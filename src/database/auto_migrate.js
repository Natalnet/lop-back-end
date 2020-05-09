const sequelize = require('./connection')
const path = require('path')
sequelize
	.authenticate()
	.then(async () => {
		const {User,UserPending,Question,Test,ListQuestions,Class,Tag,FeedBackTest} = sequelize.import(path.resolve(__dirname,'..','app','models'))
		const {SolicitationToClass,ClassHasUser,ListHasQuestion,TestHasQuestion,ClassHasTest,ClassHasListQuestion,Submission,QuestionHasTag,Difficulty,Access,Draft} = sequelize.import(path.resolve(__dirname,'..','app','models'))
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
			Submission.sync(),
			Tag.sync(),
			FeedBackTest.sync(),
			QuestionHasTag.sync(),
			Difficulty.sync(),
			Access.sync(),
			Draft.sync(),
		])
		console.log('conexão com o banco de dados realizada com sucesso!');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize