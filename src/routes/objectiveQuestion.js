const router = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const {
    getObjectiveQuestionsPagined,
    createObjectveQuestion,
    getInfoObjectiveQuestion,
    updateObjectveQuestion
} = require('../app/controllers/objectiveQuestionController')

router.use('/objectiveQuestion', AuthMiddleware.authentication)

router.get('/objectiveQuestion/page/:page', getObjectiveQuestionsPagined)
router.get('/objectiveQuestion/:id/info', getInfoObjectiveQuestion);
router.post('/objectiveQuestion', createObjectveQuestion);
router.put('/objectiveQuestion/:id', updateObjectveQuestion);

module.exports = (app) => app.use(router);