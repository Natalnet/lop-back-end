const crypto = require('crypto');
const { Op } = require('sequelize')
const path = require('path')

const sequelize = require('../../database/connection')
const { User, Class, SolicitationToClass, ClassHasUser } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class UserMiddleware {
    async index(req, res, next) {
        const idClass = req.query.idClass
        const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        try {
            if (idClass && !isUuid.test(idClass)) {

                return res.status(404).json({ msg: 'página não encontrada' })
            }
            if (idClass) {
                const classCount = await Class.count({
                    where: {
                        id: idClass
                    }
                })
                if (classCount === 0) {

                    return res.status(404).json({ msg: 'página não encontrada' })
                }
            }

            return next()
        }
        catch (err) {
            console.log(err)
            return res.status(500).json(err)
        }
    }
    async index_paginate(req, res, next) {
        const idClass = req.query.idClass
        const isUuid = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/
        try {
            if (!isUuid.test(idClass)) {
                return res.status(404).json({ msg: 'página não encontrada' })
            }
			const classHasUser = await ClassHasUser.findOne({
				where:{
					user_id: req.userId,
					class_id: idClass
				}
			});
            // console.log('classHasUser: ',classHasUser);
			if(!classHasUser){
				return res.status(401).json({msg: 'Sem permissão'})
			}
            return next()
        }
        catch (err) {
            console.log(err)
            return res.status(500).json(err)
        }
    }
}

module.exports = new UserMiddleware();
