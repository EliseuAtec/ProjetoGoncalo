function btnCriarNomeTabela() {
    const inputNametable = document.getElementById('inputNametable').value;

    if (inputNametable.trim() === '') {
        alert('Por favor, insira um nome para a tabela!');
        return;
      }

    // Mostra os campos da estrutura da tabela criada
    document.getElementById('aparecerCamposEstrutura').style.display = 'block';
        
}








