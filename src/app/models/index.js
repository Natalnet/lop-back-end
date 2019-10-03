const path = require('path')
const fs = require('fs')

module.exports = async sequelize => {
	const User = sequelize.import(path.resolve(__dirname,'UserModel'))
	const UserPending = sequelize.import(path.resolve(__dirname,'UserPendingModel'))
	const Question = sequelize.import(path.resolve(__dirname,'QuestionModel'))
	const ListQuestions = sequelize.import(path.resolve(__dirname,'ListQuestionsModel'))
	const ListHasQuestion = sequelize.import(path.resolve(__dirname,'ListHasQuestionModel'))

	await User.sync()
	await UserPending.sync()
	await Question.sync()
	await ListQuestions.sync()
	await ListHasQuestion.sync()
	console.log('tabelas criadas/verificadas com sucesso!');
}