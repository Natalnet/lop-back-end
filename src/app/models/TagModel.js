/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Tag = sequelize.define('tag',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		name:{
			type:DataTypes.STRING(200),
			allowNull:false,
		},
	},{
		freezeTableName:true,
		timestamps: false,
	})
	return Tag;

}