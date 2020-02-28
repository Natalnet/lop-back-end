
const path = require('path')
const sequelize = require('../../database/connection')
const  {Class,Question,Tag,Test,ListQuestions}= sequelize.import(path.resolve(__dirname,'..','models'))

class QuestionMiddleware{

	async show(req,res,next){
		const {idList,idTest,idClass} = req.query
        const idQuestion = req.params.id
        const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        
        try{
            if(!isUuid.test(idQuestion)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
            if(idClass && !isUuid.test(idClass)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
            if(idList && !isUuid.test(idList)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }
            if(idTest && !isUuid.test(idTest)){
                
                return res.status(404).json({msg:'página não encontrada'})
            }

            let promises = [
                Question.count({
                    where:{
                        id:idQuestion
                    }
                })
            ]
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
            if(idList){
                promises = [
                    ...promises,
                    ListQuestions.count({
                        where:{
                            id:idList
                        }
                    })
                ]
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
            const results = await Promise.all(promises)
            for(let r of results){
                if(r===0){
                    
                    return res.status(404).json({msg:'página não encontrada'})
                }
            }
            
            return next()
		}
		catch(err){
			console.log(err);
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
module.exports = new QuestionMiddleware