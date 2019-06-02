const Instituition = require('../models/InstituitionModel')

class InstituitionController{
	async show(req,res){
		const options = {
			page: req.params.page || 1,
			limit:10, //limitede documentos por página
		}
		Instituition.paginate({},options,(err,result) => {
			return res.status(200).json(result)
		})
	}
	async store(req,res){
		const instituition = await Instituition.create(req.body)
		if(!instituition){
			return res.status(500).json({error:"create instituition failed :("})
		}
		return res.status(200).json(instituition)	
	}
	async get_instituition(req,res){
		const id = req.params.id
		const instituition = await Instituition.findById(id)
		if(!instituition){
			return res.status(400).json({error:"Instituition not found :("})
		}
		return res.status(200).json(instituition)
	}
	async update(req,res){
		const id = req.params.id
		const {name,street,cep,number,complement,uf,neighborhood,state,profile}=req.body
		const instituition = await Instituition.findById(id)
		if(!instituition){
			return res.status(400).json({error:"Instituition not found :("})
		}
		await Instituition.findByIdAndUpdate(id,{
			'$set':{
				name         : name,
				street       : street,
				cep          : cep,
				number       : number,
				complement   : complement,
				uf           : uf,
				neighborhood : neighborhood,
				state        : state,
				profile      : profile,
			}
		})
		return res.status(200).json(await Instituition.findById(id))
	}
	async delete(req,res){
		const id = req.params.id
		const instituition = await Instituition.findById(id)
		if(!instituition){
			return res.status(400).json({error:"instituition not found :("})
		}
		await Instituition.findByIdAndDelete(id)

		if(!await Instituition.findById(id)){
			return res.status(200).json({msg:"deletd instituition with success :/"})
		}
	}
}
module.exports = new InstituitionController();