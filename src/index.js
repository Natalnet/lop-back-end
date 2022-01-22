require('dotenv/config');
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
let server;

const PORT = process.env.PORT;
const PRIVATEKEY = process.env.PRIVATEKEY || '<local_da_chave>';
const FULLCHAIN = process.env.FULLCHAIN || '<local_da_chave>';
const CHAIN = process.env.CHAIN || '<local_da_chave>';
const NODE_ENV = process.env.NODE_ENV;
app.use(cors())

if(NODE_ENV === 'develop'){
    server = require('http').createServer(app)
}
else{
    const privateKey  = fs.readFileSync(PRIVATEKEY, 'utf8');
    const certificate = fs.readFileSync(FULLCHAIN, 'utf8');
    const chain = fs.readFileSync(CHAIN, 'utf8');
    const credentials = {key: privateKey, cert: certificate, ca: chain};
    server = require('https').createServer(credentials, app)
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Verifica a conexão com o banco de dados e cria as tabelas caso não foram criadas
require('./database/auto_migrate');

//importa rotas
require('./routes')(app);

server.listen(PORT,() => {
    console.log(`Listening in localhost:${PORT}`)
})
