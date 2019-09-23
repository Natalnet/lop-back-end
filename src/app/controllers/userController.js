const User = require('../models/UserModel');
const Class = require('../models/ClassModel');
const arrayPaginate = require('array-paginate')

class UserController{
	// Get a paginated list of all Users
	async get_users(req,res){
		const users = await User.find()
		return res.status(200).json(users)
	}
	async get_usersPaginate(req,res){
		const include = req.query.contentInputSeach
		const page = req.params.page || 1;
		const limitDocsPerPage=10;
		try{
			const users = await User.find({ title: { $regex: '.*' + include + '.*' }})
			const usersPaginate = arrayPaginate(classes,page,limitDocsPerPage)
			return res.status(200).json(usersPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async get_myClassesPaginate(req,res){
		const include = req.query.include || ''
		const page = req.params.page || 1;
		const limitDocsPerPage=8;
		try{
			const users = await User.findById(req.userId).populate({
				path:'classes',
				match:{name:{$regex: '.*' + include + '.*'}},
				options:{sort:{createdAt:-1}}
			})
			const myClassesPaginate = arrayPaginate(users.classes,page,limitDocsPerPage)
			return res.status(200).json(myClassesPaginate)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	//Get an individual User's public information
	async show(req,res){
		const id = req.params.id
		const user = await User.findById(id).select('name')
		if(!user){
			return res.status(400).json({error:"User not found :("})
		}
		return res.status(200).json(user)
	}
	//Get an individual user's private profile information
	async profile_user(req,res){
		const userId = req.userId
		const user = await User.findById(userId).populate('classes requestedClasses')
		if(!user){
			return res.status(400).json({error:"User not found :("})
		}
		return res.status(200).json(user)
	}
	//Get an individual user's private profile information in admin
	async get_user(req,res){
		const id = req.params.id
		const user = await User.findById(id).populste('classes requestedClasses')
		if(!user){
			return res.status(400).json({error:"User not found :("})
		}
		return res.status(200).json(user)
	}
	async requestClass(req,res){
		try{
		const idTurma = req.params.id
		const turma = await Class.findById(idTurma).populate('requestingUsers')
		const user = await User.findById(req.userId)
		if(!turma || !user){
			return res.status(400).json({error:"User or class not found :("})
		}
		turma.requestingUsers.push(user)
		user.requestedClasses.push(turma)
		await turma.save()
		await user.save()
		req.io.sockets.in(idTurma).emit('RequestsClass',turma.requestingUsers)
		return res.status(200).json("ok")
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}

	}
	async removeRequestClass(req,res){
		const idTurma = req.params.id
		try{
			const turma = await Class.findById(idTurma).populate('requestingUsers')
			//console.log(turma);
			if(!turma){
				console.log('class not found');
				return res.status(400).json('class not found')
			}
			const user = await User.findById(req.userId)
			if(!user){
				console.log('user not found');
				return res.status(400).json('user not found')
			}
			turma.requestingUsers.pull(user)
			user.requestedClasses.pull(turma)
			await turma.save()
			await user.save()
			req.io.sockets.in(idTurma).emit('RequestsClass',turma.requestingUsers)
			return res.status(200).json("ok")
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async update(req,res){
		const id = req.params.id
		const {profile} = req.body

		const user = await User.findById(id)
		if(!user){
			return res.status(400).json({error:"User not found :("})
		}
		
		const userUpdated = await User.findByIdAndUpdate(id,{
			'$set':{
				profile  : profile
			}
		})
		if(!userUpdated){
			return res.status(500).json({error:"User not updated :("})
		}
		return res.status(200).json({msg:"updated user with success :/"})	
	}
	async delete(req,res){
		const id = req.params.id
		const user = await User.findById(id)
		if(!user){
			return res.status(400).json({error:"User not found :("})
		}
		const userDelete = await User.findByIdAndDelete(id)
		if(!userDelete){
			return res.status(500).json({error:"User not deleted :("})
		}
		return res.status(200).json({msg:"deletd user with success :/"})
		
	}
	async get_all_professores(req,res){
		try{
			const professores = await User.find({profile:"PROFESSOR"}).populate('class')
			//console.log(professores);
			return res.status(200).json(professores)
		}catch(err){
			console.log('---err---');
			console.log(Object.getOwnPropertyDescriptors(err));
			console.log('---------');
			return res.status(500).json({erro:"erro ao obter professores"})
		}

	}
}

module.exports = new UserController();
