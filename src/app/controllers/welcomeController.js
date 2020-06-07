class WelcomeController{
	async hello(req, res, next){
        return res.status(200).json({
            message: "welcome to the lop api"
        })
    }
    
    async error(req, res, next){
        return res.status(500).json({
            error: "internal error :("
        })
	}
}

module.exports = new WelcomeController()