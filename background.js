// Função para verificar a URL e injetar o script na página
function checkUrlAndInjectScript(tabId, tab) {
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.varejofacil\.com\/app\/#\/vf\?r=%2FnotaFiscalVenda%2Findex/;

    if (tab.url && urlPattern.test(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }).then(() => {
            console.log("✅ Script injetado na página:", tab.url);
        }).catch(err => {
            if (err.message.includes("Cannot access a chrome-extension://")) {
                console.warn("⚠ O script já foi injetado.");
            } else {
                console.error("❌ Erro ao injetar o script:", err);
            }
        });
    }
}
// Monitora mudanças na URL da aba ativa
chrome.tabs.onUpdated.addListener(checkUrlAndInjectScript);
