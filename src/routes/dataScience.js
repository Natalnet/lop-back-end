const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const DataScienceController = require('../app/controllers/dataScience')
//middleware de autenticação
//router.use('/csv',AuthMiddleware.authentication)


router.get('/dataScience/class/:idClass/list',AuthMiddleware.authentication,DataScienceController.getDataScienceListClass);
router.get('/dataScience/class/:idClass/submission',DataScienceController.getDataScienceSubmissionClass);

module.exports = app => app.use(router);