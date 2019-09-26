const Class = require('../models/ClassModel')
const User = require('../models/UserModel')
const SolicitationToClass = require('../models/SolicitationToClassModel')

class SolicitationToClassController{
	async get_all_solicitatuion(req,res){
		try{
			const solicitations = await SolicitationToClass.find()
			return res.status(200).json(solicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async get_my_solicitations(req,res){
		try{
			const mySolicitations = await SolicitationToClass.find({user:req.userId},{status:'PENDENTE'}).populate('classSolicited')
			return res.status(200).json(mySolicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async get_class_solicitations(req,res){
		const idClass = req.params.id
		try{
			const classSolicitations = await SolicitationToClass.find({classSolicited:idClass},{status:'PENDENTE'}).populate('user')
			return res.status(200).json(classSolicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}
	}
	async solicitClass(req,res){
		const idClass = req.params.id
		try{
			const newSolicitationToClass = await SolicitationToClass.create({
				user : req.userId,
				classSolicited : idClass
			})
			const solicitationToClass = await SolicitationToClass.findById(newSolicitationToClass._id)
			if(!solicitationToClass){
				const msg = 'solicitação não pôde ser feita'
				console.log(msg);
				return res.status(500).json(msg)
			}
			req.io.sockets.in(idClass).emit('RequestsClass',solicitationToClass)
			return res.status(200).json(solicitationToClass)
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}	
	}
	async removeSolicitClass(req,res){
		const idClass = req.params.id
		try{
			const solicitationToClassDeleted = await SolicitationToClass.findOneAndDelete(
				{user:req.userId},
				{classSolicited:idClass}
			)
			const solicitationToClass = await SolicitationToClass.findById(solicitationToClassDeleted._id)
			if(solicitationToClass){
				const msg = 'solicitação não pôde ser cancelada'
				console.log(msg);
				return res.status(500).json(msg)
			}
			req.io.sockets.in(idClass).emit('RequestsClass',solicitationToClass)
			return res.status(200).json('ok')
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
			const turma = await Class.findById(idClass)
			const user = await User.findById(idUser)
			if(!turma){
				return res.status(404).json({error:"Class not found :("})
			}
			if(!user){
				return res.status(400).json({error:"User not found :("})
			}
			const solicitationToClass = await SolicitationToClass.findOne(
				{user:idUser},
				{classSolicited:idClass}
			)
			if(!solicitationToClass){
				return res.status(400).json({error:"Solicitation not found :("})
			}


			turma.students.push(user)
			user.classes.push(turma)
			await turma.save()
			await user.save()
			solicitationToClass.status="ACEITA"
			await solicitationToClass.save()

			req.io.sockets.in(idUser).emit('MyRequestsClass',turma)
			return res.status(200).json("ok")
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
			const solicitationToClassDeleted = await SolicitationToClass.findOneAndDelete(
				{user:idUser},
				{classSolicited:idClass}
			)

			const solicitationToClass = await SolicitationToClass.findById(solicitationToClassDeleted._id)

			if(solicitationToClass){
				const msg = 'solicitação não pôde ser cancelada'
				console.log(msg);
				return res.status(500).json(msg)
			}
			req.io.sockets.in(idUser).emit('MyRequestsClass',idClass)
			return res.status(200).json('ok')
		}
		catch(err){
			console.log(err);
			return res.status(500).json('err')
		}	
	}

}
module.exports = new SolicitationToClassController()