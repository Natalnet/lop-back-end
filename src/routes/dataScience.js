const router = require('express').Router()
const { authentication } = require('../app/middlewares/authMiddleware')
const { validate } = require('../app/middlewares/dataScienceMiddleware')
const {
    getDataScienceTeachers,
    getDataScienceClassByTeacher,
    getDataScienceSubmissionClass,
    getDataScienceSubmission,
    getDataScienceList,
    getDataScienceTest,
    getDataScienceListClass,
    getDataScienceListClassStudeants,
    getDataScienceTestClass,
    getDataScienceQeustions,
    getDataScienceClasses
} = require('../app/controllers/dataScienceController')

//middleware de autenticação
//router.use('/dataScience',validate)


router.get('/dataScience/teacher', validate, getDataScienceTeachers);
router.get('/dataScience/class/teacher/:teacher_id', validate, getDataScienceClassByTeacher);
router.get('/dataScience/class/:idClass/submission', validate, getDataScienceSubmissionClass);
router.get('/dataScience/submission', validate, getDataScienceSubmission);
router.get('/dataScience/list', validate, getDataScienceList);
router.get('/dataScience/test', validate, getDataScienceTest);
router.get('/dataScience/class', validate, getDataScienceClasses);
router.get('/dataScience/question', validate, getDataScienceQeustions);
router.get('/dataScience/class/:idClass/list', authentication, getDataScienceListClass);
router.get('/dataScience/class/:idClass/list/dashboard', authentication, getDataScienceListClassStudeants);
router.get('/dataScience/class/:idClass/test', authentication, getDataScienceTestClass);

module.exports = app => app.use(router);