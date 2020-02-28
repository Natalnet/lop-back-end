const crypto = require('crypto');
const {Op} = require('sequelize')
const path = require('path')

const sequelize = require('../../database/connection')
const {User,Class,SolicitationToClass,ClassHasUser} = sequelize.import(path.resolve(__dirname,'..','models'))

class UserController{
	// Get a paginated list of all Users
	async index(req,res){
		const idClass = req.query.idClass || ""
		const profile = req.query.profile || ""
		const fields = req.query.fields?req.query.fields.split(' ').map(f=>f.trim()):['id','name','email','profile','createdAt','updatedAt']
		const solicitations = req.query.solicitations || ""

		try{
			const query = {
				where:{
					profile:{
						[Op.like]:`%${profile}%`
					}
				},
				attributes : fields
			}
			const include = []
			if(solicitations && solicitations==="yes"){
				query.include = [...include,{
					model:Class,
					as: "solicitedClasses",
					where:{
						id:idClass
					}
				}]
			}
			let users = await User.findAll(query)
			users = users.map(user=>{
				return {
					id:user.id,
					name:user.name,
					email:user.email,
					enrollment:solicitations && user.solicitedClasses[0].solicitationToClass.enrollment
				}
			})
			return res.status(200).json(users)	
		}
		catch(err){
			console.log(err);
			return res.status(200).json(err)
		}

	}
	async index_paginate(req,res){
		const field = req.query.field || 'name'
		const includeString = req.query.include || ''
		const limitDocsPerPage= parseInt(req.query.docsPerPage || 15);
		const classes = req.query.classes
		const idClass = req.query.idClass
		let page = parseInt(req.params.page || 1);
		try{
			const users = {}
			const query = {
				where:{
					name: { 
						[Op.like]: `%${field==='name'?includeString:''}%` 
					},
					email: { 
						[Op.like]: `%${field==='email'?includeString:''}%` 
					}, 
				},
				order:[
					['name']
				],
			}
			const include = []
			if(classes && classes==="yes"){
				query.order = [
					['profile','DESC'],['name']
				]
				query.include = [...include,{
					model:Class,
					as:'classes',
					where:{
						id:idClass
					}
				}]
			}
			users.count = await User.count(query)

			const totalPages = Math.ceil(users.count/limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page<=0?1:page

			query.limit = limitDocsPerPage
			query.offset = (page-1)*limitDocsPerPage

			users.rows = await User.findAll(query)
			users.rows = users.rows.map(user=>{
				return {
					id:user.id,
					name:user.name,
					email:user.email,
					profile:user.profile,
					enrollment:classes && user.classes[0].classHasUser.enrollment
				}
			})
			const usersPaginate = {
				docs        : users.rows,
				currentPage : page,
				perPage     : parseInt(limitDocsPerPage),
				total       : parseInt(users.count),
				totalPages  : parseInt(totalPages)
			}
			return res.status(200).json(usersPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async update(req,res){
		const idUser = req.params.id
		try{
			const user = await User.findByPk(idUser)
			await user.update(req.body.user)
			return res.status(200).json(user)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async show(req,res){

	}
	async delete(req,res){

	}


}

module.exports = new UserController();
