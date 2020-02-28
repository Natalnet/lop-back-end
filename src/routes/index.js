const fs = require('fs')
const path = require('path')

module.exports = app => {
    //lista todos os arquivos do diretório atual
    fs.readdirSync(__dirname) 
    	//filtrando rotas 
    	//removendo da lista de arquivos: 'index.js' e arquivos que começam  com '.'
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
        //ler todas as rotas
        .forEach(file => require(path.resolve(__dirname, file))(app));
}
