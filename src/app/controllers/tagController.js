const path = require('path')

const sequelize = require('../../database/connection')
const {Tag} = sequelize.import(path.resolve(__dirname,'..','models'))

class TagController{
	async index(req,res){
		try{
			const tags = await Tag.findAll()
			return res.status(200).json(tags)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new TagController()