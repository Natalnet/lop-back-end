const UserController = require('../app/controllers/userController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

//user Routes
//middlawares para user
router.use('/user',AuthMiddleware.authentication)
router.get('/user/page/:page',UserController.get_users)
router.get('/user/info/profile',UserController.profile_user)
router.get('/user/:id',UserController.show)
router.put('/user/request/class/:id',UserController.requestClass)
router.put('/user/removeRequest/class/:id',UserController.removeRequestClass)

//middlawares para obter todos os professores
router.use('/user/professor',AuthMiddleware.permitionProfessor)
//obtem todos os usuarios com o perfil "PROFESSOR"
router.get('/user/get/professores',UserController.get_all_professores)

module.exports = app => app.use(router)