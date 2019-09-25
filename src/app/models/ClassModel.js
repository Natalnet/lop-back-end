const mongoose = require('../../config/mongoose');
const bcrypt = require('bcryptjs');

const ClassSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    year: {
        type: String,
        required: true,
    },
    semester:{
        type: String,
        enum:['1','2'],
        required: true,
        select: false,
    },
    description:{
        type: String,
        required:true,
    },
    state:{
        type:String,
        required:true,
        enum:["ATIVA","INATIVA"],
        default:"ATIVA"
    },
    listsQuestions:[{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'ListQuestion'
    }],
    professores: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User'
    }],
    students: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User'
    }],

},{timestamps:true});


const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;