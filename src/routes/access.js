const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const AccessController = require('../app/controllers/accessController')

router.use('/access',AuthMiddleware.authentication)

//----------------------------cria um acesso-----------------------------
router.post('/access/store',AccessController.store)
/*
    ip -> ip local do usuário
    environment -> (desktop ou mobile)
    idQuestion -> id da questão que o usuário está acessando
*/

module.exports = (app) => app.use(router)