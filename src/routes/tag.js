const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const TagController = require('../app/controllers/tagController')

router.use('/tag',AuthMiddleware.authentication)
router.get('/tag',TagController.index)

module.exports = (app) => app.use(router)