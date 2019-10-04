const sequelize = require('../../database/connection')
const path = require('path')

const User = sequelize.import(path.resolve(__dirname,'UserModel'))
const UserPending = sequelize.import(path.resolve(__dirname,'UserPendingModel'))
const Question = sequelize.import(path.resolve(__dirname,'QuestionModel'))
const ListQuestions = sequelize.import(path.resolve(__dirname,'ListQuestionsModel'))
const ListHasQuestion = sequelize.import(path.resolve(__dirname,'ListHasQuestionModel'))
const Class = sequelize.import(path.resolve(__dirname,'ClassModel'))
const ClassHasUser = sequelize.import(path.resolve(__dirname,'ClassHasUserModel'))

/*associations*/

//User 1:N Question
Question.belongsTo(User,{as: 'author', foreignKey : 'author_id'})

//User N:N Class
User.belongsToMany(Class, { as: 'Classes', foreignKey : 'user_id',through: ClassHasUser })
Class.belongsToMany(User, { as: 'Users', foreignKey : 'class_id',through: ClassHasUser })

//Question N:N ListQuestions
Question.belongsToMany(ListQuestions, { as: 'Lists', foreignKey : 'question_id',through: ListHasQuestion })
ListQuestions.belongsToMany(Question, { as: 'Questions', foreignKey : 'list_id',through: ListHasQuestion })

module.exports = {User,UserPending,Question,ListQuestions,ListHasQuestion,Class,ClassHasUser}
