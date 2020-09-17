/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const ClassHasTest = sequelize.define('classHasTest',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		status:{
			type:DataTypes.ENUM('ABERTA','FECHADA'),
			defaultValue:"FECHADA",
			allowNull:false,
			validate:{
				isIn:{
					args:[['ABERTA','FECHADA']],
					msg: "Status só pode ser 'ABERTA' ou 'FECHADA'"
				}
			}
		},
		showAllTestCases:{
			type:DataTypes.BOOLEAN,
			defaultValue:false,
			//allowNull:false,
		},
		password:{
			type : DataTypes.STRING,
			allowNull : false, // default é true
			// validate:{
			// 	notNull:{
			// 		msg:"Senha é obrigatório"
			// 	},
			// 	notEmpty:{
			// 		msg:"Senha é obrigatório"
			// 	}
			// }
		},
	},{
		freezeTableName:true,
	})


	return ClassHasTest;
}