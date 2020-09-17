const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassHasTestController = require('../app/controllers/classHasTestController')
const classHasTestMiddleware = require('../app/middlewares/classHasTestMiddleware')

router.use('/classHasTest',AuthMiddleware.authentication)

router.post('/classHasTest/store',ClassHasTestController.store)
router.put('/classHasTest/:id/update/status',classHasTestMiddleware.update,ClassHasTestController.updateStatus)
router.put('/classHasTest/:id/update',classHasTestMiddleware.update,ClassHasTestController.update)
router.delete('/classHasTest/:id/delete',ClassHasTestController.delete)


module.exports = app => app.use(router)