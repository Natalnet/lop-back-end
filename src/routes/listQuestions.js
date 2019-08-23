const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ListQuestionsController = require('../app/controllers/listQuestionsController')

//middlwares para alunos
router.use('/listQuestion',AuthMiddleware.authentication)

router.get('/listQuestion',ListQuestionsController.get_all_listQuestions)
router.get('/listQuestion/:id',ListQuestionsController.get_listQuestions)
router.post('/listQuestion/store',ListQuestionsController.store)
router.put('/listQuestion/update/:id',ListQuestionsController.update)

module.exports = (app) => app.use(router) 