const mongoose = require('mongoose');
const {MONGO_URI} = require('../config/env')
mongoose.set('useCreateIndex', true)
mongoose.connect(MONGO_URI, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;