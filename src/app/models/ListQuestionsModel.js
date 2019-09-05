const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')

const ListQuestionSchema = new mongoose.Schema({
	title:{
		type:String,
		required:true
	},
	typeList:{
		type:String,
		required:true,
	},
	questions:[{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'Question'
	}]
},{timestamps:true})
ListQuestionSchema.plugin(mongoosePaginate)

module.exports=mongoose.model('ListQuestion',ListQuestionSchema)