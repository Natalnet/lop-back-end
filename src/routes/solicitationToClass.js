const SolicitationToClassController = require('../app/controllers/solicitationToClassController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

router.use('/solicitation',AuthMiddleware.authentication)

router.get('/solicitation/classes',SolicitationToClassController.get_my_solicitations)
router.get('/solicitation/users/class/:id',SolicitationToClassController.get_class_solicitations)

router.put('/solicitation/class/:id/solicit',SolicitationToClassController.solicitClass)
//router.delete('/solicitation/class/:id/removeSolicit',SolicitationToClassController.removeSolicitClass)

//adiciona aluno na turma
router.put('/solicitation/:idClass/acceptSolicit/user/:idUser',AuthMiddleware.permitionProfessor,SolicitationToClassController.acceptSolicitClass)
//rejeita solicitação do aluno na turma
router.delete('/solicitation/:idClass/removeSolicitation/user/:idUser',SolicitationToClassController.destroySolicitClass)

module.exports = app => app.use(router)