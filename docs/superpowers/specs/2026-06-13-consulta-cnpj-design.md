# Design: Ferramenta de Consulta de CNPJ

**Data:** 2026-06-13  
**Projeto:** Núcleo Tributário  
**Tipo:** Arquivo HTML standalone

---

## Objetivo

Criar uma ferramenta standalone (único arquivo `.html`) para consultar dados cadastrais e tributários de empresas brasileiras via CNPJ. A ferramenta exibe regime tributário, sócios, contato, dados cadastrais e processos judiciais.

---

## Decisões de Design

| Decisão | Escolha | Razão |
|---|---|---|
| Tipo de entrega | Arquivo `.html` standalone | Sem necessidade de servidor; funciona em qualquer máquina |
| Identidade visual | Núcleo Tributário (azul marinho `#1d3461`) | Consistência com o projeto existente |
| API de dados | cnpj.ws (pública, gratuita, CORS) | Sem autenticação, confiável, cobre todos os campos necessários |
| API de processos | DataJud CNJ (gratuita, requer chave) | Dados oficiais de todos os tribunais do Brasil |

---

## Campos Exibidos

### Cabeçalho do Card
- **Situação cadastral** (badge: Ativa / Baixada / Inapta)
- **Data de abertura** — "Desde dd/mm/aaaa"

### Identificação da Empresa
- Razão Social
- Nome Fantasia
- CNPJ (formatado)
- Inscrição Estadual
- Porte (ME / EPP / Grande)

### Regime Tributário
- Determinado pela combinação de campos da cnpj.ws:
  - `simples.optante_simples = true` → **Simples Nacional**
  - `simples.optante_mei = true` → **MEI**
  - Campo `regime_tributario` da API → **Lucro Real** ou **Lucro Presumido**
  - Fallback quando nenhum sinal disponível → **Lucro Presumido** (padrão para empresas sem opção declarada)

### Sócio / Proprietário
- Nome completo (campo `qsa[].nome_socio`)
- Qualificação (ex: Sócio-Administrador, Empresário Individual)
- CPF parcialmente mascarado (quando disponível)

### Informações de Contato
- Endereço completo (logradouro, número, bairro, município, UF, CEP)
- Telefone 1
- E-mail

### Dados Cadastrais
- Natureza Jurídica
- Município / Estado
- Atividade Principal — CNAE (código + descrição)

### Processos Judiciais (DataJud CNJ)
- Número do processo (formatado)
- Tribunal e vara
- Fase processual
- Data da última atualização
- Se nenhum processo encontrado: mensagem "Nenhum processo ativo encontrado"
- Se a chave DataJud não estiver configurada: mensagem orientando o usuário a cadastrar em datajud.cnj.jus.br

> **Escopo de busca:** A API DataJud tem endpoints por tribunal (ex: `api_publica_tjce`, `api_publica_tjsp`). Para evitar dezenas de requisições paralelas, a busca consultará o tribunal do estado da empresa (UF obtida via cnpj.ws) + TRF da região correspondente. Cobre a maioria dos casos práticos.

---

## Arquitetura

```
consulta-cnpj.html
│
├── CSS inline — paleta NT (#1d3461, branco, cinzas)
├── HTML — estrutura do card de resultado
└── JS inline
    ├── formatCNPJ(value)          — formata enquanto digita (00.000.000/0000-00)
    ├── validateCNPJ(cnpj)         — validação matemática dos dígitos verificadores
    ├── fetchEmpresa(cnpj)         — GET https://publica.cnpj.ws/cnpj/{cnpj}
    ├── fetchProcessos(cnpj)       — POST DataJud CNJ API (busca por CPF/CNPJ do processo)
    ├── getTaxRegime(data)         — interpreta campos simples/mei/regime_tributario
    ├── renderCard(data, processos) — constrói o HTML do resultado
    └── showError(msg)             — exibe toast de erro estilizado
```

### Fluxo de uma busca
1. Usuário digita CNPJ (auto-formatado a cada tecla)
2. Clica em Buscar ou pressiona Enter
3. Validação local dos dígitos verificadores — erro imediato se inválido
4. Spinner de carregamento aparece
5. Chamadas paralelas: `fetchEmpresa` + `fetchProcessos`
6. Card renderizado com todos os dados
7. Em caso de CNPJ não encontrado na API: mensagem de erro no lugar do card

### Tratamento de erros
| Situação | Comportamento |
|---|---|
| CNPJ com formato inválido | Toast "CNPJ inválido — verifique os dígitos" |
| CNPJ não encontrado (404) | Mensagem inline no card |
| Erro de rede / timeout | Toast "Erro ao consultar. Verifique sua conexão." |
| Chave DataJud ausente | Seção de processos exibe aviso de configuração |
| DataJud sem resultado | Mensagem "Nenhum processo ativo encontrado" |

---

## Interações

- **Auto-formatação** do CNPJ enquanto digita
- **Enter** aciona a busca (além do botão)
- **Botão Buscar** desabilitado durante carregamento
- Spinner animado durante a consulta
- Campo limpo a cada nova busca ativa

---

## Configuração da Chave DataJud

O arquivo terá uma constante no topo do `<script>`:

```js
const DATAJUD_API_KEY = 'SUA_CHAVE_AQUI';
```

Quando vazia, a seção de processos exibe um aviso com link para cadastro no CNJ. Sem necessidade de backend.

---

## Arquivo de Saída

- **Caminho:** `nuctributario/public/consulta-cnpj.html`  
- Acessível em `http://localhost:3000/consulta-cnpj` quando o servidor NT estiver rodando  
- Também abre diretamente no navegador como arquivo local (`file://`)

---

## Fora de Escopo

- Histórico de buscas
- Exportar resultado em PDF/CSV
- Autenticação ou controle de acesso
- Integração com o dashboard de métricas NT
