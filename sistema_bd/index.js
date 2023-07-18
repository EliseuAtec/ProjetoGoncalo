const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db',
});

// conectando ao banco de dados
connection.connect((error) => {
 
  if (error) {
    console.error('Ocorreu um erro ao conectar ao BD:', error);
    return;
  }
  console.log('Conectado com sucesso ao banco de dados!');
});

// Criando a tabela
app.post('/create-table', (req, res) => {
  const { tableName, query } = req.body;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Ocorreu um erro ao criar a tabela:', error);
      res.status(500).send('Ocorreu um erro ao criar a tabela.');
      return;
    }
   
    console.log(`Tabela ${tableName} criada com sucesso!`);
    res.json({ message: `Tabela ${tableName} criada com sucesso!` });
  });
});

// rota para obter os nomes das tabelas e os campos
app.get('/get-tables', function (req, res) {
  // executa a consulta para mostrar todas as tabelas
  connection.query('SHOW TABLES', async function (error, results, fields) {
   
    if (error) {
      console.error('Ocorreu um erro ao obter as tabelas:', error);
      res.status(500).send('Ocorreu um erro ao obter as tabelas.');
      return;
    }

    //mapeia os resultados para obter apenas os nomes das tabelas
    var tables = results.map(row => row[Object.keys(row)[0]]);

    // para cada tabela, cria uma nova promessa que irá obter os campos da tabela
    var promises = tables.map(tableName => {
      return new Promise((resolve, reject) => {
        // executa a consulta para obter a descrição da tabela (e os campos)
        connection.query(`DESCRIBE ${tableName}`, function (error, results, fields) {
          // Se ocorrer um erro, rejeite a promessa
          if (error) {
            reject(error);
          } else {
            // separa o nome, tipo e valor do campo
            var fields = results.map(row => {
              let field = row.Field;
              let [type, value] = row.Type.split('(');
              value = value ? value.replace(/\D/g, '') : null;
              return { field, type, value };
            });

            // resolve a promessa com um objeto contendo o nome da tabela e seus campos
            resolve({ tableName, fields });
          }
        });
      });
    });

    try {
      // aguarda todas as promessas serem resolvidas
      var tablesWithFields = await Promise.all(promises);
      // responde com os nomes das tabelas e seus campos
      res.json({ tables: tablesWithFields });
    } catch (error) {
   
      console.error('Ocorreu um erro ao obter os campos da tabela:', error);
      res.status(500).send('Ocorreu um erro ao obter os campos da tabela.');
    }
  });
});

// rota para atualizar a tabela ou os campos na base de dados
app.post('/atualizar-tabela', function(req, res) {
  const { nomeTabela, campos } = req.body;

  const promises = [];

  // verifica se o nome da tabela foi alterado
  if (nomeTabela.antigo !== nomeTabela.novo) {
    let query = `RENAME TABLE ${connection.escapeId(nomeTabela.antigo)} TO ${connection.escapeId(nomeTabela.novo)}`;
    
    const renamePromise = new Promise((resolve, reject) => {
      connection.query(query, function(error, results, fields) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    promises.push(renamePromise);
  }

  const alterFieldPromises = campos.map(campo => {
    // verifica se o campo foi alterado
    let campoAlterado = campo.campoAntigo.nome !== campo.novoCampo.nome || 
                        campo.campoAntigo.tipo !== campo.novoCampo.tipo || 
                        campo.campoAntigo.valor !== campo.novoCampo.valor;

    if (campoAlterado) {
      // cria a consulta SQL para alterar a tabela
      let query = `ALTER TABLE ${connection.escapeId(nomeTabela.novo)} CHANGE ${connection.escapeId(campo.campoAntigo.nome)} ${connection.escapeId(campo.novoCampo.nome)} ${campo.novoCampo.tipo}`;

      if (campo.novoCampo.valor) {
        query += `(${campo.novoCampo.valor})`;
      }

      // executa a consulta no banco de dados
      return new Promise((resolve, reject) => {
        connection.query(query, function(error, results, fields) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } else {
      // retornar uma promessa resolvida se o campo não foi alterado
      return Promise.resolve();
    }
  });

  promises.push(...alterFieldPromises);

  //executar as consultas em tempo real, assim vai atualizar..
  Promise.all(promises)
    .then(() => {
      res.json({ message: 'Campo atualizado com sucesso.' });
    })
    .catch(error => {
      res.status(500).json({ message: 'Ocorreu um erro durante a atualização do campo.', error });
    });
});

// rota para apagar a tabela na base de dados
app.delete('/delete-table', function(req, res) {
  const tableName = req.body.tableName;
  const query = `DROP TABLE ${tableName}`;

  connection.query(query, function(error, results, fields) {
    if (error) {
      return res.status(500).json({ message: 'Ocorreu um erro durante a exclusão da tabela.', error });
    }
    res.json({ message: 'Tabela excluída com sucesso.' });
  });
});

//rota para obter os dados da tabela
app.get('/get-data/:tableName', (req, res) => {
  const tableName = req.params.tableName;

  connection.query(`SELECT * FROM ${tableName}`, (error, results) => {
    if (error) {
      console.error(`Ocorreu um erro ao obter os dados da tabela ${tableName}:`, error);
      res.status(500).send(`Ocorreu um erro ao obter os dados da tabela ${tableName}.`);
      return;
    }

    res.json({ data: results });
  });
});

//rota para obter os dados de uma linha da tabela
app.get('/obter-dados/:nomeTabela/:id', (req, res) => {
  const nomeTabela = req.params.nomeTabela;
  const id = req.params.id;

  connection.query(`SELECT * FROM ${nomeTabela} WHERE id = ?`, [id], (erro, resultados) => {
    if (erro) {
      console.error(`Ocorreu um erro ao obter os dados da tabela ${nomeTabela}:`, erro);
      res.status(500).send(`Ocorreu um erro ao obter os dados da tabela ${nomeTabela}.`);
      return;
    }

    res.json({ data: resultados });
  });
});

// rota para editar os dados da tabela, os inputs com os campos...
app.patch('/editar-dados/:nomeTabela/:id', (req, res) => {
  const nomeTabela = req.params.nomeTabela;
  const id = req.params.id;
  const dados = req.body;

  let sql = `UPDATE ${nomeTabela} SET ${Object.keys(dados).map(chave => `${chave} = ?`).join(', ')} WHERE id = ?`;

  connection.query(sql, [...Object.values(dados), id], (erro, resultados) => {
    if (erro) {
      console.error(`Ocorreu um erro ao editar os dados na tabela ${nomeTabela}:`, erro);
      res.status(500).send(`Ocorreu um erro ao editar os dados na tabela ${nomeTabela}.`);
      return;
    }

    res.send(`Dados editados com sucesso na tabela ${nomeTabela}.`);
  });
});



// rota para obter a estrutura da tabela 
app.get('/get-structure/:tableName', (req, res) => {
  const tableName = req.params.tableName;

  connection.query(`SHOW COLUMNS FROM ${tableName}`, (error, results) => {
    if (error) {
      console.error(`Ocorreu um erro ao obter a estrutura da tabela ${tableName}:`, error);
      res.status(500).send(`Ocorreu um erro ao obter a estrutura da tabela ${tableName}.`);
      return;
    }

    res.json({ structure: results });
  });
});


// rota para inserir novos dados nos campos da tabela
app.post('/insert-data/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const dados = req.body;

  let sql = `INSERT INTO ${tableName} (${Object.keys(dados).join(',')}) VALUES (${Object.values(dados).map(() => '?').join(',')})`;

  connection.query(sql, Object.values(dados), (error, results) => {
    if (error) {
      console.error(`Ocorreu um erro ao inserir dados na tabela ${tableName}:`, error);
      res.status(500).send(`Ocorreu um erro ao inserir dados na tabela ${tableName}.`);
      return;
    }

    res.send(`Dados inseridos com sucesso na tabela ${tableName}.`);
  });
});


//rota para deletar o card com os dados do campo...
app.delete('/delete-data/:tableName/:id', (req, res) => {
  const { tableName, id } = req.params;
  connection.query(`DELETE FROM ?? WHERE id = ?`, [tableName, id], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Ocorreu um erro');
    } else {
      res.send(`Registro com id ${id} deletado da tabela ${tableName}`);
    }
  });
});


// iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`)
})
