/**
 * database.js — armazenamento em memória (sem dependências nativas)
 *
 * No Render free tier o filesystem é efêmero de qualquer forma.
 * Formulários críticos já chegam por email via Formspree.
 * O tracking acumula enquanto o servidor está ativo.
 */

// ─── Stores em memória ───────────────────────────────────────────────────────
const store = {
  events:   [],   // { id, type, page, element, timestamp, ip_address, user_agent }
  visitors: {},   // ip → { ip_address, first_visit, last_visit, visit_count }
  documents:[],   // { id, empresa, email, telefone, cnpj, data_envio }
  partners: [],   // { id, nome, email, ... data_cadastro }
  ctas:     [],   // { id, email, telefone, data_cta }
};
let nextId = { events: 1, documents: 1, partners: 1, ctas: 1 };

function now() { return new Date().toISOString(); }

// ─── trackEvent ──────────────────────────────────────────────────────────────
const trackEvent = (type, page, element, ipAddress, userAgent) => {
  const row = {
    id: nextId.events++,
    type, page, element,
    timestamp: now(),
    ip_address: ipAddress,
    user_agent: userAgent,
  };
  store.events.push(row);
  // Mantém apenas os 5000 eventos mais recentes para não estourar memória
  if (store.events.length > 5000) store.events.shift();
  return Promise.resolve(row.id);
};

// ─── trackVisitor ────────────────────────────────────────────────────────────
const trackVisitor = (ipAddress) => {
  if (store.visitors[ipAddress]) {
    store.visitors[ipAddress].last_visit = now();
    store.visitors[ipAddress].visit_count += 1;
  } else {
    store.visitors[ipAddress] = {
      ip_address: ipAddress,
      first_visit: now(),
      last_visit: now(),
      visit_count: 1,
    };
  }
  return Promise.resolve();
};

// ─── addDocument ─────────────────────────────────────────────────────────────
const addDocument = (empresa, email, telefone, cnpj) => {
  const row = { id: nextId.documents++, empresa, email, telefone, cnpj, data_envio: now() };
  store.documents.push(row);
  return Promise.resolve(row.id);
};

// ─── addPartner ──────────────────────────────────────────────────────────────
const addPartner = (nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
                    rede, motivacao, disponibilidade, linkedin) => {
  const row = {
    id: nextId.partners++,
    nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
    rede: rede || null, motivacao: motivacao || null,
    disponibilidade: disponibilidade || null, linkedin: linkedin || null,
    data_cadastro: now(),
  };
  store.partners.push(row);
  return Promise.resolve(row.id);
};

// ─── addCTA ──────────────────────────────────────────────────────────────────
const addCTA = (email, telefone) => {
  const row = { id: nextId.ctas++, email, telefone, data_cta: now() };
  store.ctas.push(row);
  return Promise.resolve(row.id);
};

// ─── getMetrics ──────────────────────────────────────────────────────────────
const getMetrics = () => {
  const visitors = Object.values(store.visitors);
  const totalVisits = visitors.reduce((s, v) => s + v.visit_count, 0);

  // Cliques por elemento
  const clickMap = {};
  store.events.filter(e => e.type === 'click').forEach(e => {
    clickMap[e.element] = (clickMap[e.element] || 0) + 1;
  });
  const clicksByElement = Object.entries(clickMap)
    .map(([element, count]) => ({ element, count }))
    .sort((a, b) => b.count - a.count);

  // Page views por página
  const pvMap = {};
  store.events.filter(e => e.type === 'pageview').forEach(e => {
    pvMap[e.page] = (pvMap[e.page] || 0) + 1;
  });
  const pageViews = Object.entries(pvMap)
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  return Promise.resolve({
    totalVisitors:  visitors.length,
    totalVisits,
    totalDocuments: store.documents.length,
    totalPartners:  store.partners.length,
    totalCTAs:      store.ctas.length,
    clicksByElement,
    pageViews,
  });
};

// ─── getRecentEvents ─────────────────────────────────────────────────────────
const getRecentEvents = (limit = 50) => {
  const rows = [...store.events]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
  return Promise.resolve(rows);
};

// ─── getSessionStats ─────────────────────────────────────────────────────────
const getSessionStats = () => {
  const durations = store.events
    .filter(e => e.type === 'session' && /^\d+s$/.test(e.element || ''))
    .map(e => parseInt(e.element))
    .filter(n => n > 0 && n < 7200);

  const avg = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  const max = durations.length ? Math.max(...durations) : 0;
  return Promise.resolve({ avg, max, total: durations.length });
};

// ─── getRecentDocuments ──────────────────────────────────────────────────────
const getRecentDocuments = (limit = 10) => {
  const rows = [...store.documents]
    .sort((a, b) => new Date(b.data_envio) - new Date(a.data_envio))
    .slice(0, limit);
  return Promise.resolve(rows);
};

// ─── getRecentPartners ───────────────────────────────────────────────────────
const getRecentPartners = (limit = 10) => {
  const rows = [...store.partners]
    .sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro))
    .slice(0, limit);
  return Promise.resolve(rows);
};

// ─── Exportações compatíveis com a interface anterior ────────────────────────
module.exports = {
  db: null, // mantido para compatibilidade (não usado)
  trackEvent,
  trackVisitor,
  addDocument,
  addPartner,
  addCTA,
  getMetrics,
  getRecentDocuments,
  getRecentPartners,
  getRecentEvents,
  getSessionStats,
};
