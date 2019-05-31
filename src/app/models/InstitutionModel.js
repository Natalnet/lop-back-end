const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const bcrypt = require('bcryptjs');

const InstitutionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    cep:{
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    complement:{
        type: String,
    },
    number:{
        type: String,
        required:true,
    },
    profile:{
        type:String,
        required:true,
        enum:["PRIVADA","PÚBLICA"],
    },
    
},{timestamps:true});

InstitutionSchema.plugin(mongoosePaginate)

InstitutionSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const Institution = mongoose.model('Institution', InstitutionSchema);

module.exports = Institution;