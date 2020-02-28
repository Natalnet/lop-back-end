/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const ListHasListQuestion = sequelize.define('classHasListQuestion',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		submissionDeadline:{
			type:DataTypes.DATE,
		},
		createdAt:{
			type:DataTypes.DATE,
			allowNull:false,
		},
	},{
		timestamps: false,
		freezeTableName:true,
	})


	return ListHasListQuestion;
}