const crypto = require('crypto');

const {Op} = require('sequelize')

const path = require('path')
const sequelize = require('../../database/connection')
const {Test,Question,Class,SubmissionStats,User,ClassHasTest} = sequelize.import(path.resolve(__dirname,'..','models'))

function hashPassword(password) {
	const hash = crypto.createHash('sha256');
	hash.update(password);
	return hash.digest('hex');
}

class TestController{
	async index(req,res){
		const idUser = req.query.idUser || req.userId;
		const idClass = req.query.idClass;
		try{
			const queryTest= {
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

			let tests = await Test.findAll(queryTest)

			tests = await Promise.all(tests.map(async test=>{
				const {createdAt, password, status, correcao, showAllTestCases, id} = test.classes[0].classHasTest
				const questions = await Promise.all(test.questions.map(async question=>{
					const query = {
						where:{
							user_id     : idUser,
							question_id : question.id,
							test_id     : test.id,
							class_id    : idClass
						}
					}
					const submissionsCount = await SubmissionStats.count(query)
					query.where.hitPercentage = 100
					const completedSumissionsCount = await SubmissionStats.count(query)
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
				testCopy.classHasTest = {createdAt, password, status, correcao, showAllTestCases, id}
				if(req.userProfile === 'ALUNO'){
					delete testCopy.classHasTest.password;
				}
				return testCopy
			}))
	
			
			tests = tests.sort((t1,t2)=>{
				const date1 = t1.classHasTest.createdAt
				const date2 = t2.classHasTest.createdAt
				return date1>=date2?1:-1
			})
			return res.status(200).json(tests)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async checkPassowrd(req, res){
		const password = req.query.password? req.query.password.trim():''
		const idTest = req.query.idTest? req.query.idTest: '';
		try{
			const classHasTest = await ClassHasTest.findOne({
				where:{
					test_id: idTest,
				}
			})
			if(classHasTest && hashPassword(classHasTest.password) === password){
				return res.status(200).json({msg: 'ok'})
			}
			return res.status(400).json({msg: 'Senha não bate'})
		}
		catch(err){
			return res.status(500).json(err);
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
			},{
				model: User,
				as: "author",
				attributes:["email"]
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

	async getCountTests(req, res){
		try{
			const countTests = await Test.count();
			return res.status(200).json({ countTests})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async getUserSubmissionsByTest(req, res){
		try{
			const { id, idClass, idQuestion} = req.params;
			//console.log({ id, idClass, idQuestion})
			const classRoonPromise = Class.findByPk(idClass);
			const testPromise = Test.findOne({
				where:{
					id
				},
				attributes:['id','title'],
				order:[
					['questions','createdAt']
				],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id','title','description','katexDescription']
				}],
			});
			const classHasTestQuestionPromise =  ClassHasTest.findOne({
				where:{
					test_id : id,
					class_id: idClass
				},
				attributes:['createdAt']
			})
			let [classRoon, test ,classHasListQuestion] = await Promise.all([classRoonPromise, testPromise, classHasTestQuestionPromise])
			let users = await classRoon.getUsers({
				where:{
					profile: 'ALUNO'
				},
				attributes: ['id','name','email'],
				order:['name']
			});

			
			test.questions = test.questions.map(question=>{
				const questionCopy = JSON.parse(JSON.stringify(question))
				delete questionCopy.testHasQuestion
				return questionCopy;
			})
			users = users.map(user=>{
				const userCopy = JSON.parse(JSON.stringify(user))
				userCopy.enrollment = userCopy.classHasUser.enrollment
				delete userCopy.classHasUser
				return userCopy;
			})

			users = await Promise.all(users.map(async user=>{
				const query = {
					where: {
						user_id: user.id,
						question_id: idQuestion,
						test_id : id,
						class_id: idClass,
						hitPercentage: 100
					},
					order:[
						['createdAt','DESC']
					],
				}
	
				let lastSubmission = await SubmissionStats.findOne(query);
				if(!lastSubmission){
					delete query.where.hitPercentage;
					lastSubmission = await SubmissionStats.findOne(query);
				}

				const userCopy = JSON.parse(JSON.stringify(user));
				return {
					...userCopy,
					lastSubmission
				}
			}))
			users = users.filter(user=>user.lastSubmission);
			return res.status(200).json({users, test});
			
		}
		catch(err){
			console.log(err)
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
				attributes:['id','title'],
				order:[
					['questions','createdAt']
				],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id','title','description','type']
				}],
			})
			const classHasTestPromise =  ClassHasTest.findOne({
				where:{
					test_id : idTest,
					class_id: idClass
				},
				attributes:['createdAt','password','correcao','showAllTestCases','status']
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
				const submissionsCount = await SubmissionStats.count(query)
				query.where.hitPercentage = 100
				const completedSumissionsCount  = await SubmissionStats.count(query)
	
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
			if(req.userProfile === 'ALUNO'){
				delete test.classHasTest.password
			}
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
			const {title,questions/*,password,showAllTestCases*/} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const test = await Test.create({
				title,
				// password,
				// showAllTestCases,
				code,
				author_id: req.userId
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

	async updateQuestions(req,res){
		try{
			const {title,questions/*, password, showAllTestCases*/} = req.body
			const {id} = req.params;
			const test = await Test.findByPk(id);
			if(!test){
				return res.status(404).json()
			}
			//console.log(test)
			if(test.author_id !== req.userId){	
				//console.log("Sem permissão")
				return res.status(401).json({msg:"Sem permissão"})
			}
			await test.update({
				title,
				// password,
				// showAllTestCases,
			})
			const bulkQuestions = await Promise.all([...questions].map(qId => Question.findByPk(qId) ))
			if(bulkQuestions.length > 0){
				await test.setQuestions(bulkQuestions);
			}
			//await test.getQuestions()
			return res.status(200).json({msg:'ok'});
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
                return res.status(400).json(validationsErros);
            }
            else{
                console.log(err);
                return res.status(500).json(err);
            }
		}
	}
	async getApiStatus(req, res) {
		return res.status(200).send("LOP API OK");
	}

}
module.exports = new TestController()
