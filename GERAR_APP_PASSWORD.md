# Como Gerar App Password do Gmail

## Passo 1: Ativar 2-Step Verification
1. Acesse sua conta Google: https://myaccount.google.com/
2. Clique em **"Segurança"** (menu lateral esquerdo)
3. Procure por **"Verificação em duas etapas"**
4. Clique em **"Ativar"** (se não estiver ativado)
5. Siga as instruções (você receberá SMS/chamada)

## Passo 2: Gerar App Password
1. Acesse novamente: https://myaccount.google.com/apppasswords
2. Verifique se a página mostra um dropdown com opções
3. Selecione:
   - **App:** "Mail"
   - **Device:** "Windows Computer" (ou seu dispositivo)
4. Clique em **"Gerar"**
5. Google mostrará uma senha de **16 caracteres**

## Passo 3: Copiar a Senha
1. Copie a senha completa (ex: `abcd efgh ijkl mnop`)
2. Abra o arquivo `.env` na pasta do projeto
3. Substitua a linha:
   ```
   EMAIL_PASSWORD=COLOCAR_SUA_SENHA_DE_APP_GOOGLE_AQUI
   ```
   Por:
   ```
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   (use a senha que Google gerou, SEM espaços)

## Passo 4: Salvar e Rodar

Depois de atualizar o `.env`, execute:
```bash
npm start
```

## ⚠️ Importante

- **Não compartilhe** essa senha com ninguém
- A senha é diferente da sua senha regular do Gmail
- Se vazar, gere uma nova em: https://myaccount.google.com/apppasswords

## Se tiver dúvidas

Envie um print do passo 4 acima e eu ajudo!
