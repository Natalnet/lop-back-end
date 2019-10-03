/*para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{

	const UserPending = sequelize.define('userPending',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		name:{
			type:DataTypes.STRING(50),
			allowNull:false,
		    set(name) {
		      if (name) this.setDataValue('name', name.trim());
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
			type : DataTypes.STRING(30),
			allowNull : false, // default é true
		    set(email) {
		      this.setDataValue('email', email.toLowerCase().trim());
		    },
			unique:{
				msg:'Já existe um usuário cadastrado com esse email :('
			},
			validate:{
				isEmail:{
					msg:"Informe um email válido :("
				},
				notNull:{
					msg:"Email é obrigatório"
				}
			}
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

		enrollment:{
			type : DataTypes.STRING(30),
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
			type : DataTypes.ENUM("ALUNO","PROFESSOR","ADMINISTRADOR"),
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
		solicitationKey:{
			type: DataTypes.STRING(40),
		},
		solicitationExpires:{
			type: DataTypes.DATE,
			validate:{
				isDate:true
			}	
		},
	},{
		freezeTableName:true,
	})
	return UserPending;

}