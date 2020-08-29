const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware');
const PlagiarismController = require('../app/controllers/plagiarismController');

//middlwares para alunos
router.use('/plagiarism',AuthMiddleware.authentication);

router.post('/plagiarism/list',PlagiarismController.createUrlListPlagiarism);
router.get('/plagiarism/list',PlagiarismController.findAllListPlagiarism);

// router.post('/plagiarism/list',PlagiarismController.createUrlListPlagiarism);
router.get('/plagiarism/test',PlagiarismController.findAllTestPlagiarism);
router.post('/plagiarism/test',PlagiarismController.createUrlTestPlagiarism);


module.exports = (app) => app.use(router) 