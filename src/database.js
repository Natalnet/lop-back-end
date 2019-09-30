const Sequelize = require('sequelize');

const sequelize = new Sequelize('4tUg4WH3yX', '4tUg4WH3yX', 'GKasm01Bx5', {
  host: 'remotemysql.com',
  dialect: 'mysql'
})

// Option 2: Passing a connection URI
//const sequelize = new Sequelize('mysql://user:pass@example.com:5432/dbname');

sequelize
	.authenticate()
	.then(() => {
		//console.log('Connection has been established successfully.');
	})
	.catch(err => {
		console.error('Falha na conexão com o banco de dados:', err);
	});

module.exports = sequelize