require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configurar multer para uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// URL do Formspree
const FORMSPREE_URL = 'https://formspree.io/f/mkoagwdj';

// Rota para enviar formulário de parceria
app.post('/api/parcerias', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, profissao, experiencia, estado, cidade, rede, motivacao, disponibilidade, linkedin } = req.body;

    const data = {
      subject: `Nova Candidatura de Parceria - ${nome}`,
      from_name: nome,
      from_email: email,
      phone: telefone,
      message: `
NOVA CANDIDATURA DE PARCERIA

Nome: ${nome}
CPF: ${cpf}
Email: ${email}
Telefone: ${telefone}
Profissão: ${profissao}
Experiência: ${experiencia} anos
Estado: ${estado}
Cidade: ${cidade}
Disponibilidade: ${disponibilidade}
LinkedIn: ${linkedin || 'Não informado'}

Descrição da Rede de Contatos:
${rede}

Motivação:
${motivacao}
      `
    };

    const response = await axios.post(FORMSPREE_URL, data);

    res.json({
      success: true,
      message: 'Candidatura enviada com sucesso! Entraremos em contato em breve.'
    });
  } catch (error) {
    console.error('Erro ao enviar candidatura:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar candidatura. Tente novamente.'
    });
  }
});

// Rota para enviar CTA simples (sem anexos)
app.post('/api/cta', async (req, res) => {
  try {
    const { email, telefone } = req.body;

    const data = {
      subject: 'Nova Solicitação de Análise Tributária',
      from_email: email,
      message: `
NOVA SOLICITAÇÃO DE ANÁLISE TRIBUTÁRIA

Email: ${email}
Telefone: ${telefone}

Cliente interessado em análise tributária.
      `
    };

    const response = await axios.post(FORMSPREE_URL, data);

    res.json({
      success: true,
      message: 'Pedido enviado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar CTA:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar pedido. Tente novamente.'
    });
  }
});

// Rota para enviar formulário com anexos
app.post('/api/documentos', upload.array('documentos'), async (req, res) => {
  try {
    // Mapear nomes do formulário HTML para variáveis
    const empresa = req.body['Razao Social'] || req.body.empresa;
    const cnpj = req.body.CNPJ || req.body.cnpj;
    const responsavel = req.body.Responsavel || req.body.contato;
    const email = req.body.Email || req.body.email;
    const telefone = req.body.Telefone || req.body.telefone;
    const faturamento = req.body['Faturamento Anual'] || req.body.faturamento;

    const data = {
      subject: `Novo Pedido de Análise - ${empresa}`,
      from_email: email,
      message: `
NOVO PEDIDO DE ANÁLISE TRIBUTÁRIA

Empresa: ${empresa}
Responsável: ${responsavel}
CNPJ: ${cnpj}
Email: ${email}
Telefone: ${telefone}
Faturamento Anual: ${faturamento || 'Não informado'}

${req.files && req.files.length > 0 ?
  'Documentos anexados:\n' + req.files.map(f => `- ${f.originalname}`).join('\n')
  : 'Nenhum documento anexado'
}
      `
    };

    const response = await axios.post(FORMSPREE_URL, data);

    res.json({
      success: true,
      message: 'Seus arquivos foram enviados com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar documentos:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar documentos. Tente novamente.'
    });
  }
});

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
