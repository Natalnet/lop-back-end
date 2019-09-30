const User = require('../models/UserModel');
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
            const key = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const [user, created] = await User.findOrCreate({
                where:{
                    email:email,
                },
                defaults:{
                    id : crypto.randomBytes(12).toString('hex'),
                    name : name,
                    email : email,
                    enrollment : enrollment,
                    password : await bcrypt.hash(password, 10),
                    solicitationKey : key,
                    solicitationExpires : now
                }
            });
            //caso o usário já exista
            if(!created){
                //caso já exista e o usuário já foi verificado
                if(user.checked){
                    console.log('já existe e o usuário já foi verificado');
                    const msgErro = [{fild:'email',msg:"Já existe um usuário cadastrado com esse email :("}]
                    return res.status(400).json(msgErro)
                }
                //caso já exista, mas o usuário não foi verificado
                else{
                    console.log('já existe, mas o usuário não foi verificado');
                    user.solicitationKey = key
                    user.solicitationExpires =now
                    await user.save()
                }
            }
            //-----envia email-----
            await sendEmail('confirm_registration.html',key,email)
            user.password = null;
            return res.json(`foi enviado um email de confirmação para ${email}`);
            
        }catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        fild:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json('err')
            }
        }
    }
    async confirmRegister(req,res){
        const key = req.query.key
        try{
            const user = await User.findOne({
                where:{
                    solicitationKey:key
                }
            })
            if(!user || !key){
                return res.status(404).json("Link inválido :)")
            }
            const now = new Date()
            if(now > user.dataValues.solicitationExpires){
                return res.status(404).json("link expirado :(")
            }
            user.checked=true
            user.solicitationKey=null
            user.solicitationExpires=null
            await user.save()
            user.dataValues.password = undefined
            return res.status(200).json({
                user  : user,
                token : generateToken({ id: user._id })
            });
        }catch(err){
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        fild:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json('err')
            }        }
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