/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const ClassHasCourse = sequelize.define('classHasCourse',{
        
		id: {
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
        },
        
		startDate: {
			type:DataTypes.DATE,
        },
        
		isVisible: {
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
        },

		createdAt: {
			type:DataTypes.DATE,
			allowNull:false,
		},
	},{
		timestamps: false,
		freezeTableName:true,
	})
	return ClassHasCourse;
}