const Sequelize = require('sequelize');
const DB = process.env.DB;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const sequelize = new Sequelize(DB, DB_USER, DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  pool: {
    acquire: 600000,
    idle: 600000,
  }
})


module.exports = sequelize
