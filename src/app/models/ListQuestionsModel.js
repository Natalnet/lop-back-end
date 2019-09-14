const mongoose = require('../../config/mongoose');

const ListQuestionSchema = new mongoose.Schema({
	title:{
		type:String,
		required:true
	},
	code:{
		type:String,
		required:true,
		unique: true
	},
	questions:[{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'Question'
	}],
	createdBy:{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model('ListQuestion',ListQuestionSchema)