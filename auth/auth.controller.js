var config = require('../config');
//var moment = require('moment');
var jwt = require('jwt-simple');
var nodemailer = require('nodemailer'); 
const uuidv1 = require('uuid/v1');

var User = require('../user/user.model.js');
var EmailRecover = require('../emailrecover/emailrecover.model.js');

// 1. Signin an user
exports.signin = function(req, res){
     var email = req.body.email;
     var password = req.body.password;

     User.find({email : email})
     .exec((err,users) => {
          if(err || users === null || users === undefined || users.length < 1){
               res.status(404).json({error: 'UserNotFound'});
          } else {
               var user = users[0];
               user.comparePassword(password,(err,isMatch) => {
                    if(err || isMatch === null || isMatch === undefined || isMatch === false){
                         res.status(404).json({error: 'WrongPassword'});
                    } else {
                         var payload = { 
                              sup: user._id
                              //exp: moment().unix() + 24*3600
                         };
                         var token = jwt.encode(payload, config.TOKEN_SECRET);
                         res.status(200).send(token);
                    }
               });
          }
     })
};
  
// 2. Signup an user
exports.signup = function(req, res){
     var user = new User({
          name : req.body.name,
          enrollment: req.body.enrollment,
          email : req.body.email,
          password : req.body.password
     });

     user.save(function (err) {
          if (err) {
               res.status(500).json({error : 'Email or Enrollment Exists'});
          } else {
               res.status(200).send({message : 'Account successfully created'});
          }
    })
};

// 3. sends reset password email
exports.recoverpassword = function(req, res){
     console.log('recover password called');
     var email = req.body.email;
     User.find({email : email})
     .exec((err,users) => {
          if(err || users === null || users === undefined || users.length < 1){
               res.status(404).json({error: 'UserNotFound'});
          } else {
  
               var code = uuidv1();

               var emailrecover = new EmailRecover({
                   email : email,
                   code: code
               });
               
               EmailRecover.remove({ email: email }, function(err) {
                    emailrecover.save(function (err) {
                         if (err) {
                              res.status(500).json({error : 'Email already exists'});
                         } else {
                              var transporter = nodemailer.createTransport({
                                   host: "smtp.mailtrap.io",
                                   port: 2525,
                                   auth: {
                                     user: "a1c0c6ad61b047",
                                     pass: ""
                                   }
                              });
     
                              var mailOptions = {
                                 from: 'projetosect@gmail.com',
                                 to: email,
                                 subject: 'Recuperação de senha',
                                 text: 'Clique no link a seguir para recurerar sua senha: http://localhost:3000/resetpassword?code=' + code
                              };
     
                              transporter.sendMail(mailOptions, function(error, info){
                                 if (error) {
                                     res.status(500).json({error: 'Could not send email.'});
                                 } else {
                                     res.status(200).json({msg:'Email sent successfuly'});
                                 }
                              });
                         }
                    })
                });
          }
     })
};

// 4. Reset user password
exports.resetpassword = function(req, res){
     console.log('reset password called');
     var code = req.body.code;
     var password = req.body.password;

     EmailRecover.find({code : code})
     .exec((err,emailrecovers) => {
          if(err || emailrecovers === null || emailrecovers === undefined || emailrecovers.length < 1){
               res.status(404).json({error: 'O link usado para resetar a senha é inválido'});
          } else {
               var emailrecover = emailrecovers[0];
               var query = { email: emailrecover.email };

               User.where({ email: emailrecover.email }).update({password:password}, function(err) {
                    if(err) {
                         res.status(500).json({error: 'Falha ao atualizar email.'});
                    } else {
                         EmailRecover.remove({email:emailrecover.email}, function(err) {
                              res.status(200).json({msg: 'Senha alterada com sucesso.'});
                         })
                    }
               })
          }
     })
};
  
  
  