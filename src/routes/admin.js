const router = require('express').Router()
const AuthMidlleware = require('../app/middlewares/authMiddleware')
const UserController = require('../app/controllers/UserController')

//middlewares to admin
router.use('/admin',AuthMidlleware.authentication,AuthMidlleware.permitionAdmin)
//routes to admin/users
router.get('/admin/users',UserController.get_users)
router.get('/admin/users/:id',UserController.get_user)
router.get('/admin/users/:id/edit',UserController.get_user)
router.put('/admin/users/:id/update',UserController.update)
router.delete('/admin/users/:id/delete',UserController.delete)

//routes to admin/cousres
/*router.get('/admin/cousres',CousreController.show)
router.get('/admin/cousres/:id',CousreController.get_cousre)
router.get('/admin/cousres/:id/edit',CousreController.get_cousre)
router.put('/admin/cousres/:id/update',CousreController.update)
router.delete('/admin/cousres/:id/delete',CousreController.delete)*/

//routes to admin/instituitions
/*router.get('/admin/instituitions',InstituitionController.show)
router.get('/admin/instituitions/:id',InstituitionController.get_instituition)
router.get('/admin/instituitions/:id/edit',InstituitionController.get_get_instituition)
router.put('/admin/instituitions/:id/update',InstituitionController.update)
router.delete('/admin/instituitions/:id/delete',InstituitionController.delete)*/

//routes to admin/subjects
/*router.get('/admin/subjects',SubjectController.show)
router.get('/admin/subjects/:id',SubjectController.get_subject)
router.get('/admin/subjects/:id/edit',SubjectController.get_subjects)
router.put('/admin/subjects/:id/update',SubjectController.update)
router.delete('/admin/subjects/:id/delete',SubjectController.delete)*/

module.exports = (app) => app.use(router)