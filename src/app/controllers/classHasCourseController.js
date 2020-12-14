const path = require('path')
const sequelize = require('../../database/connection')
const {ClassHasCourse} = sequelize.import(path.resolve(__dirname,'..','models'))

class ClassHasCourseController{
    async addCourseInClass(req, res){
        const { class_id, course_id} = req.body;
        try{
            if(req.userProfile !== 'PROFESSOR'){
                return res.status(401).json({})
            }
            await ClassHasCourse.create({
                isVisible: true,
                class_id,
                course_id,
                createdAt: new Date()
            })
            return res.status(200).json({msg: 'ok'})
        }
        catch(err){
            console.log(err)
            if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
                return res.status(400).json({ msg: 'erro de validação' });
            }
            else {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    }
    async removeCoursefromClass(req, res){
        const { class_id, course_id} = req.query;
        try{
            if(req.userProfile !== 'PROFESSOR'){
                return res.status(401).json({})
            }
            await ClassHasCourse.destroy({
                where:{
                    class_id,
                    course_id,
                }
            })
            return res.status(200).json({msg: 'ok'})
        }
        catch(err){
            console.log(err)
            if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
                return res.status(400).json({ msg: 'erro de validação' });
            }
            else {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    }
}
module.exports = new ClassHasCourseController()