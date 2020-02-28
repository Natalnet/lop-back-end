/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Access = sequelize.define('access',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		ip:{
			type:DataTypes.STRING(60),
		},
		environment:{
			type:DataTypes.ENUM('desktop','mobile'),
			allowNull:false,
		},
		createdAt:{
			type:DataTypes.DATE,
			allowNull:false,
		},
	},{
		freezeTableName:true,
		timestamps: false,
	})


	return Access;
}
