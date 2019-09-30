//const Question = require('../modelsMongo/QuestionModel')
//const ListQuestions = require('../modelsMongo/ListQuestionsModel')
const arrayPaginate = require('array-paginate')
const crypto = require('crypto');

class ListQuestionsController{
	async get_all_listQuestions(req,res){
		const listQuestion = await ListQuestions.find().populate('questions')
		return res.status(200).json(listQuestion)
	}
	async get_all_listQuestions_paginate(req,res){
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
			const listQuestion = await ListQuestions.find(queyBilder).sort(sort).populate('questions')
			const listQuestionPaginate = arrayPaginate(listQuestion)
			//console.log(listQuestionPaginate);
			return res.status(200).json(listQuestionPaginate)
		}
		catch(err){
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
				questions,
				code,
				createdBy:req.userId
			})
			return res.status(200).json(listQuestion)
		}
		catch(err){
			return ser.status(500).json(err)
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