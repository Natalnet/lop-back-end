const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
// const CourseController = require('../app/controllers/courseController')

router.use('/course',AuthMiddleware.authentication)

// router.get('/course/page/:page',CourseController.getCourses);
// router.get('/course/class/:id/page/:page',CourseController.getCoursesByClass);
// router.get('/course/:id',CourseController.getCourse);
// router.post('/course',CourseController.createCourse);
// router.put('/course/:id',CourseController.updateCourse);

module.exports = (app) => app.use(router);