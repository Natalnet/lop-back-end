const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../config/mailer');
const config = require('../../config/env');
const fs = require('fs')
const handlebars = require('handlebars')
const path = require('path')

//gera o token
function generateToken(params = {}){
    return jwt.sign(params, config.TOKEN_SECRET, {expiresIn: 86400,});
}

class AuthController {
    async register(req, res) {
       const { email,enrollment } = req.body;
        try{
            if(await User.findOne({ email })){
                return res.status(404).json({error: "Já existe um usuário cadastrado com esse email"})
            }
            if(await User.findOne({ enrollment })){
                return res.status(404).json({error: "Já existe um usuário cadastrado com essa matrícula!"})
            }
            const user = await User.create(req.body);
            user.password = undefined;
            return res.json({
                user,
                token: generateToken({ id: user.id }),
            });
        }catch(er){
            return res.status(500).json({error: 'Registration failed'});
        }
    }
    async authenticate(req, res){
        const { email, password} = req.body;
        const user = await User.findOne({ email}).select('+password');
        if(!user){
            return res.status(404).json({error: 'O usuário não foi encontrado!'});
        }
        if(!await bcrypt.compare(password, user.password)){
            return res.status(404).json({error: 'Senha inválida'});
        }
        user.password = undefined;
        res.send({ 
            user,
            token: generateToken({ id: user.id }),
        });
    }
    async forgot_password(req, res){
        const { email } =  req.body;
        //console.log(req.body.email)
        try{
            const user = await User.findOne({email:email});
            //console.log(user)
            if(!user){
                return res.status(404).json({error: 'User not found'});
            }
            const key = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            await User.findByIdAndUpdate(user._id, {
                '$set':{
                    passwordResetKey: key,
                    passwordResetExpires: now,
                }
            });
            const html = fs.readFileSync(path.resolve(__dirname,'..','..','tamplates','mail','forgot_password.html'))
            //const html = "<P>Clique <a href='http://localhost:3000/auth/reset_password?token={{token}}' target='_blank'>aqui</a> para recurerar sua senha</P>"
            const tamplate =  handlebars.compile(html.toString())
            const data =  {key:key}
            const result =  tamplate(data)
            //console.log(result)

            const mailOptions = {
                from: 'projetosect@gmail.com',
                to: email,
                //template: 'auth/forgot_password',
                subject: 'Recuperação de senha',
                //context: {key},
                html: result
                //html: '<p>Clique no link a seguir para recurerar sua senha: http://localhost:3000/auth/reset_password?token=' + token+'</p>'
            };
            await mailer.sendMail(mailOptions, (err,info) =>{
                if(err){
                    console.log('<<<<ERRO>>>>\n',err)
                    return res.status(404).json({error: 'Cannot send forgot password email'});
                }
                return res.status(200).json({msg:"Email sent sulccessefuly"});
            })
            //console.log(key, now);
        }catch(err){
            return res.status(500).json({error: 'erro on forgot password, try again'});
        }
    }
    async reset_password(req,res){

        const key = req.query.key
        const {password}=req.body
        //console.log(key)
    try{
            const user = await User.findOne({passwordResetKey:key})
            .select('+passwordResetKey passwordResetExpires')
            if(!user){
                return res.status(404).json({error:"key invalid"})
            }
            
            const now = new Date()
            if(now>user.passwordResetExpires){
                return res.status(404).json({error:"key expired, generate a new one"})
            }
            user.password = password
            await user.save()
            return res.status(200).json({msg:"Password changed successfuly"})
        }
        catch(err){
            return res.status(500).json({error: 'Filed to change password'});
        } 
    }
}

module.exports = new AuthController();