const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');
const authConfig = require('../../config/auth');
const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, authConfig.secret,{
        expiresIn: 86400,
    });
}

router.post('/register', async(req, res)=>{
   const { email } = req.body;
    try{
        if(await User.findOne({ email })){
            return res.status(400).send({error: "Esse email já estar cadastrado!"})
        }
        const user = await User.create(req.body);
        user.password = undefined;
        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    }catch(er){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post('/authenticate', async (req, res) => {
    const { email, password} = req.body;
    const user = await User.findOne({ email}).select('+password');
    
    if(!user){
        return res.status(400).send({error: 'O usuário não foi encontrado!'});
    }
    if(!await bcrypt.compare(password, user.password)){
        return res.status(400).send({error: 'Senha inválida'});
    }
    
    user.password = undefined;
    
    res.send({ 
        user,
        token: generateToken({ id: user.id }),
    });
})

router.post('/forgot_password', async(req, res) =>{
    const { email } =  req.body;
    console.log(req.body.email)
    try{
        const user = await User.findOne({ email });
        
        if(!user){
            return res.status(400).send({error: 'User not found'});
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);


        await User.findByIdAndUpdate(user.id, {
            '$set':{
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'projetosect@gmail.com',
            template: 'auth/forgot_password',
            context: {token},
        }, (err) =>{
            if(err){
                return res.status(400).send({error: 'Cannot send forgot password email'});
            }
            return res.send();
        })
        
        console.log(token, now);
    }catch(err){
        res.status(400).send({error: 'erro on forgot password, try again'});
    }
})

module.exports = app => app.use('/auth', router);