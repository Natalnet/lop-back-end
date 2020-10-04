
const path = require('path')
const { Op } = require('sequelize')

const sequelize = require('../../database/connection')
const { Submission, Question, ClassHasListQuestion, ListQuestions, Test, Class, User } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class DataScienceController {
	async getDataScienceListClass(req, res) {
		const { idClass } = req.params;
		try {
			const classRoon = await Class.findByPk(idClass);
			let users = await classRoon.getUsers({
				where: {
					profile: 'ALUNO',
				},
				order: ['name'],
				attributes: ['id', 'name', 'email'],

			});
			let lists = await classRoon.getLists({
				attributes: ['id', 'title'],
				order: [
					['questions', 'createdAt']
				],
				include: [{
					model: Question,
					as: 'questions',
					attributes: ['id']
				}],
			});
			users = users.map(user => {
				const userCopy = JSON.parse(JSON.stringify(user));
				userCopy.enrollment = userCopy.classHasUser.enrollment;
				delete userCopy.classHasUser;
				return userCopy;
			})
			users = await Promise.all(users.map(async user => {
				lists = await Promise.all(lists.map(async list => {
					const classHasListQuestion = await ClassHasListQuestion.findOne({
						where: {
							list_id: list.id,
							class_id: idClass
						},
						attributes: ['createdAt', 'submissionDeadline']
					})
					let submissionDeadline = classHasListQuestion.submissionDeadline
					submissionDeadline = submissionDeadline ? new Date(submissionDeadline) : null;
					const questions = await Promise.all(list.questions.map(async question => {
						const query = {
							where: {
								user_id: user.id,
								question_id: question.id,
								listQuestions_id: list.id,
								class_id: idClass
							}
						}

						const submissionsCount = await Submission.count(query)
						query.where.hitPercentage = 100
						const correctSumissionsCount = await Submission.count(query)
						if (submissionDeadline) {
							query.where.createdAt = {
								[Op.lte]: submissionDeadline
							}
						}
						const completedSumissionsCount = await Submission.count(query)
						const questionCopy = JSON.parse(JSON.stringify(question))
						delete questionCopy.listHasQuestion
						questionCopy.completedSumissionsCount = completedSumissionsCount
						questionCopy.submissionsCount = submissionsCount
						questionCopy.isCorrect = correctSumissionsCount > 0
						return questionCopy
					}))
					const listCopy = JSON.parse(JSON.stringify(list))

					listCopy.questionsCount = questions.length
					listCopy.questionsCompletedSumissionsCount = questions.filter(q => q.completedSumissionsCount > 0).length
					delete listCopy.questions;
					listCopy.classHasListQuestion = classHasListQuestion;
					return listCopy;
				}))
				const userCopy = JSON.parse(JSON.stringify(user));
				userCopy.lists = lists;
				return userCopy;
			}))


			return res.status(200).json(users)
		}
		catch (err) {
			console.log(err)
			return res.status(500).json(err)
		}
	}

	async getDataScienceSubmissionClass(req, res) {
		const { idClass } = req.params;
		try {
			const  classRoomPromise = Class.findOne({
				where: {
					id: idClass
				},
				attributes: ['name','year','semester'],
				include:[{
					model: User,
					as: 'users',
					where:{
						profile: 'PROFESSOR'
					},
					attributes:['name','email']
				}]
			}) 
			const submissionsPromise = Submission.findAll({
				where: {
					class_id: idClass
				},
				order: [
					['createdAt', 'DESC']
				],
				attributes: ['environment', 'hitPercentage', 'language', 'char_change_number', 'timeConsuming', 'createdAt', 'listQuestions_id', 'test_id', 'question_id'],
				include: [{
					model: User,
					as: 'user',
					where: {
						profile: "ALUNO",
					},
					attributes: ['id', 'name', 'email'],
					include: [{
						model: Class,
						as: 'classes',
						where: {
							id: idClass
						},
						attributes: ['id']
					}]
				}, {
					model: Question,
					as: 'question',
					attributes: ['title']
				}, {
					model: ListQuestions,
					as: 'list',
					attributes: ['title']
				},{
					model: Test,
					as: 'test',
					attributes: ['title']
				// }
				// ,{
				// 	model: Class,
				// 	as: 'class',
				// 	attributes: ['name','year','semester'],
				// 	include:[{
				// 		model: User,
				// 		as: 'users',
				// 		where:{
				// 			profile: 'PROFESSOR'
				// 		},
				// 		attributes:['name']
				// 	}]
				}]
			})
			let [classRoom, submissions] = await Promise.all([
				classRoomPromise,
				submissionsPromise
			])
			classRoom = JSON.parse(JSON.stringify(classRoom))
			classRoom.teachers = classRoom.users.map(({name, email})=>({
				name, 
				email
			}))
			delete classRoom.users;
			submissions = submissions.map(submission => {
				const submissionCopy = JSON.parse(JSON.stringify(submission))
				submissionCopy.user = `${submission.user.name} - ${submission.user.classes[0].classHasUser.enrollment}`;
				submissionCopy.question = submission.question.title;
				submissionCopy.list = submission.list && submission.list.title;
				submissionCopy.test = submission.test && submission.test.title;

				// const {name, year,semester, users } = submissionCopy.class;
				// delete submissionCopy.class;
				// submissionCopy.class = {};
				// submissionCopy.class.info = `${name} - ${year}.${semester}`;
				// submissionCopy.class.users = users.map(({name})=>name);
				delete submissionCopy.question_id;
				delete submissionCopy.listQuestions_id;
				delete submissionCopy.user.classes;
				delete submissionCopy.test_id;
				return submissionCopy;
			})

			return res.status(200).json({classRoom , submissions});
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new DataScienceController();