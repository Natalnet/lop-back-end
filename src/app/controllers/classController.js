const Class = require('../models/ClassModel')
const User = require('../models/UserModel')


class ClassController{
	async get_all_classes(req,res){
		const classes = await Class.find().populate('professores students listsQuestions requestingUsers')
		return res.status(200).json(classes)

	}
	async get_all_classes_paginate(req,res){
		const query={state:'ATIVA'/*,requestingUsers:ObjectId(req.userId)*/}
		const options = {
			page: req.params.page || 1,
			limit:8, //limite de documentos por página
			populate:'professores students listsQuestions requestingUsers'
		}
		Class.paginate(query,options).then(function(result) {
			console.log(result);
			return res.status(200).json(result)
		}).catch(function(err) {
			return res.status(500).json(err)
		})
	}
	async get_all_classes_open(req,res){
		const classes = await Class.find({state:'ATIVA'}).populate('professores students listsQuestions ruquestingUsers')
		return res.status(200).json(classes)
	}
	async get_class(req,res){
		const id=req.params.id
		const classInfo = await Class.findById(id).populate('professores students listsQuestions')
		return res.status(200).json(classInfo)
	}
	async store(req,res){
		const {name,year,semester,description,state,professores} = req.body
		const newClass = await Class.create(req.body)
		
		for (let i = 0; i < professores.length; i++) {
			let prof = await User.findById(professores[i])
			prof.classes.push(newClass)
			await prof.save()
		}

		return res.status(200).json(newClass) 
	}
	async update(req,res){
		const id = req.params.id
		const {name,year,semester,description,state,professores} = req.body
		const updatedClass = await Class.findById(id)
		let jaParticipa=false
		for (let i = 0; i < professores.length; i++) {
			for(let j = 0; j < updatedClass.professores.length; j++){
				console.log(professores[i],updatedClass.professores[j]._id.toString());
				console.log(professores[i]==updatedClass.professores[j]._id.toString());
				if(professores[i]==updatedClass.professores[j]._id.toString()){
					jaParticipa=true;
					break;
				}
			}
			if(!jaParticipa){
				let prof = await User.findById(professores[i])
				prof.classes.push(updatedClass)
				await prof.save()
			}
			jaParticipa=false
		}
		await Class.findByIdAndUpdate(id,{
			"$set":{name,year,semester,description,state,professores}
		})
		return res.status(200).json(updatedClass) 
	}
	async acceptRequest(req,res){
		const idClass = req.params.idClass
		const idUser = req.params.idUser
		const turma = await Class.findById(idClass)
		const user = await User.findById(idUser)
		if(!turma || !user){
			return res.status(400).json({error:"User or class not found :("})
		}
		turma.requestingUsers.pull(user)
		user.requestedClasses.pull(turma)
		turma.students.push(user)
		user.classes.push(turma)
		await turma.save()
		await user.save()
		return res.status(200).json({msg:"ok"})

	}
	async rejectRequest(req,res){
		const idClass = req.params.idClass
		const idUser = req.params.idUser
		const turma = await Class.findById(idClass)
		const user = await User.findById(idClass)
		if(!turma || !user){
			return res.status(400).json({error:"User or class not found :("})
		}
		turma.requestingUsers.pull(user)
		user.requestedClasses.pull(turma)
		await turma.save()
		await user.save()
		return res.status(200).json({msg:"ok"})
	}
}
module.exports = new ClassController()