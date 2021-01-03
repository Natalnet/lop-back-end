const path = require('path')
const sequelize = require('../../database/connection')
const {FeedBackTest,User,Class,Test, Submission, Question} = sequelize.import(path.resolve(__dirname,'..','models'))

class FeedBackTestController{
	async index_paginate(req,res){
		const limitDocsPerPage= parseInt(req.query.docsPerPage || 15);
        const idClass = req.query.idClass;
        const idTest = req.query.idTest;
        
		let page = parseInt(req.params.page || 1);
		try{
			const users = {}
			const query = {
				where:{
					profile:"ALUNO"
				},
				order:[
					['name']
                ],
                //attributes:['id','name','email'],
                include : {
                    model:Class,
                    as:'classes',
                    where:{
                        id:idClass
                    }
                }
			}
			users.count = await User.count(query)

			const totalPages = Math.ceil(users.count/limitDocsPerPage)
			page = parseInt(page > totalPages ? totalPages : page)
			page = page<=0?1:page

			query.limit = limitDocsPerPage
			query.offset = (page-1)*limitDocsPerPage

            const usersRowsPromise = User.findAll(query)
            const testPromise = Test.findOne({
                where:{
                    id:idTest
                },
                order:[
					['questions','createdAt']
				],
                attributes:['id'],
                include:[{
                    model:Question,
					as:'questions',
                    attributes:['id','title'],
                    where: {
                        type: 'PROGRAMAÇÃO'
                    }
                }]
            })
            let [usersRows,test] = await Promise.all([usersRowsPromise, testPromise])
            users.rows = usersRows;

            users.rows = await Promise.all(users.rows.map(async user=>{
                const infoSubmissionsAndFeedBacks = await Promise.all(test.questions.map(async question=>{
                    //pega a última submissão na prova
                    const submission = await Submission.findOne({
                        where:{
                            user_id: user.id,
                            question_id: question.id,
                            test_id: idTest,
                            class_id: idClass
                        },
                        order:[
                            ['createdAt','DESC']
                        ],
                        attributes:['hitPercentage','createdAt']
                    })
                    const feedBackTest = await FeedBackTest.findOne({
                        where:{
                            user_id: user.id,
                            question_id: question.id,
                            test_id: idTest,
                            class_id: idClass,
                        },
                        order:[
                            ['createdAt','DESC']
                        ],
                        attributes:['isEditedByTeacher','hitPercentage','createdAt']
                    })
                    
                    return {
                        tried: submission || null,
                        hitPercentageSub:submission?submission.hitPercentage:0,
                        hitPercentageFeedBack:feedBackTest?feedBackTest.hitPercentage:0,
                        isEdited:feedBackTest?feedBackTest.isEditedByTeacher:false
                    };
                }))
                const userWithFeedBack = JSON.parse(JSON.stringify(user))
                const triedQuestions = infoSubmissionsAndFeedBacks.filter(t=>t.tried).length;
                const scoreSystem = infoSubmissionsAndFeedBacks.reduce((total,h)=>total+h.hitPercentageSub,0)/test.questions.length
                const scoreTeacher = infoSubmissionsAndFeedBacks.reduce((total,h)=>total+h.hitPercentageFeedBack,0)/test.questions.length
                const isEditedByTeacher = infoSubmissionsAndFeedBacks.filter(sub=>sub.isEdited).length > 0
                return {
                    id: userWithFeedBack.id,
					name: userWithFeedBack.name,
					email: userWithFeedBack.email,
					enrollment: userWithFeedBack.classes[0].classHasUser.enrollment,
                    triedQuestions,
                    scoreSystem: Number(scoreSystem.toFixed(2)),
                    scoreTeacher: scoreTeacher!==null?Number(scoreTeacher.toFixed(2)):null,
                    isEditedByTeacher
                }
            }))
		
			const usersPaginate = {         
                docs           : users.rows,
                totalQuestions : test.questions.length,
				currentPage    : page,
				perPage        : parseInt(limitDocsPerPage),
				total          : parseInt(users.count),
				totalPages     : parseInt(totalPages)
			}
			return res.status(200).json(usersPaginate)
            //return res.json({mdg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
    }
    async show(req, res){
        const idClass = req.query.idClass;
        const idTest = req.query.idTest;
        const idUser = req.query.idUser;
        try{
            const testPromise = Test.findOne({
                where:{
                    id: idTest
                },
                order:[
					['questions','createdAt']
				],
                attributes:['id'],
                include:[{
                    model:Question,
                    as:'questions',
                    
                }]
            })
            const userPromise = User.findOne({
                where:{
                    id:idUser
                },
                attributes:['id','name']
            })
            const [test, user] = await Promise.all([testPromise,userPromise])

            const questions = await Promise.all(test.questions.map(async question=>{
                const submission = await Submission.findOne({
                    where: {
                        class_id: idClass,
                        test_id : idTest,
                        question_id: question.id,
                        user_id : idUser
                    },
                    order:[
                        ['createdAt','DESC']
                    ],
                })
                const feedBackTest = await FeedBackTest.findOne({
                    where: {
                        class_id: idClass,
                        test_id : idTest,
                        question_id: question.id,
                        user_id : idUser
                    },
                    order:[
                        ['createdAt','DESC']
                    ],
                })
                const questionCopy = JSON.parse(JSON.stringify(question));
                questionCopy.lastSubmission = submission?submission:{
                    class_id: idClass,
                    test_id : idTest,
                    question_id: question.id,
                    user_id : idUser,
                    hitPercentage: 0
                };
                questionCopy.feedBackTest = feedBackTest;
                delete questionCopy.testHasQuestion;
                return questionCopy;
            }))
            return res.status(200).json({questions,user});
        }
        catch(err){
			console.log(err);
			return res.status(500).json(err)
        }
    }
    async store(req, res){
        
        const {
            comments,
            compilation_error,
            runtime_error,
            presentation_error,
            wrong_answer,
            invalid_algorithm,
            hitPercentage,
            user_id,
            test_id,
            question_id,
            class_id,
        } = req.body
        try {
            const [feedBackTest, created] = await FeedBackTest.findOrCreate({
                where: {
                    user_id,
                    test_id,
                    question_id,
                    class_id  
                }, 
                defaults:{
                    user_id,
                    test_id,
                    question_id,
                    class_id,  
                    hitPercentage,
                    comments: comments || '',
                    compilation_error,
                    runtime_error,
                    presentation_error,
                    wrong_answer,
                    invalid_algorithm,
                    isEditedByTeacher: true
                }		
            })
            if(!created){
                await feedBackTest.update({
                    comments: comments || '',
                    compilation_error,
                    runtime_error,
                    presentation_error,
                    wrong_answer,
                    invalid_algorithm,
                    hitPercentage,
                    isEditedByTeacher: true
                })
            }
            return res.status(200).json(feedBackTest); 
            

        } 
        catch(err){
			console.log(err);
			return res.status(500).json(err)
        }
    }
}
module.exports = new FeedBackTestController();