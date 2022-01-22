const path = require('path')
const sequelize = require('../../database/connection')
const {ListQuestions,Question,ClassHasListQuestion,Submission} = sequelize.import(path.resolve(__dirname,'..','models'))

class ClassHasListQuestionController{
	async store(req,res){
		const {idClass,idList} = req.body
		try{		
			const classHasListQuestion = await ClassHasListQuestion.create({
				list_id : idList,
				class_id : idClass,
				createdAt : new Date()
			}).then(async classHasListQuestionCopy=>{
		
				let list = await ListQuestions.findOne({
					where:{
						id:idList
					},
					include:[{
						model:Question,
						as:'questions',
					}],
				})
				
				const questions = list.questions.map(question=>{
					const questionCopy = JSON.parse(JSON.stringify(question))
					questionCopy.submissionsCount = 0
					questionCopy.completedSumissionsCount = 0
					questionCopy.correctSumissionsConunt = 0
						
					return questionCopy
				})
				list = JSON.parse(JSON.stringify(list))
				list.questions = questions
				list.classHasListQuestion = classHasListQuestionCopy

			})
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async delete(req,res){
		const idClass = req.query.idClass
		const idList = req.params.id
		try{
			const classHasListQuestion = await ClassHasListQuestion.findOne({
				where:{
					list_id  : idList,
					class_id : idClass
				}
			})

			await classHasListQuestion.destroy({ force: true }).then(async ()=>{
				const list = await ListQuestions.findByPk(idList)
			})
			
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async update(req,res){
		const idList = req.params.id
		let {submissionDeadline, idClass} = req.body;
		try{
			const classHasListQuestion = await ClassHasListQuestion.findOne({
				where:{
					list_id  : idList,
					class_id : idClass
				}
			})
			await classHasListQuestion.update({
				submissionDeadline,
			})
			return res.status(200).json({msg:'ok'})
		}

		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
}
module.exports =  new ClassHasListQuestionController()