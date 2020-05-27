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
                    attributes:['id','title']
                }]
            })
            let [usersRows,test] = await Promise.all([usersRowsPromise, testPromise])
            users.rows = usersRows;
            // users.rows = users.rows.map(user=>{
			// 	return {
			// 		id:user.id,
			// 		name:user.name,
			// 		email:user.email,
			// 		enrollment:user.classes[0].classHasUser.enrollment
			// 	}
            // })
            //return res.json(test.questions)
            //console.log('length: ',test.questions.length)
            users.rows = await Promise.all(users.rows.map(async user=>{
                const infoSubmissions = await Promise.all(test.questions.map(async question=>{
                    // const submissionsCount = await Submission.count({
                    //     where:{
                    //         user_id: user.id,
                    //         question_id: question.id,
                    //         test_id: idTest,
                    //         class_id: idClass
                    //     }
                    // })
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
                    // const correctSubmissions = await Submission.count({
                    //     where:{
                    //         user_id: user.id,
                    //         question_id: question.id,
                    //         test_id: idTest,
                    //         class_id: idClass,
                    //         hitPercentage : 100
                    //     }
                    // })
                    const feedBackTest = await FeedBackTest.findOne({
                        where:{
                            user_id: user.id,
                            question_id: question.id,
                            test_id: idTest,
                            class_id: idClass,
                            //hitPercentage : 100
                        },
                        order:[
                            ['createdAt','DESC']
                        ],
                        attributes:['hitPercentage','createdAt']
                    })
                    // const feedBackTest = await FeedBackTest.count({
                    //     where:{
                    //         user_id: user.id,
                    //         question_id: question.id,
                    //         test_id: idTest,
                    //         class_id: idClass,
                    //         hitPercentage : 100
                    //     }
                    // })
                    
                    return {
                        hitPercentageSub:submission?submission.hitPercentage:0,
                        //correctSubmissions,
                        hitPercentageFeedBack:feedBackTest?feedBackTest.hitPercentage:null
                    };
                }))
                const userWithFeedBack = JSON.parse(JSON.stringify(user))
                const triedQuestions = infoSubmissions.filter(t=>t.submission).length;
                //const scoreSystem = infoSubmissions.filter(t=>t.correctSubmissions>0).length/test.questions.length
                const scoreSystem = infoSubmissions.reduce((total,h)=>total+h.hitPercentageSub,0)/test.questions.length
                const scoreTeacher = infoSubmissions.filter(h=>h.hitPercentageFeedBack===null).length > 0?
                    null
                    :
                    infoSubmissions.reduce((total,t)=>total+t.hitPercentageFeedBack,0)/test.questions.length
                //const scoreTeacher= infoSubmissions.filter(t=>t.feedBackTest>0).length/test.questions.length
                //const feedBackTests = infoSubmissions.map(i=>i.feedBackTest?i.feedBackTest.hitPercentage:null)//infoSubmissions.filter(t=>t.correctSubmissions>0).length/test.questions.length
                return {
                    id: userWithFeedBack.id,
					name: userWithFeedBack.name,
					email: userWithFeedBack.email,
					enrollment: userWithFeedBack.classes[0].classHasUser.enrollment,
                    triedQuestions,
                    //scoreSystem: Number(scoreSystem.toFixed(2)),
                    scoreSystem: Number(scoreSystem.toFixed(2)),
                    scoreTeacher: scoreTeacher!==null?Number(scoreTeacher.toFixed(2)):null,
                    //feedBackTests,

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
            const test = await Test.findOne({
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
                questionCopy.lastSubmission = submission;
                questionCopy.feedBackTest = feedBackTest;
                delete questionCopy.testHasQuestion;
                return questionCopy;
            }))
            return res.status(200).json(questions);
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
            class_id
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
                    comments: comments || '',
                    compilation_error,
                    runtime_error,
                    presentation_error,
                    wrong_answer,
                    invalid_algorithm,
                    hitPercentage,
                    user_id,
                    test_id,
                    question_id,
                    class_id   
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
                    user_id,
                    test_id,
                    question_id,
                    class_id   
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