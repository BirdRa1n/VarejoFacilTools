// Função para verificar a URL e injetar o script na página
function checkUrlAndInjectScript(tabId, changeInfo, tab) {
    // Só processa quando a página terminou de carregar
    if (changeInfo.status !== 'complete') return;
    
    console.log('🔍 Verificando URL:', tab.url);
    
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.varejofacil\.com\/.*notaFiscalVenda.*index/;
    const productPattern = /^https:\/\/[a-zA-Z0-9.-]+\.varejofacil\.com\/.*[?#&]r=%2Fproduto%2Fcadastro/;
    
    if (tab.url && urlPattern.test(tab.url)) {
        console.log('✅ URL corresponde ao pattern, injetando script...');
        
        const hostname = new URL(tab.url).hostname;
        const subdomain = hostname.split('.')[0];
        chrome.storage.local.set({ 'varejofacil_subdomain': subdomain });
        
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }).then(() => {
            console.log("✅ Script injetado na página:", tab.url);
        }).catch(err => {
            console.error("❌ Erro ao injetar o script:", err);
        });
    } else if (tab.url && productPattern.test(tab.url)) {
        console.log('✅ Página de produto detectada, injetando image loader...');
        
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ["product-image-loader.js"]
        }).then(() => {
            console.log("✅ Image loader injetado na página:", tab.url);
        }).catch(err => {
            console.error("❌ Erro ao injetar image loader:", err);
        });
    } else {
        console.log('❌ URL não corresponde ao pattern');
    }
}

// Handler para requisições do popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'searchInvoice') {
        handleInvoiceSearch(request.data)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Mantém o canal aberto para resposta assíncrona
    }
    
    if (request.action === 'downloadInvoice') {
        handleInvoiceDownload(request.data)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
    
    if (request.action === 'checkLogin') {
        handleLoginCheck(request.data)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function handleLoginCheck({ subdomain }) {
    const response = await fetch(`https://${subdomain}.varejofacil.com/api/v1/eumesmo`);
    
    if (!response.ok) {
        throw new Error(`Status de login inválido: ${response.status}`);
    }
    
    return await response.json();
}

async function handleInvoiceSearch({ subdomain, invoiceNumber, invoiceType }) {
    let searchUrl;
    
    if (invoiceType === 'compra') {
        searchUrl = `https://${subdomain}.varejofacil.com/notaFiscalCompra/pesquisa?filtro.notaFiscal.numeroDoDocumento=${invoiceNumber}&filtro.skipPagina=0&filtro.pageSize=100&filtro.totalPagina=-1&filtro.ordem=DATADAEMISSAO&filtro.direcao=desc`;
    } else {
        searchUrl = `https://${subdomain}.varejofacil.com/notaFiscalVenda/pesquisar?null=null&filtro.notaFiscal.loja.codigo=&filtro.notaFiscal.pessoa.codigo=&filtro.notaFiscal.cliente.codigo=&filtro.intervaloEmissao.inicio=&filtro.intervaloEmissao.termino=&filtro.notaFiscal.serie=&filtro.notaFiscal.numeroDoDocumento=${invoiceNumber}&filtro.notaFiscal.chaveDaNfe=&filtro.intervaloEntrada.inicio=&filtro.intervaloEntrada.termino=&filtro.skipPagina=0&filtro.pageSize=100&filtro.totalPagina=-1&filtro.ordem=DATADAEMISSAO&filtro.direcao=desc&_=${Date.now()}`;
    }
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
    }
    
    return await response.json();
}

async function handleInvoiceDownload({ subdomain, notaCodigo }) {
    const danfeUrl = `https://${subdomain}.varejofacil.com/notaFiscalVenda/danfe`;
    const formData = new URLSearchParams();
    formData.append('codigo', notaCodigo);

    const response = await fetch(danfeUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Erro ao gerar DANFE: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), ''));
    const dataUrl = `data:application/pdf;base64,${base64}`;
    
    const downloadId = await chrome.downloads.download({
        url: dataUrl,
        filename: `nota_fiscal_${notaCodigo}.pdf`
    });
    
    await chrome.tabs.create({ url: dataUrl });
    
    return { success: true, downloadId };
}
// Monitora mudanças na URL da aba ativa
chrome.tabs.onUpdated.addListener(checkUrlAndInjectScript);

// Também injeta quando a extensão é carregada em abas já abertas
chrome.runtime.onStartup.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            if (tab.url && tab.url.includes('varejofacil.com')) {
                checkUrlAndInjectScript(tab.id, {status: 'complete'}, tab);
            }
        });
    });
});
