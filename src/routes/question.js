const route = require('express').Router()
const AuthMiddleware = require('../app/middlewares/authMiddleware')
const QuestionController = require('../app/controllers/questionController')
const QuestionMiddleware = require('../app/middlewares/questionMiddleware')
//Midllware de autenticação
route.use('/question',AuthMiddleware.authentication)

//--------------------------------obtem todas os exercícios--------------------------------
route.get('/question',QuestionController.index);
/*
-----------------------------------------------------------------------------------------------
*/


//----------------------------obtem todas os exercícios páginados-----------------------------
route.get('/question/page/:page',QuestionController.index_paginate)
/*
    recebe na query
    status -> estatus da questão, pode recerber os seguintes valores:
        PÚBLICA, PRIVADA ou PÚBICA PRIVADA. O padrão é PÚBLICA
    include -> conteudo do campo de busca. 
    field -> campo pelo qual deseja-se obter a busca, title ou code.
        O padrão é title
    sortBy -> campo pelo qual deseja-se ordenar os documentos (createdAt,title,difficulty)
        o padrão é createdAt
    sort -> padrão pelo qual deseja-se ordenar os documentos (ASC,DESC)
        o padrão é DESC
    tags -> array de tags no format json
        ex : ?tags=`JSON.parse(['operadores lógicos','matrizes','operadores relcionais'])`
    limitDocsPerPage -> número limites de dicumentos por página. O
        padrão é 15
    recebe no params (na rota) -> o numero da página. O padrão é 1
    
    retorno 
    um objeto com com as seguintes propriedades:
    currentPage -> o número da página atual
    perPage -> o número máximo de exercícios por página 
    total -> o total de questões em todas as páginas
    totalPages -> total de páginas  
    docs -> um array de exercícios referente ao número da página
----------------------------------------------------------------------------------------------------------
*/

//----------------------------obtem um exercício com o id enviado na rota-----------------------------
route.get('/question/:id',QuestionMiddleware.show, QuestionController.show);
/*
    recebe na query
    exclude -> campos do qual não queira que seja retornado (separados por espaço)
        ex: /question/:id?exclude=id solution
        no exemplo acima, aquestão reotnada virá sem os campos id e solution
        obs: nas telas de resolver exercício recomenda-se que envie solution em exclude
    idClass -> id da turma (Obridatório se o execício estiver sendo feio dentro de uma turma)
    idList -> id da lista (Obridatório se o execício estiver sendo feio dentro de uma lista e turma)
    idTest -> id da prova (Obridatório se o execício estiver sendo feio dentro de uma prova e turma)
    draft -> caso passe o valor 'yes', retornará o racunho referente aos ids (idClass,idList ou idTest)
        passados.
        obs: os rascunhs estão relacionados com turma, lista, prova, questão e usuário, por tanto é imporante
        que passe os ids (idClass,idList ou idTest) caso esteja dentro de uma turma. Caso esteja enviado a 
        requisição de um exercício geral (que não está dentro de uma turma,lista ou prova), não precisa passar
        os ids (idClass,idList ou idTest) referente ao reascunho, basta enviar draft=yes, que será retornado o rascunho
        cujo os ids (idClass,idList ou idTest) são null.
    difficulty ->  caso passe o valor yes, será retornado a dificudade que usuário cetou anteriormente
    
    retorno (relevante)
    um objeto com com as seguintes propriedades:
    title -> título do exercício
    description -> descrição do execício
    katexDescription -> descrição ltex do exercício
    difficulty -> dificudade da questão segundo quem a criou
    accessCount -> número de acessos que a questão teve
    submissionsCount -> número de submissões que a questão teve
    submissionsCorrectsCount -> número de submissões que a questão teve com 100% de acerto 
    tags -> um array com as tags da questão
    userDifficulty -> (caso tenha enviado na query difficulty=yes) uma string com a dificudade que
        usuário cetou anteriormente ('Muito fácil', 'Fácil', 'Médio', 'Difícil', 'Muito difícil')
    questionDraft -> (caso tenha enviado na query draft=yes) um objeto com as seguintes propriedades
        answer -> conteúdo  do rascunho que irá para o editor
        char_change_number -> número de variações de caractéres
----------------------------------------------------------------------------------------------------------
*/

route.post('/question/store',QuestionMiddleware.store,QuestionController.store);
route.put('/question/update/:id',QuestionMiddleware.update,QuestionController.update);


module.exports = (app) => app.use(route)
