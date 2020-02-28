const path = require('path')
const sequelize = require('../../database/connection')
const {Difficulty} = sequelize.import(path.resolve(__dirname,'..','models'))

class DifficultyController{
	async store(req,res){
		let {userDifficulty,idQuestion} = req.body

		try{
			const [difficulty,created] = await Difficulty.findOrCreate({
				where:{
					user_id : req.userId,
					question_id : idQuestion,
				},
				defaults:{
					user_id : req.userId,
					question_id : idQuestion,
					difficulty: userDifficulty || null
				}
			})
			if(!created){
				await difficulty.update({
					difficulty: userDifficulty || null
				})
			}
			return res.status(200).json(userDifficulty)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new DifficultyController()