const Class = require('../models/ClassModel')
const User = require('../models/UserModel')


class ClassController{

	//cria uma turma
	async get_all_classes(req,res){
		const classes = await Class.find().populate('professores students')
		return res.status(200).json(classes)

	}
	async store(req,res){
		const {name,year,semester,description,state,professores} = req.body
		const newClass = await Class.create({name,year,semester,description,state,professores})
		

		for (let i = 0; i < professores.length; i++) {
			let prof = await User.findById(professores[i])
			prof.classes.push(newClass)
			await prof.save()
		}

		return res.status(200).json(newClass) 

	}
}
module.exports = new ClassController()