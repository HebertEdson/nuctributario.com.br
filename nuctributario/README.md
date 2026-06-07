# Núcleo Tributário - Sistema Completo com Dashboard de Métricas

Sistema profissional de recuperação tributária com landing page e dashboard administrativo para acompanhamento de métricas.

## 🚀 Funcionalidades

### Landing Page
- ✅ Design responsivo (desktop e mobile)
- ✅ Modais corrigidos (funciona perfeitamente em PC e celular)
- ✅ Formulário de solicitação de análise (CTA)
- ✅ Formulário de envio de documentos
- ✅ Formulário de candidatura a parceria
- ✅ Rastreamento automático de eventos
- ✅ Integração com Formspree para emails

### Dashboard de Métricas
- 📊 **Visitantes Únicos** - Total de pessoas que acessaram o site
- 👁️ **Total de Visitas** - Contagem geral de acessos
- 📄 **Documentos Enviados** - Empresas que enviaram documentos para análise
- 🤝 **Parceiros Cadastrados** - Profissionais cadastrados no programa
- 🎯 **Solicitações de Análise** - Pessoas que solicitaram análise gratuita
- 💰 **Taxa de Conversão** - Percentual de visitantes que tomaram ação
- 📈 **Gráficos de Cliques** - Quais elementos recebem mais cliques
- 📊 **Páginas Mais Visitadas** - Quais seções atraem mais interesse
- 📋 **Tabelas Detalhadas** - Listas completas de documentos e parceiros

## 📁 Estrutura do Projeto

```
nuctributario/
├── server.js                 # Backend Express
├── database.js              # Gerenciamento do SQLite
├── package.json             # Dependências
├── .env                     # Variáveis de ambiente
├── metrics.db               # Banco de dados (criado automaticamente)
├── public/                  # Landing page
│   ├── index.html          # HTML principal (CORRIGIDO)
│   ├── css/
│   │   └── style.css       # Estilos (com modais corrigidos)
│   └── js/
│       ├── script.js       # Lógica dos formulários e modais
│       └── analytics.js    # Rastreamento de eventos
└── admin/                  # Dashboard administrativo
    ├── dashboard.html      # HTML do dashboard
    ├── css/
    │   └── dashboard.css   # Estilos do dashboard
    └── js/
        └── dashboard.js    # Lógica de carregamento de métricas
```

## 🔧 Instalação e Execução

### 1. Instalar Dependências
```bash
cd C:\Users\FAMILIA\Desktop\album\nuctributario
npm install
```

### 2. Configurar Variáveis de Ambiente
Edite o arquivo `.env`:
```
PORT=3000
FORMSPREE_URL=https://formspree.io/f/mkoagwdj
```

### 3. Iniciar o Servidor
```bash
npm start
```

Ou com auto-reload (desenvolvedores):
```bash
npm run dev
```

### 4. Acessar o Sistema
- **Landing Page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/admin

## 📊 Dados Rastreados

### Automaticamente Coletados:
- ✅ **Visitantes únicos** (por IP)
- ✅ **Número de visitas** por visitante
- ✅ **Cliques** em elementos e links
- ✅ **Visualizações** de página
- ✅ **Envios** de formulários
- ✅ **Timestamp** de cada ação
- ✅ **User Agent** do navegador

### Armazenados no Banco:
- 📄 **Empresas que enviaram documentos**
  - Razão Social
  - CNPJ
  - Responsável
  - Email
  - Telefone
  - Faturamento

- 🤝 **Parceiros cadastrados**
  - Nome
  - CPF
  - Email
  - Telefone
  - Profissão
  - Experiência
  - Estado
  - Cidade

- 🎯 **Solicitações de Análise (CTA)**
  - Email
  - Telefone

## 🎯 Correção do Modal no PC

### Problema Original
O modal de parcerias aparecia sobreposto ao conteúdo da página no PC.

### Solução Implementada
1. **Position Fixed com Z-Index Alto**
   ```css
   .modal-overlay {
     position: fixed;
     z-index: 10000;
   }
   ```

2. **Overlay Semitransparente**
   ```css
   background: rgba(0, 0, 0, 0.6);
   ```

3. **Flexbox para Centralização**
   ```css
   display: flex;
   align-items: center;
   justify-content: center;
   ```

4. **Controle de Body Scroll**
   ```javascript
   body.classList.add('modal-open');
   // CSS: body.modal-open { overflow: hidden; }
   ```

## 💾 Banco de Dados

O sistema usa **SQLite3** para armazenar dados localmente.

### Tabelas Criadas Automaticamente:
- `events` - Rastreamento de cliques e visualizações
- `visitors` - Visitantes únicos
- `documents` - Documentos enviados
- `partners` - Parceiros cadastrados
- `ctas` - Solicitações de análise

## 📧 Emails

Os emails são enviados através do **Formspree** (serviço gratuito).

Para usar seu próprio endpoint, altere a variável `FORMSPREE_URL` no `.env`.

## 🔐 Segurança

- ✅ CORS habilitado
- ✅ Variáveis sensíveis no `.env` (não commitadas)
- ✅ Inputs validados
- ✅ SQL Safe (uso de prepared statements)
- ✅ Rate limiting recomendado para produção

## 📈 Próximos Passos

1. **Proteger o Dashboard**
   - Adicionar autenticação/senha
   - Implementar login

2. **Exportar Dados**
   - Permitir download de relatórios em CSV/Excel
   - Gerar PDFs

3. **Mais Métricas**
   - Adicionar datas específicas
   - Filtros por período
   - Comparação mês a mês

4. **Notificações**
   - Email quando um novo documento é enviado
   - Alertas de metas atingidas

## 🎨 Customização

### Mudar Cores
Edite as variáveis CSS em `style.css` e `dashboard.css`:
```css
:root {
  --navy: #1d3461;      /* Cor primária */
  --white: #ffffff;     /* Fundo */
}
```

### Adicionar Novos Campos
1. Adicione ao formulário no HTML
2. Adicione à tabela no banco (database.js)
3. Adicione à rota POST no server.js
4. Atualize a tabela no dashboard

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique se o Node.js está instalado (`node --version`)
2. Verifique se as dependências foram instaladas (`npm install`)
3. Verifique se a porta 3000 está disponível
4. Verifique os logs do servidor para erros

## 📝 Licença

© 2025 Núcleo Tributário. Todos os direitos reservados.
