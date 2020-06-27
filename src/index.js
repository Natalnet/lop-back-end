require("dotenv/config")
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const {PORT} = require("./config/env");
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const errors = require('./utils/errors/errors')

//middlewares globais
app.use(cors())
app.use(require('./sockets')(io))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Verifica a conexão com o bacno de dados e cria as tabelas caso não foram criadas
require('./database/auto_migrate')

//importa rotas
require('./routes')(app);  

// handle to internal and business errors
app.use(errors.processErrors);

// handle to not found errors
app.use((req, res, next) => {
    res.status(404).json({
        message: `msg: Nenhuma rota encontrada para ${req.path}`
    });
});

server.listen(PORT,(req,res) => {
    console.log(`Ativo em localhost:${PORT}`)
})



