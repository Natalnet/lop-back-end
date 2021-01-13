/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const LessonHasQuestion = sequelize.define('LessonHasQuestion',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
	},{
		freezeTableName:true,
	});

	return LessonHasQuestion;
}
