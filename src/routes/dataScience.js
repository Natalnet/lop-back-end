const router = require('express').Router()
const {authentication} = require('../app/middlewares/authMiddleware')
const {validate} = require('../app/middlewares/dataScienceMiddleware')
const {
    getDataScienceTeachers,
    getDataScienceClassByTeacher,
    getDataScienceSubmissionClass,
    getDataScienceListByClass,
    getDataScienceTestByClass,
    getDataScienceListClass,
    getDataScienceTestClass,
    getDataScienceQeustions
} = require('../app/controllers/dataScienceController')

//middleware de autenticação
//router.use('/dataScience',validate)


router.get('/dataScience/teacher',validate, getDataScienceTeachers);
router.get('/dataScience/class/teacher/:teacher_id',validate, getDataScienceClassByTeacher);
router.get('/dataScience/class/:idClass/submission',validate, getDataScienceSubmissionClass);
router.get('/dataScience/class/:idClass/list/all',validate, getDataScienceListByClass);
router.get('/dataScience/class/:idClass/test/all',validate, getDataScienceTestByClass);
router.get('/dataScience/question',validate, getDataScienceQeustions);
router.get('/dataScience/class/:idClass/list',authentication, getDataScienceListClass);
router.get('/dataScience/class/:idClass/test',authentication, getDataScienceTestClass);

module.exports = app => app.use(router);