/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const FeedBackTest = sequelize.define('feedBackTest',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},

		compilation_error:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
		},
		runtime_error:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
		},
		presentation_error:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
		},
		wrong_answer:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
		},
		invalid_algorithm:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
		},
        comments:{
			type:DataTypes.TEXT,
			defaultValue:'',
        },
        hitPercentage:{
            type:DataTypes.FLOAT(5),
            allowNull:false,
		},
		isEditedByTeacher:{
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,	
		},
        createdAt:{
            type:DataTypes.DATE,
            defaultValue: DataTypes.NOW 
		},
	},{
		freezeTableName:true,
		timestamps: false,
	})


	return FeedBackTest;
}
