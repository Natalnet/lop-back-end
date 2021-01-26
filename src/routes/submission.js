const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const SubmissionController = require('../app/controllers/submissionController')

//midleware de auenticação
router.use('/submission',AuthMiddleware.authentication)

router.get('/submissions/page/:page',SubmissionController.index_paginate)

//cria uma submissão
router.post('/submission/store',SubmissionController.saveSubmissionOfProgrammingQuestion)
/*
recebe no body da requisição
(obrigatórios)
question_id -> id da questão,
hitPercentage -> valor fornececido pela apiCompiler,
language -> linguage de programação em que o código foi submetido (por enquanto só javascript ou cpp) ,
answer -> todo o código que está dentro do editor,
timeConsuming -> tempo consumido (ms) desde do didMount da página ou da útima subissão,
ip -> ip local do usuário,
environment -> (desktop ou mobile),
char_change_number -> número de variações de caractéres do editor desde o didMount somado com
o número de variações de caracteres do rascunho (casa exista),

(Não obrigatórios)
class_id -> id da turma
listQuestions_id -> id da urma,
test_id -> id da prova,

obs1: caso o aluno esteja submetendo dentro de uma turma, 
class_id e (listQuestions_id ou test_id) são obrigatórios

obs2: Essa rota só pode ser chamada após a chamada à apiCompiler e tiver obitido os resultdos
*/
router.post('/submission/ObjectiveQuestion',SubmissionController.saveSubmissionByObjectiveQuestion)
router.post('/submission/discursiveQuestion',SubmissionController.saveSubmissionByDiscursiveQuestion)
router.put('/submission/discursiveQuestion',SubmissionController.updateSubmissionByDiscursiveQuestion)

module.exports = (app) => app.use(router)