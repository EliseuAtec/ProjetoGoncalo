const mysql = require('mysql');   //importar o pacote "mysql"

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
      console.log('Conexão bem-sucedida ao banco de dados!');
    }
  });

  $query = 'SELECT * FROM teste';  //onde esta teste tem que puxar o nome da TABELA criada pelo usuario...

  connection.query($query, (error, results) => {
    if (error) {
      console.error('Erro ao executar a consulta: ', error);  //caso surgir erro para consultar os dados
    } else {
      console.log('Executado com sucesso: ', results);  //se for sucesso, mostra os resultados..
    }
  });
  
  connection.end(function() {  //finalizar conexao com a base de dados...
    console.log("Conexão finalizada!");
  })
  