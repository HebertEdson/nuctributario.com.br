// ─── PERFORMANCE OPTIMIZATION: DOM CACHE ───
const DOM_CACHE = {
  totalVisitors: null,
  totalVisits: null,
  totalDocuments: null,
  totalPartners: null,
  totalCTAs: null,
  conversionRate: null,
  avgSession: null,
  totalClicks: null,
  clicksChart: null,
  pagesChart: null,
  documentsTable: null,
  partnersTable: null,
  eventsTable: null,
  updateTime: null,
  anAvgSession: null,
  anTotalSessions: null,
  anMaxSession: null,
};

function initDOMCache() {
  DOM_CACHE.totalVisitors    = document.getElementById('total-visitors');
  DOM_CACHE.totalVisits      = document.getElementById('total-visits');
  DOM_CACHE.totalDocuments   = document.getElementById('total-documents');
  DOM_CACHE.totalPartners    = document.getElementById('total-partners');
  DOM_CACHE.totalCTAs        = document.getElementById('total-ctas');
  DOM_CACHE.conversionRate   = document.getElementById('conversion-rate');
  DOM_CACHE.avgSession       = document.getElementById('avg-session');
  DOM_CACHE.totalClicks      = document.getElementById('total-clicks');
  DOM_CACHE.clicksChart      = document.getElementById('clicks-chart');
  DOM_CACHE.pagesChart       = document.getElementById('pages-chart');
  DOM_CACHE.documentsTable   = document.getElementById('documents-table');
  DOM_CACHE.partnersTable    = document.getElementById('partners-table');
  DOM_CACHE.eventsTable      = document.getElementById('events-table');
  DOM_CACHE.updateTime       = document.getElementById('update-time');
  DOM_CACHE.anAvgSession     = document.getElementById('an-avg-session');
  DOM_CACHE.anTotalSessions  = document.getElementById('an-total-sessions');
  DOM_CACHE.anMaxSession     = document.getElementById('an-max-session');
}

function formatDuration(secs) {
  if (!secs || secs <= 0) return '—';
  if (secs < 60) return secs + 's';
  const m = Math.floor(secs / 60), s = secs % 60;
  return m + 'min' + (s ? ' ' + s + 's' : '');
}

// ─── PERFORMANCE OPTIMIZATION: CHART MEMOIZATION ───
const CHART_CACHE = new Map();

function getCachedChart(cacheKey, generateFn) {
  if (CHART_CACHE.has(cacheKey)) {
    return CHART_CACHE.get(cacheKey);
  }
  const result = generateFn();
  CHART_CACHE.set(cacheKey, result);
  return result;
}

// ─── PERFORMANCE OPTIMIZATION: DATE FORMATTER CACHE ───
const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

const dateCache = new Map();

function formatDate(dateString) {
  if (!dateString) return '-';

  if (dateCache.has(dateString)) {
    return dateCache.get(dateString);
  }

  const date = new Date(dateString);
  const formatted = DATE_FORMATTER.format(date);
  dateCache.set(dateString, formatted);
  return formatted;
}

// ─── PERFORMANCE OPTIMIZATION: TAB NAVIGATION ───
const TAB_CACHE = {
  navItems: null,
  tabElements: null,
  activeNavItem: null,
  activeTab: null
};

function setupTabs() {
  TAB_CACHE.navItems = document.querySelectorAll('.nav-item');
  TAB_CACHE.tabElements = document.querySelectorAll('.tab-content');

  TAB_CACHE.navItems.forEach(item => {
    item.addEventListener('click', handleTabClick);
  });
}

function handleTabClick(e) {
  e.preventDefault();
  const newNavItem = e.currentTarget;
  const tabId = newNavItem.getAttribute('data-tab');
  const newTab = document.getElementById(tabId);

  if (!newTab) return;

  // Remove previous active states
  if (TAB_CACHE.activeNavItem) TAB_CACHE.activeNavItem.classList.remove('active');
  if (TAB_CACHE.activeTab) TAB_CACHE.activeTab.classList.remove('active');

  // Add new active states
  newNavItem.classList.add('active');
  newTab.classList.add('active');

  // Update cache
  TAB_CACHE.activeNavItem = newNavItem;
  TAB_CACHE.activeTab = newTab;
}

// ─── PERFORMANCE OPTIMIZATION: INTERVAL MANAGEMENT ───
let metricsIntervalId = null;

function startMetricsInterval() {
  metricsIntervalId = setInterval(loadMetrics, 30000);
}

function stopMetricsInterval() {
  if (metricsIntervalId) {
    clearInterval(metricsIntervalId);
    metricsIntervalId = null;
  }
}

// ─── DASHBOARD INITIALIZATION ───
document.addEventListener('DOMContentLoaded', () => {
  initDOMCache();
  loadMetrics();
  setupTabs();

  // Auto-refresh metrics every 30 seconds
  startMetricsInterval();

  // Cleanup ao sair
  window.addEventListener('beforeunload', () => {
    stopMetricsInterval();
  });

  // Pausar quando aba não está ativa
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopMetricsInterval();
    } else {
      startMetricsInterval();
      loadMetrics(); // Recarregar imediatamente
    }
  });
});

// ─── LOAD METRICS ───
async function loadMetrics() {
  try {
    const [metrics, documents, partners, events, sessions] = await Promise.all([
      fetch('/api/metrics').then(r => r.json()),
      fetch('/api/documents/recent').then(r => r.json()),
      fetch('/api/partners/recent').then(r => r.json()),
      fetch('/api/events/recent?limit=100').then(r => r.json()),
      fetch('/api/sessions/stats').then(r => r.json()),
    ]);

    updateMetrics(metrics, sessions);
    updateDocumentsTable(documents);
    updatePartnersTable(partners);
    updateEventsTable(events);
    updateSessionStats(sessions);
    updateCharts(metrics);
    updateLastUpdate();
  } catch (error) {
    console.error('Error loading metrics:', error);
  }
}

// ─── UPDATE METRICS ───
function updateMetrics(metrics, sessions) {
  const conversions = metrics.totalDocuments + metrics.totalPartners + metrics.totalCTAs;
  const rate = metrics.totalVisitors > 0
    ? ((conversions / metrics.totalVisitors) * 100).toFixed(1)
    : 0;

  const totalClicks = (metrics.clicksByElement || []).reduce((s, i) => s + i.count, 0);

  DOM_CACHE.totalVisitors.textContent  = metrics.totalVisitors.toLocaleString('pt-BR');
  DOM_CACHE.totalVisits.textContent    = metrics.totalVisits.toLocaleString('pt-BR');
  DOM_CACHE.totalDocuments.textContent = metrics.totalDocuments.toLocaleString('pt-BR');
  DOM_CACHE.totalPartners.textContent  = metrics.totalPartners.toLocaleString('pt-BR');
  DOM_CACHE.totalCTAs.textContent      = metrics.totalCTAs.toLocaleString('pt-BR');
  DOM_CACHE.conversionRate.textContent = rate + '%';
  DOM_CACHE.totalClicks.textContent    = totalClicks.toLocaleString('pt-BR');
  if (DOM_CACHE.avgSession && sessions) {
    DOM_CACHE.avgSession.textContent = formatDuration(sessions.avg);
  }
}

// ─── UPDATE SESSION STATS (aba Analytics) ───
function updateSessionStats(sessions) {
  if (!sessions) return;
  if (DOM_CACHE.anAvgSession)    DOM_CACHE.anAvgSession.textContent    = formatDuration(sessions.avg);
  if (DOM_CACHE.anTotalSessions) DOM_CACHE.anTotalSessions.textContent = sessions.total.toLocaleString('pt-BR');
  if (DOM_CACHE.anMaxSession)    DOM_CACHE.anMaxSession.textContent    = formatDuration(sessions.max);
}

// ─── UPDATE EVENTS TABLE ───
const TYPE_LABELS = {
  pageview:     { icon: '📄', label: 'Pageview',     cor: '#0369a1' },
  click:        { icon: '🖱️', label: 'Clique',       cor: '#7c3aed' },
  scroll:       { icon: '📜', label: 'Scroll',        cor: '#065f46' },
  session:      { icon: '⏱️', label: 'Sessão',        cor: '#b45309' },
  section_view: { icon: '👁️', label: 'Seção vista',  cor: '#1d3461' },
};

function updateEventsTable(events) {
  if (!events || events.length === 0) {
    DOM_CACHE.eventsTable.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum evento registrado ainda. Acesse o site para gerar dados.</td></tr>';
    return;
  }
  DOM_CACHE.eventsTable.innerHTML = events.map(ev => {
    const t = TYPE_LABELS[ev.type] || { icon: '•', label: ev.type, cor: '#475569' };
    return `
      <tr>
        <td><span style="background:${t.cor}15;color:${t.cor};padding:2px 8px;border-radius:20px;font-size:0.8rem;font-weight:600;">${t.icon} ${t.label}</span></td>
        <td style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${ev.element || '-'}">${ev.element || '-'}</td>
        <td>${ev.page || '/'}</td>
        <td style="font-family:monospace;font-size:0.82rem;">${ev.ip_address || '-'}</td>
        <td>${formatDate(ev.timestamp)}</td>
      </tr>`;
  }).join('');
}

// ─── UPDATE DOCUMENTS TABLE ───
function updateDocumentsTable(documents) {
  if (!documents || documents.length === 0) {
    DOM_CACHE.documentsTable.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum documento enviado ainda</td></tr>';
    return;
  }

  DOM_CACHE.documentsTable.innerHTML = documents.map(doc => `
    <tr>
      <td>${doc.empresa || '-'}</td>
      <td>${doc.email || '-'}</td>
      <td>${doc.telefone || '-'}</td>
      <td>${doc.cnpj || '-'}</td>
      <td>${formatDate(doc.data_envio)}</td>
    </tr>
  `).join('');
}

// ─── UPDATE PARTNERS TABLE ───
function updatePartnersTable(partners) {
  if (!partners || partners.length === 0) {
    DOM_CACHE.partnersTable.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum parceiro cadastrado ainda</td></tr>';
    return;
  }

  DOM_CACHE.partnersTable.innerHTML = partners.map(partner => `
    <tr>
      <td>${partner.nome || '-'}</td>
      <td>${partner.email || '-'}</td>
      <td>${partner.telefone || '-'}</td>
      <td>${partner.profissao || '-'}</td>
      <td>${partner.estado || '-'}</td>
      <td>${formatDate(partner.data_cadastro)}</td>
    </tr>
  `).join('');
}

// ─── UPDATE CHARTS (OTIMIZADO COM MEMOIZAÇÃO) ───
function updateCharts(metrics) {
  // ✅ PERFORMANCE: Memoized chart rendering
  updateChartSection('clicks-chart', metrics.clicksByElement, 'element', DOM_CACHE.clicksChart);
  updateChartSection('pages-chart', metrics.pageViews, 'page', DOM_CACHE.pagesChart);
}

function updateChartSection(elementId, data, labelKey, domElement) {
  const cacheKey = `${elementId}-${JSON.stringify(data)}`;

  if (CHART_CACHE.has(cacheKey)) {
    domElement.innerHTML = CHART_CACHE.get(cacheKey);
    return;
  }

  if (!data || data.length === 0) {
    const emptyHtml = '<p style="text-align: center; color: var(--muted);">Sem dados</p>';
    CHART_CACHE.set(cacheKey, emptyHtml);
    domElement.innerHTML = emptyHtml;
    return;
  }

  const maxValue = Math.max(...data.map(item => item.count));
  const html = data.slice(0, 5).map(item => {
    const label = item[labelKey] || '/';
    const percentage = (item.count / maxValue) * 100;
    return `
      <div class="chart-item">
        <div class="chart-label" title="${label}">${label}</div>
        <div class="chart-bar" style="width: ${percentage}%;">
          <div class="chart-value">${item.count}</div>
        </div>
      </div>
    `;
  }).join('');

  CHART_CACHE.set(cacheKey, html);
  domElement.innerHTML = html;
}

// ─── UPDATE LAST UPDATE TIME ───
function updateLastUpdate() {
  const now = new Date();
  DOM_CACHE.updateTime.textContent = now.toLocaleTimeString('pt-BR');
}
