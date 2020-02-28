const path = require('path')
const sequelize = require('../../database/connection')
const {Test,Question,Class,Submission,User,ClassHasTest} = sequelize.import(path.resolve(__dirname,'..','models'))

class TestMiddleware{
	async index(req,res,next){
		const idUser = req.query.idUser || req.userId
		const idClass = req.query.idClass
        const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        let promises = [] 
		try{
            
			if(idUser && !isUuid.test(idUser)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
			if(idClass && !isUuid.test(idClass)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
            if(idClass){
                promises = [
                    ...promises,
                    Class.count({
                        where:{
                            id:idClass
                        }                    
                    })
                ]
            }
            if(idUser){
                promises = [
                    ...promises,
                    User.count({
                        where:{
                            id:idUser
                        }
                    })
                ]
            }
            const results = await Promise.all(promises)
            for(let r of results){
                if(r===0){
                    
                    return res.status(404).json({msg:'página não encontrada'})
                }
            }
            
            return next()
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
	}
    async index_paginate(req,res,next){
        if(req.userProfile!=="PROFESSOR"){
            return res.status(401).json({msg:"Sem permissão"})
        }
		return next()
	}

	async show(req,res,next){
		const idTest = req.params.id
		const idClass = req.query.idClass 
		const idUser = req.query.idUser || req.userId
		const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        const begin = new Date()
        let promises = []
		try{
            if(!isUuid.test(idTest)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
			if(idUser && !isUuid.test(idUser)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
			if(idClass && !isUuid.test(idClass)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
            if(idTest){
                promises = [
                    ...promises,
                    Test.count({
                        where:{
                            id:idTest
                        }                    
                    })
                ]
            }    
            if(idClass){
                promises = [
                    ...promises,
                    Class.count({
                        where:{
                            id:idClass
                        }                    
                    })
                ]
            }
            if(idUser){
                promises = [
                    ...promises,
                    User.count({
                        where:{
                            id:idUser
                        }
                    })
                ]
            }
            const results = await Promise.all(promises)
            for(let r of results){
                if(r===0){
                    
                    return res.status(404).json({msg:'página não encontrada'})
                }
            }
            
            return next()
        }
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
    }
    async store(req,res,next){
        if(req.userProfile!=="PROFESSOR"){
            return res.status(401).json({msg:"Sem permissão"})
        }
		return next()
	}
    async update(req,res,next){
        if(req.userProfile!=="PROFESSOR"){
            return res.status(401).json({msg:"Sem permissão"})
        }
		return next()
	}

}
module.exports = new TestMiddleware()