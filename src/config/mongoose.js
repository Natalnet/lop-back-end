const mongoose = require('mongoose');
const config = require('../config/env')
mongoose.set('useCreateIndex', true)
mongoose.connect(config.MONGO_URI, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;