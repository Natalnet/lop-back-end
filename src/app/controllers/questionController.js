const crypto = require('crypto');
const arrayPaginate = require('array-paginate')
const {Op} = require('sequelize')

const path = require('path')
const sequelize = require('../../database/connection')
const  {User,Question}= sequelize.import(path.resolve(__dirname,'..','models'))

class QuestionController{
	async get_all_questions(req,res){
		const questions = await Question.find()
		if(questions.length===0){
			res.status(200).json()
		}
		return res.status(200).json(questions)
	}
	async get_all_questions_paginate(req,res){
		const include = req.query.include || ''
		const fild = req.query.fild || 'title'
		const includeString = req.query.include || ''
		//const sort = req.query.sort || '-createdAt'

		const limitDocsPerPage=req.query.docsPerPage || 10;
		const page = req.params.page || 1;
		try{
			const questions = await Question.findAll({
				where: { 
					title: { 
						[Op.like]: `%${fild==='title'?includeString:''}%` 
					},
					code: { 
						[Op.like]: `%${fild==='code'?includeString:''}%` 
					},
					status:'PÚBLICA'
				},
				include : [{
					model : User,
					as    : 'author',
					attributes:['email']

				}]
			})
			const questionsPaginate = arrayPaginate(questions,page,limitDocsPerPage)
			//console.log(listQuestionPaginate);
			return res.status(200).json(questionsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_question(req,res){
		const id = req.params.id
		try{
			let question = await Question.findByPk(id)
			if(!question){
				return res.status(404).json('questão não encontrada')
			}
			return res.status(200).json(question)
		}
		catch(err){
			console.log(err);
			return res.status(500).json({err:'err'})
		}
	}
	async store(req,res){
		
		try{
			const {title,description,results,difficulty,status,katexDescription,solution} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const question = await Question.create({
				title,
				description,
				results,
				code,
				status,
				difficulty,
				katexDescription,
				solution,
				author_id:req.userId
			})
			//console.log(question);
			return res.status(200).json(question)
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        fild:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json('err')
            }
		}
	}
	async update(req,res){
		try{
			const id = req.params.id
			const {title,description,results,difficulty,status,katexDescription,solution} = req.body
			const question = await Question.findByPk(id)
			//console.log(title,description,results,difficulty,status,katexDescription,solution);
			if(!question){
				return res.status(404).json('questão não encontrada')
			}
			await question.update({
					title:title,
					description:description,
					results:results,
					status:status,
					difficulty:difficulty,
					katexDescription:katexDescription,
					solution:solution,
			})
			return res.status(200).json('ok')
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        fild:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json('err')
            }
		}
	}
}
module.exports = new QuestionController