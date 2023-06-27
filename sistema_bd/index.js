//https://www.youtube.com/watch?v=w0raNWk2ybg



const mysql = require('mysql');   //importar o pacote "mysql"
const express = require('express');
var app = express()
const bodyParser = require('body-parser');

const port = 3000
app.use(bodyParser.json());


const connection = mysql.createConnection({  //conexão com o banco de dados MySQL usando as informações apropriadas, como host, porta, nome do usuário, senha e nome do banco de dados
    host: 'localhost',
    user: 'root',
    password: '',
    database: "db"  //nome da base de dados.. create datebase
  });


connection.connect((error) => { //Abrindo uma conexão 
    if (error) {
      console.error(error.code);
      console.error(error.fatal);
    } else {
      console.log('\nConexão bem-sucedida ao banco de dados!');
    }
  });

  $query = 'SELECT * FROM tabelateste';  //onde esta 'tabelateste' tem que puxar o nome da TABELA criada pelo usuario...
  // $query = definir aqui se quer criar tabela, inserir dados... ;  
  //$queryCriarTabela = 'CREATE TABLE `db`.`tabelateste2` (`Produto` VARCHAR(100) NOT NULL , UNIQUE (`Produto`)) ENGINE = InnoDB;';
//$queryCriarTabela = 'CREATE TABLE `db`.`tabelateste2` (`inputName` inputType(inputValue) NOT NULL , inputIndex (`inputName`)) ENGINE = InnoDB;';

  //mostra o resultado da consulta
  connection.query($query, (error, results) => {
    if (error) {
      console.error('Erro ao executar a consulta: ', error);  //caso surgir erro para consultar os dados
    } else {
      console.log('\nResultado: ', results);  //se for sucesso, mostra os resultados..
    }
  });
  
  connection.end(function() {  //finalizar conexao com a base de dados...
    console.log("\nFunção finalizada!");
  })
  
  // iniciar o servidor
  app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`)
  })

