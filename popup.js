document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const searchButton = document.getElementById('searchInvoice');
    const invoiceInput = document.getElementById('invoiceNumber');
    const invoiceTypeSelect = document.getElementById('invoiceType');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const notesList = document.getElementById('notesList');
    const notesContainer = document.getElementById('notesContainer');

    let currentSubdomain = null;

    // Navegação por abas
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Verificar status de login
    async function checkLoginStatus() {
        try {
            const result = await chrome.storage.local.get(['varejofacil_subdomain']);
            let subdomain = result.varejofacil_subdomain;
            
            // Primeiro tenta verificar com o subdomínio salvo
            if (subdomain) {
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkLogin',
                        data: { subdomain: subdomain }
                    });
                    
                    if (response && response.success) {
                        currentSubdomain = subdomain;
                        updateStatus(true, 'Online');
                        return;
                    }
                } catch (error) {
                    console.log('Erro ao verificar login com subdomínio salvo:', error);
                }
            }
            
            // Se não conseguiu verificar, tenta extrair da aba ativa
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url && tab.url.includes('varejofacil.com')) {
                subdomain = extractSubdomain(tab.url);
                if (subdomain) {
                    chrome.storage.local.set({ 'varejofacil_subdomain': subdomain });
                    currentSubdomain = subdomain;
                    updateStatus(true, 'Online');
                    return;
                }
            }
            
            updateStatus(false, 'Acesse o VarejoFacil');
            
        } catch (error) {
            console.error('Erro na verificação de status:', error);
            updateStatus(false, 'Erro de conexão');
        }
    }

    function updateStatus(isOnline, text) {
        statusDot.classList.toggle('online', isOnline);
        statusText.textContent = text;
    }

    function extractSubdomain(url) {
        try {
            const hostname = new URL(url).hostname;
            const parts = hostname.split('.');
            return parts.length > 2 ? parts[0] : null;
        } catch {
            return null;
        }
    }

    // Consultar nota fiscal
    async function searchInvoice() {
        const invoiceNumber = invoiceInput.value.trim();
        const invoiceType = invoiceTypeSelect.value;
        
        if (!invoiceNumber) {
            showResult('Por favor, digite o número da nota fiscal', 'error');
            return;
        }

        if (!currentSubdomain) {
            const result = await chrome.storage.local.get(['varejofacil_subdomain']);
            if (!result.varejofacil_subdomain) {
                showResult('Acesse o VarejoFacil primeiro', 'error');
                return;
            }
            currentSubdomain = result.varejofacil_subdomain;
        }

        try {
            showLoading(true);
            
            const response = await chrome.runtime.sendMessage({
                action: 'searchInvoice',
                data: {
                    subdomain: currentSubdomain,
                    invoiceNumber: invoiceNumber,
                    invoiceType: invoiceType
                }
            });
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
            const searchData = response.data;
            console.log('📊 Dados da busca completos:', searchData);
            console.log('📊 Total de registros:', searchData.totalRegistros);
            
            let notas = [];
            if (invoiceType === 'compra') {
                notas = searchData.notas || [];
            } else {
                notas = searchData.notas || searchData.items || [];
            }
            
            console.log(`📋 Notas extraídas: ${notas.length}`);
            console.log('📋 Estrutura das notas:', notas);
            
            if (notas.length === 0) {
                showResult(`Nenhuma nota fiscal de ${invoiceType} encontrada com o número ${invoiceNumber}`, 'error');
                return;
            }
            
            console.log(`📋 Processando ${notas.length} nota(s)`);
            showNotesList(notas, invoiceType);
            
        } catch (error) {
            showResult(error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
        searchButton.disabled = show;
        result.style.display = 'none';
        notesList.style.display = 'none';
    }

    function showResult(message, type) {
        result.textContent = message;
        result.className = `result ${type}`;
        result.style.display = 'block';
        notesList.style.display = 'none';
    }
    
    function showNotesList(notas, invoiceType) {
        console.log('🎨 Criando lista de notas');
        console.log('- Notas recebidas:', notas);
        
        notesContainer.innerHTML = '';
        
        notas.forEach((nota, index) => {
            console.log(`📝 Processando nota ${index + 1}:`, nota);
            
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            
            // Extrai dados da estrutura aninhada
            const numeroDoc = nota.numeroDoDocumento || nota.numero || 'N/A';
            const serie = nota.serie || 'N/A';
            const codigo = nota.codigo;
            const data = nota.dataDaEmissao ? new Date(nota.dataDaEmissao).toLocaleDateString('pt-BR') : 'N/A';
            const fornecedor = nota.descricaoDaPessoa || nota.pessoa?.nome || nota.fornecedor?.nome || 'N/A';
            const valor = nota.valorDoDocumento ? parseFloat(nota.valorDoDocumento).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00';
            
            noteItem.innerHTML = `
                <div class="note-header">📄 Nota ${numeroDoc} - Série ${serie}</div>
                <div class="note-details">
                    <strong>Código:</strong> ${codigo} | <strong>Data:</strong> ${data}<br>
                    <strong>Fornecedor:</strong> ${fornecedor}<br>
                    <strong>Valor:</strong> R$ ${valor}
                </div>
            `;
            
            noteItem.addEventListener('click', (event) => {
                console.log(`🖱️ Clicou na nota ${codigo}`);
                console.log('Event:', event);
                console.log('Current subdomain:', currentSubdomain);
                console.log('Invoice type:', invoiceType);
                event.preventDefault();
                downloadNote(codigo, invoiceType);
            });
            
            notesContainer.appendChild(noteItem);
        });
        
        notesList.style.display = 'block';
        result.style.display = 'none';
        
        console.log('✅ Lista exibida!');
    }
    
    async function downloadNote(notaCodigo, invoiceType) {
        try {
            console.log(`🚀 Iniciando download da nota ${notaCodigo}`);
            showLoading(true);
            
            const response = await chrome.runtime.sendMessage({
                action: 'downloadInvoice',
                data: {
                    subdomain: currentSubdomain,
                    notaCodigo: notaCodigo
                }
            });
            
            console.log('📥 Resposta do background:', response);
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
            showResult(`✅ Nota fiscal baixada e aberta para visualização!`, 'success');
            
        } catch (error) {
            console.error('❌ Erro no download:', error);
            showResult(error.message, 'error');
        } finally {
            showLoading(false);
        }
    }

    // Event listeners
    searchButton.addEventListener('click', searchInvoice);
    
    invoiceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchInvoice();
        }
    });

    // Verificar status ao carregar
    checkLoginStatus();
    
    // Verificar status a cada 30 segundos
    setInterval(checkLoginStatus, 30000);
});