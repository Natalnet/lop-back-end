const crypto = require('crypto');

const path = require('path')
const {Op} = require('sequelize')
const sequelize = require('../../database/connection')
const {Class,User,ListQuestions,Test,Question,ClassHasListQuestion,Submission} = sequelize.import(path.resolve(__dirname,'..','models'))


class ClassController{
	async index(req,res){
		const code= req.query.code
		const state = req.query.state?[req.query.state.split(" ")]:["ATIVA","INATIVA"]
		const myClasses = req.query.myClasses
		const idNotIn = req.query.idNotIn || ""
		 
		try{
			const query = {
				where : {
					id:{
						[Op.notIn]:idNotIn.split(" ")
					},
					code:{
						[Op.like]: `%${code || ''}%` 
					},
					state:{
						[Op.in] : state
					},
				},
				attributes:{ 
					exclude:["createdAt","updatedAt","author_id"]
				},
				order:[
					['createdAt','DESC']
				],
				include:[{
					model:User,
					as:'author',
				}]
			}

			if(myClasses && myClasses==="yes"){
				query.include = [...query.include,{
					model : User,
					as : 'users',
					where:{
						id:req.userId,
					},
					attributes:['id']
				}]
			}
			
			let classes = await Class.findAll(query)
			
			classes = await Promise.all(classes.map(async turma=>{
				const turmaCopy = JSON.parse(JSON.stringify(turma))
				const listsCount = await ListQuestions.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.listsCount = listsCount
				const usersCount = await User.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.usersCount = usersCount
				const solicitationsCount = await User.count({
					include:[{
						model:Class,
						as:'solicitedClasses',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.solicitationsCount = solicitationsCount
				const testsCount = await Test.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.testsCount = testsCount
				turmaCopy.author = {
					id:turmaCopy.author.id,
					email:turmaCopy.author.email,
					name:turmaCopy.author.name,
				}
				
				delete turmaCopy.users

				return turmaCopy
			}))
			
			return res.status(200).json(classes)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async index_paginate(req,res){
		const field = req.query.field || 'name'
		const includeString = req.query.include || ''
		const limitDocsPerPage= parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);
		const myClasses = req.query.myClasses
		try{
			
			const classes = {}
			const query = {
				where : {
					name: { 
						[Op.like]: `%${field==='name'?includeString:''}%` 
					},
					code: { 
						[Op.like]: `%${field==='code'?includeString:''}%` 
					},
				},
				order: [
					['createdAt','DESC']
				],
				include:[{
					model:User,
					as:'author',
					//attributes:['name,email']
				}]
			}
			if(myClasses && myClasses==="yes"){
				query.include = [...query.include,{
					model : User,
					as : 'users',
					where:{
						id:req.userId,
					},
					attributes:['id']
				}]
			}
			classes.count = await Class.count(query)

			const totalPages = Math.ceil(classes.count/limitDocsPerPage)
			page = parseInt(page>totalPages?totalPages:page)
			page = page<=0?1:page

			query.ofsset = (page-1)*limitDocsPerPage
			query.limit = limitDocsPerPage

			classes.rows = await Class.findAll(query)
			classes.rows = await Promise.all(classes.rows.map(async turma=>{
				const turmaCopy = JSON.parse(JSON.stringify(turma))
				const listsCount = await ListQuestions.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.listsCount = listsCount
				const usersCount = await User.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.usersCount = usersCount
				const solicitationsCount = await User.count({
					include:[{
						model:Class,
						as:'solicitedClasses',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.solicitationsCount = solicitationsCount
				const testsCount = await Test.count({
					include:[{
						model:Class,
						as:'classes',
						where:{
							id:turma.id
						}
					}]
				})
				turmaCopy.testsCount = testsCount
				return turmaCopy
			}))

			const classesPaginate = {
				docs        : classes.rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(classes.count),
				totalPages  : parseInt(totalPages)
			}
			return res.status(200).json(classesPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async show(req,res){
		const idClass=req.params.id
		const {user,profile} = req.query
		try{
			const query = {
				where:{
					id:idClass,
				}
			}
			
			if(user && user==="YES"){
				query.include = [{
					model:User,
					as:'users',
					where:{
						profile:{
							[Op.like]: profile || ""
						}	
					}
				}]
			}
			const classInfo = await Class.findOne(query)
			return res.status(200).json(classInfo)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}

		
	}	

	async store(req,res){
		const {name,year,semester,description,state,languages,professores} = req.body
		const code = crypto.randomBytes(5).toString('hex')
		//console.log(professores);
		try{
			const newClass = await Class.create({
				name,
				code,
				year,
				author_id : req.userId,
				semester,
				description,
				state,
				languages,
			})
			
			const bulkProfessores = await Promise.all([...professores].map(async pEmail => User.findOne({
				where:{
					email:pEmail
				}
			})))
			//console.log(bulkProfessores);
			if(bulkProfessores.length>0){
				await newClass.addUsers(bulkProfessores)
			}
			return res.status(200).json({msg:'ok'})
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
                //console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json(err)
            }
		}
	}

	async update(req,res){
		const idClass = req.params.id
		const {updatedClass,professores} = req.body
		try{
			const turma = await Class.findByPk(idClass)
			await turma.update(updatedClass)
			if(professores && typeof professores ==="object"){
				const professores_participantes = await turma.getUsers({
					where:{
						profile:"PROFESSOR"
					}
				})
				await turma.removeUsers(professores_participantes)
				const bulkProfessores = await Promise.all([...professores].map(async pEmail => User.findOne({
					where:{
						email:pEmail
					}
				})))				
				if(bulkProfessores.length>0){
					await turma.addUsers(bulkProfessores)
				}
			}
			return res.status(200).json({msg:'ok'})

		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new ClassController()