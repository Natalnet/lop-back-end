const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const {
    getDiscursiveQuestionsPagined,
    createDiscursiveQuestion,
    getInfoDiscursiveQuestion,
    updateDiscursiveQuestion
} = require('../app/controllers/discursiveQuestionController')

router.use('/discursiveQuestion', AuthMiddleware.authentication)

router.get('/discursiveQuestion/page/:page', getDiscursiveQuestionsPagined)
router.get('/discursiveQuestion/:id/info', getInfoDiscursiveQuestion);
router.post('/discursiveQuestion', createDiscursiveQuestion);
router.put('/discursiveQuestion/:id', updateDiscursiveQuestion);

module.exports = (app) => app.use(router);