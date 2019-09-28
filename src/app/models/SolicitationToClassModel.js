const mongoose = require('../../config/mongoose');

const SolicitationToClassSchema = mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'User',
        required:true
    },
    classSolicited:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Class',
        required:true,
    }


},{timestamps:true})

module.exports = mongoose.model('SolicitationToClass',SolicitationToClassSchema)