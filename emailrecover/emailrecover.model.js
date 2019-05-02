// 1. Include required modules
var mongoose = require('mongoose'),
    Schema = mongoose.Schema

// 2. Define the MongoDB schema for the user collection
var emailRecoverSchema = new Schema({
  email           :   {type: String, unique: true, lowercase: true, required: 'EmailInvalid'},
  code    :   {type: String, unique: true, required: 'CodeInvalid'}
});

// 3. Export the EmailRecover model
module.exports = mongoose.model('EmailRecover', emailRecoverSchema);