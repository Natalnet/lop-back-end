// 1. Include required modules
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate'),
    bcrypt = require('bcryptjs');

// 2. Define the MongoDB schema for the user collection
var userSchema = new Schema({
  name            :   {type: String, required: 'NameInvalid'},
  enrollment      :   {type: String, unique: true, lowercase: true, required: 'EnrollmentInvalid'},
  email           :   {type: String, unique: true, lowercase: true, required: 'EmailInvalid'},
  password        :   {type: String, required: 'PasswordInvalid'}
});

// 3. Paginate the results
userSchema.plugin(mongoosePaginate);

// 4. Encypt and store the user's password
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

// 5. Confirm a user's password against the stored password
userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

// 6. Export the User model
module.exports = mongoose.model('User', userSchema);