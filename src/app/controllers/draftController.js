const path = require('path')
const sequelize = require('../../database/connection')
const {Draft} = sequelize.import(path.resolve(__dirname,'..','models'))

class DraftController{
	async store(req,res){
		let {answer,char_change_number,idQuestion,idList,idTest,idClass} = req.body
		try{
			const [draft,created] = await Draft.findOrCreate({
				where:{
					user_id : req.userId,
					question_id : idQuestion,
					class_id : idClass || null,
					listQuestions_id : idList || null,
					test_id : idTest || null
				},
				defaults:{
					user_id : req.userId,
					question_id : idQuestion,
					answer: answer || '',
					char_change_number,
				}
			})
			if(!created){
				await draft.update({
					answer,
					char_change_number
				})
			}
			return res.status(200).json(draft)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new DraftController()