//const Class = require('../modelsMongo/ClassModel')
//const User = require('../modelsMongo/UserModel')
//const List = require('../modelsMongo/ListQuestionsModel')
const {Class,User} = require('../models')

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
			const user = await User.findByPk(req.userId)
			const myClasses = await user.getClasses({
				as:'class'
			})
			const classes = await Class.findAll()
			let classesOpen=[]
			let souParticipante = false
			for(let turma of classes){
				for(let myClasse of myClasses){
					if(turma.id==myClasse.id){
						souParticipante=true;
						break;
					}
				}
				if(!souParticipante) classesOpen.push(turma);
				souParticipante=false		
			}
			const classesPaginate = arrayPaginate(classesOpen,page,limitDocsPerPage)
			return res.status(200).json(classesPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_all_classes_open(req,res){
		const classes = await Class.find({state:'ATIVA'}).populate('professores students listsQuestions requestingUsers')
		return res.status(200).json(classes)
	}
	async get_class(req,res){
		const id=req.params.id
		const classInfo = await Class.findByPk(id)
		return res.status(200).json(classInfo)
	}
	async get_solicitations(req,res){
		const idClass =  req.params.id
		try{
			const turma = await Class.findByPk(idClass)
			console.log(turma)
			const userSolicitations = await turma.getSolicitationsToClass()
			return res.status(200).json(userSolicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async acceptSolicitClass(req,res){
		try{
			req.io.sockets.in(idUser).emit('MyRequestsClass',turma)
		}
		catch(err){

		}
	}
	async rejectSolicitClass(req,res){
		const idClass = req.params.id
		try{
			req.io.sockets.in(idUser).emit('MyRequestsClass',turma)
		}
		catch(err){

		}
	}
	async get_class_participants(req,res){
		const id=req.params.id
		const include = req.query.include || ''
		const fild = req.query.fild || 'title'
		const includeString = req.query.include || ''
		//const sort = req.query.sort || '-createdAt'
		
		const limitDocsPerPage=req.query.docsPerPage || 10;
		const page = req.params.page || 1;
		try{
			const listQuestions = await ListQuestions.findAll({
				where: { 
					title: { 
						[Op.like]: `%${fild==='title'?includeString:''}%` 
					},
					code: { 
						[Op.like]: `%${fild==='code'?includeString:''}%` 
					}
				},
				include : [{
					model : Question,
					as    : 'Questions',
				}]
			})
			const listQuestionsPaginate = arrayPaginate(listQuestions,page,limitDocsPerPage)
			//console.log(listQuestionPaginate);
			return res.status(200).json(listQuestionsPaginate)
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
		console.log(professores);
		try{
			const newClass = await Class.create({
				name,
				year,
				semester,
				description,
				state,
			})
			const bulkProfessores = await Promise.all([...professores].map(async pId => {
				const user = await User.findByPk(pId)
				return user
			}))
			//console.log(bulkProfessores);
			if(bulkProfessores.length>0){
				await newClass.addUsers(bulkProfessores)
			}
			return res.status(200).json('ok')
		} 
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        fild:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json('err')
            }
		}
	}
	async addList(req,res){
		const idClass = req.params.idClass
		const idList = req.params.idList
		try{
			const myClass = Class.findById(idClass)
			if(!myClass){
				return res.satus(404).json('página não encontrada')
			}
			const list = await List.findById(req.idList)
			if(!list){
				console.log('list not found');
				return res.status(400).json('list not found')
			}
			myClass.listsQuestions.push(list)
			return res.status(200).json('ok')
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
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
}
module.exports = new ClassController()