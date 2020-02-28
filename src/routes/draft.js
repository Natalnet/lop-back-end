const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const DraftController = require('../app/controllers/draftController')

router.use('/draft',AuthMiddleware.authentication)

//----------------------------cria ou atualiza um rascunho-----------------------------
router.post('/draft/store',DraftController.store)
/*
    recebe no body
    '   idQuestion -> id da questão
        idClass -> id da turma (caso não esteja em uma turma, não precisa enviar)
        idList -> id da lista (caso não esteja em uma turma, não precisa enviar)
        idTest -> id da prova (caso não esteja em uma turma, não precisa enviar)
        answer -> todo o código que está dentro do editor
        char_change_number -> número de variações de caractéres

        obs: caso já exista um rascunho com os (idQuestion,idList,idTest,idClass)
        passados, answer e char_change_number serão atualizados
*/

module.exports = (app) => app.use(router)