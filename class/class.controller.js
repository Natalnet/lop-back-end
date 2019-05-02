// 1. Load the Class model
var Class = require('./class.model.js');

// 2. Get a paginated list of all Classes
exports.list = function(req, res){
  var query = {};
  var page = req.params.page || 1;
  var options = {
    select: 'course year period',
    page: page
  };
  Class.paginate(query, options).then(function(result) {
    res.status(200).json(result);
  });
};

