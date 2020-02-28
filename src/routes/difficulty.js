const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const DifficultyController = require('../app/controllers/difficultyController')

router.use('/difficulty',AuthMiddleware.authentication)

//----------------------------cria ou atualiza uma dificuldade-----------------------------
router.post('/difficulty/store',DifficultyController.store)
/*
    recebe no body
    idQuestion -> id da questão
    userDifficulty -> dificudade do usuário ('Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil')

    obs: caso já exista uma uma dificuldade com idQuesion passado, userDifficulty será atuaizado
*/
module.exports = (app) => app.use(router)