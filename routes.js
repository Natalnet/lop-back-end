// 1. Include config and modules
var config = require('./config');
var moment = require('moment');
var jwt = require('jwt-simple');
var AuthController = require('./auth/auth.controller.js');
var UserController = require('./user/user.controller.js');
var ClassController = require('./class/class.controller.js');
var User = require('./user/user.model.js');

// 2. Authentication Middleware
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ error: 'TokenMissing' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ error: "TokenInvalid" });
  }

  /*if (payload.exp <= moment().unix()) {
    return res.status(401).send({ error: 'TokenExpired' });
  }*/
  // check if the user exists
  try {
    User.findById(payload.sup, (err, user) => {
      if (err || !user){
        return res.status(401).send({error: 'UserNotFound'});
      } else {
        req.user = payload.sup;
        next();
      }
    });
  }
  catch(err) {
    return res.status(401).send({error: 'UserNotFound'});
  }
};

// 3. Routes
module.exports = function (app) {
  // 4. Authentication Routes
  app.post('/auth/signin', AuthController.signin);
  app.post('/auth/signup', AuthController.signup);
  app.post('/auth/recoverpassword', AuthController.recoverpassword);
  app.post('/auth/resetpassword', AuthController.resetpassword);
  
  // 5. Application Routes
  app.get('/user', ensureAuthenticated, UserController.list);
  //app.get('/user/page/:page', ensureAuthenticated, UserController.list);
  //app.get('/user/:id', ensureAuthenticated, UserController.show);
  //app.get('/profile', ensureAuthenticated, UserController.profile);

  //6. Class Routes
  app.get('/class/myclasses', ensureAuthenticated, ClassController.list);

};