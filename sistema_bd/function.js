function btnCriarNomeTabela() {
  var aparecerCamposEstrutura = document.getElementById('columnsDiv');

  aparecerCamposEstrutura.innerHTML = `
    <div class="container">
      <div class="row mt-3">
        <div class="col-3">
          <label for="table-name-input" class="form-label">NOME DA TABELA:</label>
          <input type="text" class="form-control" id="table-name-input">
        </div>
        <button type="button" class="btn btn-primary" onclick="criarTabela()" style="float: right;">CRIAR</button>
      </div>
    </div>
  `;
}

// Cria Uma nova tabela
function criarTabela() {
  var inputNametable = document.getElementById('table-name-input');
  var tableName = inputNametable.value.trim();
  if (tableName === '') {
    alert('Por favor, insira um nome para a tabela!');
    return;
  }

  fetch('http://localhost:3000/create-table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tableName: tableName })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
      inputNametable.value = ''; // Limpar o campo de entrada do nome da tabela

      // Adicionar o link na navbar
      var navBar = document.getElementById('navbarNav').getElementsByTagName('ul')[0];
      var newListItem = document.createElement('li');
      newListItem.className = 'nav-item';

      var newLink = document.createElement('a');
      newLink.className = 'nav-link';
      newLink.href = '#' + tableName;
      newLink.textContent = tableName;

      newListItem.appendChild(newLink);
      navBar.appendChild(newListItem);

      // Refresh the page
      location.reload();
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}


function getFormHtml() {
  return `
  <br>
 
    <div class="container"> 
    <button type="button" id="remove-table-button" class="btn btn-danger" style="float: right;">Apagar Tabela</button>
    <br>
       <div class="col">
       <p><strong>Adicionar Colunas</strong></p>
        </div>
      <div class="row mt-3"> 
        <div class="col-3">
          <label for="inputName" class="form-label">Name</label>
          <input type="text" class="form-control" id="inputName">
        </div>
        <div class="col-3">
          <label for="inputType" class="form-label">Type</label>
          <select class="form-control" id="inputType">
            <option value="">---</option>
            <option value="INT">INT</option>
            <option value="VARCHAR">VARCHAR</option>
            <option value="TEXT">TEXT</option>
            <option value="DATE">DATE</option>
          </select>
        </div>
        <div class="col-3">
          <label for="inputValue" class="form-label">Length/Values</label>
          <input type="text" class="form-control" id="inputValue">
        </div>
        
      </div>
      <button type="button" id="create-column-button" class="btn btn-primary" style="float: right;">CRIAR</button>
    </div>
    <div class="container"> 
        <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>

        </tr>
      </thead>
      <tbody></tbody>
    </table>
    </div>
    
  `;
}


function getFormHtmlData() {
  return `
  <br>
    <div class="container"> 
    <br>
    <div class="col">
       <p><strong>Adicionar Dados</strong></p>
    </div>
    <div id="dados"></div>
    <br>
    
       <div class="col">
          <button type="button" class="btn btn-primary" id="add-data-button" style="float: right;">Adicionar</button>
       </div>
    
    </div>
    <div class="container"> 
     <div id="dataTableContainer"></div> 
    </div>
  <br>
  `;
}


// Carrega as colunas da tabela
function displayTableColumns(tableName) {
  console.log('About to fetch table columns for:', tableName);
  fetch(`http://localhost:3000/get-table-columns/${tableName}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      console.log('Fetched table columns:', data);
      var columnsDiv = document.getElementById('columnsDiv');
      console.log('columnsDiv element:', columnsDiv);
      // Limpar o columnsDiv antes de adicionar novos parágrafos
      columnsDiv.innerHTML = '';

      columnsDiv.insertAdjacentHTML('beforeend', getFormHtml());
      

      var removeTableButton = document.getElementById('remove-table-button');
      removeTableButton.addEventListener('click', function () {
        apagarTabela(tableName);
      });

      var createColumnButton = document.getElementById('create-column-button');
      createColumnButton.addEventListener('click', function () {
        var columnName = document.getElementById('inputName').value;
        var dataType = document.getElementById('inputType').value;
        var length = document.getElementById('inputValue').value;

        if (columnName === '' || dataType === '' || length === '') {
          alert('Por favor, preencha todos os campos!');
          return;
        }

        fetch('http://localhost:3000/create-column', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tableName: tableName, columnName: columnName, dataType: dataType, length: length })
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then((data) => {
            console.log(data);
            // Limpar os campos de entrada
            document.getElementById('inputName').value = '';
            document.getElementById('inputType').value = '';
            document.getElementById('inputValue').value = '';
            // Atualizar a exibição de colunas
            displayTableColumns(tableName);
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      });
      console.log('Fetched table columns:', data);

      data.columns.forEach(column => {
        console.log('Column name:', column.name);
        console.log('Column type:', column.type);
      });

      // Use data.columns em vez de apenas data
      var tableBody = document.querySelector('.table tbody');
      tableBody.innerHTML = '';

      data.columns.forEach(column => {
        console.log('Column:', column);
        var newRow = document.createElement('tr');

        var removeButtonHTML = column.name.toLowerCase() !== 'id' ? `<td><button onclick="removeColumn('${tableName}', '${column.name}')" class="btn btn-danger">Remover</button></td>` : '';

        newRow.innerHTML = `
            <td>${column.name}</td>
            <td>${column.type}</td>
            ${removeButtonHTML}
          `;
        tableBody.appendChild(newRow);
      });
      displayTableData(tableName, data.columns)
    })
    
    
    .catch((error) => {
      console.error('Error:', error);
    });
    
}


function apagarTabela(tableName) {
  var confirmDelete = confirm("Tem certeza que deseja apagar a tabela " + tableName + "?");

  if (confirmDelete) {
    fetch('http://localhost:3000/delete-table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tableName: tableName })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);
        // Remover o link da navbar
        var navBar = document.getElementsByClassName('navbar-nav')[0];
        var tableLink = document.getElementById(tableName);
        console.log('Element to remove:', tableLink);
        tableLink.parentNode.removeChild(tableLink);

        // Limpar o conteúdo do columnsDiv
        var columnsDiv = document.getElementById('columnsDiv');
        columnsDiv.innerHTML = '';

        // Recarregar a página
        location.reload();
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }
}


function removeColumn(tableName, columnName) {
  fetch(`http://localhost:3000/remove-column`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tableName: tableName, columnName: columnName })
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.text();
  })
  .then((data) => {
    console.log(data);
    // Atualizar a exibição de colunas
    displayTableColumns(tableName);
  })
  .catch((error) => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}


// Recarrega a página ao clicar em um link da navbar
function reloadPage(tableName) {
  location.reload();
}

window.onload = function () {
  fetch('http://localhost:3000/get-tables', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      var navBar = document.getElementsByClassName('navbar-nav')[0];
      data.tables.forEach(table_name => {
        var newListItem = document.createElement('li');
        newListItem.className = "nav-item";

        var newLink = document.createElement('a');
        newLink.className = "nav-link";
        newLink.id = table_name;
        newLink.href = "#" + table_name;
        newLink.textContent = table_name;
        var activeTableName = '';
        newLink.onclick = function () {
          activeTableName = table_name;
          // Remove a classe 'active' de todos os links da navbar
          var navLinks = document.getElementsByClassName('nav-link');
          for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].classList.remove('active');
          }
          // Adiciona a classe 'active' ao link clicado
          this.classList.add('active');

          // Limpa o conteúdo do columnsDiv
          var columnsDiv = document.getElementById('columnsDiv');
          if (columnsDiv) {
            columnsDiv.innerHTML = '';

            // Exibe o conteúdo das colunas da tabela
            displayTableColumns(table_name);
          }
        };

        newListItem.appendChild(newLink);
        navBar.appendChild(newListItem);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

// Carrega os dados da tabela
function displayTableData(tableName, columns) {
  var dataDiv = document.getElementById('dataDiv');
  dataDiv.innerHTML = '';

  dataDiv.insertAdjacentHTML('beforeend', getFormHtmlData());

  var addButton = document.getElementById('add-data-button');
  addButton.addEventListener('click', function () {
    var columnData = {};
    columns.forEach(column => {
      var columnInputValue = document.getElementById('input-' + column.name).value;
      columnData[column.name] = columnInputValue;
    });

    if (Object.values(columnData).some(value => value === '')) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    fetch('http://localhost:3000/add-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        tableName: tableName, 
        rowData: columnData // Verifique se 'columnData' não é null ou undefined
      })
    })

      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);
        // Limpar os campos de entrada
        columns.forEach(column => {
          document.getElementById('input-' + column.name).value = '';
        });
        // Atualizar a exibição dos dados
        displayTableData(tableName, columns);
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  });

  fetch(`http://localhost:3000/get-data?tableName=${tableName}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      var dataTableContainer = document.getElementById('dataTableContainer');
      dataTableContainer.innerHTML = '';

      // Create a new table
      var table = document.createElement('table');
      table.className = 'table';

      // Add table headers
      var thead = document.createElement('thead');
      var headerRow = document.createElement('tr');
      columns.forEach(column => {
        var th = document.createElement('th');
        th.textContent = column.name;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Add table data
      var tbody = document.createElement('tbody');
      data.forEach(row => {
        var dataRow = document.createElement('tr');
        columns.forEach(column => {
          var td = document.createElement('td');
          td.textContent = row[column.name];
          dataRow.appendChild(td);
        });
        tbody.appendChild(dataRow);
      });
      table.appendChild(tbody);

      dataTableContainer.appendChild(table);
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });


// Crie um novo container para armazenar as linhas
var rowContainer = document.createElement('div');
rowContainer.className = 'row';

columns.forEach(column => {
  var newInputDiv = document.createElement('div');
  newInputDiv.className = 'col-3';

  var newLabel = document.createElement('label');
  newLabel.for = 'input-' + column.name;
  newLabel.className = 'form-label';
  newLabel.textContent = column.name;

  var newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'form-control';
  newInput.id = 'input-' + column.name;

  newInputDiv.appendChild(newLabel);
  newInputDiv.appendChild(newInput);

  // Adicione o newInputDiv ao rowContainer, em vez da linha existente
  rowContainer.appendChild(newInputDiv);
});

// Adicione o rowContainer ao dataDiv
dados.appendChild(rowContainer);
}
