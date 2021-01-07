const crypto = require('crypto');
const { Op, fn } = require('sequelize')

const path = require('path')
const sequelize = require('../../database/connection')
const { User, Question, Difficulty, Tag, Draft,Test, Submission, Access, ListQuestions } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class QuestionController {

	async index(req, res) {
		const { idList, idTest } = req.query;
		try {
			let listPromise, testPromise;
			if(idList){
				listPromise = ListQuestions.findOne({
					where: {
						id: idList
					},
					attributes: ["title"]
				})
			}
			else if(idTest){
				testPromise = Test.findOne({
					where: {
						id: idTest
					},
					attributes: ["title"/*,"password","showAllTestCases"*/]
				})
			}
			const query = {
				include: [{
					model: User,
					as: 'author',
					attributes: ["email"]
				}]
			}
			if (idList) {
				query.include = [...query.include, {
					model: ListQuestions,
					as: "lists",
					where: {
						id: idList,
					},
					attributes: ["id"]
				}]
			}
			else if (idTest) {
				query.include = [...query.include, {
					model: Test,
					as: "tests",
					where: {
						id: idTest,
					},
					attributes: ["id"]
				}]
			}			
			const questionsPromise = Question.findAll(query)
			let list, test, questions;
			if(idList){
				[list, questions] = await Promise.all([listPromise, questionsPromise])
			}
			else if(idTest){
				[test, questions] = await Promise.all([testPromise, questionsPromise])
			}
			questions = await Promise.all(questions.map(async question => {
				const submissionsCount = await Submission.count({
					where: {
						question_id: question.id
					},

				})
				const submissionsCorrectsCount = await Submission.count({
					where: {
						question_id: question.id,
						hitPercentage: 100
					},

				})

				return {
					...JSON.parse(JSON.stringify(question)),
					submissionsCount,
					submissionsCorrectsCount
				};
			}))
			const response = {
				questions
			}
			if(idList){
				response.list = list
			}
			else if(idTest){
				response.test = test
			}
			return res.status(200).json(response)
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}
	}
	async index_paginate(req, res) {
		const status = req.query.status || 'PÚBLICA';
		const titleOrCode = req.query.titleOrCode || '';
		const sortBy = req.query.sortBy || 'createdAt';
		const sort = req.query.sort || "DESC";
		const tagId = req.query.tag;

		const limitDocsPerPage = parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);

		try {
			const query = {
				where: {
					[Op.or] :{
						title: {
							[Op.like]: `%${titleOrCode}%`
						},
						code: {
							[Op.eq]: titleOrCode
						},
					},
					status: {
						[Op.in]: status.split(' ')
					},
					type: 'PROGRAMAÇÃO',
				},
				order: [
					sort === 'DESC' ? [sortBy, 'DESC'] : [sortBy]
				],
				attributes: {
					exclude: ['solution', 'author_id', 'updatedAt']
				},

				include: [
					{
						model: Tag,
						as: 'tags',
						attributes: ["name"],
					},
					{
						model: User,
						as: 'author',
						attributes: ['email'],
					}
				]
			}
			//console.log('orderBy', sortBy);
			// if (!sortBy) {
			// 	query.order = [
			// 		fn('RAND')
			// 	]
			// } else {
			// 	query.order = [
			// 		sort === 'DESC' ? [sortBy, 'DESC'] : [sortBy]
			// 	]
			// }

			if (tagId) {
				//console.log('idTag: ',tagId)
				query.include[0] = {
					...query.include[0],
					where: {
						id: tagId,
					},
				}
			}

			let questions = await Question.findAll(query);
			//let {count,rows} = await Question.findAndCountAll(query)
			//let count = await Question.count(query)
			const count = questions.length;
			//console.log('count: ', count)
			//console.log('length: ', rows.length)
			const totalPages = Math.ceil(count / limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page <= 0 ? 1 : page

			query.offset = (page - 1) * limitDocsPerPage
			query.limit = limitDocsPerPage

			//let questions = await Question.findAll(query)
			questions = questions.slice((page - 1) * limitDocsPerPage, (page - 1) * limitDocsPerPage + limitDocsPerPage)

			questions = await Promise.all(questions.map(async question => {
				const submissionsCount = await Submission.count({
					where: {
						question_id: question.id
					},

				})
				const submissionsCorrectsCount = await Submission.count({
					where: {
						question_id: question.id,
						hitPercentage: 100
					},

				})
				const mySubmissionsCount = await Submission.count({
					where: {
						user_id: req.userId,
						question_id: question.id,
					},
				})
				const mySubmissionsCorrectCount = await Submission.count({
					where: {
						user_id: req.userId,
						question_id: question.id,
						hitPercentage: 100
					},
				})

				const accessCount = await Access.count({
					where: {
						question_id: question.id
					},
				})

				const questionWithSubmissions = JSON.parse(JSON.stringify(question))
				questionWithSubmissions.tags = questionWithSubmissions.tags.map(tag => tag.name)
				questionWithSubmissions.submissionsCount = submissionsCount
				questionWithSubmissions.submissionsCorrectsCount = submissionsCorrectsCount
				questionWithSubmissions.accessCount = accessCount

				questionWithSubmissions.isCorrect = mySubmissionsCorrectCount > 0
				questionWithSubmissions.wasTried = mySubmissionsCount > 0
				return questionWithSubmissions
			}))
			const questionsPaginate = {
				docs: questions,
				currentPage: page,
				perPage: parseInt(limitDocsPerPage),
				total: parseInt(count),
				totalPages: parseInt(totalPages)
			}
			const end = Date.now();
			return res.status(200).json(questionsPaginate);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async show(req, res) {
		const { idList, idTest, idClass, draft, difficulty } = req.query
		const idQuestion = req.params.id
		const excludeFieldes = req.query.exclude ? req.query.exclude.split(' ') : [];
		try {
			let questionDraftPromise = "";
			let userDifficultyPromise = "";
			const questionPromise = Question.findOne({
				where: {
					id: idQuestion
				},
				attributes: { exclude: excludeFieldes },
				include: [{
					model: Tag,
					as: 'tags'
				}, {
					model: User,
					as: 'author',
					attributes: ["id", "email"]
				}]
			})
			if (draft && draft === "yes") {
				questionDraftPromise = Draft.findOne({
					where: {
						user_id: req.userId,
						question_id: idQuestion,
						class_id: idClass || null,
						listQuestions_id: idList || null,
						test_id: idTest || null
					},
					attributes: ['answer', 'char_change_number']
				})
			}
			if (difficulty && difficulty === "yes") {
				userDifficultyPromise = Difficulty.findOne({
					where: {
						user_id: req.userId,
						question_id: idQuestion
					}
				})
			}

			const lastSubmissionPromise = Submission.findOne({
				where: {
					user_id: req.userId,
					question_id: idQuestion,
					class_id: idClass || null,
					listQuestions_id: idList || null,
					test_id: idTest || null
				},
				attributes: ['timeConsuming', 'createdAt'],
				order: [
					['createdAt', 'DESC']
				],
			})

			const accessCountPromise = Access.count({
				where:{
					question_id: idQuestion
				}
				
			})
		
			const submissionsCountPromise = Submission.count({
				where: {
					question_id: idQuestion
				},

			})
			const submissionsCorrectsCountPromise = Submission.count({
				where: {
					question_id: idQuestion,
					hitPercentage: 100
				},
			})
			

			let [question, questionDraft, userDifficulty, lastSubmission, accessCount, submissionsCount, submissionsCorrectsCount] = await Promise.all([
				questionPromise,
				questionDraftPromise,
				userDifficultyPromise,
				lastSubmissionPromise,
				accessCountPromise,
				submissionsCountPromise,
				submissionsCorrectsCountPromise,

			])

			question = JSON.parse(JSON.stringify(question))
			question.userDifficulty = userDifficulty ? userDifficulty.difficulty || '' : ''
			question.questionDraft = questionDraft
			question.lastSubmission = lastSubmission
			question.accessCount = accessCount
			question.submissionsCount = submissionsCount
			question.submissionsCorrectsCount = submissionsCorrectsCount
			return res.status(200).json(question)
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async store(req, res) {

		try {
			const { title, description, results, difficulty, tags, status, katexDescription, solution } = req.body
			const code = crypto.randomBytes(5).toString('hex')
			const question = await Question.create({
				type: 'PROGRAMAÇÃO',
				title,
				description,
				results,
				code,
				status,
				difficulty,
				katexDescription,
				solution,
				author_id: req.userId
			})
			const bulkTags = await Promise.all([...tags].map(idTag => Tag.findByPk(idTag)))

			//console.log(bulkProfessores);
			if (bulkTags && bulkTags.length > 0) {
				await question.setTags(bulkTags)
			}
			return res.status(200).json(question)
		}
		catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
				const validationsErros = ([...err.errors].map(erro => {
					let erroType = {
						field: erro.path,
						msg: erro.message,

					}
					return erroType
				}));
				//console.log(validationsErros)
				return res.status(400).json(validationsErros)
			}
			else {
				console.log(err);
				return res.status(500).json(err)
			}
		}
	}
	async update(req, res) {
		try {
			const idQuestion = req.params.id
			const { title, description, results, difficulty, status, katexDescription, solution, tags } = req.body
			const question = await Question.findByPk(idQuestion);
			if (question.author_id !== req.userId) {
				//console.log("Sem permissão")
				return res.status(401).json({ msg: "Sem permissão" })
			}
			await question.update({
				title,
				description,
				results: results,
				status: status,
				difficulty,
				katexDescription,
				solution,
			})
			const bulkTags = await Promise.all([...tags].map(async idTag => Tag.findByPk(idTag)))
			if (bulkTags) {
				await question.setTags(bulkTags)
			}
			return res.status(200).json({ msg: 'ok' })
		}
		catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
				const validationsErros = ([...err.errors].map(erro => {
					let erroType = {
						field: erro.path,
						message: erro.message,
					}
					return erroType
				}));
				//console.log(validationsErros)
				return res.status(400).json(validationsErros)
			}
			else {
				console.log(err);
				return res.status(500).json(err)
			}
		}
	}
}
module.exports = new QuestionController