const arrayPaginate = require('array-paginate')
const path = require('path')
const {Op} = require('sequelize')
const sequelize = require('../../database/connection')
const {Class,User,List,Question} = sequelize.import(path.resolve(__dirname,'..','models'))


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
				as:'class',
			})
			const idsMyclass =[...myClasses].map(turma => turma.id)
			console.log(idsMyclass);
			const classesOpen = await Class.findAll({
				where:{
					id:{
						[Op.notIn]:idsMyclass
					},
					state:'ATIVA'
				}
			})
			/*let classesOpen=[]
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
			}*/
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
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const userSolicitations = await turma.getSolicitationsToClass()
			return res.status(200).json(userSolicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async acceptSolicitClass(req,res){
		const idClass = req.params.idClass
		const idUser = req.params.idUser
		try{
			const turma = await Class.findByPk(idClass)
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const user = await User.findByPk(idUser)
			await turma.addUser(user)
			if(!await turma.hasUser(user)){
				return res.status(500).json('usuário não pôde ser adicionado à turma')
			}
			req.io.sockets.in(idUser).emit('MyRequestsClass',turma)
			return res.status(200).json(turma)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async rejectSolicitClass(req,res){
		const idClass = req.params.idClass
		const idUser = req.params.idUser
		try{
			const turma = await Class.findByPk(idClass)
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const user = await User.findByPk(idUser)
			await turma.removeSolicitationToClass(user)
			if(await turma.hasSolicitationToClass(user)){
				return res.status(500).json('Solicitação não pôde ser cancelada')
			}
			req.io.sockets.in(idUser).emit('MyRequestsClass',turma)
			return res.status(200).json(turma)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async get_class_participants(req,res){
		const idClass=req.params.id
		try{
			const turma = await Class.findByPk(idClass)
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const studants = await turma.getUsers({
				where:{
					profile:'PROFESSOR'
				},
				order: ['name']
			})
			const professors = await turma.getUsers({
				where:{
					profile:'ALUNO'
				},
				order: ['name']
			})
			return res.status(200).json([...studants,...professors])
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_class_lists(req,res){
		const idclass = req.params.id 
		try{
			const turma = await Class.findByPk(idclass)
			//console.log(myclass.listsQuestions);
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const listas = await turma.getLists({
				include:[{
					model:Question,
					as:'questions'
				}]
			})
			return res.status(200).json(listas)
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
				const user = await User.findByPk(req.userId)
				return user;
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
			const turma = Class.findById(idClass)
			if(!turma){
				return res.status(404).json('página não encontrada')
			}
			const list = await List.findByPk(idList)
			if(!list){
				console.log('list not found');
				return res.status(400).json('list not found')
			}
			await turma.addList(list)
			if(! await  turma.hasList(list)){
				return res.status(500).json('lista não pôde ser adicionado à turma')
			}
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