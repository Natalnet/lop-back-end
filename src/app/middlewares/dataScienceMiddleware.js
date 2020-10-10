const path = require('path')
const sequelize = require('../../database/connection')

class DataScienceMiddleware{
    validate(req, res, next){
        const { key } = req.query;
        if(key === process.env.DATASCIENCE_KEY){
            return next();
        }
        return res.status(401).json({msg: 'Acesso não permitido!'})
    }
    
}
module.exports = new DataScienceMiddleware();

