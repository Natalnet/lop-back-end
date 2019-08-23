const mongoose = require('../../config/mongoose');

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
    
    results: {
        type: Array,
        required:true
    }
})
module.exports = mongoose.model('Question',QuestionSchema)