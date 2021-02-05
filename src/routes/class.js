const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const ClassController = require('../app/controllers/classController')
const ClassMiddleware = require('../app/middlewares/classMiddleware')
//middleware de autenticação
router.use('/class',AuthMiddleware.authentication)

router.get('/class',ClassController.index);
router.get('/class/open',ClassController.getActiveClasses);
router.get('/class/page/:page',ClassController.index_paginate);
router.get('/class/:id',ClassMiddleware.show,ClassController.show);
router.post('/class/store',ClassMiddleware.store,ClassController.store);
router.put('/class/:id/update',ClassController.update);

module.exports = app => app.use(router)