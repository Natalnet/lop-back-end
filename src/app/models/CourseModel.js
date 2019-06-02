const mongoose = require('../../config/mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const bcrypt = require('bcryptjs');

const CourseSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    
    
},{timestamps:true});

CourseSchema.plugin(mongoosePaginate)

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;