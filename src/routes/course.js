const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const CourseController = require('../app/controllers/courseController')

router.use('/course',AuthMiddleware.authentication)

router.post('/course',CourseController.createCourse)
router.put('/course/:id',CourseController.updateCourse)
router.get('/course/page/:page',CourseController.getCourses)

module.exports = (app) => app.use(router);