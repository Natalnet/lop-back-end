const Question = require('../models/QuestionModel')

class QuestionController{
	async get_all_questions(req,res){
		const questions = await Question.find()
		if(questions.length===0){
			res.status(200).json()
		}
		return res.status(200).json(questions)
	}
	async get_question(req,res){
		const id = req.params.id
		try{
			let question = await Question.findById(id)

			return res.status(200).json(question)
		}
		catch(err){
			console.log(Object.getOwnPropertyDescriptors(err));
			return res.status(500).json({err:'err'})
		}
	}
	async store(req,res){
		
		try{
			const {title,description,results} = req.body
			const question = await Question.create({title,description,results})
			console.log(question);
			return res.status(200).json(question)
		}
		catch(err){
			console.log(Object.getOwnPropertyDescriptors(err));
			return res.status(500).json({err:'err'})
		}
	}
	async update(req,res){
		try{
			const id = req.params.id
			const {title,description,results} = req.body
			await Question.findByIdAndUpdate(id,{
				"$set":{
					title       : title,
					description : description,
					results     : results
				}
			})
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(Object.getOwnPropertyDescriptors(err));
			return res.status(500).json({err:'err'})
		}
	}
}
module.exports = new QuestionController