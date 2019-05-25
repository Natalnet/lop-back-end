const express = require('express');
const bodyParser = require('body-parser')
const PORT = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//repassando app garante mesma instancia do express
require('./app/controllers/index')(app); 

app.get('/', (req, res) => {
    res.send('<h1>Servidor Ativo</h1>')
})
app.listen(PORT,(req,res) => {
    console.log(`Ativo em localhost:${PORT}`)
})