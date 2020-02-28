const jwt = require('jsonwebtoken')
const {TOKEN_SECRET} = require('../../config/env')
const path = require('path')
const sequelize = require('../../database/connection')

const User = sequelize.import(path.resolve(__dirname,'..','models','UserModel'))

class authMiddleware{
    authentication(req, res, next){
        const authHeader = req.headers.authorization;
        const profile = req.headers.profile
        if(!authHeader){
            return res.status(401).json({msg: 'token não informado'});
        }

        const parts = authHeader.split(' ');

        if(!parts.length === 2){
            return res.status(401).json({msg: 'token mal formatado'});
        }

        const [scheme, token] = parts;

        if(!/^Bearer$/i.test(scheme)){
            return res.status(401).json({msg: 'token mal formatado' });
        }

        jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
            if(err){
                return res.status(401).json({msg: 'token mal formatado'});
            }
            if(decoded.profile!==profile){
                return res.status(401).json({msg: 'perfil inválido'});
            }
            req.userId = decoded.id;
            req.userProfile = decoded.profile
            req.userEmail = decoded.email
            return next();
        });   

    }
}

module.exports = new authMiddleware()