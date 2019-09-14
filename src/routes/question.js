const route = require('express').Router()
const QuestionController = require('../app/controllers/questionController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const arrayPaginate = require('array-paginate')

//Midllware de autenticação
route.use('/question',AuthMiddleware.authentication)
route.get('/question',QuestionController.get_all_questions);
route.get('/question/:id',QuestionController.get_question);
route.get('/question/page/:page',QuestionController.get_all_questions_paginate)
//Midllware de permissão
route.use('/question/store', AuthMiddleware.permitionProfessor)
route.post('/question/store',QuestionController.store);
//Midllware de permissão
route.use('/question/update', AuthMiddleware.permitionProfessor)
route.put('/question/update/:id',QuestionController.update);


module.exports = (app) => app.use(route)
