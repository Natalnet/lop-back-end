const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const {LISTEN_PORT} = require("./config/env");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)



io.on('connection',socket=>{
	socket.on('connectRoonRequestClass',idRoon=>{
		socket.join(idRoon)//adicionando o socket a uma sala com o id 'idRonn'
	})
	socket.on('connectRoonMyRequestsClass',idRoon=>{
		socket.join(idRoon)
	})
})
//middlewares globais
app.use(cors())
app.use((req,res,next)=>{
	req.io = io
	return next()
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//importa rotas
require('./routes')(app);  

server.listen(LISTEN_PORT,(req,res) => {
    console.log(`Ativo em localhost:${LISTEN_PORT}`)
})