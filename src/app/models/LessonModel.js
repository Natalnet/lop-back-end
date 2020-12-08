'use strict';

/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
const path = require('path')
module.exports = (sequelize,DataTypes)=>{
	const Lesson = sequelize.define('lesson',{
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
		startDate: {
			type: DataTypes.DATE,
        },
        
		isVisible: {
            type:DataTypes.BOOLEAN,
			defaultValue:false,
			allowNull:false,
        },

	},{
		freezeTableName:true,
		//underscored: true,
	})

	return Lesson;

}