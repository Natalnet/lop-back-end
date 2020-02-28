const Sequelize = require('sequelize');
const {DATABASE} = require('../config/env')

const sequelize = new Sequelize(DATABASE.db, DATABASE.user, DATABASE.password, {
  host: DATABASE.host,
  dialect: 'mysql',
  logging: false
})


module.exports = sequelize