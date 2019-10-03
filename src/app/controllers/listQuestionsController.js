//const Question = require('../modelsMongo/QuestionModel')
const arrayPaginate = require('array-paginate')
const crypto = require('crypto');

const path = require('path')
const {Op} = require('sequelize')

const sequelize = require('../../database/connection')
const ListQuestions = sequelize.import(path.resolve(__dirname,'..','models','ListQuestionsModel'))
const Question = sequelize.import(path.resolve(__dirname,'..','models','QuestionModel'))

class ListQuestionsController{
	async get_all_listQuestions(req,res){
		const listQuestion = await ListQuestions.find().populate('questions')
		return res.status(200).json(listQuestion)
	}
	async get_all_listQuestions_paginate(req,res){
		const include = req.query.include || ''
		const fild = req.query.fild || 'title'
		const includeString = req.query.include || ''
		//const sort = req.query.sort || '-createdAt'
		
		const limitDocsPerPage=req.query.docsPerPage || 10;
		const page = req.params.page || 1;
		try{
			const listQuestions = await ListQuestions.findAll({
				where: { 
					title: { 
						[Op.like]: `%${fild==='title'?includeString:''}%` 
					},
					code: { 
						[Op.like]: `%${fild==='code'?includeString:''}%` 
					}
				},
				include : [{
					model : Question,
					as    : 'Questions',
				}]
			})
			const listQuestionsPaginate = arrayPaginate(listQuestions,page,limitDocsPerPage)
			//console.log(listQuestionPaginate);
			return res.status(200).json(listQuestionsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_listQuestions(req,res){
		const id = req.params.id
		const listQuestion = await ListQuestions.findById(id).populate('questions')
		return res.status(200).json(listQuestion)
	}
	async store(req,res){
		try{
			const {title,questions} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const listQuestion = await ListQuestions.create({
				title,
				code,
			})
			const bulkQuestions = await Promise.all([...questions].map(async q => {
				const question = await Question.findByPk(q.id)
				return question
			}))
			if(bulkQuestions.length>0){
				await listQuestion.addQuestions(bulkQuestions)
			}
			await listQuestion.getQuestions()
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
	async update(req,res){
		const id = req.params.id
		const {title,questions} = req.body
		await ListQuestions.findByIdAndUpdate(id,{
			'$set':{
				title,
				questions,
			}
		})
		return res.status(200).json(listQuestion)
	}
}
module.exports = new ListQuestionsController()