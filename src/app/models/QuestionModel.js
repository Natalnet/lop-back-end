const mongoose = require('../../config/mongoose');
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
    difficulty:{
        type:String,
        enum:['Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil'],
        default:'Fácil'
    },
    katexDescription:{
        type:String
    },
    status:{
        type:String,
        enum:['PÚBLICA','PRIVADA'],
        default:'PÚBLICA',
        required:true
    },
    solution:{
        type: String
    },
    code:{
        type:String,
        required:true,
        unique: true
    },
    results:{
        type: Array,
        required:true
    },
    createdBy:{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model('Question',QuestionSchema)