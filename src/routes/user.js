const UserController = require('../app/controllers/userController')
const UserMiddleware = require('../app/middlewares/userMiddleware')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

//user Routes
//middlawares para user

router.use('/user',AuthMiddleware.authentication)

router.get('/user',UserMiddleware.index,UserController.index)
router.get('/user/page/:page',UserMiddleware.index_paginate,UserController.index_paginate)
router.get('/user/list/:idList/class/:idClass/question/:idQuestion', UserController.getUsersWithLastSubmissionByQuestionByListByClass)

router.get('/user/class/:id',UserController.getUsersByClass)
router.put('/user/:id/update',UserController.update)



module.exports = app => app.use(router)