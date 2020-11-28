/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
module.exports = (sequelize,DataTypes)=>{
	const Course = sequelize.define('course',{
		id: {
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
		title: {
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
		code: {
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
		description:{
			type : DataTypes.TEXT,
		    set(description) {
		      if(description) this.setDataValue('description', description.trim());
		    },
        },
	},{
		freezeTableName:true,
	})
	return Course;
}