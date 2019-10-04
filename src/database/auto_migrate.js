const sequelize = require('./connection')
const path = require('path')
sequelize
	.authenticate()
	.then(async () => {
		const {User,UserPending,Question,ListQuestions,ListHasQuestion,Class,ClassHasUser} = require('../app/models')
		await User.sync()
		await UserPending.sync()
		await Question.sync()
		await ListQuestions.sync()
		await ListHasQuestion.sync()
		await Class.sync()
		await ClassHasUser.sync()
		console.log('conexão com o banco de dados realizada com sucesso!');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize