# Configuração do Servidor - Núcleo Tributário

## Requisitos

- Node.js (v16 ou superior)
- npm ou yarn

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 3. Configurar Gmail App Password

Para enviar emails pelo Gmail, você precisa:

1. Ativar **2-Step Verification** na sua conta Google
2. Gerar uma **App Password**:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Windows Computer"
   - Google gerará uma senha de 16 caracteres
3. Copie essa senha e adicione ao arquivo `.env`:

```env
EMAIL_USER=hecnucleotributario@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_google
PORT=3000
```

## Rodar o Servidor

### Desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Produção

```bash
npm start
```

O servidor rodará na porta 3000 (ou conforme configurado em `.env`).

## Endpoints da API

### 1. Envio de Documentos

**POST** `/api/documentos`

Envia formulário com upload de arquivos.

**Body:** FormData
- empresa (string)
- cnpj (string)
- email (string)
- telefone (string)
- faturamento (string, opcional)
- documentos (file[], opcional)

**Resposta:**
```json
{
  "success": true,
  "message": "Seus arquivos foram enviados com sucesso!"
}
```

### 2. Solicitação CTA

**POST** `/api/cta`

Envia solicitação de análise tributária simples.

**Body:** JSON
```json
{
  "email": "cliente@email.com",
  "telefone": "(11) 9 0000-0000"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pedido enviado com sucesso!"
}
```

### 3. Candidatura de Parceria

**POST** `/api/parcerias`

Envia candidatura para programa de parcerias.

**Body:** JSON
```json
{
  "nome": "João Silva",
  "cpf": "000.000.000-00",
  "email": "joao@email.com",
  "telefone": "(11) 9 0000-0000",
  "profissao": "Consultor",
  "experiencia": "5-10",
  "estado": "SP",
  "cidade": "São Paulo",
  "rede": "Tenho muitos contatos em tecnologia...",
  "motivacao": "Quero ganhar renda adicional...",
  "disponibilidade": "tempo-parcial",
  "linkedin": "https://linkedin.com/in/joao"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Candidatura enviada com sucesso! Entraremos em contato em breve."
}
```

## Verificar se está funcionando

1. Acesse http://localhost:3000 no navegador
2. O site deve carregar normalmente
3. Ao enviar um formulário, você receberá um email em hecnucleotributario@gmail.com

## Troubleshooting

### Erro: "EADDRINUSE: address already in use :::3000"

A porta 3000 já está em uso. Mude a porta no `.env`:
```env
PORT=3001
```

### Erro: "Invalid app password"

Verifique se:
- A senha do Gmail foi copiada corretamente
- 2-Step Verification está ativado
- Você está usando a senha de app (16 caracteres), não a senha regular

### Emails não chegam

Verifique:
- Pasta de spam/lixo do Gmail
- Se o email está configurado corretamente no `.env`
- Se o servidor está rodando sem erros (veja console)

## Deploy

Para fazer deploy em produção:

1. **Heroku:**
   ```bash
   heroku login
   heroku create nome-do-app
   heroku config:set EMAIL_USER=seu@email.com EMAIL_PASSWORD=sua_senha
   git push heroku main
   ```

2. **Vercel:**
   - Conecte o repositório no Vercel
   - Configure as variáveis de ambiente
   - Deploy automático

3. **Digital Ocean / AWS / Azure:**
   - Configure um VPS
   - Instale Node.js
   - Rode `npm install && npm start`
   - Use PM2 ou similar para manter o processo rodando

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commit o arquivo `.env` com senhas reais
- Use variáveis de ambiente no servidor de produção
- Implemente rate limiting em produção
- Valide todos os inputs do formulário
