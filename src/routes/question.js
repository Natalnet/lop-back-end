const route = require('express').Router()
const QuestionController = require('../app/controllers/questionController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')

//Midllwares para question
route.use('/question',AuthMiddleware.authentication, AuthMiddleware.permitionProfessor)

route.get('/question',QuestionController.get_all_questions);
route.get('/question/:id',QuestionController.get_question);
route.post('/question/store',QuestionController.store);
route.put('/question/update/:id',QuestionController.update);


module.exports = (app) => app.use(route)
