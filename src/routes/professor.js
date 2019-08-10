const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ProfessorController = require('../app/controllers/ProfessorController')
const ClassController = require('../app/controllers/classController')

//middlewares para professor
router.use('/professor',AuthMiddleware.authentication, AuthMiddleware.permitionProfessor)

//obtem todos os usuarios com o perfil "PROFESSOR"
router.get('/professor',ProfessorController.get_all_professores)
//obtem lista de todas as turmas cadastradas
router.get('/professor/classes',ClassController.get_all_classes)
//criar turma
router.post('/professor/store',ClassController.store)

module.exports = app => app.use(router)