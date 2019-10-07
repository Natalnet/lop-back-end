const sequelize = require('./connection')
const path = require('path')
sequelize
	.authenticate()
	.then(async () => {
		const {User,UserPending,Question,ListQuestions,Class,SolicitationToClass,ClassHasUser,ListHasQuestion,ClassHasListQuestion} = sequelize.import(path.resolve(__dirname,'..','app','models'))
		await User.sync()
		await UserPending.sync()
		await Question.sync()
		await ListQuestions.sync()
		await Class.sync()
		await SolicitationToClass.sync()
		await ClassHasUser.sync()
		await ListHasQuestion.sync()
		await ClassHasListQuestion.sync()
		console.log('conexão com o banco de dados realizada com sucesso!');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize