const path = require('path')
const sequelize = require('../../database/connection')
const {Class,ClassHasUser} = sequelize.import(path.resolve(__dirname,'..','models'))

class ClassMiddleware{
	async show(req,res,next){
        const idClass=req.params.id
        const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
		try{
            //const begin = new Date()
            if(!isUuid.test(idClass)){
                return res.status(404).json({msg:'página não encontrada'})
            }
            
			const classCountPromise = Class.count({
                where:{
                    id:idClass
                }
            })
            const myClassesCountPromise = ClassHasUser.count({
                where:{
                    user_id  : req.userId,
                    class_id : idClass
                },

            })
            const [classCount,myClassesCount] = await Promise.all([classCountPromise,myClassesCountPromise])
            if(classCount===0){
				return res.status(404).json({msg:'página não encontrada'})
            }
            if(myClassesCount===0){
                return res.status(401).json({msg:"Sem permissão"})
            }

            //const end = new Date()
            //console.log(`Tempo gasto: ${(end-begin)/1000 }s`)
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
module.exports = new ClassMiddleware()