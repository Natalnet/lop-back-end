const Sequelize = require('sequelize');

const sequelize = new Sequelize('4tUg4WH3yX', '4tUg4WH3yX', 'GKasm01Bx5', {
  host: 'remotemysql.com',
  dialect: 'mysql',
  logging: false
})

module.exports = [sequelize,Sequelize]