'use strict';

/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/
const path = require('path')
module.exports = (sequelize, DataTypes) => {
	const Question = sequelize.define('question', {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4
		},
		title: {
			type: DataTypes.STRING(200),
			allowNull: false,
			set(title) {
				if (title) this.setDataValue('title', title.trim());
			},
			validate: {
				notNull: {
					msg: "Título é obrigatório"
				},
				notEmpty: {
					msg: "Título é obrigatório"
				}

			}
		},
		code: {
			type: DataTypes.STRING(10),
			allowNull: false, // default é true
			unique: {
				msg: 'Já existe uma questão cadastrada com esse código :('
			},
			validate: {
				notNull: {
					msg: "código é obrigatório"
				},
				notEmpty: {
					msg: "código é obrigatório"
				}
			}
		},
		type: {
			type: DataTypes.ENUM('PROGRAMMING', 'OBJECTIVE', 'DISCURSIVE'),
			defaultValue: "PROGRAMMING",
			allowNull: false,
			validate: {
				isIn: {
					args: [['PROGRAMMING', 'OBJECTIVE', 'DISCURSIVE']],
					msg: "Status só pode ser 'PROGRAMMING', 'OBJECTIVE' ou 'DISCURSIVE'"
				}
			}
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false, // default é true
			set(description) {
				if (description) this.setDataValue('description', description.trim());
			},
			validate: {
				notNull: {
					msg: "Descrição é obrigatório"
				},
				notEmpty: {
					msg: "Descrição é obrigatório"
				}
			}
		},
		solution: {
			type: DataTypes.TEXT,
		},
		katexDescription: {
			type: DataTypes.TEXT,
			set(katexDescription) {
				if (katexDescription) this.setDataValue('katexDescription', katexDescription.trim());
			},
		},
		status: {
			type: DataTypes.ENUM('PÚBLICA', 'PRIVADA'),
			defaultValue: "PÚBLICA",
			allowNull: false,
			validate: {
				isIn: {
					args: [['PÚBLICA', 'PRIVADA']],
					msg: "Status só pode ser 'PÚBLICA' ou 'PRIVADA'"
				}
			}
		},

		difficulty: {
			type: DataTypes.ENUM('1', '2', '3', '4', '5'),
			allowNull: false,
			validate: {
				isIn: {
					args: [[1, 2, 3, 4, 5]],
					msg: "Dificudade só pode ser '1', '2', '3', '4'ou '5"
				}
			}
		},
		results: {
			type: DataTypes.JSON,
		},
		alternatives: {
			type: DataTypes.JSON,
		},

	}, {
		freezeTableName: true,
		//underscored: true,
	})


	return Question;

}