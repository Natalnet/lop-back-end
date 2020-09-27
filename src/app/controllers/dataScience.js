
const path = require('path')
const {Op} = require('sequelize')

const sequelize = require('../../database/connection')
const {Submission,Question,ClassHasListQuestion,Class, User} = sequelize.import(path.resolve(__dirname,'..','models'))

class CSVController{
    async getCsvListClass(req,res){
		const {idClass} = req.params;
		try{
			const classRoon = await Class.findByPk(idClass);
			let users = await classRoon.getUsers({
				where:{
					profile: 'ALUNO',
				},
				order:['name'],
				attributes: ['id','name','email'],
				
			});
			let lists = await classRoon.getLists({
				attributes:['id','title'],
				order:[
					['questions','createdAt']
				],
				include:[{
					model:Question,
					as:'questions',
					attributes:['id']
				}],
			});
			users = users.map(user=>{
				const userCopy = JSON.parse(JSON.stringify(user));
				userCopy.enrollment = userCopy.classHasUser.enrollment;
				delete userCopy.classHasUser;
				return userCopy;
			})
			users = await Promise.all(users.map(async user => {
				lists = await Promise.all(lists.map(async list => {
					const classHasListQuestion =  await ClassHasListQuestion.findOne({
						where:{
							list_id : list.id,
							class_id: idClass
						},
						attributes:['createdAt','submissionDeadline']
					})
					let submissionDeadline = classHasListQuestion.submissionDeadline
					submissionDeadline = submissionDeadline?new Date(submissionDeadline):null;
					const questions = await Promise.all(list.questions.map(async question=>{
						const query = {
							where:{
								user_id     : user.id,
								question_id : question.id,
								listQuestions_id : list.id,
								class_id         : idClass
							}
						}
		
						const submissionsCount = await Submission.count(query)
						query.where.hitPercentage = 100
						const correctSumissionsCount  = await Submission.count(query)
						if(submissionDeadline){
							query.where.createdAt = {
								[Op.lte] : submissionDeadline
							}
						}
						const completedSumissionsCount = await Submission.count(query)
						const questionCopy = JSON.parse(JSON.stringify(question))
						delete questionCopy.listHasQuestion
						questionCopy.completedSumissionsCount = completedSumissionsCount
						questionCopy.submissionsCount = submissionsCount
						questionCopy.isCorrect = correctSumissionsCount>0
						return questionCopy
					}))
					const listCopy = JSON.parse(JSON.stringify(list))
			
					listCopy.questionsCount = questions.length
					listCopy.questionsCompletedSumissionsCount = questions.filter(q=>q.completedSumissionsCount>0).length
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
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
    }	
    
    async getCsvSubmissionClass(req,res){
        const { idClass } = req.params;
		try{
			let submissions =  await Submission.findAll({
				where:{
                    class_id : idClass
                },
				order: [
					['createdAt','DESC']
                ],
                attributes: ['id','ip','environment','language','char_change_number','timeConsuming','createdAt','listQuestions_id','test_id','question_id'],
				include:[{
					model:User,
					as:'user',
					where:{
						profile:"ALUNO",
					},
                    attributes:['id','name','email'],
                    include: [{
                        model: Class,
                        as: 'classes',
                        where: {
                            id: idClass
                        },
                        attributes: ['id']
                    }]
				}]
            })
            submissions = submissions.map(submission => {
                const sucmissionCopy = JSON.parse(JSON.stringify(submission))
                sucmissionCopy.user.enrollment = submission.user.classes[0].classHasUser.enrollment;
                delete sucmissionCopy.user.classes
                return sucmissionCopy
            })
			
			return res.status(200).json(submissions);
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}
}
module.exports = new CSVController();