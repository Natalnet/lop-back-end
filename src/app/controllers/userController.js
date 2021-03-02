const crypto = require('crypto');
const { Op } = require('sequelize')
const path = require('path')
const bcrypt = require('bcryptjs');

const sequelize = require('../../database/connection')
const { User, Class, ClassHasListQuestion, Submission } = sequelize.import(path.resolve(__dirname, '..', 'models'))

class UserController {
	// Get a paginated list of all Users
	async index(req, res) {
		const idClass = req.query.idClass || ""
		const profile = req.query.profile || ""
		const fields = req.query.fields ? req.query.fields.split(' ').map(f => f.trim()) : ['id', 'name', 'email', 'profile', 'createdAt', 'updatedAt']
		const solicitations = req.query.solicitations || ""
		try {
			const query = {
				where: {
					profile: {
						[Op.like]: `%${profile}%`
					}
				},
				attributes: fields
			}
			const include = []
			if (solicitations && solicitations === "yes") {
				query.include = [...include, {
					model: Class,
					as: "solicitedClasses",
					where: {
						id: idClass
					}
				}]
			}
			let users = await User.findAll(query)
			users = users.map(user => {
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					enrollment: solicitations && user.solicitedClasses[0].solicitationToClass.enrollment
				}
			})
			return res.status(200).json(users)
		}
		catch (err) {
			console.log(err);
			return res.status(200).json(err)
		}

	}

	async index_paginate(req, res) {
		const field = req.query.field || 'name'
		const includeString = req.query.include || ''
		const limitDocsPerPage = parseInt(req.query.docsPerPage || 15);
		const classes = req.query.classes
		const idClass = req.query.idClass
		let page = parseInt(req.params.page || 1);
		try {
			const users = {}
			const query = {
				where: {
					name: {
						[Op.like]: `%${field === 'name' ? includeString : ''}%`
					},
					email: {
						[Op.like]: `%${field === 'email' ? includeString : ''}%`
					},
				},
				order: [
					['profile', 'DESC'], ['name']
				],
				include: [{
					model: Class,
					as: 'classes',
					where: {
						id: idClass
					}
				}]
			}

			users.count = await User.count(query)

			const totalPages = Math.ceil(users.count / limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page <= 0 ? 1 : page

			query.limit = limitDocsPerPage
			query.offset = (page - 1) * limitDocsPerPage

			users.rows = await User.findAll(query)
			users.rows = users.rows.map(user => {
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					profile: user.profile,
					enrollment: user.classes[0].classHasUser.enrollment
				}
			})
			const usersPaginate = {
				docs: users.rows,
				currentPage: page,
				perPage: parseInt(limitDocsPerPage),
				total: parseInt(users.count),
				totalPages: parseInt(totalPages)
			}
			return res.status(200).json(usersPaginate)
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async getAllUsers(req, res) {
		const field = req.query.field || 'name'
		const includeString = req.query.include || ''
		const limitDocsPerPage = parseInt(req.query.docsPerPage || 15);
		let page = parseInt(req.params.page || 1);
		try {

			if (req.userProfile !== 'ADMINISTRADOR') {
				return res.status(401).json({ msg: 'Sem permissão' })
			}
			const users = {}
			const query = {
				where: {
					name: {
						[Op.like]: `%${field === 'name' ? includeString : ''}%`
					},
					email: {
						[Op.like]: `%${field === 'email' ? includeString : ''}%`
					},
				},
				order: [
					['name']
				],
			}

			users.count = await User.count(query)

			const totalPages = Math.ceil(users.count / limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page <= 0 ? 1 : page

			query.limit = limitDocsPerPage
			query.offset = (page - 1) * limitDocsPerPage

			users.rows = await User.findAll(query)
			users.rows = users.rows.map(user => {
				return {
					id: user.id,
					name: user.name,
					email: user.email,
					profile: user.profile,
				}
			})
			const usersPaginate = {
				docs: users.rows,
				currentPage: page,
				perPage: parseInt(limitDocsPerPage),
				total: parseInt(users.count),
				totalPages: parseInt(totalPages)
			}
			return res.status(200).json(usersPaginate)
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async getUser(req, res) {
		const { id } = req.params;
		try {
			const user = await User.findByPk(id, {
				attributes: ['id', 'name', 'email', 'profile', 'urlImage']
			})
			return res.status(200).json(user);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async getUserInfo(req, res) {

		try {
			const user = await User.findByPk(req.userId, {
				attributes: ['id', 'name', 'email', 'profile', 'urlImage']
			})
			return res.status(200).json(user);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async update(req, res) {
		const { id } = req.params
		try {
			const user = await User.findByPk(id)
			await user.setClasses(null);
			await user.update(req.body.user)
			return res.status(200).json(user)
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async updateInfo(req, res) {
		const { user: userData, editPassowrd } = req.body;
		try {
			const user = await User.findByPk(req.userId, {
				attributes: ['id', 'name', 'email', 'profile', 'urlImage','password']
			})
			const infoUser = {
				name: userData.name,
			};
			if(editPassowrd){
				if(!await bcrypt.compare(userData.currentPassword, user.password)){
					return res.status(400).json({message:'Senha incorreta'});
				}
				infoUser.password = await bcrypt.hash(userData.newPassword, 10);
			}
			await user.update(infoUser);
			return res.status(200).json(user);
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

	async getUsersByClass(req, res) {
		const { id } = req.params;
		try {
			const classRoon = await Class.findByPk(id);

			let users = await classRoon.getUsers({
				where: {
					profile: 'ALUNO'
				},
				attributes: ['id', 'name', 'email'],
				order: ['name']
			});
			users = users.map(user => {
				const userCopy = JSON.parse(JSON.stringify(user))
				userCopy.enrollment = userCopy.classHasUser.enrollment
				delete userCopy.classHasUser
				return userCopy;
			})
			return res.status(200).json(users);
		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}
	async getUsersWithLastSubmissionByQuestionByListByClass(req, res) {
		try {
			const { idList, idClass, idQuestion } = req.params;
			const classRoonPromise = Class.findByPk(idClass);

			const classHasListQuestionPromise = ClassHasListQuestion.findOne({
				where: {
					list_id: idList,
					class_id: idClass
				},
				attributes: ['createdAt', 'submissionDeadline']
			})

			let [classRoon, classHasListQuestion] = await Promise.all([classRoonPromise, classHasListQuestionPromise])
			let users = await classRoon.getUsers({
				where: {
					profile: 'ALUNO'
				},
				attributes: ['id', 'name', 'email'],
				order: ['name']
			});


			users = users.map(user => {
				const userCopy = JSON.parse(JSON.stringify(user))
				userCopy.enrollment = userCopy.classHasUser.enrollment
				delete userCopy.classHasUser
				return userCopy;
			})

			let submissionDeadline = classHasListQuestion.submissionDeadline
			submissionDeadline = submissionDeadline ? new Date(submissionDeadline) : null

			users = await Promise.all(users.map(async user => {
				const query = {
					where: {
						user_id: user.id,
						question_id: idQuestion,
						listQuestions_id: idList,
						class_id: idClass,
						hitPercentage: 100
					},
					order: [
						['createdAt', 'DESC']
					],
				}
				if (submissionDeadline) {
					query.where.createdAt = {
						[Op.lte]: submissionDeadline
					}
				}
				let lastSubmission = await Submission.findOne(query);
				if (!lastSubmission) {
					delete query.where.hitPercentage;
					lastSubmission = await Submission.findOne(query);
				}

				const userCopy = JSON.parse(JSON.stringify(user));
				return {
					...userCopy,
					lastSubmission
				}
			}))
			users = users.filter(user => user.lastSubmission);
			return res.status(200).json(users);

		}
		catch (err) {
			console.log(err);
			return res.status(500).json(err)
		}
	}


}

module.exports = new UserController();
