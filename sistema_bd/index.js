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

connection.connect((error) => {
  if (error) {
    console.error('An error occurred while connecting to the DB:', error);
    return;
  }
  console.log('Successfully connected to the database!');
});


//Cria a tabela
app.post('/create-table', (req, res) => {
  const { tableName } = req.body;
  const query = `CREATE TABLE ${tableName} (id INT)`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while creating the table:', error);
      res.status(500).send('An error occurred while creating the table.');
      return;
    }
    console.log(`Successfully created table ${tableName}!`);
    res.send(`Successfully created table ${tableName}!`);
  });
});

//Obtem nomes das tabela para a navbar
app.get('/get-tables', function (req, res) {
  connection.query('SHOW TABLES', function (error, results, fields) {
      if (error) throw error;

      // 'results' é um array de objetos onde cada objeto tem uma propriedade que corresponde ao nome da tabela
      // Vamos extrair os nomes das tabelas para um array
      var tables = results.map(row => row[Object.keys(row)[0]]);

      // Retornar o array de nomes das tabelas como um objeto JSON
      res.json({ tables: tables });
  });
});

app.get('/get-table-columns/:tableName', function (req, res) {
  const { tableName } = req.params;
  connection.query(`SHOW COLUMNS FROM ${tableName}`, function (error, results) {
      if (error) throw error;
      res.json({ columns: results.map(row => row.Field) });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
