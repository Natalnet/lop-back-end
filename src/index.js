const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const {LISTEN_PORT} = require("./config/env");
const app = express();



//middlewares globais
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//importa rotas
require('./routes')(app);  

app.listen(LISTEN_PORT,(req,res) => {
    console.log(`Ativo em localhost:${LISTEN_PORT}`)
})