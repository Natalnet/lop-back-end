const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const CSVController = require('../app/controllers/dataScience')
//middleware de autenticação
//router.use('/csv',AuthMiddleware.authentication)


router.get('/dataScience/class/:idClass/list',AuthMiddleware.authentication,CSVController.getCsvListClass);
router.get('/dataScience/class/:idClass/submission',CSVController.getCsvSubmissionClass);

module.exports = app => app.use(router);