/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Submission = sequelize.define('submission',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		type: {
			type: DataTypes.ENUM('PROGRAMAÇÃO', 'OBJETIVA', 'DISCURSIVA'),
			defaultValue: "PROGRAMAÇÃO",
			allowNull: false,
			validate: {
				isIn: {
					args: [['PROGRAMAÇÃO', 'OBJETIVA', 'DISCURSIVA']],
					msg: "Status só pode ser 'PROGRAMAÇÃO', 'OBJETIVA' ou 'DISCURSIVA'"
				}
			}
		},
		ip:{
			type:DataTypes.STRING(200),
		},
		environment:{
			type:DataTypes.ENUM('desktop','mobile'),
			allowNull:false,
		},
		hitPercentage:{
			type:DataTypes.FLOAT(5),
		},
		language:{
			type:DataTypes.ENUM('javascript','cpp','c','python','java','blockly'),
			allowNull:true,
		},
		answer:{
			type:DataTypes.TEXT
		},
		char_change_number:{
			type : DataTypes.BIGINT(11),
			allowNull : false,
			defaultValue : 0
		},
		timeConsuming:{
			type:DataTypes.BIGINT(11),
			allowNull:false
		},
		createdAt:{
			type:DataTypes.DATE,
			allowNull:false,
		},
	},{
		freezeTableName:true,
		timestamps: false,
	})


	return Submission;
}
