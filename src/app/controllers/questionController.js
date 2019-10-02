const sequelize = require('../../database/connection')
const crypto = require('crypto');
const arrayPaginate = require('array-paginate')
const path = require('path')

const Question = sequelize.import(path.resolve(__dirname,'..','models','QuestionModel'))


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
		let queyBilder = ''
		if(fild==='title'){
			queyBilder = {title:{$regex: '.*' + include + '.*'}}
		}
		else if(fild==='code'){
			queyBilder = {code:{$regex: '.*' + include + '.*'}}
		}
		const sort = req.query.sort || '-createdAt'
		const page = req.params.page || 1;
		const limitDocsPerPage=10;
		try{
			const question = await Question.find(queyBilder).sort(sort).populate({
				path:'createdBy',
				select:'email'
			})
			const questionPaginate = arrayPaginate(question)
			//console.log(listQuestionPaginate);
			return res.status(200).json(questionPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)

		}
	}
	async get_question(req,res){
		const id = req.params.id
		try{
			let question = await Question.findById(id)

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
			await Question.findByIdAndUpdate(id,{
				"$set":{
					title,
					description,
					results,
					status,
					difficulty,
					katexDescription,
					solution,
				}
			})
			return res.status(200).json({msg:'ok'})
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