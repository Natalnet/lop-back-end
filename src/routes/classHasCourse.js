const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
// const {
//     addCourseInClass,
//     removeCoursefromClass
// } = require('../app/controllers/classHasCourseController')

router.use('/classHasCourse',AuthMiddleware.authentication)

// router.post('/classHasCourse',addCourseInClass)
// router.delete('/classHasCourse',removeCoursefromClass)


module.exports = app => app.use(router)