const {register,confirmRegister,authenticate,forgot_password,reset_password} = require('../app/controllers/authController')
const express = require('express')
const router = express.Router()

//Authentication routes
router.post('/auth/register',register)
router.post('/auth/confirm_register',confirmRegister)
router.post('/auth/authenticate', authenticate)
router.post('/auth/forgotpassword',forgot_password)
router.put('/auth/resetpassword', reset_password)


module.exports = app => app.use(router)
