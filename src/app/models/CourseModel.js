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

CourseSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;