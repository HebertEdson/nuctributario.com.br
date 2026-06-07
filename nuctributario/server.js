require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const {
  trackEvent,
  trackVisitor,
  addDocument,
  addPartner,
  addCTA,
  getMetrics,
  getRecentDocuments,
  getRecentPartners,
  getRecentEvents,
  getSessionStats
} = require('./database');

const app = express();

// Multer para uploads de arquivo em memória
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Servir assets e arquivos públicos
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// URL do Formspree para emails
const FORMSPREE_URL = process.env.FORMSPREE_URL || 'https://formspree.io/f/mkoagwdj';

// Rastrear visitantes em todas as rotas
app.use((req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  trackVisitor(ip).catch(console.error);
  res.locals.ip = ip;
  next();
});

// ─── RASTREAMENTO DE EVENTOS ───
app.post('/api/track', async (req, res) => {
  try {
    const { type, page, element } = req.body;
    await trackEvent(type, page, element, res.locals.ip, req.headers['user-agent'] || '');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CTA ───
app.post('/api/cta', async (req, res) => {
  try {
    const { email, telefone } = req.body;
    await addCTA(email, telefone);
    await axios.post(FORMSPREE_URL, {
      subject: 'Nova Solicitação de Análise Tributária',
      from_email: email,
      message: `NOVA SOLICITAÇÃO\n\nEmail: ${email}\nTelefone: ${telefone}`
    });
    res.json({ success: true, message: 'Pedido enviado com sucesso!' });
  } catch (err) {
    console.error('Erro CTA:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao enviar pedido. Tente novamente.' });
  }
});

// ─── DOCUMENTOS (suporta JSON e multipart/form-data) ───
app.post('/api/documentos', upload.array('documentos'), async (req, res) => {
  try {
    // Aceita nomes de campos do HTML de produção e da versão antiga
    const empresa   = req.body['Razao Social'] || req.body.empresa    || '';
    const cnpj      = req.body.CNPJ            || req.body.cnpj       || '';
    const responsavel = req.body.Responsavel   || req.body.responsavel || '';
    const email     = req.body.Email           || req.body.email       || '';
    const telefone  = req.body.Telefone        || req.body.telefone    || '';
    const faturamento = req.body['Faturamento Anual'] || req.body.faturamento || 'Não informado';

    await addDocument(empresa, email, telefone, cnpj);

    const arquivos = req.files && req.files.length > 0
      ? 'Documentos anexados:\n' + req.files.map(f => `- ${f.originalname}`).join('\n')
      : 'Nenhum documento anexado';

    await axios.post(FORMSPREE_URL, {
      subject: `Novo Pedido de Análise - ${empresa}`,
      from_email: email,
      message: `NOVO PEDIDO DE ANÁLISE TRIBUTÁRIA\n\nEmpresa: ${empresa}\nResponsável: ${responsavel}\nCNPJ: ${cnpj}\nEmail: ${email}\nTelefone: ${telefone}\nFaturamento: ${faturamento}\n\n${arquivos}`
    });

    res.json({ success: true, message: 'Seus arquivos foram enviados com sucesso!' });
  } catch (err) {
    console.error('Erro documentos:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao enviar documentos. Tente novamente.' });
  }
});

// ─── PARCERIAS ───
app.post('/api/parcerias', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, profissao, experiencia, estado, cidade,
            rede, motivacao, disponibilidade, linkedin } = req.body;

    await addPartner(nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
                     rede, motivacao, disponibilidade, linkedin);

    await axios.post(FORMSPREE_URL, {
      subject: `Nova Candidatura de Parceria - ${nome}`,
      from_email: email,
      message: `NOVA CANDIDATURA DE PARCERIA\n\nNome: ${nome}\nCPF: ${cpf}\nEmail: ${email}\nTelefone: ${telefone}\nProfissão: ${profissao}\nExperiência: ${experiencia}\nEstado: ${estado}\nCidade: ${cidade}\nDisponibilidade: ${disponibilidade || 'Não informado'}\nLinkedIn: ${linkedin || 'Não informado'}\n\nRede de Contatos:\n${rede || 'Não informado'}\n\nMotivação:\n${motivacao || 'Não informado'}`
    });

    res.json({ success: true, message: 'Candidatura enviada com sucesso! Entraremos em contato em breve.' });
  } catch (err) {
    console.error('Erro parcerias:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao enviar candidatura. Tente novamente.' });
  }
});

// ─── NOTÍCIAS TRIBUTÁRIAS (RSS Google News com cache de 1h) ───
let noticiasCache = { data: null, timestamp: 0 };
const NOTICIAS_TTL = 60 * 60 * 1000; // 1 hora

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const bloco = match[1];
    const get = (tag) => {
      const m = bloco.match(new RegExp(`<${tag}(?:[^>]*)><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
               || bloco.match(new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const titulo = get('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const link   = get('link') || bloco.match(/<link\s*\/?>(.*?)<\/link>|<link>(.*?)<\/link>/)?.[1] || '';
    const data   = get('pubDate');
    const fonte  = get('source').replace(/<[^>]*>/g, '').trim() || 'Google News';
    // Extrai imagem das tags media do RSS (quando disponível)
    const imagem = bloco.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"[^>]*medium="image"/i)?.[1]
                || bloco.match(/<media:thumbnail[^>]+url="([^"]+)"/i)?.[1]
                || bloco.match(/<media:content[^>]+url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i)?.[1]
                || bloco.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/i)?.[1]
                || '';
    // Decodifica entidades ANTES de strip de tags (Google News pode usar &lt; em vez de CDATA)
    const descClean = get('description')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '')   // strip HTML após decode
      .replace(/\s+/g, ' ').trim();
    // Descarta se for só o título repetido, HTML residual ou texto muito curto
    const resumo = (descClean.length > 80 && !descClean.includes('<') && !descClean.startsWith(titulo.substring(0, 25))) ? descClean.substring(0, 240) : '';
    if (titulo && link) items.push({ titulo, link, data, fonte, resumo, imagem });
  }
  return items;
}

app.get('/api/noticias', async (req, res) => {
  try {
    const agora = Date.now();
    if (noticiasCache.data && (agora - noticiasCache.timestamp) < NOTICIAS_TTL) {
      return res.json(noticiasCache.data);
    }
    const query = encodeURIComponent('tributação OR "receita federal" OR ICMS OR "imposto" OR "reforma tributária" OR "crédito fiscal"');
    const url = `https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const response = await axios.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const noticias = parseRSS(response.data);
    noticiasCache = { data: noticias, timestamp: agora };
    res.json(noticias);
  } catch (err) {
    console.error('Erro ao buscar notícias:', err.message);
    // Retorna cache expirado se disponível, para não deixar o usuário sem nada
    if (noticiasCache.data) return res.json(noticiasCache.data);
    res.status(500).json([]);
  }
});

// ─── MÉTRICAS (admin) ───
app.get('/api/metrics', async (req, res) => {
  try {
    res.json(await getMetrics());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/recent', async (req, res) => {
  try {
    res.json(await getRecentDocuments(parseInt(req.query.limit) || 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/partners/recent', async (req, res) => {
  try {
    res.json(await getRecentPartners(parseInt(req.query.limit) || 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/recent', async (req, res) => {
  try {
    res.json(await getRecentEvents(parseInt(req.query.limit) || 50));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sessions/stats', async (req, res) => {
  try {
    res.json(await getSessionStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN DASHBOARD ───
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Dashboard em http://localhost:${PORT}/admin`);
});
