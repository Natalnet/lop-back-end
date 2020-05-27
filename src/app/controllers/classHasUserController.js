const path = require('path')
const sequelize = require('../../database/connection')
const {ClassHasUser} = sequelize.import(path.resolve(__dirname,'..','models'))

class ClassHasUserController{
    async store(req,res){
		const {idClass,idUser,enrollment} = req.body
		const {userEmail} = req.query
		try{
			const classHasUser = await ClassHasUser.create({
				user_id: idUser,
				class_id: idClass,
				enrollment
			})
			req.io.sockets.in(userEmail).emit('AcceptSolicitation',idClass)
			return res.status(200).json(classHasUser)
		}
        catch(err){
            console.log(err)
            return res.status(500).json(err)
        }
	}
	async storeAll(req, res){
		const {idClass,users} = req.body;
		try{
			const classHasUsers = await Promise.all(users.map(user=>{
				return ClassHasUser.create({
					user_id: user.id,
					class_id: idClass,
					enrollment: user.enrollment
				})			
			}));

			users.forEach(user => {
				req.io.sockets.in(user.email).emit('AcceptSolicitation',idClass);
			});

			return res.status(200).json(classHasUsers);
		}
        catch(err){
            console.log(err)
            return res.status(500).json(err)
        }
	}
	async delete(req,res){
		const {idClass,idUser} = req.query
		try{
			await ClassHasUser.destroy({
				where:{
					user_id:idUser,
					class_id:idClass
				}
			})
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new ClassHasUserController()