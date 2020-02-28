const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassHasListQuestionController = require('../app/controllers/classHasListQuestionController')

router.use('/classHasListQuestion',AuthMiddleware.authentication)

router.post('/classHasListQuestion/store',ClassHasListQuestionController.store)
router.put('/classHasListQuestion/:id/update',ClassHasListQuestionController.update)
router.delete('/classHasListQuestion/:id/delete',ClassHasListQuestionController.delete)

module.exports = app => app.use(router)