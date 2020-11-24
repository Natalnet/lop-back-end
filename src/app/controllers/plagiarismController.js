const MossClient = require('moss-node-client')
const { mkdirSync, existsSync, rmdirSync, writeFileSync, unlinkSync } = require('fs');
const { resolve, join } = require('path');
const { Op } = require('sequelize')
const sequelize = require('../../database/connection');
const { ListQuestions, Test, Question, Class, Submission, ClassHasListQuestion, ClassHasTest,Plagiarism } = sequelize.import(resolve(__dirname, '..', 'models'))

class PlagiarismController {
    async createUrlListPlagiarism(req, res) {

        const { idList, idClass, idQuestion, moss_language, language } = req.body;
        console.log({ moss_language, language });
        const classRoonPromise = Class.findByPk(idClass);
        const listPromise = ListQuestions.findOne({
            where: {
                id: idList
            },
            attributes: ['id', 'title'],
            order: [
                ['questions', 'createdAt']
            ],
            include: [{
                model: Question,
                as: 'questions',
                attributes: ['id', 'title', 'description', 'katexDescription']
            }],
        });
        const classHasListQuestionPromise = ClassHasListQuestion.findOne({
            where: {
                list_id: idList,
                class_id: idClass
            },
            attributes: ['createdAt', 'submissionDeadline']
        })
        let [classRoon, list, classHasListQuestion] = await Promise.all([classRoonPromise, listPromise, classHasListQuestionPromise])
        let users = await classRoon.getUsers({
            where: {
                profile: 'ALUNO'
            },
            attributes: ['id', 'name', 'email'],
            order: ['name']
        });

        list.questions = list.questions.map(question => {
            const questionCopy = JSON.parse(JSON.stringify(question))
            delete questionCopy.listHasQuestion
            return questionCopy;
        })

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

        try {
            if (users.length) {
                //const languages = classRoon.
                // Create a client and specify language and moss user id
                const client = new MossClient(moss_language, process.env.MOSS_KEY);
                let mossFilesDir = process.env.MOSS_FILES_DIR;
                let classPath;

                classPath = `${mossFilesDir}/${idList}-${idClass}-${idQuestion}`;


                /*
                if (process.env.NODE_ENV === 'production') {
                   
                }
                else {
                    classPath = resolve(__dirname, '..', '..', 'tmp', `${idList}-${idClass}-${idQuestion}`);
                }
                */
                !existsSync(classPath) && mkdirSync(classPath);

                for (const user of users) {
                    const name = user.name.split(' ').join('_');
                    const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");

                    const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                    try {
                        writeFileSync(filePath, user.lastSubmission.answer);
                        await client.addFile(filePath, `${name}(${enrollment})`);
                    }
                    catch (err) {
                        console.log('---------------arquivo não pôde ser criado--------------')
                        console.log(`${filePath}\n-->arquivo não pode ser criado\n`)
                        console.log(err);
                        console.log('--------------------------------------------------------')
                    }
                    // Add files to compare
                }
                // Call process(), a async/promise that returns the moss url
                client.process()
                    .then(async url => {
                        const plagiarism = await Plagiarism.create({
                            moss_url: url,
                            language,
                            question_id: idQuestion,
                            listQuestions_id: idList,
                            class_id: idClass,
                            createdAt: new Date()
                        })
                        if (existsSync(classPath)) {
                            for (const user of users) {
                                const name = user.name.split(' ').join('_');
                                const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                                const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                                existsSync(filePath) && unlinkSync(filePath);
                            }
                            rmdirSync(classPath, { recursive: true });
                        }
                        //console.log('url-> ',url);

                        // req.io.sockets.in(`${idList}-${idClass}-${idQuestion}`).emit('urlPlagiarism',{
                        //     moss_url: plagiarism.moss_url,
                        //     createdAt: plagiarism.createdAt,
                        //     err: false
                        // })
                    })
                    .catch(err => {
                        console.log('catch');
                        console.log(err);
                        if (existsSync(classPath)) {
                            for (const user of users) {
                                const name = user.name.split(' ').join('_');
                                const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                                const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                                existsSync(filePath) && unlinkSync(filePath);
                            }
                            rmdirSync(classPath, { recursive: true });
                        }                        // req.io.sockets.in(`${idList}-${idClass}-${idQuestion}`).emit('urlPlagiarism',{
                        //     url: null,
                        //     err: true
                        // })
                    })
                setTimeout(() => {
                    //console.log('deleted-->>');
                    if (existsSync(classPath)) {
                        for (const user of users) {
                            const name = user.name.split(' ').join('_');
                            const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                            const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                            existsSync(filePath) && unlinkSync(filePath);
                        }
                        rmdirSync(classPath, { recursive: true });
                    }
                }, 1000 * 60 * 20);// 20 min
                return res.status(200).json({ msg: "Em alguns minutos o link estará pronto!" });
                // try{
                // 	const url = await client.process();
                //     existsSync(classPath) && rmdirSync(classPath, {recursive: true});
                //     return res.status(200).json({url});
                // }
                // catch(err){
                // 	console.log('catch');
                // 	console.log(err);
                // 	existsSync(classPath) && rmdirSync(classPath, {recursive: true});
                //     return res.status(500).json({err});
                // }
            }
            else {
                return res.status(200).json({ msg: 'Ainda não há submissões para essa questão' });
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }

    async findAllListPlagiarism(req, res) {
        const { idList, idClass, idQuestion } = req.query
        try {
            const plagiarisms = await Plagiarism.findAll({
                where: {
                    question_id: idQuestion,
                    listQuestions_id: idList,
                    class_id: idClass
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            })
            return res.status(200).json(plagiarisms);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }

    async createUrlTestPlagiarism(req, res) {
        const { idTest, idClass, idQuestion, moss_language, language } = req.body;
        try {
            //console.log({ id, idClass, idQuestion})
            const classRoonPromise = Class.findByPk(idClass);
            const testPromise = Test.findOne({
                where: {
                    id: idTest
                },
                attributes: ['id', 'title'],
                order: [
                    ['questions', 'createdAt']
                ],
                include: [{
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'title', 'description', 'katexDescription']
                }],
            });
            const classHasTestQuestionPromise = ClassHasTest.findOne({
                where: {
                    test_id: idTest,
                    class_id: idClass
                },
                attributes: ['createdAt']
            })
            let [classRoon, test, classHasListQuestion] = await Promise.all([classRoonPromise, testPromise, classHasTestQuestionPromise])
            let users = await classRoon.getUsers({
                where: {
                    profile: 'ALUNO'
                },
                attributes: ['id', 'name', 'email'],
                order: ['name']
            });


            test.questions = test.questions.map(question => {
                const questionCopy = JSON.parse(JSON.stringify(question))
                delete questionCopy.testHasQuestion
                return questionCopy;
            })

            users = users.map(user => {
                const userCopy = JSON.parse(JSON.stringify(user))
                userCopy.enrollment = userCopy.classHasUser.enrollment
                delete userCopy.classHasUser
                return userCopy;
            })

            users = await Promise.all(users.map(async user => {
                const query = {
                    where: {
                        user_id: user.id,
                        question_id: idQuestion,
                        test_id: idTest,
                        class_id: idClass,
                        hitPercentage: 100
                    },
                    order: [
                        ['createdAt', 'DESC']
                    ],
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
            try {
                if (users.length) {
                    //const languages = classRoon.
                    // Create a client and specify language and moss user id
                    const client = new MossClient(moss_language, process.env.MOSS_KEY);
                    let mossFilesDir = process.env.MOSS_FILES_DIR;
                    let classPath;

                    classPath = `${mossFilesDir}/${idTest}-${idClass}-${idQuestion}`;

                    /*
                    if (process.env.NODE_ENV === 'production') {
                        classPath = `/tmp/${idTest}-${idClass}-${idQuestion}`;
                    }
                    else {
                        classPath = resolve(__dirname, '..', '..', 'tmp', `${idTest}-${idClass}-${idQuestion}`);
                    }
                    */
                    !existsSync(classPath) && mkdirSync(classPath);

                    for (const user of users) {
                        const name = user.name.split(' ').join('_');
                        const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");

                        const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                        try {
                            writeFileSync(filePath, user.lastSubmission.answer);
                            await client.addFile(filePath, `${name}(${enrollment})`);
                        }
                        catch (err) {
                            console.log('---------------arquivo não pôde ser criado--------------')
                            console.log(`${filePath}\n-->arquivo não pode ser criado\n`)
                            console.log(err);
                            console.log('--------------------------------------------------------')
                        }
                        // Add files to compare
                    }
                    // Call process(), a async/promise that returns the moss url
                    client.process()
                        .then(async url => {
                            const plagiarism = await Plagiarism.create({
                                moss_url: url,
                                language,
                                question_id: idQuestion,
                                test_id: idTest,
                                class_id: idClass,
                                createdAt: new Date()
                            })
                            if (existsSync(classPath)) {
                                for (const user of users) {
                                    const name = user.name.split(' ').join('_');
                                    const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                                    const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                                    existsSync(filePath) && unlinkSync(filePath);
                                }
                                rmdirSync(classPath, { recursive: true });
                            }
                            //console.log('url-> ',url);

                            // req.io.sockets.in(`${idTest}-${idClass}-${idQuestion}`).emit('urlPlagiarism',{
                            //     moss_url: plagiarism.moss_url,
                            //     createdAt: plagiarism.createdAt,
                            //     err: false
                            // })
                        })
                        .catch(err => {
                            console.log('catch');
                            console.log(err);
                            if (existsSync(classPath)) {
                                for (const user of users) {
                                    const name = user.name.split(' ').join('_');
                                    const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                                    const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                                    existsSync(filePath) && unlinkSync(filePath);
                                }
                                rmdirSync(classPath, { recursive: true });
                            }                        // req.io.sockets.in(`${idTest}-${idClass}-${idQuestion}`).emit('urlPlagiarism',{
                            //     url: null,
                            //     err: true
                            // })
                        })
                    setTimeout(() => {
                        //console.log('deleted-->>');
                        if (existsSync(classPath)) {
                            for (const user of users) {
                                const name = user.name.split(' ').join('_');
                                const enrollment = user.enrollment.replace(/[^a-z0-9]/gi, "");
                                const filePath = join(classPath, `${name}-${enrollment}.cpp`);
                                existsSync(filePath) && unlinkSync(filePath);
                            }
                            rmdirSync(classPath, { recursive: true });
                        }
                    }, 1000 * 60 * 20);// 20 min
                    return res.status(200).json({ msg: "Em alguns minutos o link estará pronto!" });
                    // try{
                    // 	const url = await client.process();
                    //     existsSync(classPath) && rmdirSync(classPath, {recursive: true});
                    //     return res.status(200).json({url});
                    // }
                    // catch(err){
                    // 	console.log('catch');
                    // 	console.log(err);
                    // 	existsSync(classPath) && rmdirSync(classPath, {recursive: true});
                    //     return res.status(500).json({err});
                    // }
                }
                else {
                    return res.status(200).json({ msg: 'Ainda não há submissões para essa questão' });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            return res.status(200).json({ users, test });

        }
        catch (err) {
            console.log(err)
            return res.status(500).json(err)
        }
    }
    async findAllTestPlagiarism(req, res) {
        const { idTest, idClass, idQuestion } = req.query
        try {
            const plagiarisms = await Plagiarism.findAll({
                where: {
                    question_id: idQuestion,
                    test_id: idTest,
                    class_id: idClass
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            })
            return res.status(200).json(plagiarisms);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    }
}
module.exports = new PlagiarismController();