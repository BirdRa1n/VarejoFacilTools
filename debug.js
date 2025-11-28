// Script de debug para testar a função showNotesList
// Cole este código no console do popup para testar

const testData = {
    "totalRegistros": 2,
    "notas": [
        {
            "codigo": 152826,
            "numeroDoDocumento": "2030",
            "serie": "1",
            "dataDaEmissao": "2024-01-15",
            "descricaoDaPessoa": "Fornecedor Teste",
            "valorDoDocumento": "1500.50"
        },
        {
            "codigo": 152827,
            "numeroDoDocumento": "2031", 
            "serie": "1",
            "dataDaEmissao": "2024-01-16",
            "descricaoDaPessoa": "Outro Fornecedor",
            "valorDoDocumento": "2300.75"
        }
    ]
};

// Simula a função showNotesList
function testShowNotesList() {
    const notesList = document.getElementById('notesList');
    const notesContainer = document.getElementById('notesContainer');
    const result = document.getElementById('result');
    
    console.log('🧪 Testando showNotesList...');
    console.log('- notesList element:', notesList);
    console.log('- notesContainer element:', notesContainer);
    
    if (!notesList || !notesContainer) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    notesContainer.innerHTML = '';
    
    testData.notas.forEach((nota, index) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <div class="note-header">📄 Nota ${nota.numeroDoDocumento} - Série ${nota.serie}</div>
            <div class="note-details">
                <strong>Código:</strong> ${nota.codigo} | <strong>Data:</strong> ${nota.dataDaEmissao}<br>
                <strong>Fornecedor:</strong> ${nota.descricaoDaPessoa}<br>
                <strong>Valor:</strong> R$ ${nota.valorDoDocumento}
            </div>
        `;
        
        noteItem.addEventListener('click', () => {
            console.log(`🖱️ Clicou na nota ${nota.codigo}`);
        });
        
        notesContainer.appendChild(noteItem);
        console.log(`✅ Item ${index + 1} adicionado`);
    });
    
    notesList.style.display = 'block';
    if (result) result.style.display = 'none';
    
    console.log('✅ Teste concluído!');
    console.log('- Display da lista:', notesList.style.display);
    console.log('- Itens no container:', notesContainer.children.length);
}

// Execute o teste
testShowNotesList();