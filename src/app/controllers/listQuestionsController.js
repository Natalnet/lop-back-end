const Question = require('../models/QuestionModel')
const ListQuestions = require('../models/ListQuestionsModel')

class ListQuestionsController{
	async get_all_listQuestions(req,res){
		const listQuestion = await ListQuestions.find().populate('questions')
		return res.status(200).json(listQuestion)
	}
	async get_listQuestions(req,res){
		const id = req.params.id
		const listQuestion = await ListQuestions.findById(id).populate('questions')
		return res.status(200).json(listQuestion)
	}
	async store(req,res){
		const {title,typeList,questions} = req.body
		const listQuestion = await ListQuestions.create({title,typeList,questions})
		return res.status(200).json(listQuestion)
	}
	async update(req,res){
		const id = req.params.id
		const {title,typeList,questions} = req.body
		await ListQuestions.findByIdAndUpdate(id,{
			'$set':{
				title    : title,
				typeList : typeList,
				questions: questions
			}
		})
		return res.status(200).json(listQuestion)
	}
}
module.exports = new ListQuestionsController()