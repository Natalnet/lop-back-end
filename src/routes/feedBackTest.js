const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const FeedBackTestController = require('../app/controllers/feedBackTestController')
const FeddBackTestMiddleware = require('../app/middlewares/feedBackTestMiddleware')
//midleware de auenticação
router.use('/feedBacksTest',AuthMiddleware.authentication)

router.get('/feedBacksTest/page/:page',FeddBackTestMiddleware.index_paginate,FeedBackTestController.index_paginate)
router.get('/feedBacksTest/show',FeddBackTestMiddleware.show,FeedBackTestController.show)
router.post('/feedBacksTest/store',FeddBackTestMiddleware.store,FeedBackTestController.store)

//cria uma feedBacksTest
//router.post('/feedBacksTest/store',FeedBackTestController.store)

module.exports = (app) => app.use(router)