function criarTabela() {
  const tableName = document.getElementById('inputNametable').value;
  const tableRows = document.querySelectorAll('.criacaodecampos tbody tr');

  if (tableRows.length === 0) {
    alert('Por favor, adicione campos à tabela antes de criar.');
    return;
  }
  if (tableName.length === 0) {
    alert('NOME DA TABELA NECESSARIO.');
    return;
  }

  const columns = Array.from(tableRows).map(row => {
    const name = row.cells[0].textContent;
    const type = row.cells[1].textContent;
    const length = row.cells[2].textContent;
    return `${name} ${type}(${length})`;
  });

  const query = `CREATE TABLE ${tableName}  (id INT AUTO_INCREMENT PRIMARY KEY, ${columns.join(', ')})`;

  fetch('http://localhost:3000/create-table', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tableName, query }),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// QUANDO CLICA EM ADD, ELE VAI PARA O TBODY DO (NAME,TYPE,Length/Values)
function adicionarCampos() {
  const nameInput = document.getElementById('inputName');
  const typeInput = document.getElementById('inputType');
  const valueInput = document.getElementById('inputValue');

  if (!nameInput.value || !typeInput.value || !valueInput.value) {
    alert('Por favor, preencha todos os campos antes de adicionar uma nova linha.');
    return;
  }


  if (!Number.isInteger(parseInt(valueInput.value))) {
    alert('Por favor, insira um número inteiro válido para o comprimento do campo.');
    return;
  }

  if (typeInput.value === 'INT' && parseInt(valueInput.value) > 255) {
    alert('Por favor, insira um número inteiro válido para o comprimento do campo INT, até 255.');
    return;
  }

  const novaLinha = document.createElement('tr');

  novaLinha.innerHTML = `
    <td>${nameInput.value}</td>
    <td>${typeInput.options[typeInput.selectedIndex].value}</td> 
    <td>${valueInput.value}</td>
  `;

  document.querySelector('.table tbody').appendChild(novaLinha);

  //limpa os campos
  nameInput.value = '';
  typeInput.selectedIndex = 0;
  valueInput.value = '';
}

// buscar tabela na base de dados
function dbtabelas() {
  fetch('http://localhost:3000/get-tables')
    .then(response => response.json())
    .then(data => {
      data.tables.forEach(tabela => {
        adicionarTabela(tabela.tableName, tabela.fields);
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
// Chamar a função pegartabelas no início para carregar as tabelas existentes
dbtabelas();

// adicionar os campos e o nome da tabela a uma TABELA no html
function adicionarTabela(nomeTabela, campos) {
  const tabela = document.getElementById('tabela_criadas');

  // cria a linha que irá representar a tabela
  const novaLinha = document.createElement('tr');
  novaLinha.dataset.nomeTabela = nomeTabela;  // guarda o nome da tabela
  novaLinha.dataset.campos = JSON.stringify(campos);  // guarda os campos da tabela

  // cria as celulas que irão compor a linha
  const cellNomeTabela = document.createElement('td');
  const cellNomeCampo = document.createElement('td');
  const cellTipo = document.createElement('td');
  const cellValor = document.createElement('td');
  const cellAcoes = document.createElement('td');

  // preenche as células com os valores
  campos.forEach(campo => {
    const { field: nomeCampo, type: tipo, value: valor } = campo;

    
    if (nomeCampo.toLowerCase() === 'id') return; //ignorar o id

    [cellNomeCampo, cellTipo, cellValor].forEach((cell, index) => {
      const value = [nomeCampo, tipo.toUpperCase(), valor][index]; 
      cell.innerHTML += (cell.innerHTML ? "<br>" : "") + value;
    });
  });

  cellNomeTabela.textContent = nomeTabela;

  // adiciona as células criadas à nova linha
  [cellNomeTabela, cellNomeCampo, cellTipo, cellValor, cellAcoes].forEach(cell => novaLinha.appendChild(cell));

  // botão de editar
  const editarBtn = document.createElement('button');
  editarBtn.id = 'btnEditar'; // ID
  editarBtn.className = "btn btn-primary";
  editarBtn.textContent = 'Editar';
  editarBtn.addEventListener('click', () => {
    editarBtn.style.display = 'none'; // Oculta
    editarLinha(novaLinha, editarBtn);
  });

  novaLinha.editarBtn = editarBtn; // Armazena a referência ao botão na linha
  cellAcoes.appendChild(editarBtn);

  //botão de excluir
  const excluirBtn = document.createElement('button');
  excluirBtn.textContent = 'Excluir';
  excluirBtn.className ="btn btn-danger";
  excluirBtn.onclick = () => excluirTabela(nomeTabela);
  cellAcoes.appendChild(excluirBtn);


  tabela.appendChild(novaLinha);
}

// Excluir uma tabela
function excluirTabela(nomeTabela) {
  // confirmação
  if (!confirm('Você tem certeza que deseja excluir esta tabela?')) {
    return;
  }

  fetch('http://localhost:3000/delete-table', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tableName: nomeTabela }),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      // limpa o conteúdo da tabela
      const tabela = document.getElementById('tabela_criadas');
      tabela.innerHTML = '';
      
      dbtabelas();//chamar a funçao para recarregar as tabelas
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// editar os campos e o nome da tabela
function editarLinha(linha, editarBtn) {
  const cells = linha.getElementsByTagName('td');
  const originalHtml = linha.innerHTML;

  for (let i = 0; i < 4; i++) {
    const cell = cells[i];
    if (i === 0) {
      cell.className = 'nometabela-editar';
    }
    else {
      cell.className = 'campos-editar';
    }
    const values = cell.innerHTML.split('<br>');
    cell.innerHTML = '';
    values.forEach(value => {
      if (i === 2) { // campo do tipo
        const select = document.createElement('select');
        select.className = 'form-control';
        const types = ['INT', 'VARCHAR'];
        types.forEach(type => {
          const option = document.createElement('option');
          option.textContent = type;
          option.selected = (type === value);
          select.appendChild(option);
        });
        cell.appendChild(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.value = value;
        cell.appendChild(input);
      }
    });
  }

  // limpa a célula de ações antes de adicionar novos botões
  cells[4].innerHTML = '';

  // botão Salvar
  const salvarBtn = document.createElement('button');
  salvarBtn.textContent = 'Salvar';
  salvarBtn.className = "btn btn-primary";
  salvarBtn.onclick = () => {
    salvarEdicoes(linha);
    editarBtn.style.display = 'inline'; // Mostra
  };
  cells[4].appendChild(salvarBtn);

  // botão Cancelar
  const cancelarBtn = document.createElement('button');
  cancelarBtn.textContent = 'Cancelar';
  cancelarBtn.className = "btn btn-danger";
  cancelarBtn.onclick = () => {
    linha.innerHTML = originalHtml;
    // reatribui o evento de clique ao botão "Editar" depois de restaurar o HTML original
    const reattachedEditarBtn = linha.querySelector('#btnEditar');
    reattachedEditarBtn.style.display = 'inline'; 
   
    reattachedEditarBtn.addEventListener('click', () => {
      reattachedEditarBtn.style.display = 'none'; // esconde o botão de editar
      editarLinha(linha, reattachedEditarBtn);
    });
  };
  cells[4].appendChild(cancelarBtn);
}

function salvarEdicoes(linha) {
  const cells = linha.getElementsByTagName('td');
  const nomeTabela = { antigo: linha.dataset.nomeTabela, novo: cells[0].children[0].value };
  const camposOriginais = JSON.parse(linha.dataset.campos).slice(1); // ignora o primeiro campo -> id

  const camposEditados = Array.from(cells[1].children).map((input, index) => {
    const campoOriginal = camposOriginais[index];

    return {
      campoAntigo: {
        nome: campoOriginal.field,
        tipo: campoOriginal.type,
        valor: campoOriginal.value
      },
      novoCampo: {
        nome: cells[1].children[index].value,
        tipo: cells[2].children[index].value,
        valor: cells[3].children[index].value
      }
    };
  });

  fetch('http://localhost:3000/atualizar-tabela', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nomeTabela, campos: camposEditados }),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      // limpa o conteúdo da tabela
      const tabela = document.getElementById('tabela_criadas');
      tabela.innerHTML = '';
      
      dbtabelas(); //chamar a funcao para pegar as tabelas
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


