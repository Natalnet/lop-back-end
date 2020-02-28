/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Draft = sequelize.define('draft',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		answer:{
			type:DataTypes.TEXT
		},
		char_change_number:{
			type : DataTypes.BIGINT(11),
			allowNull : false,
			defaultValue : 0
		},
	},{
		freezeTableName:true,
	})


	return Draft;
}
