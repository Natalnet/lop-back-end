const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
// const LessonController = require('../app/controllers/lessonController')

router.use('/lesson',AuthMiddleware.authentication)

// router.get('/lesson/course/:idCourse',LessonController.getLessonsByCourse);
// router.get('/lesson/:id',LessonController.getLesson);
// router.post('/lesson',LessonController.createLesson);
// router.put('/lesson/:id',LessonController.updateLesson);
// router.put('/lesson/:id/visibility',LessonController.updateVisibilityLesson);

module.exports = (app) => app.use(router);