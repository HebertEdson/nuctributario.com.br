const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'metrics.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Conectado ao banco de dados SQLite');
});

// Inicializar tabelas
db.serialize(() => {
  // Tabela de eventos (cliques, visualizações)
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      page TEXT,
      element TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `);

  // Tabela de visitantes
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT UNIQUE,
      first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
      visit_count INTEGER DEFAULT 1
    )
  `);

  // Tabela de documentos enviados
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa TEXT,
      email TEXT,
      telefone TEXT,
      cnpj TEXT,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de parceiros cadastrados
  db.run(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT,
      cpf TEXT,
      telefone TEXT,
      profissao TEXT,
      experiencia TEXT,
      estado TEXT,
      cidade TEXT,
      rede TEXT,
      motivacao TEXT,
      disponibilidade TEXT,
      linkedin TEXT,
      data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Adicionar colunas extras se o banco já existia sem elas
  ['rede', 'motivacao', 'disponibilidade', 'linkedin'].forEach(col => {
    db.run(`ALTER TABLE partners ADD COLUMN ${col} TEXT`, () => {});
  });

  // Tabela de CTA (Call To Action)
  db.run(`
    CREATE TABLE IF NOT EXISTS ctas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      telefone TEXT,
      data_cta DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Funções para registrar eventos
const trackEvent = (type, page, element, ipAddress, userAgent) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO events (type, page, element, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [type, page, element, ipAddress, userAgent],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const trackVisitor = (ipAddress) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO visitors (ip_address) VALUES (?)`,
      [ipAddress],
      (err) => {
        if (err) reject(err);
        else {
          // Atualizar última visita
          db.run(
            `UPDATE visitors SET last_visit = CURRENT_TIMESTAMP, visit_count = visit_count + 1
             WHERE ip_address = ?`,
            [ipAddress],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      }
    );
  });
};

const addDocument = (empresa, email, telefone, cnpj) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO documents (empresa, email, telefone, cnpj) VALUES (?, ?, ?, ?)`,
      [empresa, email, telefone, cnpj],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const addPartner = (nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
                    rede, motivacao, disponibilidade, linkedin) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO partners (nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
                             rede, motivacao, disponibilidade, linkedin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, cpf, telefone, profissao, experiencia, estado, cidade,
       rede || null, motivacao || null, disponibilidade || null, linkedin || null],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const addCTA = (email, telefone) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ctas (email, telefone) VALUES (?, ?)`,
      [email, telefone],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

// Funções para obter métricas
const getMetrics = () => {
  return new Promise((resolve, reject) => {
    const metrics = {};

    // Total de visitantes únicos
    db.get(`SELECT COUNT(*) as count FROM visitors`, (err, row) => {
      if (err) return reject(err);
      metrics.totalVisitors = row.count || 0;

      // Total de visitas
      db.get(`SELECT SUM(visit_count) as total FROM visitors`, (err, row) => {
        if (err) return reject(err);
        metrics.totalVisits = row.total || 0;

        // Total de documentos
        db.get(`SELECT COUNT(*) as count FROM documents`, (err, row) => {
          if (err) return reject(err);
          metrics.totalDocuments = row.count || 0;

          // Total de parceiros
          db.get(`SELECT COUNT(*) as count FROM partners`, (err, row) => {
            if (err) return reject(err);
            metrics.totalPartners = row.count || 0;

            // Total de CTAs
            db.get(`SELECT COUNT(*) as count FROM ctas`, (err, row) => {
              if (err) return reject(err);
              metrics.totalCTAs = row.count || 0;

              // Cliques por elemento
              db.all(
                `SELECT element, COUNT(*) as count FROM events WHERE type = 'click'
                 GROUP BY element ORDER BY count DESC`,
                (err, rows) => {
                  if (err) return reject(err);
                  metrics.clicksByElement = rows || [];

                  // Páginas mais visitadas
                  db.all(
                    `SELECT page, COUNT(*) as count FROM events WHERE type = 'pageview'
                     GROUP BY page ORDER BY count DESC`,
                    (err, rows) => {
                      if (err) return reject(err);
                      metrics.pageViews = rows || [];

                      resolve(metrics);
                    }
                  );
                }
              );
            });
          });
        });
      });
    });
  });
};

const getRecentEvents = (limit = 50) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT type, page, element, timestamp, ip_address FROM events ORDER BY timestamp DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

const getSessionStats = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT element FROM events WHERE type = 'session' AND element LIKE '%s'`,
      [],
      (err, rows) => {
        if (err) return reject(err);
        const durations = (rows || [])
          .map(r => parseInt(r.element))
          .filter(n => !isNaN(n) && n > 0 && n < 7200);
        const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
        const max = durations.length ? Math.max(...durations) : 0;
        resolve({ avg, max, total: durations.length });
      }
    );
  });
};

const getRecentDocuments = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM documents ORDER BY data_envio DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

const getRecentPartners = (limit = 10) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM partners ORDER BY data_cadastro DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

module.exports = {
  db,
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
};
