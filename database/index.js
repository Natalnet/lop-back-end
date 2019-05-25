const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost/noderest', {useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;

