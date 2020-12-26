const crypto = require('crypto');
const { Op, fn } = require('sequelize')
const path = require('path')
const sequelize = require('../../database/connection')
const { ObjectiveQuestion, Tag, User } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class ObjectiveQuestionController {
	async getInfoObjectiveQuestion(req, res) {
		const { id } = req.params;
		try {
			if (req.userProfile !== 'PROFESSOR') {
				return res.status(401).json({ msg: "Sem permissão" })
			}
			const objectiveQuestion = await ObjectiveQuestion.findByPk(id,{

				attributes: ['id', 'title', 'code','description','alternatives', 'status', 'difficulty', 'createdAt'],
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
			})
			
			return res.status(200).json(objectiveQuestion);
		}
		catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
				return res.status(400).json({ msg: 'erro de validação' });
			}
			else {
				console.log(err);
				return res.status(500).json(err);
			}
		}
	}
	async createObjectveQuestion(req, res) {
		const { title, description, status, difficulty, alternatives, tags } = req.body;
		try {
			if (req.userProfile !== 'PROFESSOR') {
				return res.status(401).json({ msg: "Sem permissão" })
			}
			const code = crypto.randomBytes(5).toString('hex');
			const objectiveQuestions = await ObjectiveQuestion.create({
				title,
				description,
				code,
				status,
				difficulty,
				alternatives,
				author_id: req.userId
			});
			const bulkTags = await Promise.all([...tags].map(idTag => Tag.findByPk(idTag)))

			//console.log(bulkProfessores);
			if (bulkTags && bulkTags.length > 0) {
				await objectiveQuestions.setTags(bulkTags);
			}
			return res.status(200).json({ msg: 'ok' });
		}
		catch (err) {
			if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
				return res.status(400).json({ msg: 'erro de validação' });
			}
			else {
				console.log(err);
				return res.status(500).json(err);
			}
		}
	}

	async getObjectiveQuestionsPagined(req, res) {
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
					[Op.or]: {
						title: {
							[Op.like]: `%${titleOrCode}%`
						},
						code: {
							[Op.eq]: titleOrCode
						},
					},
					status: {
						[Op.in]: status.split(' ')
					}
				},
				order: [
					sort === 'DESC' ? [sortBy, 'DESC'] : [sortBy]
				],
				attributes: ['id', 'title', 'code', 'status', 'difficulty', 'createdAt'],
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
			if (tagId) {
				//console.log('idTag: ',tagId)
				query.include[0] = {
					...query.include[0],
					where: {
						id: tagId,
					},
				}
			}

			let objectiveQuestion = await ObjectiveQuestion.findAll(query);
			const count = objectiveQuestion.length;
			const totalPages = Math.ceil(count / limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page <= 0 ? 1 : page

			query.offset = (page - 1) * limitDocsPerPage
			query.limit = limitDocsPerPage

			objectiveQuestion = objectiveQuestion.slice((page - 1) * limitDocsPerPage, (page - 1) * limitDocsPerPage + limitDocsPerPage)

			// objectiveQuestion = await Promise.all(objectiveQuestion.map(async question => {
			// 	const submissionsCount = await Submission.count({
			// 		where: {
			// 			question_id: question.id
			// 		},

			// 	})
			// 	const submissionsCorrectsCount = await Submission.count({
			// 		where: {
			// 			question_id: question.id,
			// 			hitPercentage: 100
			// 		},

			// 	})
			// 	const mySubmissionsCount = await Submission.count({
			// 		where: {
			// 			user_id: req.userId,
			// 			question_id: question.id,
			// 		},
			// 	})
			// 	const mySubmissionsCorrectCount = await Submission.count({
			// 		where: {
			// 			user_id: req.userId,
			// 			question_id: question.id,
			// 			hitPercentage: 100
			// 		},
			// 	})

			// 	const accessCount = await Access.count({
			// 		where: {
			// 			question_id: question.id
			// 		},
			// 	})

			// 	const questionWithSubmissions = JSON.parse(JSON.stringify(question))
			// 	questionWithSubmissions.tags = questionWithSubmissions.tags.map(tag => tag.name)
			// 	questionWithSubmissions.submissionsCount = submissionsCount
			// 	questionWithSubmissions.submissionsCorrectsCount = submissionsCorrectsCount
			// 	questionWithSubmissions.accessCount = accessCount

			// 	questionWithSubmissions.isCorrect = mySubmissionsCorrectCount > 0
			// 	questionWithSubmissions.wasTried = mySubmissionsCount > 0
			// 	return questionWithSubmissions
			// }))
			const objectiveQuestionPaginate = {
				docs: objectiveQuestion,
				currentPage: page,
				perPage: parseInt(limitDocsPerPage),
				total: parseInt(count),
				totalPages: parseInt(totalPages)
			}
			const end = Date.now();
			return res.status(200).json(objectiveQuestionPaginate);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
}

module.exports = new ObjectiveQuestionController();