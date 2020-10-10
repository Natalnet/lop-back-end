const router = require('express').Router()
//const AuthMiddleware = require('../app/middlewares/authMiddleware')
const {getDataScienceTeachers,getDataScienceClassByTeacher,getDataScienceSubmissionClass} = require('../app/controllers/dataScienceController')
const {validate} = require('../app/middlewares/dataScienceMiddleware')
//middleware de autenticação
router.use('/dataScience',validate)


router.get('/dataScience/teacher',getDataScienceTeachers);
router.get('/dataScience/class/teacher/:teacher_id',getDataScienceClassByTeacher);
router.get('/dataScience/class/:idClass/submission',getDataScienceSubmissionClass);
//router.get('/dataScience/class/:idClass/list',DataScienceController.getDataScienceListClass);

module.exports = app => app.use(router);