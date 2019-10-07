const path = require('path')
const fs = require('fs')

module.exports = (sequelize) => {
	const model = {}
	fs.readdirSync(__dirname)
	.filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
	.forEach(file =>{
		model[file.replace('Model.js','')] = sequelize.import(path.resolve(__dirname,file))
	})
	
	/*associations*/

	//User 1:N Question
	model['Question'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//User N:N Class
	model['User'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'user_id',through: model['ClassHasUser'] })
	model['Class'].belongsToMany(model['User'], { as: {singular: 'user', plural: 'users'}, foreignKey : 'class_id',through: model['ClassHasUser'] })

	//User N:N Class
	model['User'].belongsToMany(model['Class'], { as: {singular: 'solicitation', plural: 'solicitations'}, foreignKey : 'user_id',through: model['SolicitationToClass'] })
	model['Class'].belongsToMany(model['User'], { as: {singular: 'solicitationToClass', plural: 'solicitationsToClass'}, foreignKey : 'class_id',through: model['SolicitationToClass'] })

	//Class N:N List
	model['ListQuestions'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'list_id',through: model['ClassHasListQuestion'] })
	model['Class'].belongsToMany(model['ListQuestions'], { as: {singular: 'list', plural: 'lists'}, foreignKey : 'class_id',through: model['ClassHasListQuestion'] })

	//Question N:N ListQuestions
	model['Question'].belongsToMany(model['ListQuestions'], { as: {singular: 'list', plural: 'lists'}, foreignKey : 'question_id',through: model['ListHasQuestion'] })
	model['ListQuestions'].belongsToMany(model['Question'], { as: {singular: 'question', plural: 'questions'}, foreignKey : 'list_id',through: model['ListHasQuestion'] })

	return {
		User 				 : model['User'],
		UserPending 		 : model['UserPending'],
		Question 			 : model['Question'],
		ListQuestions 		 : model['ListQuestions'],
		Class 				 : model['Class'],
		SolicitationToClass  : model['SolicitationToClass'],
		ClassHasUser         : model['ClassHasUser'],
		ListHasQuestion      : model['ListHasQuestion'],
		ClassHasListQuestion : model['ClassHasListQuestion']
	}
}
