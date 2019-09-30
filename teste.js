const express = require('express')
const crypto = require('crypto');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//https://remotemysql.com/databases.php

// option1
const sequelize = new Sequelize('4tUg4WH3yX', '4tUg4WH3yX', 'GKasm01Bx5', {
  host: 'remotemysql.com',
  dialect: 'mysql'
})

// Option 2: Passing a connection URI
//const sequelize = new Sequelize('mysql://user:pass@example.com:5432/dbname');

sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});

// models
class User extends Sequelize.Model{}
User.init({
	id:{
		type:Sequelize.STRING(24),
		allowNull:false,
		primaryKey:{
			msg:'Já existe um usuário cadastrado com esse id'
		},
	},
	name:{
		type:Sequelize.STRING(50),
		allowNull:false,
	    set(name) {
	      this.setDataValue('name', name.trim());
	    },
		validate:{
			notNull:{
				msg:"Este campo é Obrigatório"
			},
		    isValidName(name) {
				const regexName = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;
			    if (!regexName.test(name)) throw new Error('Informe um nome válido');
		    }
		}
	},
	email:{
		type : Sequelize.STRING(50),
		allowNull : false, // default é true
	    set(email) {
	      this.setDataValue('email', email.toLowerCase().trim());
	    },
		unique:{
			msg:'Já existe um usuário cadastrado com esse email :('
		},
		validate:{
			isEmail:{
				msg:"Informe um email válido"
			},
			notNull:{
				msg:"Este campo é Obrigatório"
			}
		}
	},
},{
	modelName:'user',
	freezeTableName:true,
	sequelize,
})
//User.sync({force:true})
/*User.create({
	id:crypto.randomBytes(12).toString('hex'),
	name:'josé',
	email:"hewertoN90@gmail.com "
})
	.then(user=>{
		console.log('usuario criado');
		console.log(user);
	})
	.catch(err=>{
		console.log('-------------------erro-------------------');
		console.log(Object.getOwnPropertyDescriptors(err));
		console.log('------------------------------------------');
		console.log(err.errors);
		const listErro = {}
		if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
			const validationsErros = ([...err.errors].map(erro=>{
				let erroType = {
					fild:erro.path,
					message:erro.message,
					
				}
				return erroType
			}));
			console.log(validationsErros);
		}
	})*/
/*User.create({name:'josé',email:""})
	.then(user=>{
		console.log('usuario criado');
		console.log(user);
	})
	.catch(err=>{
		console.log(err);
	})*/
app.post('/teste',async (req,res)=>{
		const {name,email} = req.body
		try{
			const user = await User.create({
				id:crypto.randomBytes(12).toString('hex'),
				name,
				email
			})
			const users = await User.findAll()
			return res.status(200).json({user,users})
		}
		catch(err){
			if(err.name==='SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError'){
				const validationsErros = ([...err.errors].map(erro=>{
					let erroType = {
						fild:erro.path,
						message:erro.message,
						
					}
					return erroType
				}));
				console.log(validationsErros)
				return res.status(400).json(validationsErros)
			}
			else{
				console.log(err);
				return res.status(500).json('err')
			}
		}
})


app.listen(3001,()=>{
	console.log('listen on port 3001');
})