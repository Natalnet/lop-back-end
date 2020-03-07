/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Test = sequelize.define('test',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		title:{
			type:DataTypes.STRING(200),
			allowNull:false,
		    set(title) {
		      if (title) this.setDataValue('title', title.trim());
		    },
			validate:{
				notNull:{
					msg:"Título é obrigatório"
				},
				notEmpty:{
					msg:"Título é obrigatório"
				}
			}
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
			allowNull:false,
		},
		password:{
			type : DataTypes.STRING,
			allowNull : false, // default é true
			validate:{
				notNull:{
					msg:"Senha é obrigatório"
				},
				notEmpty:{
					msg:"Senha é obrigatório"
				}
			}
		},
		code:{
			type: DataTypes.STRING(10),
			allowNull : false, // default é true
			unique:{
				msg:'Já existe uma lista cadastrada com esse código :('
			},
			validate:{
				notNull:{
					msg:"código é obrigatório"
				},
				notEmpty:{
					msg:"código é obrigatório"
				}
			}
		},
	},{
		freezeTableName:true,
	})
	return Test;

}