const fs = require('fs');
const https = require('https');

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/api.lop.natalnet.br/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.lop.natalnet.br/fullchain.pem', 'utf8');
const chain = fs.readFileSync('/etc/letsencrypt/live/api.lop.natalnet.br/chain.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate, ca: chain};
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Verifica a conexão com o bacno de dados e cria as tabelas caso não foram criadas
require('./database/auto_migrate');

//importa rotas
require('./routes')(app);

const server = https.createServer(credentials, app);
const io = require('socket.io')(server)
app.use(require('./sockets')(io))

server.listen(3001,() => console.log('https on 3001'));

// var exec = require('child_process').exec;
// var child = exec('mysqldump -u root -p 3306 lop > dumpfilename.sql',err=>{
//     console.log('erro ao gerar backup\n');
//     console.log(err);
// });




