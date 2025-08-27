# VarejoFacilTools

Uma extensão do Chrome que automatiza a consulta de preços de produtos na plataforma VarejoFacil, copiando automaticamente o preço de custo para a área de transferência.

## 📋 Funcionalidades

- **Detecção Automática**: Monitora automaticamente páginas de nota fiscal de venda no VarejoFacil
- **Busca de Produtos**: Captura códigos de produto e loja quando o usuário pressiona Enter
- **Consulta de Preços**: Busca automaticamente informações de preço e custo do produto
- **Cópia Automática**: Copia o preço de custo da loja específica para a área de transferência
- **Formatação Brasileira**: Formata valores no padrão brasileiro (R$ 0,00)

## 🚀 Como Funciona

1. A extensão monitora URLs que correspondem ao padrão: `https://*.varejofacil.com/app/#/vf?r=%2FnotaFiscalVenda%2Findex`
2. Quando detecta a página correta, injeta um script que procura pelos campos:
   - `#codigoDoProduto` - Campo do código do produto
   - `#codigoDaLojaDaNota` - Campo do código da loja
3. Monitora quando o usuário pressiona Enter nesses campos
4. Faz requisições automáticas para buscar:
   - Dados do produto via `/produto/cadastro/pesquisa/simples/porCodigo`
   - Preços do produto via `/api/v1/produto/precos`
5. Copia automaticamente o preço de custo da loja específica para a área de transferência

## 📁 Estrutura do Projeto

```
VarejoFacilTools/
├── manifest.json          # Configurações da extensão
├── background.js          # Service worker (monitora URLs)
├── content.js            # Script injetado nas páginas
├── popup.html            # Interface do popup (básica)
├── icons/                # Ícones da extensão
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── LICENSE               # Licença do projeto
└── README.md            # Este arquivo
```

## 🔧 Instalação

### Instalação Manual (Modo Desenvolvedor)

1. Clone ou baixe este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto
6. A extensão será instalada e aparecerá na lista

### Permissões Necessárias

A extensão requer as seguintes permissões:
- `tabs` - Para monitorar mudanças de URL
- `activeTab` - Para acessar a aba ativa
- `scripting` - Para injetar scripts nas páginas
- `clipboardWrite` - Para copiar valores para a área de transferência
- `host_permissions` - Acesso a `https://*.varejofacil.com/*`

## 💻 Uso

1. Navegue até uma página de nota fiscal de venda no VarejoFacil
2. A extensão detectará automaticamente a página e injetará o script
3. Digite o código do produto no campo correspondente e pressione Enter
4. Digite o código da loja no campo correspondente e pressione Enter
5. A extensão buscará automaticamente os dados e copiará o preço de custo para a área de transferência
6. Cole o valor onde necessário (Ctrl+V)

## 🔍 Logs e Debugging

A extensão fornece logs detalhados no console do navegador:
- ✅ Confirmações de ações bem-sucedidas
- ⚠ Avisos sobre possíveis problemas
- ❌ Erros com descrições detalhadas
- 🔹 Informações sobre valores capturados
- 📋 Confirmação de cópia para área de transferência

Para visualizar os logs:
1. Pressione F12 para abrir as ferramentas de desenvolvedor
2. Vá para a aba "Console"
3. Use a extensão normalmente e observe os logs

## 🛠 Tecnologias Utilizadas

- **Manifest V3** - Versão mais recente do sistema de extensões do Chrome
- **JavaScript ES6+** - Linguagem principal
- **Chrome Extensions API** - APIs nativas do Chrome
- **Fetch API** - Para requisições HTTP
- **Clipboard API** - Para cópia automática

## ⚠ Limitações e Considerações

- Funciona apenas em páginas específicas do VarejoFacil
- Requer que o usuário esteja logado na plataforma
- Depende da estrutura HTML atual da plataforma (pode quebrar com atualizações)
- Funciona apenas com iframes acessíveis (sem restrições CORS)

## 🐛 Tratamento de Erros

A extensão trata diversos cenários de erro:
- **401/403**: Problemas de autenticação
- **404**: Produto não encontrado
- **CORS**: Restrições de acesso a iframes
- **Network**: Problemas de conectividade

## 📝 Logs de Exemplo

```
✅ Script injetado na página: https://exemplo.varejofacil.com/app/#/vf?r=%2FnotaFiscalVenda%2Findex
✅ Input #codigoDoProduto encontrado.
✅ Input #codigoDaLojaDaNota encontrado.
🔹 Usuário pressionou Enter no codigoDoProduto. Valor: 12345
🔹 Usuário pressionou Enter no codigoDaLojaDaNota. Valor: 001
✅ Preços do produto encontrados:
🏬 Loja: 001 - 💰 Preço: R$15.99 - Custo: R$8.50
📋 Preço de custo (R$8,50) da loja 001 copiado para a área de transferência!
```

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob os termos especificados no arquivo LICENSE.

## 🔄 Versão

**Versão Atual**: 1.0

---

**Nota**: Esta extensão foi desenvolvida para uso interno e automação de tarefas repetitivas na plataforma VarejoFacil. Use com responsabilidade e de acordo com os termos de uso da plataforma.
