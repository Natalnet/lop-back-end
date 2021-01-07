
const path = require('path')
const { Op } = require('sequelize')

const sequelize = require('../../database/connection')
const { Submission, Question, ClassHasListQuestion, ListQuestions, Test, Class, User, Tag } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class DataScienceController {
	async getDataScienceTeachers(req, res) {
		try {
			const teachers = await User.findAll({
				where: {
					profile: "PROFESSOR"
				},
				attributes: ['id', 'email', 'name'],
				order: ['name']
			})
			return res.status(200).json(teachers);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}
	}

	async getDataScienceClassByTeacher(req, res) {
		const { teacher_id } = req.params;
		const { semester, year } = req.query;
		try {
			if (!(semester && year)) {
				return res.status(400).json({ msg: 'year e semester devem ser passados' });
			}
			const teacher = await User.findByPk(teacher_id);
			if (!teacher) {
				return res.status(404).json({ msg: 'Não foi encontrado nenhum usuário com o id informado' });
			}
			let classes = await teacher.getClasses({
				where: {
					semester,
					year
				},
				order: [
					['createdAt', 'DESC']
				],
				attributes: ['id', 'name', 'code', 'year', 'semester']
			})
			classes = JSON.parse(JSON.stringify(classes))
			classes = await Promise.all(classes.map(async classRoom => {
				const studentsCount = await User.count({
					where: {
						profile: 'ALUNO',
					},
					include: [{
						model: Class,
						as: 'classes',
						where: {
							id: classRoom.id
						}
					}]
				})
				const teachersCount = await User.count({
					where: {
						profile: 'PROFESSOR',
					},
					include: [{
						model: Class,
						as: 'classes',
						where: {
							id: classRoom.id
						}
					}]
				})
				delete classRoom.classHasUser;
				classRoom.studentsCount = studentsCount
				classRoom.teachersCount = teachersCount
				return classRoom;
			}))
			return res.status(200).json(classes);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}
	}
	async getDataScienceListClass(req, res) {
		const { idClass } = req.params;
		try {
			const classRoom = await Class.findByPk(idClass);
			if (!classRoom) {
				return res.status(404).json({ msg: 'Não foi encontrado nenhuma turma com o id informado' });
			}
			let users = await classRoom.getUsers({
				where: {
					profile: 'ALUNO',
				},
				order: ['name'],
				attributes: ['id', 'name', 'email'],

			});
			let lists = await classRoom.getLists({
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
	async getDataScienceListByClass(req, res) {
		const { idClass } = req.params;
		try {
			const classRoom = await Class.findByPk(idClass);
			if (!classRoom) {
				return res.status(404).json({ msg: 'Não foi encontrado nenhuma turma com o id informado' });
			}
			let lists = await classRoom.getLists({
				attributes: ['id', 'title', 'createdAt'],
				order: [
					['createdAt', 'DESC']
				],
				include: [{
					model: User,
					as: 'author',
					attributes: ['name', 'email']
				}]
			});
			lists = JSON.parse(JSON.stringify(lists))
			lists.forEach(list => {
				delete list.classHasListQuestion;
				let shortTitle = '';
				list.title.split(' ').forEach(word => {
					const code = word.charCodeAt(0);
	
					if ((code > 47 && code < 58) || // numeric (0-9)
						(code > 64 && code < 91) || // upper alpha (A-Z)
						(code > 96 && code < 123)) { // lower alpha (a-z)
						shortTitle += word[0].toUpperCase()
					}
				})
				list.shortTitle = shortTitle;
			})
			return res.status(200).json(lists)
		}
		catch (err) {
			console.log(err)
			return res.status(500).json(err)
		}
	}

	async getDataScienceTestClass(req, res) {
		const { idClass } = req.params;
		try {
			const classRoom = await Class.findByPk(idClass);
			if (!classRoom) {
				return res.status(404).json({ msg: 'Não foi encontrado nenhuma turma com o id informado' });
			}
			let users = await classRoom.getUsers({
				where: {
					profile: 'ALUNO',
				},
				order: ['name'],
				attributes: ['id', 'name', 'email'],

			});
			let tests = await classRoom.getTests({
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
				tests = await Promise.all(tests.map(async test => {

					const questions = await Promise.all(test.questions.map(async question => {
						const submission = await Submission.findOne({
							where: {
								user_id: user.id,
								question_id: question.id,
								test_id: test.id,
								class_id: idClass
							},
							order: [
								['createdAt', 'DESC']
							],
							attributes: ['hitPercentage', 'createdAt']
						})
						const questionCopy = JSON.parse(JSON.stringify(question))
						questionCopy.hitPercentage = submission ? submission.hitPercentage : 0
						return questionCopy
					}))
					const testCopy = JSON.parse(JSON.stringify(test))
					const scoreSystem = questions.reduce((total, h) => total + h.hitPercentage, 0) / test.questions.length
					delete testCopy.classHasTest
					testCopy.scoreSystem = Number(scoreSystem.toFixed(2))
					return testCopy;
				}))
				const userCopy = JSON.parse(JSON.stringify(user));
				userCopy.tests = tests;
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
			const classRoom = await Class.findByPk(idClass)
			if (!classRoom) {
				return res.status(404).json({ msg: 'Não foi encontrado nenhuma turma com o id informado' });
			}
			let submissions = await Submission.findAll({
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
				}, {
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
			submissions = JSON.parse(JSON.stringify(submissions))
			submissions = submissions.map(submission => {
				submission.user = `${submission.user.name} - ${submission.user.classes[0].classHasUser.enrollment}`;
				submission.question = submission.question.title;
				submission.list = submission.list && submission.list.title;
				submission.test = submission.test && submission.test.title;

				// const {name, year,semester, users } = submission.class;
				// delete submission.class;
				// submission.class = {};
				// submission.class.info = `${name} - ${year}.${semester}`;
				// submission.class.users = users.map(({name})=>name);
				delete submission.question_id;
				delete submission.listQuestions_id;
				delete submission.user.classes;
				delete submission.test_id;
				return submission;
			})

			return res.status(200).json(submissions);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async getDataScienceQeustions(req, res) {
		try {
			let questions = await Question.findAll({
				where: {
					type: 'PROGRAMAÇÃO',
				},
				attributes: ['id', 'title', 'difficulty'],
				order: ['title'],

				include: [{
					model: Tag,
					as: 'tags',
					attributes: ['name']
				}, {
					model: ListQuestions,
					as: 'lists',
					attributes: ['id', 'title']
				}, {
					model: Test,
					as: 'tests',
					attributes: ['id', 'title']
				}]
			})
			questions = JSON.parse(JSON.stringify(questions))
			questions.forEach(question => {
				question.tags.forEach(tag => {
					delete tag.questionHasTag;
				})
				question.lists.forEach(list => {
					delete list.listHasQuestion;
				})
				question.tests.forEach(test => {
					delete test.testHasQuestion;
				})
			});
			return res.status(200).json(questions);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new DataScienceController();