
const path = require('path')
const {Op} = require('sequelize')

const sequelize = require('../../database/connection')
const {Submission,FeedBackTest,User,Question,ListQuestions,ClassHasListQuestion,Test} = sequelize.import(path.resolve(__dirname,'..','models'))

class SubmissionController{
	async index_paginate(req,res){
		const field = req.query.field || 'name'
		const includeString = req.query.include || ''
		const limitDocsPerPage= parseInt(req.query.docsPerPage || 15);
		const {idClass,idUser,idList,idTest,idQuestion,profile} = req.query
		let page = parseInt(req.params.page || 1);
		try{
			let submissions = {}
			const query = {
				where:{},
				order: [
					['createdAt','DESC']
				],
				include:[{
					model:User,
					as:'user',
					where:{
						name: { 
							[Op.like]: `%${field==='name'?includeString:''}%` 
						},
						profile:profile || "ALUNO",
					},
					attributes:['id','name']
				},{				
					model:Question,
					as:'question',
					attributes:['id','title','description'],
					where:{
						title: { 
							[Op.like]: `%${field==='title'?includeString:''}%` 
						},
					}
				}]
			}
			

			if(idClass) query.where.class_id = idClass
			if(idUser) query.where.user_id = idUser
			if(idList) query.where.listQuestions_id = idList
			if(idTest) query.where.test_id = idTest
			if(idQuestion) query.where.question_id = idQuestion
			//console.log("query: ",query)
			submissions.count = await Submission.count(query)

			const totalPages = Math.ceil(submissions.count/limitDocsPerPage)
			page = parseInt(page>totalPages?totalPages:page)
			page = page<=0?1:page
			query.limit=limitDocsPerPage
			query.offset=(page-1)*limitDocsPerPage

			const submissionsPromise =  Submission.findAll(query)
			
			let userPromise = ""
			let listPromise = ""
			let testPromise = ""
			let questionPromise = ""
			if(idUser){
				userPromise = User.findOne({
					where:{
						id:idUser || ''
					},
					attributes:['id','name']
				})
			}
			if(idList){
				listPromise = ListQuestions.findOne({
					where:{
						id:idList || ''
					},
					attributes:['title']
				})
			}
			if(idTest){
				testPromise = Test.findOne({
					where:{
						id:idTest || ''
					},
					attributes:['title']
				})
			}
			if(idQuestion){
				questionPromise = Question.findOne({
					where:{
						id:idQuestion
					},
					attributes:['title']
				})
			}
			
			let [rows,user,list,test,question] = await Promise.all([submissionsPromise,userPromise,listPromise,testPromise,questionPromise])
			if(idList && list){
				rows = await Promise.all(rows.map(async submission=>{
					const classHasListQuestion = await ClassHasListQuestion.findOne({
						where:{
							class_id : submission.class_id,
							list_id  : submission.listQuestions_id
						},
						attributes:['submissionDeadline']
					})
					const submissionCopy = JSON.parse(JSON.stringify(submission))
					submissionCopy.submissionDeadline = classHasListQuestion.submissionDeadline
					return submissionCopy
				}))
			}
			

			const submissionsPaginate = {
				docs        : rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(submissions.count),
				totalPages  : parseInt(totalPages),
				user,
				list,
				test,
				question
			}

			return res.status(200).json(submissionsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	
	async store(req,res){
		const {hitPercentage,language,answer,timeConsuming,ip,environment,char_change_number,idQuestion,idList,idTest,idClass} = req.body
		try{

			const submission = await Submission.create({
				user_id : req.userId,
				question_id : idQuestion,
				class_id : idClass || null,
				listQuestions_id : idList|| null,
				test_id : idTest|| null,
				hitPercentage,
				environment,
				timeConsuming,
				language,
				answer,
				ip,
				char_change_number,
				createdAt:new Date()
			}).then(async sub=>{
				const userPromise = User.findOne({
					where:{
						id:sub.user_id,
					},
					attributes:['name']
				})
				const QuestionPromise = Question.findOne({
					where:{
						id:sub.question_id,
					},
					attributes:['title','description']
				})
				const [user,question] = await Promise.all([userPromise,QuestionPromise])
				const submissionWhitUserAndQuestion = JSON.parse(JSON.stringify(sub))
				submissionWhitUserAndQuestion.user = user
				submissionWhitUserAndQuestion.question = question
				req.io.sockets.in(idClass).emit('SubmissionClass',submissionWhitUserAndQuestion)
			})
			if(idTest){
				const [feedBackTest, created] = await FeedBackTest.findOrCreate({
					where: {
						user_id : req.userId,
						question_id : idQuestion,
						class_id : idClass,
						test_id : idTest, 
					},
					defaults:{
						user_id : req.userId,
						question_id : idQuestion,
						class_id : idClass,
						test_id : idTest,    
						hitPercentage,

					}		
				})
				if(!created){
					await feedBackTest.update({
						hitPercentage,
						timeConsuming,
						language,
						answer,
						ip,
						char_change_number
					})
				}
			}
			return res.status(200).json(submission)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new SubmissionController()