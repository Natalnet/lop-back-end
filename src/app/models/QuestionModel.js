const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const User = require('./UserModel')

const QuestionSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,

    },
    description:{
        type:String,
        required:true,
        unique:true,

    },
    results:{
        type: Array,
        required:true
    },
    creator:{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required:true
    }
},{timestamps:true})
QuestionSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Question',QuestionSchema)