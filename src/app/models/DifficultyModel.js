/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Difficulty = sequelize.define('difficulty',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		difficulty:{
			type : DataTypes.ENUM('1','2','3','4','5'),
		},
	},{
		freezeTableName:true,
	})


	return Difficulty;
}
