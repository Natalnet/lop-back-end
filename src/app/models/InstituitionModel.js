const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const bcrypt = require('bcryptjs');

const InstituitionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    cep:{
        type: String,
        required: true,
    },
    number:{
        type: String,
        required:true,
    },
    complement:{
        type: String,
    },
    uf:{
        type: String,
        required:true,
    },
    neighborhood:{
        type: String,
        required:true,
    },
    state:{
        type: String,
        required:true,
    },
    profile:{
        type:String,
        required:true,
        enum:["PRIVADA","PÚBLICA"],
    },
    
},{timestamps:true});

InstituitionSchema.plugin(mongoosePaginate)

const Instituition = mongoose.model('Institution', InstituitionSchema);

module.exports = Instituition;