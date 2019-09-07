const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassController = require('../app/controllers/classController')

//middleware de autenticação
router.use('/class',AuthMiddleware.authentication)
//obtem lista de todas as turmas
router.get('/class',ClassController.get_all_classes)
//obtem lista de todas as turmas abertas páginadas
router.get('/class/open/page/:page',ClassController.get_all_classes_paginate)
//obtem lista de todas as turmas ativas
router.get('/class/open',ClassController.get_all_classes_open)
//obtem informações de uma turma específica
router.get('/class/:id',ClassController.get_class)

//middleware para aceitar aluno na turma (só professor pode) 
router.use('/class/:idClass/acceptRequest/user/:idUser',AuthMiddleware.permitionProfessor)
//adiiona aluno na turma
router.put('/class/:idClass/acceptRequest/user/:idUser',ClassController.acceptRequest)
//middleware para rejeitar aluno na turma (só professor pode) 
router.use('/class/:idClass/acceptRequest/user/:idUser',AuthMiddleware.permitionProfessor)
//rejeita aluno na turma
router.put('/class/:idClass/rejectRequest/user/:idUser',ClassController.rejectRequest)

//middleware para criar turma (só professor pode)
router.use('/class/store',AuthMiddleware.permitionProfessor)
//criar turma
router.post('/class/store',ClassController.store)

//middleware para editar turma (só professor pode)
router.use('/class/:id/update',AuthMiddleware.permitionProfessor)
//criar turma
router.put('/class/:id/update',ClassController.update)

module.exports = app => app.use(router)