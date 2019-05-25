const User = require('../models/UserModel');

class UserController{
	// Get a paginated list of all Users
	async list(req,res){
	
		const options = {
			page: req.params.page || 1,
			limit:10, //limitede documentos por página
			select: "name email"
		}
		User.paginate({},options,(err,result) => {
			return res.status(200).json(result)
		})
	}
	//Get an individual User's public information
	async show(req,res){
		const id = req.params.id
		const user = await User.findById(id).select('name')
		if(!user){
			return res.status(400).json({error:"User not found"})
		}
		return res.status(200).json(user)
	}
	//Get an individual user's private profile information
	async profile(req,res){
		const userId = req.userId
		const user = await User.findById(userId).select('name email')
		if(!user){
			return res.status(400).json({error:"User not found"})
		}
		return res.status(200).json(user)
	}
}

module.exports = new UserController();
