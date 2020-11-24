require('dotenv/config')
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const {PORT} = require('./config/env')
const app = express();
let server;

var PRIVATEKEY = process.env.PRIVATEKEY || '<local_da_chave>';
var FULLCHAIN = process.env.FULLCHAIN || '<local_da_chave>';
var CHAIN = process.env.CHAIN || '<local_da_chave>';

//if(process.env.NODE_ENV==='production'){
//    console.log('https in Production')
    const privateKey  = fs.readFileSync(PRIVATEKEY, 'utf8');
    const certificate = fs.readFileSync(FULLCHAIN, 'utf8');
    const chain = fs.readFileSync(CHAIN, 'utf8');
    const credentials = {key: privateKey, cert: certificate, ca: chain};
    server = require('https').createServer(credentials, app)
//}
//else{
//    server = require('http').Server(app)
//}

const io = require('socket.io')(server)

app.use(cors())
app.use(require('./sockets')(io))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Verifica a conexão com o banco de dados e cria as tabelas caso não foram criadas
require('./database/auto_migrate');

//importa rotas
require('./routes')(app);

server.listen(PORT,() => {
    console.log(`Listening in localhost:${PORT}`)
})
// var exec = require('child_process').exec;
// var child = exec('mysqldump -u root -p 3306 lop > dumpfilename.sql',err=>{
//     console.log('erro ao gerar backup\n');
//     console.log(err);
// });




