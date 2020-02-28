const crypto = require('crypto');

const {Op} = require('sequelize')

const path = require('path')
const sequelize = require('../../database/connection')
const {Test,Question,Class,Submission,User,ClassHasTest} = sequelize.import(path.resolve(__dirname,'..','models'))

class TestController{
	async index(req,res){
		const idUser = req.query.idUser || req.userId
		const idClass = req.query.idClass
		try{
			const queryTest= {
				attributes:['id','title','status','password'],
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

			let testsPromise=  Test.findAll(queryTest)
			const userPromise = User.findOne({
				where:{
					id:idUser
				},
				attributes:['id','name']
			})
			
			let [tests,user] = await Promise.all([testsPromise,userPromise])

			tests = await Promise.all(tests.map(async test=>{
				const {createdAt} = test.classes[0].classHasTest
				const questions = await Promise.all(test.questions.map(async question=>{
					const query = {
						where:{
							user_id     : idUser,
							question_id : question.id,
							test_id     : test.id,
							class_id    : idClass
						}
					}
					const submissionsCount = await Submission.count(query)
					query.where.hitPercentage = 100
					const completedSumissionsCount = await Submission.count(query)
					const questionCopy = JSON.parse(JSON.stringify(question))
					delete questionCopy.testHasQuestion
					delete questionCopy.id
					questionCopy.submissionsCount = submissionsCount
					questionCopy.completedSumissionsCount = completedSumissionsCount
					return questionCopy
				}))
				const testCopy = JSON.parse(JSON.stringify(test))
				delete testCopy.classes
				delete testCopy.questions
				testCopy.questionsCount = questions.length
				testCopy.questionsCompletedSumissionsCount = questions.filter(q=>q.completedSumissionsCount>0).length
				testCopy.classHasTest = {createdAt}
				return testCopy
			}))
	
			
			tests = tests.sort((t1,t2)=>{
				const date1 = t1.classHasTest.createdAt
				const date2 = t2.classHasTest.createdAt
				return date1>=date2?1:-1
			})
			const response = req.query.idUser?{tests,user}:tests
			return res.status(200).json(response)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async index_paginate(req,res){
		const idNotInt = req.query.idNotIn || ''
		const include = req.query.include || ''
		const field = req.query.field || 'title'
		//const sort = req.query.sort || '-createdAt'
		
		const limitDocsPerPage=parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);
		try{
			const tests = {}
			const query = {
				where : {
					id:{
						[Op.notIn]: idNotInt.split(" ")
					},
					title: { 
						[Op.like]: `%${field==='title'?include:''}%` 
					},
					code: { 
						[Op.like]: `%${field==='code'?include:''}%` 
					},
				},
				order: [
					['createdAt','DESC']
				],
			}
	
			tests.count = await Test.count(query)

			const totalPages = Math.ceil(tests.count/limitDocsPerPage)
			page = parseInt(page>totalPages?totalPages:page)
			page = page<=0?1:page

			query.offset = (page-1)*limitDocsPerPage
			query.limit = limitDocsPerPage,
			query.include = [{
				model : Question,
				as    : 'questions',
			}]

			tests.rows = await Test.findAll(query)

			const TestsPaginate = {
				docs        : tests.rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(tests.count),
				totalPages  : parseInt(totalPages)
			}
			return res.status(200).json(TestsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async show(req,res){
		const idTest = req.params.id
		const idClass = req.query.idClass 
		const idUser = req.query.idUser || req.userId
		try{
			const userPromise = User.findOne({
				where:{
					id:idUser
				},
				attributes:['id','name'],
			})
			let testPromise =  Test.findOne({
				where:{
					id:idTest
				},
				attributes:['id','title','status','password','showAlltestCases'],
				order:[
					['questions','createdAt']
				],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id','title','description']
				}],
			})
			const classHasTestPromise =  ClassHasTest.findOne({
				where:{
					test_id : idTest,
					class_id: idClass
				},
				attributes:['createdAt']
			})

			let [test,classHasTest,user] = await Promise.all([
				testPromise,
				classHasTestPromise,
				userPromise
			])
			
	
			const questions = await Promise.all(test.questions.map(async question=>{
				const query = {
					where:{
						user_id     : idUser,
						question_id : question.id,
						test_id     : test.id,
						class_id    : idClass
					}
				}
				const submissionsCount = await Submission.count(query)
				query.where.hitPercentage = 100
				const completedSumissionsCount  = await Submission.count(query)
	
				const questionCopy = JSON.parse(JSON.stringify(question))
				delete questionCopy.testHasQuestion
				questionCopy.completedSumissionsCount = completedSumissionsCount
				questionCopy.submissionsCount = submissionsCount
				questionCopy.isCorrect = completedSumissionsCount>0
				return questionCopy
			}))
			test = JSON.parse(JSON.stringify(test))
			
			test.questionsCount = questions.length
			test.questionsCompletedSumissionsCount = questions.filter(q=>q.completedSumissionsCount>0).length
			questions.forEach(q=> delete q.completedSumissionsCount)
			test.questions = questions
			test.classHasTest = classHasTest
			const response = req.query.idUser?{test,user}:test
			
			return res.status(200).json(response)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}

	async store(req,res){
		try{
			const {title,questions,password,showAllTestCases} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const test = await Test.create({
				title,
				password,
				showAllTestCases,
				code,
			})
			const bulkQuestions = await Promise.all([...questions].map(async qId => Question.findByPk(qId) ))
			if(bulkQuestions.length>0){
				await test.addQuestions(bulkQuestions)
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
                return res.status(500).json('err')
            }
		}
	}
	async update(req,res){
		const idTest = req.params.id
		const {status} = req.body
		const {idClass} = req.query
		try{
			const test = await Test.findByPk(idTest)
			await test.update({
				status,
			})
			req.io.sockets.in(idClass).emit('changeStatusTest',{status,idTest})
			return res.status(200).json({msg:"ok"})

		}
		catch(err){

		}
	}

}
module.exports = new TestController()