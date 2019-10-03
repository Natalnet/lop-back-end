'use strict';

/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
const path = require('path')
module.exports = (sequelize,DataTypes)=>{
	const User = sequelize.import(path.resolve(__dirname,'UserModel'))

	const Question = sequelize.define('question',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		title:{
			type:DataTypes.STRING(50),
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
		code:{
			type: DataTypes.STRING(10),
			allowNull : false, // default é true
			unique:{
				msg:'Já existe uma questão cadastrada com esse código :('
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
		description:{
			type : DataTypes.TEXT,
			allowNull : false, // default é true
		    set(description) {
		      if(description) this.setDataValue('description', description.trim());
		    },
			validate:{
				notNull:{
					msg:"Descrição é obrigatório"
				},
				notEmpty:{
					msg:"Descrição é obrigatório"
				}
			}
		},
		solution:{
			type : DataTypes.TEXT,
		},
		katexDescription:{
			type : DataTypes.TEXT,
		    set(katexDescription) {
		      if (katexDescription) this.setDataValue('katexDescription', katexDescription.trim());
		    },
		},
		status:{
			type:DataTypes.ENUM('PÚBLICA','PRIVADA'),
			defaultValue:"PÚBLICA",
			allowNull:false,
			validate:{
				isIn:{
					args:[['PÚBLICA','PRIVADA']],
					msg: "Status só pode ser 'PÚBLICA' ou 'PRIVADA'"
				}
			}
		},
		difficulty:{
			type : DataTypes.ENUM('Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil'),
			defaultValue:"Fácil",
			allowNull:false,
			validate:{
				isIn:{
					args:[['Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil']],
					msg: "Dificudade só pode ser 'Muito fácil', 'Fácil', 'Médio', 'Difícil'ou 'Muito difícil"
				}
			}
		},
		results:{
			type : DataTypes.JSON,
			allowNull : false, // default é true
			validate:{
				notNull:{
					msg:"Resultados é obrigatório"
				},
				notEmpty:{
					msg:"Resultados é obrigatório"
				},
			    /*isValidResults(results) {
			    	const arrayyResults = JSON.parse(results)
				    if (!regexName.test(name)) throw new Error('Informe um nome válido');
			    }*/
			}
		},

	},{
		freezeTableName:true,
		//underscored: true,
	})

	Question.belongsTo(User,{as: 'author', foreignKey : 'author_id'})
	return Question;

}