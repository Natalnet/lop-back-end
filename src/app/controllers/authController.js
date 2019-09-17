const User = require('../models/UserModel');
const UserPending = require('../models/UserPendingModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {transport,mailOptions} = require('../../config/mailer');
const {TOKEN_SECRET} = require('../../config/env');
const fs = require('fs')
const handlebars = require('handlebars')
const path = require('path')

//gera o token
function generateToken(params = {}){
    return jwt.sign(params, TOKEN_SECRET);
}

async function sendEmail(name_html,key,email){

    const html = fs.readFileSync(path.resolve(__dirname,'..','..','tamplates','mail',name_html))
    const tamplate =  handlebars.compile(html.toString())
    const data =  {key:key}
    const result =  tamplate(data)
    mailOptions.to = email
    mailOptions.html = result
    mailOptions.subject = (name_html === 'confirm_registration.html')?'Confirmação de cadastro':'Recuperação de senha'
    await transport.sendMail(mailOptions, (err,info) =>{
        if(err){
            console.log('<<<<ERRO>>>>\n',err)
            return res.status(404).json({error: 'Cannot send forgot password email :('});
        }
        return res.status(200).json({msg:"Email sent sulccessefuly :)"});
    })  
}

class AuthController {
    async register(req, res) {
        const { name,email,enrollment,password } = req.body;
        try{
            if(await User.findOne({ email })){
                return res.status(404).json({error: "Já existe um usuário cadastrado com esse email"})
            }
            if(await User.findOne({ enrollment })){
                return res.status(404).json({error: "Já existe um usuário cadastrado com essa matrícula!"})
            }
            const pendingEmail = await UserPending.findOne({ email })
            if (pendingEmail){
                await pendingEmail.remove()
            }

            const pendingEnrollment = await UserPending.findOne({ enrollment })
            if (pendingEnrollment){
                await pendingEnrollment.remove()
            }
            
            const key = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const userPending = await UserPending.create({
                name : name,
                email : email,
                enrollment : enrollment,
                password : password,
                solicitationKey : key,
                solicitationExpires : now
            });
            //-----envia email-----
            await sendEmail('confirm_registration.html',key,email)
            userPending.password = undefined;
            return res.json({msg:`foi enviado um email de confirmação para ${email}`});
            
        }catch(er){
            return res.status(500).json({error: 'Registration failed :('});
        }
    }
    async confirmRegister(req,res){
        const key = req.query.key
        try{
            const userPending = await UserPending.findOne({solicitationKey:key}).select('+password')
            //console.log(userPending)
            if(!userPending || !key){
                return res.status(404).json({error:"key invalid :("})
            }
            const now = new Date()
            if(now > userPending){
                return res.status(404).json({error:"key expired, generate a new one :("})
            }
            const user = await User.create({
                _id        : userPending._id,
                name       : userPending.name,
                email      : userPending.email,
                enrollment : userPending.enrollment,
                password   : userPending.password
            });
            if(!user){
                return res.status(400).json({error:"user not created"})
            }
            await userPending.remove()
            user.password = undefined
            if(user)
            return res.status(200).json({
                user  : user,
                token : generateToken({ id: user._id })
            });
        }catch(er){
            return res.status(500).json({error: 'Registration failed :('});
        }
    }
    async authenticate(req, res){
        const { email, password} = req.body;
        const user = await User.findOne({ email}).select('+password');
        if(!user){
            return res.status(400).json('O e-mail inserido não corresponde a nenhuma conta :(');
        }
        if(!await bcrypt.compare(password, user.password)){
            return res.status(400).json('Senha incorreta :(');
        }
        user.password = undefined;
        return res.status(200).json({ 
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
                return res.status(400).json('O e-mail inserido não corresponde a nenhuma conta :(');
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
            //-----envia email-----
            await sendEmail('forgot_password.html',key,email)
            return res.status(200).json(`Foi enviado um email de recuperação de senha para ${email}`);
        }catch(err){
            return res.status(500).json({error: 'erro on forgot password, try again :('});
        }
    }
    async reset_password(req,res){

        const key = req.query.key
        const {password}=req.body
        
        try{
            const user = await User.findOne({passwordResetKey:key})
            .select('+passwordResetKey +passwordResetExpires')
            
            if(!user || !key){
                return res.status(400).json('Erro: o link usado expirou ou é inválido.')
            }
            
            const now = new Date()
            if(now>user.passwordResetExpires){
                return res.status(400).json('Erro: o link usado expirou ou é inválido.')
            }
            user.password = await bcrypt.hash(password, 10);
            user.passwordResetKey = undefined
            user.passwordResetExpires = undefined
            await user.save()
            user.password = undefined
            return res.status(200).json({ 
                user,
                token: generateToken({ id: user.id }),
            });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({error: 'Filed to change password :('});
        } 
    }
}

module.exports = new AuthController();