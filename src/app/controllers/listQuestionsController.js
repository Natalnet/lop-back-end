const crypto = require('crypto');

const {Op} = require('sequelize')

const path = require('path')
const sequelize = require('../../database/connection')
const {ListQuestions,Question,Class,Submission,User,ClassHasListQuestion} = sequelize.import(path.resolve(__dirname,'..','models'))

class ListQuestionsController{
	async index(req,res){
		const idUser = req.query.idUser || req.userId
		const idClass = req.query.idClass
		try{
			const queryList = {
				attributes:['id','title'],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id']
				},{
					model:Class,
					as:'classes',
					attributes:['id'],
					where : {
						id:idClass
					}
				}],
			}

			let listsPromise=  ListQuestions.findAll(queryList)
			const userPromise = User.findOne({
				where:{
					id:idUser
				},
				attributes:['id','name']
			})
			
			let [lists,user] = await Promise.all([listsPromise,userPromise])

			lists = await Promise.all(lists.map(async list=>{
				let {createdAt,submissionDeadline} = list.classes[0].classHasListQuestion
				const classHasListQuestion =  {createdAt,submissionDeadline}
				submissionDeadline = submissionDeadline?new Date(submissionDeadline):null

				const questions = await Promise.all(list.questions.map(async question=>{
					const query = {
						where:{
							user_id          : idUser,
							question_id      : question.id,
							listQuestions_id : list.id,
							class_id         : idClass
						},
					}
					const submissionsCount = await Submission.count(query)
					query.where.hitPercentage = 100
					if(submissionDeadline){
						query.where.createdAt = {
							[Op.lte] : submissionDeadline
						}
					}
					const completedSumissionsCount = await Submission.count(query)
	
					const questionCopy = JSON.parse(JSON.stringify(question))
					delete questionCopy.listHasQuestion
					delete questionCopy.id
					questionCopy.submissionsCount = submissionsCount
					questionCopy.completedSumissionsCount = completedSumissionsCount
					//questionCopy.
					return questionCopy
				}))
				const listCopy = JSON.parse(JSON.stringify(list))
				delete listCopy.classes
				delete listCopy.questions
				listCopy.questionsCount = questions.length
				listCopy.questionsCompletedSumissionsCount = questions.filter(q=>q.completedSumissionsCount>0).length
				listCopy.classHasListQuestion = classHasListQuestion
				return listCopy
			}))
	
			
			lists = lists.sort((l1,l2)=>{
				const date1 = l1.classHasListQuestion.createdAt
				const date2 = l2.classHasListQuestion.createdAt
				return date1>=date2?1:-1
			})
			const response = req.query.idUser?{lists,user}:lists
			return res.status(200).json(response)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async index_paginate(req,res){
		const idNotInt = req.query.idNotInt || ''
		const include = req.query.include || ''
		const field = req.query.field || 'title'
		//const sort = req.query.sort || '-createdAt'
		
		const limitDocsPerPage=parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);
		try{
			const listQuestions = {}
			const query = {
				where : {
					id:{
						[Op.notIn]:idNotInt.split(' ')
					},
					title: { 
						[Op.like]: `%${field==='title'?include:''}%` 
					},
					code: { 
						[Op.like]: `%${field==='code'?include:''}%` 
					}
				},
				order: [
					['createdAt','DESC']
				],

			}
			 

			listQuestions.count = await ListQuestions.count(query)

			const totalPages = Math.ceil(listQuestions.count/limitDocsPerPage)
			//console.log('total ',listQuestions.count)
			page = parseInt(page>totalPages?totalPages:page)
			page = page<=0?1:page

			query.limit = limitDocsPerPage
			query.offset = (page-1)*limitDocsPerPage
			query.include = [{
				model : Question,
				as    : 'questions',
			},{
				model: User,
				as: "author",
				attributes:["email"]
			}]
			listQuestions.rows = await ListQuestions.findAll(query)

			const listQuestionsPaginate = {
				docs        : listQuestions.rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(listQuestions.count),
				totalPages  : parseInt(totalPages)
			}
			return res.status(200).json(listQuestionsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async show(req,res){
		const idList = req.params.id
		const idClass = req.query.idClass 
		const idUser = req.query.idUser || req.userId
		try{
			const userPromise = User.findOne({
				where:{
					id:idUser
				},
				attributes:['id','name'],
			})
			let listPromise =  ListQuestions.findOne({
				where:{
					id:idList,
				},
				attributes:['id','title'],
				order:[
					['questions','createdAt']
				],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id','title','description']
				}],
			})
			
			const classHasListQuestionPromise =  ClassHasListQuestion.findOne({

				where:{
					list_id : idList,
					class_id: idClass
				},
				attributes:['createdAt','submissionDeadline']
			})

			let [list,classHasListQuestion,user] = await Promise.all([
				listPromise,
				classHasListQuestionPromise,
				userPromise
			])
			
			
			let submissionDeadline = classHasListQuestion.submissionDeadline
			submissionDeadline = submissionDeadline?new Date(submissionDeadline):null

			let questions = await Promise.all(list.questions.map(async question=>{
				const query = {
					where:{
						user_id     : idUser,
						question_id : question.id,
						listQuestions_id : list.id,
						class_id         : idClass
					}

				}

				const submissionsCount = await Submission.count(query)
				query.where.hitPercentage = 100
				const correctSumissionsCount  = await Submission.count(query)
				if(submissionDeadline){
					query.where.createdAt = {
						[Op.lte] : submissionDeadline
					}
				}
				const completedSumissionsCount = await Submission.count(query)

				const questionCopy = JSON.parse(JSON.stringify(question))
				delete questionCopy.listHasQuestion
				questionCopy.completedSumissionsCount = completedSumissionsCount
				questionCopy.submissionsCount = submissionsCount
				questionCopy.isCorrect = correctSumissionsCount>0
				return questionCopy
			}))
			list = JSON.parse(JSON.stringify(list))
			
			list.questionsCount = questions.length
			list.questionsCompletedSumissionsCount = questions.filter(q=>q.completedSumissionsCount>0).length
			questions.forEach(q=> delete q.completedSumissionsCount)
			list.questions = questions
			list.classHasListQuestion = classHasListQuestion
			const response = req.query.idUser?{list,user}:list
			
			return res.status(200).json(response)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async store(req,res){
		try{
			const {title,questions} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const listQuestion = await ListQuestions.create({
				title,
				code,
				author_id:req.userId
			})
			const bulkQuestions = await Promise.all([...questions].map(async qId =>Question.findByPk(qId) ))
			if(bulkQuestions.length>0){
				await listQuestion.addQuestions(bulkQuestions)
			}
			//await listQuestion.getQuestions()
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                //console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json(err)
            }
		}
	}

	async update(req,res){
		try{
			const {title,questions} = req.body
			const {id} = req.params
			const listQuestion = await ListQuestions.findByPk(id);
			if(!listQuestion){
				return res.status(404).json()
			}
			//console.log(listQuestion)
			if(listQuestion.author_id !== req.userId){	
				console.log("Sem permissão")
				return res.status(401).json({msg:"Sem permissão"})
			}
			await listQuestion.update({
				title,
			})
			const bulkQuestions = await Promise.all([...questions].map(async qId =>Question.findByPk(qId) ))
			if(bulkQuestions.length>0){
				await listQuestion.setQuestions(bulkQuestions);
			}
			//await listQuestion.getQuestions()
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                //console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json(err)
            }
		}
	}

}
module.exports = new ListQuestionsController()