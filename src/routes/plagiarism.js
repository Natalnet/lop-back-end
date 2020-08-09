const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware');
const PlagiarismController = require('../app/controllers/plagiarismController');

//middlwares para alunos
router.use('/plagiarism',AuthMiddleware.authentication);

router.post('/plagiarism',PlagiarismController.createUrlPlagiarism);
router.get('/plagiarism',PlagiarismController.findAllPlagiarism);


module.exports = (app) => app.use(router) 