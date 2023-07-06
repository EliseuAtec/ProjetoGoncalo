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

app.post('/create-column', (req, res) => {
  const { tableName, columnName, dataType, length } = req.body;
  
  // Você pode precisar validar e formatar os tipos de dados de acordo com as necessidades do seu projeto.
  // Neste exemplo, suponho que você esteja lidando apenas com tipos de dados que podem ter um comprimento definido (como VARCHAR)
  const query = `ALTER TABLE ${tableName} ADD ${columnName} ${dataType}(${length})`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while creating the column:', error);
      res.status(500).send('An error occurred while creating the column.');
      return;
    }
    console.log(`Successfully added column ${columnName} to table ${tableName}!`);
    res.send(`Successfully added column ${columnName} to table ${tableName}!`);
  });
});

app.post('/add-data', (req, res) => {
  const { tableName, rowData } = req.body;

  // Check if rowData is null or undefined
  if (!rowData) {
    console.error('rowData is null or undefined');
    res.status(400).send('rowData is required');
    return;
  }

  // Prepare the SQL query string
  const columns = Object.keys(rowData).join(',');
  const values = Object.values(rowData).map(value => mysql.escape(value)).join(',');

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while adding data:', error);
      res.status(500).send('An error occurred while adding data.');
      return;
    }
    console.log(`Successfully added data to table ${tableName}!`);
    res.send(`Successfully added data to table ${tableName}!`);
  });
});

app.post('/remove-column', (req, res) => {
  const { tableName, columnName } = req.body;
  
  const query = `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while removing the column:', error);
      res.status(500).send('An error occurred while removing the column.');
      return;
    }
    console.log(`Successfully removed column ${columnName} from table ${tableName}!`);
    res.send(`Successfully removed column ${columnName} from table ${tableName}!`);
  });
});

app.post('/delete-table', (req, res) => {
  const { tableName } = req.body;
  const query = `DROP TABLE ${tableName}`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while deleting the table:', error);
      res.status(500).send('An error occurred while deleting the table.');
      return;
    }
    console.log(`Successfully deleted table ${tableName}!`);
    res.send(`Successfully deleted table ${tableName}!`);
  });
});

app.post('/remove-data', (req, res) => {
  const { tableName, id } = req.body;

  // Certifique-se de que tanto 'tableName' quanto 'id' são fornecidos
  if (!tableName || !id) {
    res.status(400).send('Both tableName and id are required');
    return;
  }

  // Prepare the SQL query string
  const query = `DELETE FROM ${tableName} WHERE id = ?`;

  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error('An error occurred while removing data:', error);
      res.status(500).send('An error occurred while removing data.');
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).send('No data found to remove.');
      return;
    }

    console.log(`Successfully removed data from table ${tableName} with id ${id}!`);
    res.send(`Successfully removed data from table ${tableName} with id ${id}!`);
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
    const columns = results.map(row => ({
      name: row.Field,
      type: row.Type,
      length: row.Length
    }));
    res.json({ columns: columns });
  });
});

app.get('/get-data', (req, res) => {
  const tableName = req.query.tableName;

  if (!tableName) {
    res.status(400).send('Table name is required');
    return;
  }

  const query = `SELECT * FROM ${tableName}`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('An error occurred while getting data:', error);
      res.status(500).send('An error occurred while getting data.');
      return;
    }

    res.send(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
