const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassController = require('../app/controllers/classController')

//middlewares para professor
router.use('/class',AuthMiddleware.authentication, AuthMiddleware.permitionProfessor)

//obtem lista de todas as turmas cadastradas
router.get('/class',ClassController.get_all_classes)
router.get('/class/:id',ClassController.get_class)
//criar turma
router.post('/class/store',ClassController.store)

module.exports = app => app.use(router)