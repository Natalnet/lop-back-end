const User = require('../models/UserModel')

module.exports= async (req,res,next) => {
	const id = req.userId;
	const user = await User.findById(id).select('profile');
	if(user.profile!=="ADMINISTRADOR"){
		res.status(401).json({error:"You do not have permission to access this page"})
	}
	await next()
}