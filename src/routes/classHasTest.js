const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassHasTestController = require('../app/controllers/classHasTestController')

router.use('/classHasTest',AuthMiddleware.authentication)

router.post('/classHasTest/store',ClassHasTestController.store)
router.delete('/classHasTest/:id/delete',ClassHasTestController.delete)


module.exports = app => app.use(router)