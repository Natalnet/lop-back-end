const path = require('path');
const sequelize = require('../../database/connection');
const { Op, ConnectionRefusedError } = require('sequelize')

const { Course, User, Question, Lesson } = sequelize.import(path.resolve(__dirname, '..', 'models'));
const crypto = require('crypto');

class LessonController {

    async getLessonsByCourse(req, res) {
        const { idCourse } = req.params;
        try {
            const course = await Course.findByPk(idCourse);
            const query = {
                attributes:['id','title','startDate','isVisible','createdAt'],
                order: [
					['createdAt', 'DESC']
				],
                include:[{
                    model: Course,
                    as: 'course',
                    where:{
                        id: idCourse
                    },
                    attributes: []
                }]
            }
            if(course.author_id !== req.userId){
                query.where = {
                    isVisible: true
                }
            }
            const lessons = await Lesson.findAll(query)
            if(!course){
                return res.status(404).json({msg:'curso não encontrado'})
            }


            return res.status(200).json(lessons)
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }

    async getLesson(req, res){
        const { id } = req.params;
        try{
            const course = await Lesson.findByPk(id,{
                attributes: ['id', 'title', 'description', 'createdAt'],
            });
            return res.status(200).json(course);
        }
        catch(err){
            console.log(err)
            return res.status(500).json(err);
        }
    }

    async createLesson(req, res) {
        const { title, description, course_id, questions } = req.body;
        try {
            const course = await Course.findByPk(course_id);
            if (!course) {
                return res.status(404).json()
            }
            if (course.author_id !== req.userId) {
                return res.status(401).json({ msg: "Sem permissão" });
            }
            const lesson = await Lesson.create({
                title,
                description,
                course_id
            })
            const bulkQuestions = await Promise.all([...questions].map(async qId =>Question.findByPk(qId) ))
			if(bulkQuestions.length>0){
				await lesson.addQuestions(bulkQuestions);
			}
            return res.status(200).json({ msg: 'ok' });
        }
        catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
                return res.status(400).json({ msg: 'erro de validação' });
            }
            else {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    }


    async updateLesson(req, res) {
        const { id } = req.params;
        const { title, description, questions } = req.body;
        try {
            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                return res.status(404).json({})
            }
            const course = await Course.findByPk(lesson.course_id);

            if (course.author_id !== req.userId) {
                //console.log("Sem permissão")
                return res.status(401).json({ msg: "Sem permissão" })
            }

            await lesson.update({
                title,
                description,
            })
            const bulkQuestions = await Promise.all([...questions].map(async qId => Question.findByPk(qId) ))
			if(bulkQuestions.length > 0){
				await lesson.setQuestions(bulkQuestions);
			}
            return res.status(200).json({ msg: 'ok' });
        }
        catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
                return res.status(400).json({ msg: 'erro de validação' });
            }
            else {
                console.log(err);
                return res.status(500).json(err);
            }
        }
    }
    async updateVisibilityLesson(req, res) {
        const { id } = req.params;
        const { isVisible } = req.body;
        try {
            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                return res.status(404).json({})
            }
            const course = await Course.findByPk(lesson.course_id);

            if (course.author_id !== req.userId) {
                //console.log("Sem permissão")
                return res.status(401).json({ msg: "Sem permissão" })
            }

            await lesson.update({
                isVisible,
            })
            return res.status(200).json({ msg: 'ok' });
        }
        catch (err) {
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

module.exports = new LessonController();