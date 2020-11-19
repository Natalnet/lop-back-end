const path = require('path');
const sequelize = require('../../database/connection');
const { Op } = require('sequelize')

const { Course, User } = sequelize.import(path.resolve(__dirname, '..', 'models'));
const crypto = require('crypto');

class CourseController {

    async getCourses(req, res) {
        const titleOrCode = req.query.titleOrCode || ''
        //const sort = req.query.sort || '-createdAt'
        const limitDocsPerPage = parseInt(req.query.docsPerPage || 15);
        let page = parseInt(req.params.page || 1);

        try {
            const courses = {}
            const query = {
                where: {
                    [Op.or]: {
                        title: {
                            [Op.like]: `%${titleOrCode}%`
                        },
                        code: {
                            [Op.eq]: titleOrCode
                        },
                    },
                },
                order: [
                    ['createdAt', 'DESC']
                ],
                attributes: ['id', 'title', 'description', 'code', 'createdAt'],
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'email'],
                    }
                ]
            }
            courses.count = await Course.count(query);
            const totalPages = Math.ceil(courses.count / limitDocsPerPage)
            page = parseInt(page > totalPages ? totalPages : page)
            page = page <= 0 ? 1 : page

            query.limit = limitDocsPerPage
            query.offset = (page - 1) * limitDocsPerPage

            courses.rows = await Course.findAll(query);

            const coursesPagined = {
                docs: courses.rows,
                currentPage: page,
                perPage: parseInt(limitDocsPerPage),
                total: parseInt(courses.count),
                totalPages: parseInt(totalPages)
            }
            return res.status(200).json(coursesPagined)
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }

    async createCourse(req, res) {
        const { title, description } = req.body;
        const code = crypto.randomBytes(5).toString('hex');
        try {
            await Course.create({
                title,
                description,
                code,
                author_id: req.userId

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

    async updateCourse(req, res) {
        const { id } = req.params;
        const { title, description } = req.body;
        try {
            const course = await Course.findByPk(id);
            if (!course) {
                return res.status(404).json()
            }
            if (course.author_id !== req.userId) {
                //console.log("Sem permissão")
                return res.status(401).json({ msg: "Sem permissão" })
            }

            await course.update({
                title,
                description,
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

module.exports = new CourseController();