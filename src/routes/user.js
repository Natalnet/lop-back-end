const UserController = require('../app/controllers/UserController')
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const express = require('express')
const router = express.Router()

//user Routes
/*router.get('/users/page/:page',AuthMiddleware,UserController.get_users)
router.get('/user/:id',AuthMiddleware,UserController.show)
router.get('/profile',AuthMiddleware,UserController.profile)*/

module.exports = app => app.use(router)