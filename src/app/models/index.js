const path = require('path');
const fs = require('fs');

module.exports = (sequelize) => {
	const model = {}
	fs.readdirSync(__dirname)
	.filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
	.forEach(file =>{
		model[file.replace('Model.js','')] = sequelize.import(path.resolve(__dirname,file))
	})
	/*associations*/

	//Question N:1 User
	model['Question'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//ObjectiveQuestion N:1 User
	//model['ObjectiveQuestion'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//Class N:1 User
	model['Class'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//ListQuestion N:1 User
	model['ListQuestions'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//Test N:1 User
	model['Test'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//Course N:1 User
	model['Course'].belongsTo(model['User'],{as: 'author', foreignKey : 'author_id'})

	//Lesson N:1 Course
	model['Lesson'].belongsTo(model['Course'],{as: 'course', foreignKey : 'course_id'})

	//User N:N Class
	model['User'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'user_id',through: model['ClassHasUser'] })
	model['Class'].belongsToMany(model['User'], { as: {singular: 'user', plural: 'users'}, foreignKey : 'class_id',through: model['ClassHasUser'] })
	
	//User N:N Class
	model['User'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'solicitedClasses'}, foreignKey : 'user_id',through: model['SolicitationToClass'] })
	model['Class'].belongsToMany(model['User'], { as: {singular: 'user', plural: 'solicitingUsers'}, foreignKey : 'class_id',through: model['SolicitationToClass'] })

	//Class N:N List
	model['ListQuestions'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'list_id',through: model['ClassHasListQuestion'] })
	model['Class'].belongsToMany(model['ListQuestions'], { as: {singular: 'list', plural: 'lists'}, foreignKey : 'class_id',through: model['ClassHasListQuestion'] })
	
	//Class N:N Test
	model['Test'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'test_id',through: model['ClassHasTest'] })
	model['Class'].belongsToMany(model['Test'], { as: {singular: 'test', plural: 'tests'}, foreignKey : 'class_id',through: model['ClassHasTest'] })
	
	//Class N:N Course
	model['Course'].belongsToMany(model['Class'], { as: {singular: 'class', plural: 'classes'}, foreignKey : 'course_id',through: model['ClassHasCourse'] })
	model['Class'].belongsToMany(model['Course'], { as: {singular: 'course', plural: 'courses'}, foreignKey : 'class_id',through: model['ClassHasCourse'] })
	
	//Question N:N ListQuestions
	model['Question'].belongsToMany(model['ListQuestions'], { as: {singular: 'list', plural: 'lists'}, foreignKey : 'question_id',through: model['ListHasQuestion'] })
	model['ListQuestions'].belongsToMany(model['Question'], { as: {singular: 'question', plural: 'questions'}, foreignKey : 'list_id',through: model['ListHasQuestion'] })
	
	//Question N:N Lesson
	model['Question'].belongsToMany(model['Lesson'], { as: {singular: 'lesson', plural: 'lessons'}, foreignKey : 'question_id',through: model['LessonHasQuestion'] })
	model['Lesson'].belongsToMany(model['Question'], { as: {singular: 'question', plural: 'questions'}, foreignKey : 'lesson_id',through: model['LessonHasQuestion'] })

	//Question N:N Test
	model['Question'].belongsToMany(model['Test'], { as: {singular: 'test', plural: 'tests'}, foreignKey : 'question_id',through: model['TestHasQuestion'] })
	model['Test'].belongsToMany(model['Question'], { as: {singular: 'question', plural: 'questions'}, foreignKey : 'test_id',through: model['TestHasQuestion'] })
	
	//Question N:N User
	model['Question'].belongsToMany(model['User'], { as: {singular: 'userDifficulty', plural: 'userDifficultys'}, foreignKey : 'question_id',through: model['Difficulty'] })
	model['User'].belongsToMany(model['Question'], { as: {singular: 'questionDifficulty', plural: 'questionDifficultys'}, foreignKey : 'user_id',through: model['Difficulty'] })

	//Submission N:1 User
	model['Submission'].belongsTo(model['User'], {as:'user', foreignKey: 'user_id'});
	//Submission N:1 Question
	model['Submission'].belongsTo(model['Question'], {as:'question', foreignKey: 'question_id'});
	//Submission N:1 ListQuestion
	model['Submission'].belongsTo(model['ListQuestions'], {as:'list', foreignKey: 'listQuestions_id'});
	//Submission N:1 Test
	model['Submission'].belongsTo(model['Test'], {as:'test', foreignKey: 'test_id'});
	//Submission N:1 Class
	model['Submission'].belongsTo(model['Class'], {as:'class', foreignKey: 'class_id'});
	//Submission N:1 Lesson
	model['Submission'].belongsTo(model['Lesson'], {as:'lesson', foreignKey: 'lesson_id'});

	//Plagiarism N:1 Question
	model['Plagiarism'].belongsTo(model['Question'], {as:'question', foreignKey: 'question_id'});
	//Plagiarism N:1 ListQuestion
	model['Plagiarism'].belongsTo(model['ListQuestions'], {as:'list', foreignKey: 'listQuestions_id'});
	//Plagiarism N:1 Class
	model['Plagiarism'].belongsTo(model['Class'], {as:'class', foreignKey: 'class_id'});
	//Plagiarism N:1 Test
	model['Plagiarism'].belongsTo(model['Test'], {as:'test', foreignKey: 'test_id'});

	//FeedBackTest N:1 User
	model['FeedBackTest'].belongsTo(model['User'], {as:'user', foreignKey: 'user_id'});
	//FeedBackTest N:1 Question
	model['FeedBackTest'].belongsTo(model['Question'], {as:'question', foreignKey: 'question_id'});
	//FeedBackTest N:1 Test
	model['FeedBackTest'].belongsTo(model['Test'], {as:'test', foreignKey: 'test_id'});
	//FeedBackTest N:1 Class
	model['FeedBackTest'].belongsTo(model['Class'], {as:'class', foreignKey: 'class_id'});

	//Draft N:1 User
	model['Draft'].belongsTo(model['User'], {as:'user', foreignKey: 'user_id'});
	//Draft N:1 Question
	model['Draft'].belongsTo(model['Question'], {as:'question', foreignKey: 'question_id'});
	//Draft N:1 ListQuestion
	model['Draft'].belongsTo(model['ListQuestions'], {as:'list', foreignKey: 'listQuestions_id'});
	//Draft N:1 Test
	model['Draft'].belongsTo(model['Test'], {as:'test', foreignKey: 'test_id'});
	//Draft N:1 Class
	model['Draft'].belongsTo(model['Class'], {as:'class', foreignKey: 'class_id'});
	//Draft N:1 Lesson
	model['Draft'].belongsTo(model['Lesson'], {as:'lesson', foreignKey: 'lesson_id'});

	//Question N:N User
	model['Question'].belongsToMany(model['User'], { as: {singular: 'userAccess', plural: 'userAccesses'}, foreignKey : 'question_id',through:{ model:model['Access'],unique:false} })
	model['User'].belongsToMany(model['Question'], { as: {singular: 'questionAccess', plural: 'questionAccesses'}, foreignKey : 'user_id',through:{ model:model['Access'],unique:false} })
	
	//Question N:N Tag
	model['Question'].belongsToMany(model['Tag'], { as: {singular: 'tag', plural: 'tags'}, foreignKey : 'question_id',through: model['QuestionHasTag'] })
	model['Tag'].belongsToMany(model['Question'], { as: {singular: 'question', plural: 'questions'}, foreignKey : 'tag_id',through: model['QuestionHasTag'] })
	
	//ObjectveQuestion N:N Tag
	// model['ObjectiveQuestion'].belongsToMany(model['Tag'], { as: {singular: 'tag', plural: 'tags'}, foreignKey : 'objective_question_id',through: model['ObjectiveQuestionHasTag'] })
	// model['Tag'].belongsToMany(model['ObjectiveQuestion'], { as: {singular: 'objectiveQuestion', plural: 'objectiveQuestions'}, foreignKey : 'tag_id',through: model['ObjectiveQuestionHasTag'] })

	return {
		User 				     : model['User'],
		UserPending 		     : model['UserPending'],
		Question 			     : model['Question'],
		ListQuestions 		     : model['ListQuestions'],
		Class 				     : model['Class'],
		Tag                      : model['Tag'],
		Test                     : model['Test'],
		SolicitationToClass      : model['SolicitationToClass'],
		ListHasQuestion          : model['ListHasQuestion'],
		TestHasQuestion          : model['TestHasQuestion'],
		ClassHasUser             : model['ClassHasUser'],
		ClassHasListQuestion     : model['ClassHasListQuestion'],
		ClassHasTest             : model['ClassHasTest'],
		ClassHasCourse           : model['ClassHasCourse'],
		LessonHasQuestion        : model['LessonHasQuestion'],
		Submission               : model['Submission'],
		Plagiarism               : model['Plagiarism'],
		FeedBackTest             : model['FeedBackTest'],
		QuestionHasTag           : model['QuestionHasTag'],
		Difficulty               : model['Difficulty'],
		Access                   : model['Access'],
		Draft                    : model['Draft'],
		Course                   : model['Course'],
		Lesson                   : model['Lesson'],
	}
}
