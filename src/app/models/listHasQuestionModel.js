/*
Sequelize associações:
https://sequelize.org/master/manual/associations.html

Para criar campos virtuais:
https://sequelize.org/master/class/lib/data-types.js~VIRTUAL.html
*/ 
const path = require('path')
module.exports = (sequelize,DataTypes)=>{
	const ListQuestion = sequelize.import(path.resolve(__dirname,'ListQuestionModel'))
	const Question = sequelize.import(path.resolve(__dirname,'QuestionModel'))
	const ListHasQuestion = sequelize.define('listHasQuestion',{
		id:{
			type:DataTypes.UUID,
			allowNull:false,
			primaryKey: true,
			defaultValue:DataTypes.UUIDV4
		},
	},{
		freezeTableName:true,
	})

	Question.belongsToMany(ListQuestion, { as: 'List', foreignKey : 'list_id',through: ListHasQuestion })
	ListQuestion.belongsToMany(Question, { as: 'Questions', foreignKey : 'question_id',through: ListHasQuestion })
	return ListHasQuestion;

}