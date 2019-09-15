const Class = require('../models/ClassModel')
const User = require('../models/UserModel')
const arrayPaginate = require('array-paginate')

class ClassController{
	async get_all_classes(req,res){
		const classes = await Class.find().populate('professores students listsQuestions requestingUsers')
		return res.status(200).json(classes)

	}
	async get_all_classes_paginate(req,res){
		const page = req.params.page || 1;
		const limitDocsPerPage=8;
		try{
			const classes = await Class.find({state:'ATIVA'}).populate('professores students listsQuestions ruquestingUsers')
			const classesPaginate = arrayPaginate(classes,page,limitDocsPerPage)
			return res.status(200).json(classesPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_all_classes_open(req,res){
		const classes = await Class.find({state:'ATIVA'}).populate('professores students listsQuestions ruquestingUsers')
		return res.status(200).json(classes)
	}
	async get_class(req,res){
		const id=req.params.id
		const classInfo = await Class.findById(id).populate()
		return res.status(200).json(classInfo)
	}
	async get_class_participants(req,res){
		const id=req.params.id
		const page = req.params.page || 1;
		const limitDocsPerPage=15;
		try{
			const myClass = await Class.findById(id).select('professores students').populate({
				path:'professores students',
				options:{sort:{name:-1}}
			})
			const participants = myClass.professores.concat(myClass.students)
			const participantsPaginate = arrayPaginate(participants,page,limitDocsPerPage)
			return res.status(200).json(participantsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_class_lists(req,res){
		const id = req.params.id 
		try{
			const myclass = await Class.findById(id).select('listsQuestions').populate({
				path:'listsQuestions',
				populate:{
					path:'questions'
				}
			})
			//console.log(myclass.listsQuestions);
			if(!myclass){
				return res.status(404).json({err:'err'})
			}
			return res.status(200).json(myclass.listsQuestions)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async get_class_requests(req,res){
		const id = req.params.id 
		try{
			const classRequests = await Class.findById(id).select('requestingUsers').populate('requestingUsers')
			//console.log(classRequests);
			if(!classRequests){
				return res.status(404).json({err:'err'})
			}
			return res.status(200).json(classRequests.requestingUsers)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
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
		const user = await User.findById(idUser)
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