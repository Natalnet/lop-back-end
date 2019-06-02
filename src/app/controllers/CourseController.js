const Course = require('../models/CourseModel')

class CourseController{
	async store(req,res){
		const course = await Course.create(req.body)
		if(!course){
			return res.status(200).json({error:'create course failed :('})
		}
		return res.status(200).json(course)
	}
	async show(req,res){
		const options = {
			page: req.params.page || 1,
			limit:10, //limite de documentos por página
		}
		Course.paginate({},options,(err,result) => {
			return res.status(200).json(result)
		})

	}
	async get_cousre(req,res){
		const id =req.params.id
		const course = await Course.findById(id)
		if(!course){
			return res.status(400).json({error:'Course not found :('})
		}
		return res.status(200).json(course)
	}
	async update(req,res){
		const id = req.params.id
		const {name} = req.body
		await Course.findByIdAndUpdate(id,{
			'$set':{
				name : name
			}
		})
		return res.status(200).json(await Course.findById(id))
	}
	async delete(req,res){
		const id = req.params.id
		const course = await Course.findById(id)
		if(!course){
			return res.status(400).json({error:"course not found :("})
		}
		await Course.findByIdAndDelete(id)

		if(!await Course.findById(id)){
			return res.status(200).json({msg:"deletd course with success :/"})
		}
	}
}

module.exports = new CourseController()