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
router.get('/class/:id/participants',ClassController.get_class_participants)
router.get('/class/:id/requests',ClassController.get_class_requests)
router.get('/class/:id/lists',ClassController.get_class_lists)
//adiciona aluno na turma
router.put('/class/:idClass/acceptRequest/user/:idUser',AuthMiddleware.permitionProfessor,ClassController.acceptRequest)
//rejeita aluno na turma
router.put('/class/:idClass/rejectRequest/user/:idUser',AuthMiddleware.permitionProfessor,ClassController.rejectRequest)
//criar turma
router.post('/class/store',AuthMiddleware.permitionProfessor,ClassController.store)
//atualiza turma
router.put('/class/:id/update',AuthMiddleware.permitionProfessor,ClassController.update)

module.exports = app => app.use(router)