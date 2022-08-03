const sequelize = require('./connection')
const path = require('path')
sequelize
	.authenticate()
	.then(async () => {
		const { User, UserPending, Question, Test, ListQuestions, Class, Tag, FeedBackTest, Plagiarism, Course, Lesson, LessonHasQuestion } = sequelize.import(path.resolve(__dirname, '..', 'app', 'models'))
		const { SolicitationToClass, ClassHasUser, ListHasQuestion, TestHasQuestion, ClassHasTest, ClassHasListQuestion, ClassHasCourse, Submission, SubmissionStats, QuestionHasTag, Difficulty, Access, Draft } = sequelize.import(path.resolve(__dirname, '..', 'app', 'models'))
		await Promise.all([
			User.sync(),
			UserPending.sync(),
			Question.sync(),
			ListQuestions.sync(),
			Test.sync(),
			Class.sync(),
			SolicitationToClass.sync(),
			ClassHasUser.sync(),
			ListHasQuestion.sync(),
			TestHasQuestion.sync(),
			ClassHasListQuestion.sync(),
			ClassHasTest.sync(),
			Plagiarism.sync(),
			Tag.sync(),
			FeedBackTest.sync(),
			QuestionHasTag.sync(),
			Difficulty.sync(),
			Access.sync(),
			Draft.sync(),
			Course.sync(),
			Lesson.sync(),
			ClassHasCourse.sync(),
			LessonHasQuestion.sync(),
			Submission.sync(),
			SubmissionStats.sync(),
		])
		console.log('conexão com o banco de dados realizada com sucesso!');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize