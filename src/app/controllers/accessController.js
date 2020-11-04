
const path = require('path')
const sequelize = require('../../database/connection')
const {Access} = sequelize.import(path.resolve(__dirname,'..','models'))

class AccessController{
	async store(req,res){
		const {ip,environment,idQuestion} = req.body
		try{
			const access = await Access.create({
				user_id : req.userId,
				question_id : idQuestion,
				ip,
				environment,
				createdAt:new Date()
			})
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new AccessController()