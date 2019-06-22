const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const bcrypt = require('bcryptjs');

const UserPendingSchema = new mongoose.Schema({
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
    solicitationKey:{
        type: String,
        select: false,
    },
    solicitationExpires: {
        type: Date,
        select: false,
    },
},{timestamps:true});

UserPendingSchema.plugin(mongoosePaginate)


const UserPending= mongoose.model('UserPending', UserPendingSchema);

module.exports = UserPending;