const router = require('express').Router()
const AuthMidlleware = require('../app/middlewares/authMiddleware')
const UserController = require('../app/controllers/userController')

//middlewares to admin
router.use('/admin',AuthMidlleware.authentication,AuthMidlleware.permitionAdmin)

//routes to admin/users
router.get('/admin/users',UserController.get_users)
router.get('/admin/users/:id',UserController.get_user)
router.get('/admin/users/:id/edit',UserController.get_user)
router.put('/admin/users/:id/update',UserController.update)
router.delete('/admin/users/:id/delete',UserController.delete)

module.exports = (app) => app.use(router)