const path = require('path')
const sequelize = require('../../database/connection')
const {User,SolicitationToClass} = sequelize.import(path.resolve(__dirname,'..','models'))

class SolicitationToClassController{

	async index(req,res){
		const mySolicitations = req.query.mySolicitations
		try{
			const query = {}

			if(mySolicitations && mySolicitations==="yes"){
				query.where={
					user_id:req.userId
				}
			}
			const solicitations = await SolicitationToClass.findAll(query)
			return res.status(200).json(solicitations)
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async store(req,res){
		const {idClass,enrollment} = req.body
		try{
			await SolicitationToClass.create({
				user_id:req.userId,
				class_id:idClass,
				enrollment
			}).then(async ()=>{
				let user = await User.findOne({
					where:{
						id:req.userId,
					},
					attributes:['id','name','email']
					
				})
				user = JSON.parse(JSON.stringify(user))
				user.enrollment = enrollment
				req.io.sockets.in(idClass).emit('soliciteClass',user)
			})
			return res.status(200).json({
				user_id:req.userId,
				class_id:idClass
			})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async delete(req,res){
		const idClass = req.query.idClass
		const idUser = req.query.idUser || req.userId
		const emailUser = req.query.emailUser
		try{
			await SolicitationToClass.destroy({
				where:{
					user_id:idUser,
					class_id:idClass
				}
			})
			//console.log(req.userEmail)
			if(emailUser) req.io.sockets.in(emailUser).emit('RejectSolicitation',idClass)
			else req.io.sockets.in(idClass).emit('cancelSolicitClass',idUser)
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

}
module.exports = new SolicitationToClassController()