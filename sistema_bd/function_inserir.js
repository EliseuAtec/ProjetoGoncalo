// Função para preencher as tabelas
function preencherTabelas() {
  fetch('http://localhost:3000/get-tables')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('inputTable'); 
      
      // Cria uma nova opção e define suas propriedades
      const defaultOption = document.createElement('option');
      defaultOption.value = ''; 
      defaultOption.textContent = 'Selecionar tabela'; 
      defaultOption.selected = true; 
      defaultOption.disabled = true; 
      defaultOption.style.display = 'none'; 

      // Adiciona a opção padrão ao select
      select.appendChild(defaultOption); 

      // Adiciona as outras opções
      data.tables.forEach(tabela => {
        // Para cada tabela obtida, cria uma nova opção e a adiciona ao select
        const option = document.createElement('option');
        option.value = tabela.tableName; 
        option.textContent = tabela.tableName; 
        select.appendChild(option); // adicionar a opção ao select
      });

      
      select.addEventListener('change', obterDados);
      select.addEventListener('change', obterEstrutura); 
    })
    .catch((error) => {
      console.error('Error:', error); 
    });
}

// chama a função preencherTabelas quando a página carrega
preencherTabelas();


// Função para obter os dados da tabela selecionada
function obterDados() {
  const tableName = document.getElementById('inputTable').value;

  fetch(`http://localhost:3000/get-data/${tableName}`)
    .then(response => response.json())
    .then(data => {
      // limpar o container dos cards
      const container = document.getElementById('dadosdoscampos');
      container.innerHTML = '';

      // cria um card para cada linha de dados e adiciona ao container
      data.data.forEach(row => {
        let cardContent = '';
        for (let column in row) {
          if (column !== 'id') { // ignora a coluna 'id' para o user n alterar e dar ruim na bd
            cardContent += `
                <div class="col-12 div-dados">
                  <h8 style="font-size: 60%;">${column}:</h8>
                  <h6 class="card-title">${row[column]}</h6>
                </div>
              `;
          }
        }

        const card = `
  <div class="col-12 col-sm-6 col-md-4" id="edi-card-${row.id}">
    <div class="card mb-4" id="card-${row.id}">
      <div class="card-body">
        ${cardContent}
        <div class="col-12"><button type="button" class="btn btn-primary col-5" onclick="editarDados(${row.id})">Editar</button>
        <button type="button" class="btn btn-danger col-5" onclick="excluirDados(${row.id})">Excluir</button></div>
      </div>
    </div>
  </div>
`;


        container.innerHTML += card;
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Função para obter a estrutura da tabela selecionada
function obterEstrutura(event) {
  //console.log('obterEstrutura foi chamada');
  const tableName = event.target.value;

  fetch(`http://localhost:3000/get-structure/${tableName}`)
    .then(response => response.json())
    .then(data => {
      // criar um formulário para a inserção de novos dados
      criarFormulario(data.structure);
      // chamar obterDados após o formulário ter sido criado
      obterDados();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Função para criar um formulário para a inserção de novos dados para inserir nos campos da tabela
function criarFormulario(estrutura) {
  const container = document.getElementById('domtabela');


  container.innerHTML = '';


  // cria o conteudo do formulario na tela
  let formContent = '';
  estrutura.forEach(campo => {
    if (campo.Field !== 'id') { // Ignora o campo 'id' para o user n alterar
      formContent += `
          <div class="form-group">
            <label for="input${campo.Field}">${campo.Field}:</label>
            <input type="text" class="form-control" id="input${campo.Field}">
          </div>
        `;
    }
  });


  // Adicionar o botão de inserir ao conteúdo do formulário para subir a bd
  formContent += `
      <div class="button-inserir col-12">
        <button type="button" class="btn btn-dark" onclick="inserirDados()">+ INSERIR</button>
      </div>
    `;

  // Adicionar o formulário ao container
  container.innerHTML = `<form>${formContent}</form>`;
}

// Função para inserir novos dados na tabela e aparecer tbm nos cards abaixo dos --DADOS--
function inserirDados() {
  const tableName = document.getElementById('inputTable').value;

  const campos = document.getElementById('domtabela').querySelectorAll('input');
  const dados = {};
  campos.forEach(campo => {
    dados[campo.id.replace('input', '')] = campo.value;
  });

  fetch(`http://localhost:3000/insert-data/${tableName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      // Chama obterDados após a inserção bem-sucedida de dados
      obterDados();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// variavel para guardar o HTML do formulário de input
let formInsercaoHTML = '';
// variavel para guardar o card que esta sendo editado
let cardEditando = null;
function editarDados(id) {
  const nomeTabela = document.getElementById('inputTable').value;

  //se estiver editando um card, cancelar a edição antes de começar a editar um novo card
  if (cardEditando) {
    cancelarEdicao();
  }

  fetch(`http://localhost:3000/obter-dados/${nomeTabela}/${id}`)
    .then(resposta => resposta.json())
    .then(dados => {
     
      // dados atuais estão no dados.data[0]
      const linhaDados = dados.data[0];

      // guardar o HTML do formulário de input antes de limpar
      formInsercaoHTML = document.getElementById('domtabela').innerHTML;

      editarLinha(linhaDados, id);
      cardEditando = document.getElementById(`card-${id}`);
      cardEditando.classList.add('borda-verde');

    })
    .catch(erro => {
      console.error('Erro:', erro);
    });
}

// funcao para cancelar as alteracoes iniciadas
function cancelarEdicao() {
  // remover a borda verde ao cancelar as edições
  if (cardEditando) {
    cardEditando.classList.remove('borda-verde');
  }
  // restaura o formulário de inpput
  document.getElementById('domtabela').innerHTML = formInsercaoHTML;
  
  obterDados();  //chamar os dados novamente 
  //limpar a referencia do card q estava sendo editado
  cardEditando = null;
}

// Funcao para editar os dados dos campos da tabela
function editarLinha(dados, id) {
  const formContainer = document.getElementById('domtabela'); 
  formContainer.innerHTML = ''; 

  // cria campos de input para cada campo de dados (exceto o 'id' para n deixar o user mexer nisso)
  for (let campo in dados) {
    if (campo !== 'id') {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';

      const label = document.createElement('label');
      label.for = `input${campo}`;
      label.textContent = `${campo}:`;

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.id = `input${campo}`;
      input.value = dados[campo];

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      formContainer.appendChild(formGroup);
    }
  }
  
 // botão Salvar
 const salvarBtn = document.createElement('button');
 salvarBtn.textContent = 'Salvar';
 salvarBtn.className = "btn btn-primary";
 salvarBtn.onclick = () => {
   confirmarEdicao(id);
   //remove a borda verde depois de salvar as edições
   cardEditando.classList.remove('borda-verde');
 };
 formContainer.appendChild(salvarBtn);

 // botão Cancelar
 const cancelarBtn = document.createElement('button');
 cancelarBtn.textContent = 'Cancelar';
 cancelarBtn.className = "btn btn-danger";
 cancelarBtn.onclick = () => {

   cardEditando.classList.remove('borda-verde');
   document.getElementById('domtabela').innerHTML = formInsercaoHTML;
   obterDados();
 };
 formContainer.appendChild(cancelarBtn);
}

// Funcao para confirmar as edicao dos dados dos campos da tabela
function confirmarEdicao(id) {
  const nomeTabela = document.getElementById('inputTable').value;
  const campos = document.getElementById('domtabela').querySelectorAll('input');
  const dados = {};
  campos.forEach(campo => {
    dados[campo.id.replace('input', '')] = campo.value;
  });
  
  fetch(`http://localhost:3000/editar-dados/${nomeTabela}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  })
    .then(resposta => resposta.text())
    .then(dados => {
      console.log(dados);
      // Restaura o formulário de inserção
      document.getElementById('domtabela').innerHTML = formInsercaoHTML;
      // Chama obterDados após a edição bem-sucedida dos dados
      obterDados();
    })
    .catch((erro) => {
      console.error('Erro:', erro);
    });
}

cancelarBtn.onclick = () => {
  // Remove a borda verde ao cancelar as edições
  cardEditando.classList.remove('borda-verde');
  // Restaura o formulário de inserção
  document.getElementById('domtabela').innerHTML = formInsercaoHTML;
};



// Funcao para excluir dados da tabela selecionada
function excluirDados(id) {
  const tableName = document.getElementById('inputTable').value;

  fetch(`http://localhost:3000/delete-data/${tableName}/${id}`, {
    method: 'DELETE',
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      //remove o card do DOM dpois da exclusão realizada
      const card = document.getElementById(`edi-card-${id}`);
      card.parentNode.removeChild(card);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
