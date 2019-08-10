const Class = require('../models/ClassModel')
const User = require('../models/UserModel')


class ProfessorController{
	async get_all_professores(req,res){
		try{
			const professores = await User.find({profile:"PROFESSOR"}).populate('class')
			return res.status(200).json(professores)
		}catch(err){
			return res.status(500).json({erro:"erro ao obter professores"})
		}

	}
}
module.exports = new ProfessorController()