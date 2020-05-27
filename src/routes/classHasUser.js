const ClassHasUserController = require('../app/controllers/classHasUserController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

router.use('/solicitation',AuthMiddleware.authentication)


router.post('/classHasUser/store',ClassHasUserController.store)
router.post('/classHasUser/storeall',ClassHasUserController.storeAll)
router.delete('/classHasUser/delete',ClassHasUserController.delete)

module.exports = app => app.use(router)