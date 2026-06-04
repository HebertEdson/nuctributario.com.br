require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
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

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hecnucleotributario@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Use App Password do Gmail
  }
});

// Rota para enviar formulário de parceria
app.post('/api/parcerias', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, profissao, experiencia, estado, cidade, rede, motivacao, disponibilidade, linkedin } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hecnucleotributario@gmail.com',
      to: 'hecnucleotributario@gmail.com',
      subject: `Nova Candidatura de Parceria - ${nome}`,
      html: `
        <h2>Nova Candidatura de Parceria</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Profissão:</strong> ${profissao}</p>
        <p><strong>Experiência:</strong> ${experiencia} anos</p>
        <p><strong>Estado:</strong> ${estado}</p>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Disponibilidade:</strong> ${disponibilidade}</p>
        <p><strong>LinkedIn:</strong> ${linkedin || 'Não informado'}</p>

        <h3>Descrição da Rede de Contatos:</h3>
        <p>${rede.replace(/\n/g, '<br>')}</p>

        <h3>Motivação:</h3>
        <p>${motivacao.replace(/\n/g, '<br>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Candidatura enviada com sucesso! Entraremos em contato em breve.'
    });
  } catch (error) {
    console.error('Erro ao enviar email de parceria:', error);
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

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hecnucleotributario@gmail.com',
      to: 'hecnucleotributario@gmail.com',
      subject: 'Nova Solicitação de Análise Tributária',
      html: `
        <h2>Nova Solicitação de Análise</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p>Cliente interessado em análise tributária. Segue para contato.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Pedido enviado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar CTA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar pedido. Tente novamente.'
    });
  }
});

// Rota para enviar formulário com anexos
app.post('/api/documentos', upload.array('documentos'), async (req, res) => {
  try {
    const { empresa, cnpj, email, telefone, faturamento } = req.body;

    // Preparar anexos
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype
        });
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hecnucleotributario@gmail.com',
      to: 'hecnucleotributario@gmail.com',
      subject: `Novo Pedido de Análise - ${empresa}`,
      html: `
        <h2>Novo Pedido de Análise Tributária</h2>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>CNPJ:</strong> ${cnpj}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Faturamento Anual:</strong> ${faturamento || 'Não informado'}</p>

        <h3>Documentos Anexados:</h3>
        ${req.files && req.files.length > 0 ?
          `<ul>${req.files.map(f => `<li>${f.originalname}</li>`).join('')}</ul>`
          : '<p>Nenhum documento anexado</p>'}
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Seus arquivos foram enviados com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao enviar email com documentos:', error);
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
