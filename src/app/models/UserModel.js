const [sequelize,Sequelize] = require('../../database/connection') 

class User extends Sequelize.Model{}
User.init({
	id:{
		type:Sequelize.STRING(24),
		allowNull:false,
		primaryKey:{
			msg:'Já existe um usuário cadastrado com esse id'
		},
	},
	name:{
		type:Sequelize.STRING(50),
		allowNull:false,
	    set(name) {
	      this.setDataValue('name', name.trim());
	    },
		validate:{
			notNull:{
				msg:"Este campo é obrigatório"
			},
		    isValidName(name) {
				const regexName = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;
			    if (!regexName.test(name)) throw new Error('Informe um nome válido');
		    }
		}
	},
	email:{
		type : Sequelize.STRING(30),
		allowNull : false, // default é true
	    set(email) {
	      this.setDataValue('email', email.toLowerCase().trim());
	    },
		unique:{
			msg:'Já existe um usuário cadastrado com esse email :('
		},
		validate:{
			isEmail:{
				msg:"Informe um email válido"
			},
			notNull:{
				msg:"Email é obrigatório"
			}
		}
	},
	password:{
		type : Sequelize.STRING,
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

	enrollment:{
		type : Sequelize.STRING(30),
		allowNull:false,
		unique:{
			msg:'Já existe um usuário cadastrado com essa matríclula :('
		},
		validate:{
			notNull:{
				msg:"Matrícula é obrigatório"
			},
			notEmpty:{
				msg:"Matrícula é obrigatório"
			}
		}
	},
	profile:{
		type : Sequelize.ENUM("ALUNO","PROFESSOR","ADMINISTRADOR"),
		defaultValue:"ALUNO",
		allowNull:false,
		validate:{
			notNull:{
				msg:"Perfil do usuário é obrigatório"
			},
			notEmpty:{
				msg:"Perfil do usuário é obrigatório"
			},
			isIn:{
				args:[["ALUNO","PROFESSOR","ADMINISTRADOR"]],
				msg: "Perfil só pode ser 'ALUNO', 'PROFESSOR' ou 'ADMINISTRADOR'"
			}
		}
	},
	checked:{
		type: Sequelize.BOOLEAN,
		allowNull:false,
		defaultValue:false,
	},
	solicitationKey:{
		type: Sequelize.STRING(40),
	},
	solicitationExpires:{
		type: Sequelize.DATE,
		validate:{
			isDate:true
		}	
	},
	passwordResetKey:{
		type: Sequelize.STRING(40),
	},
	passwordResetExpires:{
		type: Sequelize.DATE,
		validate:{
			isDate:true
		}
	}
},{
	modelName:'user',
	freezeTableName:true,
	sequelize,
})


module.exports = User