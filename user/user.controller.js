// 1. Load the User model
var User = require('./user.model.js');

// 2. Get a paginated list of all Users
exports.list = function(req, res){
  var query = {};
  var page = req.params.page || 1;
  var options = {
    select: 'name email',
    page: page
  };
  User.paginate(query, options).then(function(result) {
    res.json(result);
  });
};

// 2. Get an individual User's public information
exports.show = function(req, res){
  User.findById(req.params.id)
    .select('name')
    .exec(function(err, doc){
      if(err || doc === null){
        res.status(404).json({error: 'UserNotFound'});
      } else {
        res.json(doc);
      }
  });
};

// 3. Get an individual user's private profile information
exports.profile = function(req, res){
  User.findById(req.user)
    .select('email name')
    .exec(function(err, doc){
      if(err || doc === null){
        res.status(404).json({error: 'UserNotFound'});
      } else {
        res.json(doc);
      }
    });
};