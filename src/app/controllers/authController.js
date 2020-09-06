const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path')
const generateToken = require('../services/generateToken')

const sendEmail = require('../services/sendEmail')
const sequelize = require('../../database/connection')
const {User,UserPending}= sequelize.import(path.resolve(__dirname,'..','models'))

class AuthController {
    async register(req, res) {
        const { name,email,password } = req.body;
        try{
            const userCount = await User.count({
                where:{
                    email
                }
            })
            if(userCount>0){
                const msgErro = [{field:'email',msg:"Já existe um usuário cadastrado com esse email :("}]
                return res.status(400).json(msgErro)
            }
            
            const key = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const [userPending, created] = await UserPending.findOrCreate({
                where:{
                    email,
                },
                defaults:{
                    name : name,
                    email : email,
                    password : await bcrypt.hash(password, 10),
                    solicitationKey : key,
                    solicitationExpires : now
                }
            });
            if(!created){
                userPending.solicitationKey = key
                userPending.solicitationExpires =now
                await userPending.save()
            }
            //-----envia email-----
            await sendEmail('confirm_registration',key,email)
            return res.status(200).json({msg:"ok"})
            
        }catch(err){
            console.log(err);
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
                        msg:erro.message,
                        
                    }
                    return erroType
                }));
                //console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json(err)
            }
        }
    }
    async confirmRegister(req,res){
        const {key} = req.query
        try{
            if(!key){
                return res.status(404).json({msg:"Link inválido :)"})
            }
            const userPending = await UserPending.findOne({
                where:{
                    solicitationKey:key
                }
            })
            if(!userPending){
                return res.status(404).json({msg:"Link inválido :)"})
            }
            const now = new Date()
            if(now > userPending.dataValues.solicitationExpires){
                return res.status(404).json({msg:"link expirado :("})
            }
            const [user,created] = await User.findOrCreate({
                where:{
                    id : userPending.id
                },
                defaults:{
                    id         : userPending.id,
                    name       : userPending.name,
                    email      : userPending.email,
                    password   : userPending.password
                }
            })
            if(!created){
                const msgErro = [{field:'email',msg:"Já existe um usuário cadastrado com esse email :("}]
                return res.status(400).json(msgErro)            
            }
            await userPending.destroy({ force: true })
            user.password = null
            return res.status(200).json({
                user  : user,
                token : generateToken({ 
                    id: user.id ,
                    profile: user.profile,
                    email:user.email
                })
            });
        }catch(err){
            console.log(err);
            if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
                const validationsErros = ([...err.errors].map(erro=>{
                    let erroType = {
                        field:erro.path,
                        message:erro.message,
                        
                    }
                    return erroType
                }));
                //console.log(validationsErros)
                return res.status(400).json(validationsErros)
            }
            else{
                console.log(err);
                return res.status(500).json(err)
            }        
        }
    }
    async authenticate(req, res){
        const { email, password} = req.body;
        try{
            const user = await User.findOne({
                where: {
                    email:email
                }
            })
            if(!user){
                return res.status(400).json({msg:'O e-mail inserido não corresponde a nenhuma conta :('});
            }
            if(!await bcrypt.compare(password, user.password)){
                return res.status(400).json({msg:'Senha incorreta :('});
            }
            user.password = null;
            return res.status(200).json({ 
                user,
                token : generateToken({ 
                    id: user.id ,
                    profile: user.profile,
                    email:user.email
                })
            });
        }
        catch(err){
            console.log(err);
            return res.status(500).json(err)
        }
    }
    async forgot_password(req, res){
        const { email } =  req.body;
        //console.log(req.body.email)
        try{
            const user = await User.findOne({
                where:{
                    email,
                }
            });
            //console.log(user)
            if(!user){
                return res.status(400).json({msg:'O e-mail inserido não corresponde a nenhuma conta :('});
            }
            const key = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            await user.update({
                passwordResetKey: key,
                passwordResetExpires: now,
                
            });
            //-----envia email-----
            await sendEmail('forgot_password',key,email);

            return res.status(200).json({msg: `Foi enviado um email de recuperação de senha para ${email}`});
        }catch(err){
            console.log(err);
            return res.status(500).json({msg:'erro ao tentar solicitar recuperação de senha, tente novamente :('});
        }
    }
    async reset_password(req,res){
        const key = req.query.key
        const {password}=req.body
        try{
            if(!key){
                return res.status(400).json({msg:'Erro: o link usado expirou ou é inválido.'})
            }
            const user = await User.findOne({
                where:{
                    passwordResetKey:key
                }
            })            
            if(!user){
                return res.status(400).json({msg:'Erro: o link usado expirou ou é inválido.'})
            }
            
            const now = new Date()
            if(now>user.passwordResetExpires){
                return res.status(400).json({msg:'Erro: o link usado expirou ou é inválido.'})
            }
            user.password = await bcrypt.hash(password, 10);
            user.passwordResetKey = null
            user.passwordResetExpires = null
            await user.save()
            user.password = null
            return res.status(200).json({msg:'Senha alterada com sucesso :)'});
        }
        catch(err){
            console.log(err);
            return res.status(500).json({msg:'Fallha na alteração da senha'});
        } 
    }
}

module.exports = new AuthController();