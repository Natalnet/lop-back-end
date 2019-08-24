const Class = require('../models/ClassModel')
const User = require('../models/UserModel')


class ClassController{

	//cria uma turma
	async get_all_classes(req,res){
		const classes = await Class.find().populate('professores students listsQuestions')
		return res.status(200).json(classes)

	}
	async get_class(req,res){
		const id=req.params.id
		const classInfo = await Class.findById(id).populate('professores students listsQuestions')
		return res.status(200).json(classInfo)
	}
	async store(req,res){
		const {name,year,semester,description,state,professores,students} = req.body
		const newClass = await Class.create(req.body)
		
		for (let i = 0; i < professores.length; i++) {
			let prof = await User.findById(professores[i])
			prof.classes.push(newClass)
			await prof.save()
		}
		for (let i = 0; i < students.length; i++) {
			let aluno = await User.findById(students[i])
			aluno.classes.push(newClass)
			await aluno.save()
		}
		return res.status(200).json(newClass) 
	}
}
module.exports = new ClassController()