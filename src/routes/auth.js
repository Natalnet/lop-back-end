const AuthController = require('../app/controllers/authController')
const express = require('express')
const router = express.Router()

//Authentication routes
router.post('/auth/register', AuthController.register)
router.post('/auth/confirm_register',AuthController.confirmRegister)
router.post('/auth/authenticate', AuthController.authenticate)
router.post('/auth/forgotpassword', AuthController.forgot_password)
router.put('/auth/resetpassword', AuthController.reset_password)


module.exports = app => app.use(router)
