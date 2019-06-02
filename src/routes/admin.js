const router = require('express').Router()
const AuthMidlleware = require('../app/middlewares/authMiddleware')
const UserController = require('../app/controllers/UserController')
const InstituitionController = require('../app/controllers/InstituitionController')
const CourseController = require('../app/controllers/CourseController')

//middlewares to admin
router.use('/admin',AuthMidlleware.authentication,AuthMidlleware.permitionAdmin)

//routes to admin/users
router.get('/admin/users',UserController.get_users)
router.get('/admin/users/:id',UserController.get_user)
router.get('/admin/users/:id/edit',UserController.get_user)
router.put('/admin/users/:id/update',UserController.update)
router.delete('/admin/users/:id/delete',UserController.delete)

//routes to admin/instituitions
router.get('/admin/instituitions',InstituitionController.show)
router.get('/admin/instituitions/:id',InstituitionController.get_instituition)
router.get('/admin/instituitions/:id/edit',InstituitionController.get_instituition)
router.post('/admin/instituitions/create',InstituitionController.store)
router.put('/admin/instituitions/:id/update',InstituitionController.update)
router.delete('/admin/instituitions/:id/delete',InstituitionController.delete)

//routes to admin/couses
router.get('/admin/courses',CourseController.show)
router.get('/admin/courses/:id',CourseController.get_cousre)
router.get('/admin/courses/:id/edit',CourseController.get_cousre)
router.post('/admin/courses/create',CourseController.store)
router.put('/admin/courses/:id/update',CourseController.update)
router.delete('/admin/courses/:id/delete',CourseController.delete)

//routes to admin/subjects
/*router.get('/admin/subjects',SubjectController.show)
router.get('/admin/subjects/:id',SubjectController.get_subject)
router.get('/admin/subjects/:id/edit',SubjectController.get_subjects)
router.put('/admin/subjects/:id/update',SubjectController.update)
router.delete('/admin/subjects/:id/delete',SubjectController.delete)*/

module.exports = (app) => app.use(router)