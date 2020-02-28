const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ListQuestionsController = require('../app/controllers/listQuestionsController')
const ListQuestionsMiddleware= require('../app/middlewares/listQuestionsMiddleware')
 
//middlwares de autenticação
router.use('/listQuestion',AuthMiddleware.authentication)

//--------------------------------obtem todas as listas--------------------------------
router.get('/listQuestion',ListQuestionsMiddleware.index, ListQuestionsController.index)
/*
    recebe na query
    idClass -> id da turma da qual deseja-se obter as listas (obrigatório)
    idUser -> id do usuário, obrigatório caso queira saber os valores de subimissões para 
        um usuário específico (requisiado das telas de professores), caso não passe o id, os valores
        de submissões são referentes a usuário que está acessando (requisitados da tela de alunos).

    retorno
    um array de objetos listas
    lista.id -> id da lista
    lista.title -> título da lista
    lista.questionsCount-> número de questões da lista
    lista.completedSumissionsCount -> quanidade de questões que foram submetidas pelo menos uma vez 
        com 100% de acerto E DENTRO DO PRAZO
        (serve para fazer o cálculo em relação ao número de questões da barra de porcentagem das listas)
    lista.classHasListQuestion -> objeto com duas propriedades
        createdAt -> data em que a lista foi inserida na turma
        submissionDeadline -> data limite das submissõe da lista nessa turma (caso não tenha, devolve null)
----------------------------------------------------------------------------------------------------------
*/

//---------------------------obtem uma lista com o id enviado na rota---------------------------
router.get('/listQuestion/:id',ListQuestionsMiddleware.show, ListQuestionsController.show)
/*
    recebe na query
    idClass -> id da turma da qual deseja-se obter a lista (obrigatório)
    idUser -> id do usuário, obrigatório caso queira saber os valores de subimissões para 
        um usuário específico (requisiado das telas de professores), caso não passe o id, os valores
        de submissões são referentes a usuário que está acessando (requisitados da tela de alunos).
    
    retorno
    Um objeto lista
    lista.id -> id da lista
    lista.title -> título da lista
    lista.questionsCount-> número de questões da lista
    lista.completedSumissionsCount -> quanidade de questões que foram submetidas pelo menos uma vez 
        com 100% de acerto E DENTRO DO PRAZO
        (serve para fazer o cálculo em relação ao número de questões da barra de porcentagem das listas)
    lista.classHasListQuestion -> objeto com duas propriedades
            createdAt -> data em que a lista foi inserida na turma
            submissionDeadline -> data limite das submissõe da lista nessa turma (caso não tenha, devolve null)
    lista.questions -> um array de objeos questions
        question.id -> id da questão
        question.title -> o título da questão
        question.description -> enunciado d questão
        question.submissionsCount -> quantidade de submissões do usuário dessa questão
        question.isCorrect -> booleano indicando se pelomenos uma das submissões doi 100% de acerto
----------------------------------------------------------------------------------------------------------
*/

router.get('/listQuestion/page/:page',ListQuestionsMiddleware.index_paginate,ListQuestionsController.index_paginate)
router.post('/listQuestion/store',ListQuestionsMiddleware.store, ListQuestionsController.store)

module.exports = (app) => app.use(router) 