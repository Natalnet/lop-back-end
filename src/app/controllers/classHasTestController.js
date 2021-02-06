const path = require('path')
const sequelize = require('../../database/connection')
const {Test,Question,ClassHasTest,Submission} = sequelize.import(path.resolve(__dirname,'..','models'))

class ClassHasTestController{
	async store(req,res){
		const {idClass,idTest, password, showAllTestCases} = req.body
		//console.log('showAllTestsCase', showAllTestCases)
		try{		
			const classHasTest = await ClassHasTest.create({
				test_id : idTest,
				class_id : idClass,
				password,
				showAllTestCases: showAllTestCases || false,
				createdAt : new Date()
			}).then(async classHasTestCopy=>{
		
				let test = await Test.findOne({
					where:{
						id:idTest
					},
					include:[{
						model:Question,
						as:'questions',
					}],
				})
				
				const questions = test.questions.map(question=>{
                    const questionCopy = JSON.parse(JSON.stringify(question))
					questionCopy.submissionsCount = 0
					questionCopy.completedSumissionsCount = 0
						
					return questionCopy
				})
				test = JSON.parse(JSON.stringify(test))
				test.questions = questions
				test.classHasTest = classHasTestCopy
				req.io.sockets.in(idClass).emit('addTestToClass',test)

			})
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err);
			return res.status(500).json(err)
		}
	}

	async updateStatus(req,res){
		const idTest = req.params.id
		const {status} = req.body
		const {idClass} = req.query
		try{
			const classHasTest = await ClassHasTest.findOne({
				where:{
					test_id: idTest,
					class_id: idClass
				}
			})
			await classHasTest.update({
				status,
			})
			req.io.sockets.in(idClass).emit('changeStatusTest',{status,idTest})
			return res.status(200).json({msg:"ok"})
		}
		catch(err){
			console.log('erro ao atualizar status da prova')
			console.log(err)
			return res.status(500).json(err);
		}
	}

	async updateCorrecao(req,res){
		const idTest = req.params.id
		const {correcao} = req.body
		const {idClass} = req.query
		try{
			const classHasTest = await ClassHasTest.findOne({
				where:{
					test_id: idTest,
					class_id: idClass
				}
			})
			await classHasTest.update({
				correcao,
			})
			//req.io.sockets.in(idClass).emit('changeStatusTest',{status,idTest})
			return res.status(200).json({msg:"ok"})
		}
		catch(err){
			console.log('erro ao atualizar status da prova')
			console.log(err)
			return res.status(500).json(err);
		}
	}
	async update(req,res){
		const idTest = req.params.id
		const {password, showAllTestCases} = req.body
		const {idClass} = req.query
		try{
			const classHasTest = await ClassHasTest.findOne({
				where:{
					test_id: idTest,
					class_id: idClass
				}
			})
			await classHasTest.update({
				password,
				showAllTestCases: showAllTestCases || false			
			})
			//req.io.sockets.in(idClass).emit('changeStatusTest',{status,idTest})
			return res.status(200).json({msg:"ok"})
		}
		catch(err){
			console.log('erro ao atualizar status da prova')
			console.log(err)
			return res.status(500).json(err);
		}
	}

	async delete(req,res){
        const idClass = req.query.idClass
        const idTest = req.params.id
		try{
			const classHasTest = await ClassHasTest.findOne({
				where:{
					test_id  : idTest,
					class_id : idClass
				}
			})

			await classHasTest.destroy({ force: true }).then(async ()=>{

				const test = await Test.findByPk(idTest)
				await test.update({
					status:"FECHADA"
				})
				req.io.sockets.in(idClass).emit('removeTestFromClass',test)
			})
			
			return res.status(200).json({msg:'ok'})
		}
		catch(err){
			console.log(err)
			return res.status(500).json(err)
		}
    }
}

module.exports =  new ClassHasTestController()