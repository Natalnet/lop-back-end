const SolicitationController = require('../app/controllers/solicitationToClassController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

router.use('/solicitation',AuthMiddleware.authentication)

//--------------------------------obtem todas as slicitações--------------------------------
router.get('/solicitation',SolicitationController.index)
/*
    recebe na query
    mySolicitations -> caso passe o valor 'yes', será retornado todas as solicitações do usuário
        que está acessando

    retorno 
    um array de objetos solicitações
    solicitação.id -> id da solicitação
    solicitação.user_id -> id do usuário que fez a silicitação
    solicitação.class_id -> id da turma solicitada
    solicitação.createdAt ->  data em que a solicitação foi criada
----------------------------------------------------------------------------------------------------------
*/

//------------------------------------------cria um solicitação-------------------------------------------
router.post('/solicitation/store',SolicitationController.store)
/*
    recebe body
    idClass -> id da turma da qual o usuário está solicitando

    retorno
    um objeto solicitação
    solicitação.user_id -> id do usuário que fez a solicitação
    solicitação.class_id -> id da turma da qual o usuário está solicitando
----------------------------------------------------------------------------------------------------------
*/

//----------------------------------------deleta uma solicitação------------------------------------------
router.delete('/solicitation/delete',SolicitationController.delete)
/*
    recebe na query
    idClass -> id da turma da qual o usuário está querendo remover a solicitação
----------------------------------------------------------------------------------------------------------
*/

module.exports = app => app.use(router)