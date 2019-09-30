const [sequelize,] = require('./connection')

sequelize
	.authenticate()
	.then(() => {
		require('../app/models')(sequelize)
		console.log('conexão com o banco de dados realizada com sucesso!');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize