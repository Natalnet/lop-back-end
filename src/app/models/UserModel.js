const mongoose = require('../../config/mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
        select: false,
    },
    enrollment:{
        type: String,
        unique:true,
        required:true,
    },
    profile:{
        type:String,
        required:true,
        enum:["ALUNO","PROFESSOR","ADMINISTRADOR"],
        default:"ALUNO"
    },
    classes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Class',
    }],
    requestedClasses: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref:'Class'
    }],
    passwordResetKey:{
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
},{timestamps:true});


/*UserSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});*/

const User = mongoose.model('User', UserSchema);

module.exports = User;