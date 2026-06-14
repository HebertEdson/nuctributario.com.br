# Consulta CNPJ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `nuctributario/public/consulta-cnpj.html` — ferramenta standalone que consulta dados cadastrais, regime tributário e processos judiciais de empresas brasileiras via CNPJ.

**Architecture:** Arquivo HTML único com CSS e JS inline. Duas chamadas paralelas: `cnpj.ws` (dados da empresa, sem auth) e DataJud CNJ (processos judiciais, requer API key configurada no arquivo). O resultado é renderizado como card com identidade visual do Núcleo Tributário (azul marinho `#1d3461`).

**Tech Stack:** HTML5, CSS3 vanilla, JavaScript ES2020 (fetch, Promise.all, template literals). APIs externas: `publica.cnpj.ws` (CORS livre) e `api-publica.datajud.cnj.jus.br` (auth via APIKey header).

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `nuctributario/public/consulta-cnpj.html` | Criar | Toda a ferramenta — HTML + CSS + JS |

Arquivo único. Cada task constrói sobre o estado anterior do arquivo.

---

## Task 1: Estrutura HTML base + CSS da identidade NT

**Files:**
- Create: `nuctributario/public/consulta-cnpj.html`

- [ ] **Criar o arquivo com a estrutura completa**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Consulta CNPJ — Núcleo Tributário</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --nt-blue: #1d3461;
    --nt-blue-light: #264a8a;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-400: #94a3b8;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-900: #0f172a;
    --green: #22c55e;
    --red: #ef4444;
    --amber: #f59e0b;
    --blue-badge-bg: #dbeafe;
    --blue-badge-fg: #1e40af;
  }

  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--gray-100);
    min-height: 100vh;
    color: var(--gray-900);
  }

  /* ── HEADER ── */
  .page-header {
    background: var(--nt-blue);
    padding: 28px 24px 0;
    text-align: center;
  }
  .page-header h1 {
    color: var(--white);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .page-header p {
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    margin-top: 4px;
  }

  /* ── SEARCH BAR ── */
  .search-wrap {
    background: var(--nt-blue);
    padding: 20px 16px 32px;
    display: flex;
    justify-content: center;
  }
  .search-box {
    background: var(--white);
    border-radius: 12px;
    display: flex;
    align-items: center;
    overflow: hidden;
    width: 100%;
    max-width: 560px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  .search-box input {
    flex: 1;
    border: none;
    outline: none;
    padding: 16px 20px;
    font-size: 17px;
    font-weight: 600;
    color: var(--nt-blue);
    letter-spacing: 1.5px;
    font-family: inherit;
  }
  .search-box input::placeholder {
    color: var(--gray-400);
    font-weight: 400;
    letter-spacing: 0;
  }
  .search-box button {
    background: var(--nt-blue);
    color: var(--white);
    border: none;
    padding: 0 24px;
    height: 56px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.3px;
    font-family: inherit;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .search-box button:hover { background: var(--nt-blue-light); }
  .search-box button:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── MAIN CONTAINER ── */
  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 16px 60px;
  }

  /* ── RESULT CARD ── */
  .card {
    background: var(--white);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.09);
    display: none;
  }
  .card.visible { display: block; }

  .card-hero {
    background: var(--nt-blue);
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    letter-spacing: 0.4px;
  }
  .badge-ativa { background: var(--green); color: var(--white); }
  .badge-baixada { background: var(--red); color: var(--white); }
  .badge-inapta { background: var(--amber); color: var(--white); }
  .card-since { color: rgba(255,255,255,0.6); font-size: 12px; }

  .card-empresa {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--gray-100);
  }
  .razao-social {
    font-size: 17px;
    font-weight: 800;
    color: var(--nt-blue);
    line-height: 1.25;
  }
  .nome-fantasia {
    font-size: 13px;
    color: var(--gray-600);
    margin-top: 4px;
  }
  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
    margin-top: 10px;
  }
  .meta-item { font-size: 12px; color: var(--gray-600); }
  .meta-item strong { color: var(--nt-blue); }

  /* ── SECTIONS ── */
  .section {
    padding: 16px 24px;
    border-bottom: 1px solid var(--gray-100);
  }
  .section:last-child { border-bottom: none; }
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--gray-400);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .field label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--gray-400);
    display: block;
    margin-bottom: 2px;
  }
  .field span {
    font-size: 14px;
    font-weight: 600;
    color: var(--nt-blue);
  }

  .regime-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--blue-badge-bg);
    color: var(--blue-badge-fg);
    font-size: 14px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: 8px;
  }

  .contact-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: var(--gray-700);
    margin-bottom: 8px;
  }
  .contact-row:last-child { margin-bottom: 0; }
  .contact-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

  .socio-row {
    background: var(--gray-50);
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  .socio-row:last-child { margin-bottom: 0; }
  .socio-nome { font-size: 13px; font-weight: 700; color: var(--nt-blue); }
  .socio-qual { font-size: 11px; color: var(--gray-600); margin-top: 2px; }

  .processo-row {
    background: #fef9ec;
    border-left: 3px solid var(--amber);
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  .processo-row:last-child { margin-bottom: 0; }
  .processo-num { font-size: 12px; font-weight: 700; color: var(--nt-blue); }
  .processo-meta { font-size: 11px; color: var(--gray-600); margin-top: 2px; }

  .empty-state {
    text-align: center;
    padding: 12px 0;
    color: var(--gray-400);
    font-size: 13px;
  }

  .datajud-notice {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 12px;
    color: #0369a1;
    line-height: 1.5;
  }
  .datajud-notice a { color: #0369a1; font-weight: 600; }

  /* ── SPINNER ── */
  .spinner-wrap {
    display: none;
    justify-content: center;
    align-items: center;
    padding: 48px 0;
    gap: 12px;
    color: var(--gray-600);
    font-size: 14px;
  }
  .spinner-wrap.visible { display: flex; }
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--gray-200);
    border-top-color: var(--nt-blue);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--gray-900);
    color: var(--white);
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    transition: transform 0.25s ease;
    z-index: 1000;
    white-space: nowrap;
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.error { background: var(--red); }
</style>
</head>
<body>

<div class="page-header">
  <h1>Consulta de CNPJ</h1>
  <p>Regime tributário, sócios e processos judiciais</p>
</div>

<div class="search-wrap">
  <div class="search-box">
    <input
      type="text"
      id="cnpjInput"
      placeholder="00.000.000/0000-00"
      maxlength="18"
      inputmode="numeric"
    >
    <button id="searchBtn" onclick="handleSearch()">
      🔍 Buscar
    </button>
  </div>
</div>

<div class="container">
  <div class="spinner-wrap" id="spinner">
    <div class="spinner"></div>
    Consultando...
  </div>

  <div class="card" id="resultCard">
    <!-- preenchido por renderCard() -->
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
  // ── CONFIGURAÇÃO ──────────────────────────────────────────
  const DATAJUD_API_KEY = ''; // coloque sua chave aqui: datajud.cnj.jus.br
  // ─────────────────────────────────────────────────────────
</script>

</body>
</html>
```

- [ ] **Abrir no navegador e conferir layout**

Abra `nuctributario/public/consulta-cnpj.html` diretamente no browser (file://). Deve aparecer: header azul, barra de busca com botão, fundo cinza claro. Nenhum card visível.

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: scaffold HTML + CSS da consulta CNPJ"
```

---

## Task 2: Formatação e validação do CNPJ

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html` — dentro do `<script>`

- [ ] **Adicionar funções de formatação e validação no `<script>`**

Substitua o bloco `<script>` atual por:

```html
<script>
  // ── CONFIGURAÇÃO ──────────────────────────────────────────
  const DATAJUD_API_KEY = ''; // coloque sua chave aqui: datajud.cnj.jus.br
  // ─────────────────────────────────────────────────────────

  const input = document.getElementById('cnpjInput');
  const searchBtn = document.getElementById('searchBtn');

  // Auto-formata enquanto digita: 00.000.000/0000-00
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5,8)+'/'+v.slice(8,12)+'-'+v.slice(12);
    else if (v.length > 8) v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5,8)+'/'+v.slice(8);
    else if (v.length > 5) v = v.slice(0,2)+'.'+v.slice(2,5)+'.'+v.slice(5);
    else if (v.length > 2) v = v.slice(0,2)+'.'+v.slice(2);
    input.value = v;
  });

  // Enter aciona busca
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Escapa strings da API antes de injetar em innerHTML — previne XSS
  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getRawCNPJ() {
    return input.value.replace(/\D/g, '');
  }

  function validateCNPJ(cnpj) {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false; // todos dígitos iguais

    const calc = (len) => {
      let sum = 0, pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += parseInt(cnpj[len - i]) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };

    return calc(12) === parseInt(cnpj[12]) && calc(13) === parseInt(cnpj[13]);
  }

  function handleSearch() {
    const raw = getRawCNPJ();
    if (!validateCNPJ(raw)) {
      showToast('CNPJ inválido — verifique os dígitos', true);
      return;
    }
    // busca implementada nas próximas tasks
    console.log('CNPJ válido:', raw);
  }
</script>
```

- [ ] **Testar no browser (console do DevTools — F12)**

```js
// No console do browser, com o arquivo aberto:
// 1. Digite 11.111.111/1111-11 no campo → deve rejeitar (todos iguais)
// 2. Digite 22.034.723/0001-44 → deve formatar automaticamente
// 3. Pressione Enter → console.log deve mostrar: "CNPJ válido: 22034723000144"
// 4. Clique Buscar com campo vazio → toast "CNPJ inválido" deve aparecer
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: formatação automática e validação matemática do CNPJ"
```

---

## Task 3: Toast de erro + spinner

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html` — adicionar funções no `<script>`

- [ ] **Adicionar funções de UI no `<script>`, após `handleSearch`**

```js
  // ── UI HELPERS ────────────────────────────────────────────

  const spinner = document.getElementById('spinner');
  const resultCard = document.getElementById('resultCard');
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg, isError = false) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
  }

  function setLoading(on) {
    searchBtn.disabled = on;
    spinner.classList.toggle('visible', on);
    if (on) resultCard.classList.remove('visible');
  }
```

- [ ] **Testar no browser (console do DevTools)**

```js
// No console:
showToast('Teste informativo');        // toast preto aparece e some
showToast('Erro de teste', true);      // toast vermelho aparece e some
setLoading(true);                      // spinner aparece, botão fica desabilitado
setLoading(false);                     // spinner some
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: spinner de carregamento e toast de feedback"
```

---

## Task 4: Fetch de dados da empresa (cnpj.ws)

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html`

- [ ] **Adicionar `fetchEmpresa` e `getTaxRegime` no `<script>`**

```js
  // ── API cnpj.ws ───────────────────────────────────────────

  async function fetchEmpresa(cnpj) {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
    if (res.status === 404) throw new Error('CNPJ não encontrado na Receita Federal.');
    if (!res.ok) throw new Error(`Erro ao consultar empresa (HTTP ${res.status}).`);
    return res.json();
  }

  function getTaxRegime(data) {
    const s = data.simples;
    if (s?.optante_mei) return { label: 'MEI', icon: '🟩' };
    if (s?.optante_simples) return { label: 'Simples Nacional', icon: '🟦' };
    const rt = data.regime_tributario;
    if (rt === '5' || rt === 5) return { label: 'Lucro Real', icon: '🟧' };
    if (rt === '3' || rt === 3) return { label: 'Lucro Presumido', icon: '🟨' };
    // Empresas sem opção declarada: presume Lucro Presumido (padrão Brasil)
    return { label: 'Lucro Presumido', icon: '🟨' };
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatPhone(phone) {
    if (!phone) return '—';
    const d = phone.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return phone;
  }

  function getSituacaoBadge(situacao) {
    const s = (situacao || '').toUpperCase();
    if (s.includes('ATIVA') || s === '02') return { cls: 'badge-ativa', label: '● Ativa' };
    if (s.includes('BAIXADA') || s === '08') return { cls: 'badge-baixada', label: '● Baixada' };
    return { cls: 'badge-inapta', label: '● ' + (situacao || 'Inapta') };
  }
```

- [ ] **Testar no browser (console)**

```js
// No console — requer conexão com internet:
fetchEmpresa('22034723000144').then(d => console.log(d));
// Deve retornar objeto com razao_social, simples, qsa, etc.

fetchEmpresa('00000000000000').catch(e => console.error(e.message));
// Deve mostrar: "CNPJ não encontrado na Receita Federal."
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: fetchEmpresa via cnpj.ws + lógica de regime tributário"
```

---

## Task 5: Renderizar card de resultado

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html`

- [ ] **Adicionar `renderCard` no `<script>`**

```js
  // ── RENDER ────────────────────────────────────────────────

  function renderCard(empresa, processos) {
    const sit = getSituacaoBadge(empresa.descricao_situacao_cadastral || empresa.situacao_cadastral);
    const regime = getTaxRegime(empresa);

    // Todos os valores da API passam por escapeHTML antes de entrar no innerHTML
    const enderecoPartes = [
      escapeHTML(empresa.logradouro),
      empresa.numero ? `, ${escapeHTML(empresa.numero)}` : '',
      empresa.complemento ? ` — ${escapeHTML(empresa.complemento)}` : '',
      empresa.bairro ? ` — ${escapeHTML(empresa.bairro)}` : '',
      empresa.municipio?.descricao ? ` — ${escapeHTML(empresa.municipio.descricao)}` : '',
      empresa.uf ? ` / ${escapeHTML(empresa.uf)}` : '',
      empresa.cep ? ` — ${escapeHTML(empresa.cep)}` : '',
    ].join('');

    const socios = (empresa.qsa || []).map(s => `
      <div class="socio-row">
        <div class="socio-nome">${escapeHTML(s.nome_socio || s.nome || '—')}</div>
        <div class="socio-qual">${escapeHTML(s.qualificacao_socio?.descricao || s.qualificacao || '')}</div>
      </div>
    `).join('') || '<div class="empty-state">Não informado</div>';

    const processosHTML = renderProcessos(processos);

    const ie = (empresa.inscricoes_estaduais || [])
      .map(i => escapeHTML(i.inscricao_estadual))
      .filter(Boolean)
      .join(', ') || '—';

    resultCard.innerHTML = `
      <div class="card-hero">
        <span class="badge ${sit.cls}">${escapeHTML(sit.label)}</span>
        <span class="card-since">Desde ${escapeHTML(formatDate(empresa.data_inicio_atividade))}</span>
      </div>

      <div class="card-empresa">
        <div class="razao-social">${escapeHTML(empresa.razao_social || '—')}</div>
        ${empresa.nome_fantasia ? `<div class="nome-fantasia">Nome Fantasia: ${escapeHTML(empresa.nome_fantasia)}</div>` : ''}
        <div class="meta-row">
          <span class="meta-item"><strong>CNPJ:</strong> ${escapeHTML(input.value)}</span>
          ${ie !== '—' ? `<span class="meta-item"><strong>IE:</strong> ${ie}</span>` : ''}
          ${empresa.porte?.descricao ? `<span class="meta-item"><strong>Porte:</strong> ${escapeHTML(empresa.porte.descricao)}</span>` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">📊 Regime Tributário</div>
        <span class="regime-badge">${regime.icon} ${escapeHTML(regime.label)}</span>
      </div>

      <div class="section">
        <div class="section-title">👤 Sócio / Proprietário</div>
        ${socios}
      </div>

      <div class="section">
        <div class="section-title">📞 Informações de Contato</div>
        ${enderecoPartes ? `<div class="contact-row"><span class="contact-icon">📍</span>${enderecoPartes}</div>` : ''}
        ${empresa.ddd_telefone_1 ? `<div class="contact-row"><span class="contact-icon">📱</span>${escapeHTML(formatPhone(empresa.ddd_telefone_1))}</div>` : ''}
        ${empresa.email ? `<div class="contact-row"><span class="contact-icon">✉️</span>${escapeHTML(empresa.email.toLowerCase())}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">🏛️ Dados Cadastrais</div>
        <div class="grid2">
          <div class="field">
            <label>Natureza Jurídica</label>
            <span>${escapeHTML(empresa.natureza_juridica?.descricao || '—')}</span>
          </div>
          <div class="field">
            <label>Localização</label>
            <span>${escapeHTML(empresa.municipio?.descricao || '')} ${empresa.uf ? `/ ${escapeHTML(empresa.uf)}` : ''}</span>
          </div>
        </div>
        ${empresa.cnae_fiscal_descricao || empresa.cnae_fiscal
          ? `<div class="field" style="margin-top:12px">
               <label>Atividade Principal (CNAE)</label>
               <span style="font-size:13px">${escapeHTML(empresa.cnae_fiscal || '')} — ${escapeHTML(empresa.cnae_fiscal_descricao || '')}</span>
             </div>`
          : ''}
      </div>

      <div class="section">
        <div class="section-title">⚖️ Processos Judiciais</div>
        ${processosHTML}
      </div>
    `;

    resultCard.classList.add('visible');
  }
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: renderCard com todos os campos do resultado"
```

---

## Task 6: Fetch de processos judiciais (DataJud CNJ)

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html`

- [ ] **Adicionar mapa UF→tribunal e funções DataJud no `<script>`**

```js
  // ── DataJud CNJ ───────────────────────────────────────────

  // Mapeamento UF → código do tribunal estadual na API DataJud
  const UF_TO_TRIBUNAL = {
    AC:'tjac', AL:'tjal', AM:'tjam', AP:'tjap', BA:'tjba', CE:'tjce',
    DF:'tjdft', ES:'tjes', GO:'tjgo', MA:'tjma', MG:'tjmg', MS:'tjms',
    MT:'tjmt', PA:'tjpa', PB:'tjpb', PE:'tjpe', PI:'tjpi', PR:'tjpr',
    RJ:'tjrj', RN:'tjrn', RO:'tjro', RR:'tjrr', RS:'tjrs', SC:'tjsc',
    SE:'tjse', SP:'tjsp', TO:'tjto'
  };

  // Mapeamento UF → TRF regional
  const UF_TO_TRF = {
    AC:'trf1', AM:'trf1', AP:'trf1', BA:'trf1', GO:'trf1', MA:'trf1',
    MG:'trf6', MT:'trf1', PA:'trf1', PI:'trf1', RO:'trf1', RR:'trf1',
    DF:'trf1', TO:'trf1',
    ES:'trf2', RJ:'trf2',
    MS:'trf3', SP:'trf3',
    PR:'trf4', RS:'trf4', SC:'trf4',
    AL:'trf5', CE:'trf5', PB:'trf5', PE:'trf5', RN:'trf5', SE:'trf5'
  };

  async function queryDataJud(tribunal, cnpj) {
    const url = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${DATAJUD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: 10,
        query: {
          nested: {
            path: 'partes',
            query: {
              term: { 'partes.cpfCnpj': cnpj }
            }
          }
        },
        _source: ['numeroProcesso', 'tribunal', 'orgaoJulgador', 'classe', 'dataHoraUltimaAtualizacao']
      })
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.hits?.hits?.map(h => h._source) || [];
  }

  async function fetchProcessos(cnpj, uf) {
    if (!DATAJUD_API_KEY) return null; // null = chave não configurada

    const tribunals = [];
    if (UF_TO_TRIBUNAL[uf]) tribunals.push(UF_TO_TRIBUNAL[uf]);
    if (UF_TO_TRF[uf]) tribunals.push(UF_TO_TRF[uf]);

    const results = await Promise.allSettled(
      tribunals.map(t => queryDataJud(t, cnpj))
    );

    return results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value);
  }

  function renderProcessos(processos) {
    if (processos === null) {
      return `
        <div class="datajud-notice">
          🔑 Para consultar processos judiciais, adicione sua chave gratuita do DataJud
          no início do arquivo (<code>DATAJUD_API_KEY</code>).<br>
          Cadastre em <a href="https://datajud-wiki.cnj.jus.br/api-publica/acesso" target="_blank" rel="noopener">datajud.cnj.jus.br</a>.
        </div>`;
    }
    if (!processos.length) {
      return '<div class="empty-state">Nenhum processo ativo encontrado nos tribunais consultados.</div>';
    }
    return processos.map(p => {
      const num = escapeHTML(p.numeroProcesso || '—');
      const trib = escapeHTML(p.tribunal || p.orgaoJulgador?.nome || '—');
      const updated = p.dataHoraUltimaAtualizacao
        ? escapeHTML(formatDate(p.dataHoraUltimaAtualizacao.slice(0, 10))) : '';
      return `
        <div class="processo-row">
          <div>
            <div class="processo-num">${num}</div>
            <div class="processo-meta">${trib}${updated ? ' · Atualizado: ' + updated : ''}</div>
          </div>
        </div>`;
    }).join('');
  }
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: integração DataJud CNJ para processos judiciais"
```

---

## Task 7: Orquestrar busca completa em `handleSearch`

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html` — substituir `handleSearch`

- [ ] **Substituir a função `handleSearch` pela versão completa**

Localize `function handleSearch()` e substitua por:

```js
  async function handleSearch() {
    const raw = getRawCNPJ();
    if (!validateCNPJ(raw)) {
      showToast('CNPJ inválido — verifique os dígitos', true);
      return;
    }

    setLoading(true);
    try {
      const [empresa, processos] = await Promise.all([
        fetchEmpresa(raw),
        // processos: passamos null de UF até termos os dados da empresa
        Promise.resolve([])
      ]);

      // Agora que temos a UF, buscamos os processos em paralelo
      const uf = empresa.uf || '';
      const processosReais = await fetchProcessos(raw, uf);

      renderCard(empresa, processosReais);
    } catch (err) {
      showToast(err.message || 'Erro ao consultar. Verifique sua conexão.', true);
    } finally {
      setLoading(false);
    }
  }
```

- [ ] **Testar o fluxo completo no browser**

```
1. Digite: 22.034.723/0001-44  → pressione Enter
   Esperado: spinner aparece → card renderiza com todos os dados
   (processos: aviso de chave se DATAJUD_API_KEY vazio)

2. Digite: 00.000.000/0000-00  → clique Buscar
   Esperado: toast vermelho "CNPJ inválido — verifique os dígitos"

3. Digite: 12.345.678/0001-95 (CNPJ inexistente, dígitos válidos)
   Esperado: toast "CNPJ não encontrado na Receita Federal."

4. Com DATAJUD_API_KEY preenchida, digitar CNPJ real com processo conhecido
   Esperado: processos aparecem no card com número e tribunal
```

- [ ] **Commit**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: orquestra busca paralela empresa + processos com tratamento de erro"
```

---

## Task 8: Ajuste final — campo de endereço e telefone da cnpj.ws

**Context:** A API cnpj.ws retorna o endereço em campos como `logradouro`, `numero`, `bairro`, `municipio.descricao`, `uf`, `cep`. O telefone vem em `ddd_telefone_1` como string sem separadores (ex: `"8897255894"`). Verificar mapeamento.

**Files:**
- Modify: `nuctributario/public/consulta-cnpj.html`

- [ ] **Logar resposta real da API e confirmar nomes de campos**

```js
// No console do browser após uma busca bem-sucedida:
fetchEmpresa('22034723000144').then(d => {
  console.log('telefone:', d.ddd_telefone_1);
  console.log('municipio:', d.municipio);
  console.log('logradouro:', d.logradouro, d.numero, d.bairro, d.cep);
  console.log('qsa:', d.qsa);
  console.log('simples:', d.simples);
  console.log('regime_tributario:', d.regime_tributario);
  console.log('IE:', d.inscricoes_estaduais);
});
```

- [ ] **Se algum campo tiver nome diferente do esperado, corrigir em `renderCard` e `getTaxRegime`**

Campos a conferir e ajustar conforme necessário:

| Campo esperado | Alternativas comuns na API |
|---|---|
| `municipio.descricao` | `municipio` (string direta) |
| `descricao_situacao_cadastral` | `situacao_cadastral` |
| `porte.descricao` | `porte` (string direta) |
| `natureza_juridica.descricao` | `natureza_juridica` (string direta) |
| `cnae_fiscal_descricao` | `atividade_principal[0].text` |
| `cnae_fiscal` | `atividade_principal[0].code` |

- [ ] **Verificar responsividade no mobile (DevTools → Toggle Device)**

Redimensionar para 375px de largura. Grid de 2 colunas nos dados cadastrais deve empilhar se necessário. Adicionar ao CSS se precisar:

```css
@media (max-width: 480px) {
  .grid2 { grid-template-columns: 1fr; }
  .search-box button { padding: 0 16px; font-size: 13px; }
}
```

- [ ] **Commit final**

```bash
git add nuctributario/public/consulta-cnpj.html
git commit -m "feat: consulta-cnpj.html completa — dados, regime tributário e processos"
```

---

## Notas de Configuração para o Usuário

Após a implementação, o usuário precisa de uma única ação para ativar os processos judiciais:

1. Acessar [datajud.cnj.jus.br](https://datajud-wiki.cnj.jus.br/api-publica/acesso) e registrar gratuitamente
2. Copiar a API Key fornecida
3. No arquivo `consulta-cnpj.html`, linha `const DATAJUD_API_KEY = '';`, inserir a chave entre as aspas
4. Salvar e reabrir — processos passam a aparecer automaticamente

---

## Self-Review

**Spec coverage:**
- ✅ Campo standalone HTML → Task 1
- ✅ Formatação automática CNPJ → Task 2
- ✅ Validação matemática → Task 2
- ✅ Enter aciona busca → Task 2
- ✅ Spinner de carregamento → Task 3
- ✅ Toast de erro → Task 3
- ✅ Razão Social, Nome Fantasia, CNPJ, IE, Porte → Task 5
- ✅ Situação + data abertura → Task 5
- ✅ Regime tributário (Simples/MEI/Lucro Real/Presumido) → Task 4 + 5
- ✅ Sócios / Proprietário (QSA) → Task 5
- ✅ Telefone, Email, Endereço → Task 5
- ✅ Natureza Jurídica, Município/UF, CNAE → Task 5
- ✅ Processos DataJud → Task 6
- ✅ Aviso quando chave ausente → Task 6
- ✅ Identidade NT (#1d3461) → Task 1
- ✅ Responsividade mobile → Task 8

**Placeholder scan:** Nenhum TBD ou TODO. A constante `DATAJUD_API_KEY = ''` é intencional.

**Segurança:** Função `escapeHTML()` definida na Task 2 e aplicada em todos os pontos onde dados da API são injetados via `innerHTML` nas Tasks 5 e 6 — previne XSS caso a API retorne conteúdo inesperado.

**Type consistency:** `renderCard(empresa, processos)` definida na Task 5 e chamada na Task 7 com a mesma assinatura. `fetchProcessos` retorna `null` (sem chave) ou `[]`/array de processos — `renderProcessos` trata os dois casos.
