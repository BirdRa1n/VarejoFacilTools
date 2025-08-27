(function () {
    let inputProduto = null;
    let inputLoja = null;
    let valoresArmazenados = {};
    let checkInterval = null;

    function getSubdomain() {
        const hostname = window.location.hostname;
        const parts = hostname.split(".");
        return parts.length > 2 ? parts[0] : null;
    }

    function findInputsInIframes() {
        const iframes = document.querySelectorAll("iframe");

        for (let iframe of iframes) {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const foundProduto = doc.querySelector("#codigoDoProduto");
                const foundLoja = doc.querySelector("#codigoDaLojaDaNota");

                if (foundProduto && !inputProduto) {
                    inputProduto = foundProduto;
                    console.log("✅ Input #codigoDoProduto encontrado.");
                    monitorEnterKey(inputProduto, "codigoDoProduto");
                }

                if (foundLoja && !inputLoja) {
                    inputLoja = foundLoja;
                    console.log("✅ Input #codigoDaLojaDaNota encontrado.");
                    monitorEnterKey(inputLoja, "codigoDaLojaDaNota");
                }

                if (inputProduto && inputLoja) {
                    clearInterval(checkInterval);
                    console.log("🚀 Ambos os inputs foram encontrados e estão sendo monitorados.");
                    return;
                }
            } catch (error) {
                console.error("⚠ Erro ao acessar iframe (possível restrição de CORS):", error);
            }
        }

        console.warn("❌ Inputs ainda não encontrados. Tentando novamente...");
    }

    function monitorEnterKey(input, key) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                valoresArmazenados[key] = input.value;
                console.log(`🔹 Usuário pressionou Enter no ${key}. Valor: ${input.value}`);

                if (key === "codigoDoProduto" && valoresArmazenados["codigoDaLojaDaNota"]) {
                    fetchProductData(input.value, valoresArmazenados["codigoDaLojaDaNota"]);
                }
            }
        });
    }

    async function fetchProductData(codigo, codigoLoja) {
        const subdomain = getSubdomain();
        if (!subdomain) {
            console.error("❌ Não foi possível obter o subdomínio.");
            return;
        }

        const url = `https://${subdomain}.varejofacil.com/produto/cadastro/pesquisa/simples/porCodigo?produto=${codigo}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Erro de autenticação. Verifique se está logado.");
                }
                if (response.status === 404) {
                    throw new Error("Produto não encontrado.");
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const dados = await response.json();
            const produtoId = dados?.id;
            if (!produtoId) {
                console.log("❌ Produto não encontrado!");
                return;
            }

            console.table(dados);
            await fetchProductPrices(produtoId, codigoLoja);
        } catch (error) {
            console.error("❌ Erro ao buscar os dados do produto:", error.message);
        }
    }

    async function fetchProductPrices(codigo, codigoLoja) {
        const subdomain = getSubdomain();
        if (!subdomain) {
            console.error("❌ Não foi possível obter o subdomínio.");
            return;
        }

        const url = `https://${subdomain}.varejofacil.com/api/v1/produto/precos?q=produtoId==${codigo}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Erro de autenticação. Verifique se está logado.");
                }
                if (response.status === 404) {
                    throw new Error("Produto não encontrado.");
                }
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();
            if (!data.items || data.items.length === 0) {
                console.log("🔍 Nenhuma informação de preço encontrada.");
                return;
            }

            console.log("✅ Preços do produto encontrados:");
            let custoCopiado = null;

            data.items.forEach((item) => {
                console.log(`🏬 Loja: ${item.lojaId} - 💰 Preço: R$${item.precoVenda1} - Custo: R$${item.custoProduto}`);
                console.table(item);

                if (String(item.lojaId) === String(codigoLoja)) {
                    custoCopiado = item.custoProduto;
                }
            });

            if (custoCopiado !== null) {
                copyToClipboard(custoCopiado);
                console.log(`📋 Preço de custo (R$${custoCopiado}) da loja ${codigoLoja} copiado para a área de transferência!`);
            } else {
                console.warn("⚠ Nenhum preço encontrado para a loja informada.");
            }
        } catch (error) {
            console.error("❌ Erro ao buscar os preços do produto:", error.message);
        }
    }

    function copyToClipboard(value) {
        const formattedValue = parseFloat(value).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        navigator.clipboard.writeText(formattedValue)
            .then(() => console.log(`📎 Preço de custo (${formattedValue}) copiado para a área de transferência!`))
            .catch(err => console.error("❌ Erro ao copiar para a área de transferência:", err));
    }

    // Função para reiniciar a busca de inputs
    function resetInputs() {
        inputProduto = null;
        inputLoja = null;
        valoresArmazenados = {};
        console.log("🔄 Reiniciando a busca pelos inputs.");
        clearInterval(checkInterval);
        checkInterval = setInterval(findInputsInIframes, 1000); // Reinicia a busca a cada 1 segundo
    }

    // Inicia a busca contínua pelos inputs
    resetInputs(); // Inicia ou reinicia a busca
})();