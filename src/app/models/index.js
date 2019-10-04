const sequelize = require('../../database/connection')
const path = require('path')

const User = sequelize.import(path.resolve(__dirname,'UserModel'))
const UserPending = sequelize.import(path.resolve(__dirname,'UserPendingModel'))
const Question = sequelize.import(path.resolve(__dirname,'QuestionModel'))
const ListQuestions = sequelize.import(path.resolve(__dirname,'ListQuestionsModel'))
const ListHasQuestion = sequelize.import(path.resolve(__dirname,'ListHasQuestionModel'))
const Class = sequelize.import(path.resolve(__dirname,'ClassModel'))
const ClassHasUser = sequelize.import(path.resolve(__dirname,'ClassHasUserModel'))
const SolicitationToClass = sequelize.import(path.resolve(__dirname,'SolicitationToClassModel'))
/*associations*/

//User 1:N Question
Question.belongsTo(User,{as: 'author', foreignKey : 'author_id'})

//User N:N Class
User.belongsToMany(Class, { as: {singular: 'class', plural: 'classes'}, foreignKey : 'user_id',through: ClassHasUser })
Class.belongsToMany(User, { as: {singular: 'user', plural: 'users'}, foreignKey : 'class_id',through: ClassHasUser })

//User N:N Class
User.belongsToMany(Class, { as: {singular: 'solicitation', plural: 'solicitations'}, foreignKey : 'user_id',through: SolicitationToClass })
Class.belongsToMany(User, { as: {singular: 'solicitationToClass', plural: 'solicitationsToClass'}, foreignKey : 'class_id',through: SolicitationToClass })

//Question N:N ListQuestions
Question.belongsToMany(ListQuestions, { as: {singular: 'list', plural: 'lists'}, foreignKey : 'question_id',through: ListHasQuestion })
ListQuestions.belongsToMany(Question, { as: {singular: 'question', plural: 'questions'}, foreignKey : 'list_id',through: ListHasQuestion })

module.exports = {User,UserPending,Question,ListQuestions,Class,SolicitationToClass,ClassHasUser,ListHasQuestion}
