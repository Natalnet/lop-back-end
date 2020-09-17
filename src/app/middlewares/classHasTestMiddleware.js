class classHasTestMiddleware{
    async update(req,res,next){
        if(req.userProfile!=="PROFESSOR"){
            return res.status(401).json({msg:"Sem permissão"})
        }
		return next();
	}
}
module.exports = new classHasTestMiddleware();