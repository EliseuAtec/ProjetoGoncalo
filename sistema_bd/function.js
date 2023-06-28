
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


//Cria Uma nova tabela
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
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function getFormHtml() {
  return `
    <div class="container">
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
        <div class="col-3">
          <label for="inputIndex" class="form-label">Index</label>
          <select class="form-control" id="inputIndex">
            <option value="">---</option>
            <option value="PRIMARY">PRIMARY</option>
            <option value="UNIQUE">UNIQUE</option>
            <option value="INDEX">INDEX</option>
            <option value="FULLTEXT">FULLTEXT</option>
            <option value="SPATIAL">SPATIAL</option>
          </select>
        </div>
      </div>
      <button type="button" id="create-column-button" class="btn btn-primary" style="float: right;">CRIAR</button>
    </div>
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

      var createColumnButton = document.getElementById('create-column-button');
      createColumnButton.addEventListener('click', function() {
        var columnName = document.getElementById('inputName').value;
        var dataType = document.getElementById('inputType').value;
        var length = document.getElementById('inputValue').value;
        var index = document.getElementById('inputIndex').value;
        
        if (columnName === '' || dataType === '' || length === '') {
          alert('Por favor, preencha todos os campos!');
          return;
        }

        fetch('http://localhost:3000/create-column', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tableName: tableName, columnName: columnName, dataType: dataType, length: length, index: index })
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
            document.getElementById('inputIndex').value = '';
            // Atualizar a exibição de colunas
            displayTableColumns(tableName);
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      });

      // Use data.columns em vez de apenas data
      data.columns.forEach(column_name => {
        var newParagraph = document.createElement('p');
        newParagraph.textContent = column_name;
        columnsDiv.appendChild(newParagraph);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


//Cria coluna na BD
function createColumn() {
  var inputName = document.getElementById('inputName');
  var inputType = document.getElementById('inputType');
  var inputValue = document.getElementById('inputValue');

  var columnName = inputName.value.trim();
  var dataType = inputType.value.trim();
  var length = inputValue.value.trim();

  if (columnName === '' || dataType === '') {
    alert('Por favor, insira um nome e um tipo para a coluna!');
    return;
  }

  fetch('http://localhost:3000/create-column', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tableName: activeTableName, columnName: columnName, dataType: dataType, length: length })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
      inputName.value = ''; 
      inputType.value = '';
      inputValue.value = '';

      displayTableColumns(activeTableName); // Atualizar a exibição das colunas da tabela
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}






// Recarrega a página ao clicar em um link da navbar
function reloadPage(tableName) {
  location.reload();
}

window.onload = function() {
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
        newLink.onclick = function() {
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
          columnsDiv.innerHTML = '';

          // Exibe o conteúdo das colunas da tabela
          displayTableColumns(table_name);
        };

        newListItem.appendChild(newLink);
        navBar.appendChild(newListItem);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
