/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Plagiarism = sequelize.define('plagiarism',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		moss_url:{
			type:DataTypes.TEXT,
		},
		createdAt:{
			type:DataTypes.DATE,
			allowNull:false,
		},
	},{
		freezeTableName:true,
		timestamps: false,
	})


	return Plagiarism;
}
