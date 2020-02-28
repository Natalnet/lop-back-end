/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
const path = require('path')
module.exports = (sequelize,DataTypes)=>{
	const SolicitationToClass = sequelize.define('solicitationToClass',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		enrollment:{
			type : DataTypes.STRING(30),
			/*unique:{
				msg:'Já existe um usuário cadastrado com essa matríclula :('
			},*/
		},
	},{
		freezeTableName:true,
	})


	return SolicitationToClass;
}