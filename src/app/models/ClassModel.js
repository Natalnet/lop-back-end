/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Class = sequelize.define('class',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		name:{
			type:DataTypes.STRING(30),
			allowNull:false,
		    set(name) {
		      if (name) this.setDataValue('name', name.trim());
		    },
			validate:{
				notNull:{
					msg:"Nome é obrigatório"
				},
				notEmpty:{
					msg:"Nome é obrigatório"
				}
			}
		},
		year:{
			type:DataTypes.STRING(5),
			allowNull:false,
		    set(year) {
		      if (year) this.setDataValue('year', year.trim());
		    },
			validate:{
				notNull:{
					msg:"Ano é obrigatório"
				},
				notEmpty:{
					msg:"Ano é obrigatório"
				}
			}
		},
		state:{
			type : DataTypes.ENUM("ATIVA","INATIVA"),
			allowNull:false,
			validate:{
				notNull:{
					msg:"Estado da turma é obrigatório"
				},
				notEmpty:{
					msg:"Estado da turma é obrigatório"
				},
				isIn:{
					args:[["ATIVA","INATIVA"]],
					msg: "Estado da turma só pode ser 'ATIVA','INATIVA'"
				}
			}
		},
		semester:{
			type : DataTypes.ENUM("1","2"),
			allowNull:false,
			validate:{
				notNull:{
					msg:"Semestre é obrigatório"
				},
				notEmpty:{
					msg:"Semestre é obrigatório"
				},
				isIn:{
					args:[["1","2"]],
					msg: "Semestre só pode ser '1' ou '2'"
				}
			}
		},
		description:{
			type : DataTypes.TEXT,
		    set(description) {
		      if(description) this.setDataValue('description', description.trim());
		    },
		},
		/*code:{
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
		},*/
	},{
		freezeTableName:true,
	})
	return Class;

}