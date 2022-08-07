const crypto = require('crypto');
const { Op, fn } = require('sequelize')
const path = require('path')
const sequelize = require('../../database/connection')
const { Question, Tag, User, SubmissionStats, Access  } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class DiscursiveQuestionController {
	async getInfoDiscursiveQuestion(req, res) {
		const { id } = req.params;
		try {
			if (req.userProfile !== 'PROFESSOR') {
				return res.status(401).json({ msg: "Sem permissão" })
			}
			let discursiveQuestion = await Question.findByPk(id,{
				attributes: ['id', 'title', 'code','description', 'status', 'difficulty', 'createdAt'],
				include: [
					{
						model: Tag,
						as: 'tags',
					},
					{
						model: User,
						as: 'author',
						attributes: ['email'],
					}
				]
			})
			discursiveQuestion = JSON.parse(JSON.stringify(discursiveQuestion))// copy
			discursiveQuestion.tags.forEach(tag => delete tag.discursiveQuestionHasTag);
			
			return res.status(200).json(discursiveQuestion);
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

    async createDiscursiveQuestion(req, res) {
		const { title, description, status, difficulty, tags } = req.body;
		try {
			if (req.userProfile !== 'PROFESSOR') {
				return res.status(401).json({ msg: "Sem permissão" })
			}
			const code = crypto.randomBytes(5).toString('hex');
			const discursiveQuestion = await Question.create({
				type: 'DISCURSIVE',
				title,
				description,
				code,
				status,
				difficulty,
				author_id: req.userId
			});
			const bulkTags = await Promise.all([...tags].map(idTag => Tag.findByPk(idTag)))

			//console.log(bulkProfessores);
			if (bulkTags && bulkTags.length > 0) {
				await discursiveQuestion.setTags(bulkTags);
			}
			return res.status(200).json({ msg: 'ok' });
		}
		catch (err) {
			console.log(err);
			if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
				return res.status(400).json({ msg: 'erro de validação' });
			}
			else {
				console.log(err);
				return res.status(500).json(err);
			}
		}
	}
	
	async updateDiscursiveQuestion(req, res) {
		const { id } = req.params;
		const { title, description, status, difficulty, tags } = req.body;
		try {
			const discursiveQuestion = await Question.findByPk(id);
			if (discursiveQuestion.author_id !== req.userId) {
                return res.status(401).json({ msg: "Sem permissão" })
            }
			await discursiveQuestion.update({
				title,
				description,
				status,
				difficulty,
			});
			const bulkTags = await Promise.all([...tags].map(idTag => Tag.findByPk(idTag)))

			//console.log(bulkProfessores);
			if (bulkTags && bulkTags.length > 0) {
				await discursiveQuestion.setTags(bulkTags);
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

	async getDiscursiveQuestionsPagined(req, res) {
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
					},
					type: 'DISCURSIVE'
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

			let discursiveQuestion = await Question.findAll(query);
			const count = discursiveQuestion.length;
			const totalPages = Math.ceil(count / limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page <= 0 ? 1 : page

			query.offset = (page - 1) * limitDocsPerPage
			query.limit = limitDocsPerPage

			discursiveQuestion = discursiveQuestion.slice((page - 1) * limitDocsPerPage, (page - 1) * limitDocsPerPage + limitDocsPerPage)

			discursiveQuestion = await Promise.all(discursiveQuestion.map(async question => {
				const submissionsCount = await SubmissionStats.count({
					where: {
						question_id: question.id
					},

				})
				const submissionsCorrectsCount = await SubmissionStats.count({
					where: {
						question_id: question.id,
						hitPercentage: 100
					},

				})
				const mySubmissionsCount = await SubmissionStats.count({
					where: {
						user_id: req.userId,
						question_id: question.id,
					},
				})
				const mySubmissionsCorrectCount = await SubmissionStats.count({
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
			const discursiveQuestionPaginate = {
				docs: discursiveQuestion,
				currentPage: page,
				perPage: parseInt(limitDocsPerPage),
				total: parseInt(count),
				totalPages: parseInt(totalPages)
			}
			const end = Date.now();
			return res.status(200).json(discursiveQuestionPaginate);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}
	}
}

module.exports = new DiscursiveQuestionController();