const crypto = require('crypto');
const {Op, fn, col} = require('sequelize')
const ListQuestionsService = require('../services/listQuestionsService');
const sequelize = require('../../database/connection');
const { resolve } = require('path');
const {ListQuestions,Question,User} = sequelize.import(resolve(__dirname,'..','models'))

class ListQuestionsController{
	async index(req,res){
		const idUser = req.query.idUser || req.userId
		const idClass = req.query.idClass
		try{

			let lists = await ListQuestionsService.getListsFromClassWithQuestionsAndUserInfos(idClass, idUser)
	
			if(!lists){
				return res.status(500).json(err)
			}
			return res.status(200).json(lists)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
	async index_paginate(req,res){
		const idNotInt = req.query.idNotInt || ''
		const include = req.query.include || ''
		const field = req.query.field || 'title'
		//const sort = req.query.sort || '-createdAt'
		
		const limitDocsPerPage=parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);
		try{
			const listQuestions = {}
			const query = {
				where : {
					id:{
						[Op.notIn]:idNotInt.split(' ')
					},
					title: { 
						[Op.like]: `%${field==='title'?include:''}%` 
					},
					code: { 
						[Op.like]: `%${field==='code'?include:''}%` 
					}
				},
				order: [
					['createdAt','DESC']
				],

			}
			 

			listQuestions.count = await ListQuestions.count(query)

			const totalPages = Math.ceil(listQuestions.count/limitDocsPerPage)
			//console.log('total ',listQuestions.count)
			page = parseInt(page>totalPages?totalPages:page)
			page = page<=0?1:page

			query.limit = limitDocsPerPage
			query.offset = (page-1)*limitDocsPerPage
			query.include = [{
				model : Question,
				as    : 'questions',
			},{
				model: User,
				as: "author",
				attributes:["email"]
			}]
			listQuestions.rows = await ListQuestions.findAll(query)

			const listQuestionsPaginate = {
				docs        : listQuestions.rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(listQuestions.count),
				totalPages  : parseInt(totalPages)
			}
			return res.status(200).json(listQuestionsPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async show(req,res){
		const idList = req.params.id;
		const idClass = req.query.idClass;
		const idUser = req.query.idUser || req.userId;
		try{
			const userPromise = User.findOne({
				where:{
					id:idUser
				},
				attributes:['id','name'],
			})
			let listPromise = ListQuestionsService.getListFromClassWithQuestionsAndUserInfos(idList, idClass, idUser);
			let [list,user] = await Promise.all([
				listPromise,
				userPromise
			])
			if(!list){
				return res.status(500).json(err)
			}
			const response = req.query.idUser?{list,user}:list
			
			return res.status(200).json(response)
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}

	async store(req,res){
		try{
			const {title,questions} = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const listQuestion = await ListQuestions.create({
				title,
				code,
				author_id:req.userId
			})
			const bulkQuestions = await Promise.all([...questions].map(async qId =>Question.findByPk(qId) ))
			if(bulkQuestions.length>0){
				await listQuestion.addQuestions(bulkQuestions)
			}
			//await listQuestion.getQuestions()
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
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
		try{
			const {title,questions} = req.body
			const {id} = req.params;
			const listQuestion = await ListQuestions.findByPk(id);
			if(!listQuestion){
				return res.status(404).json()
			}
			//console.log(listQuestion)
			if(listQuestion.author_id !== req.userId){	
				//console.log("Sem permissão")
				return res.status(401).json({msg:"Sem permissão"})
			}
			await listQuestion.update({
				title,
			})
			const bulkQuestions = await Promise.all([...questions].map(async qId => Question.findByPk(qId) ))
			if(bulkQuestions.length > 0){
				await listQuestion.setQuestions(bulkQuestions);
			}
			//await listQuestion.getQuestions()
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                //console.log(validationsErros)
                return res.status(400).json(validationsErros);
            }
            else{
                console.log(err);
                return res.status(500).json(err);
            }
		}
	}

}
module.exports = new ListQuestionsController()