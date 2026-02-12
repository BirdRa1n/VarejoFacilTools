// Script para carregar imagens externas de produtos
(function () {
    'use strict';

    console.log('🚀 Product Image Loader iniciado');

    const IMAGE_SOURCES = [
        (ean) => `https://cdn-cosmos.bluesoft.com.br/products/${ean.slice(1)}`,
        (ean) => `http://www.dataload.com.br:9000/api/gtin/${ean.slice(1)}`
    ];

    function getEANCodes() {
        const eanCodes = [];
        const rows = document.querySelectorAll('#gridProdutoAux tbody tr:not(.jqgfirstrow)');
        
        console.log(`📊 Encontradas ${rows.length} linhas na tabela`);

        rows.forEach(row => {
            const tipoCell = row.querySelector('td[aria-describedby="gridProdutoAux_tipo"]');
            const codigoCell = row.querySelector('td[aria-describedby="gridProdutoAux_codigoAux"]');

            if (tipoCell && codigoCell && tipoCell.textContent.trim() === 'EAN') {
                const ean = codigoCell.textContent.trim();
                if (ean) eanCodes.push(ean);
            }
        });

        return eanCodes;
    }

    async function tryLoadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    async function loadExternalImage() {
        const imgElement = document.getElementById('imgProduto');
        console.log('🖼️ Elemento imgProduto:', imgElement ? 'encontrado' : 'NÃO encontrado');
        
        if (!imgElement) return;

        const eanCodes = getEANCodes();
        if (eanCodes.length === 0) {
            console.log('❌ Nenhum código EAN encontrado');
            return;
        }

        console.log(`🔍 Códigos EAN encontrados: ${eanCodes.join(', ')}`);

        for (const ean of eanCodes) {
            for (const sourceFunc of IMAGE_SOURCES) {
                const url = sourceFunc(ean);
                console.log(`🔄 Tentando carregar imagem: ${url}`);

                const validUrl = await tryLoadImage(url);
                if (validUrl) {
                    imgElement.src = validUrl;
                    console.log(`✅ Imagem carregada com sucesso: ${validUrl}`);
                    return;
                }
            }
        }

        console.log('⚠️ Nenhuma imagem externa encontrada');
    }

    function init() {
        console.log('🔧 Inicializando...');
        setTimeout(loadExternalImage, 2000);

        const targetNode = document.querySelector('#gview_gridProdutoAux');
        if (targetNode) {
            console.log('👀 Observer configurado na tabela');
            const observer = new MutationObserver(() => loadExternalImage());
            observer.observe(targetNode, { childList: true, subtree: true });
        } else {
            console.log('⚠️ Tabela #gview_gridProdutoAux não encontrada');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
