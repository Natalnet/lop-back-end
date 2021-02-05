const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const TestController = require('../app/controllers/testController')
const TestMiddleware = require('../app/middlewares/testMiddleware')

//middlwares para alunos
router.use('/test',AuthMiddleware.authentication);


router.get('/test',TestMiddleware.index, TestController.index);
router.get('/test/page/:page',TestMiddleware.index_paginate,TestController.index_paginate);
router.get('/test/:id',TestMiddleware.show,TestController.show);
router.get('/test/check/password', TestController.checkPassowrd);
router.get('/test/:id/class/:idClass/question/:idQuestion', TestController.getUserSubmissionsByTest);
router.get('/apistatus', TestController.getApiStatus);

router.post('/test/store',TestMiddleware.store,TestController.store);
router.put('/test/:id/update',TestMiddleware.update,TestController.updateQuestions);

module.exports = (app) => app.use(router);
