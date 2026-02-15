# 🚀 Guia de Deploy no Vercel - SmartKey System

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [GitHub](https://github.com)
3. Projeto Firebase configurado

## 🔧 Preparação para Deploy

### 1. Commit das mudanças
```bash
git add .
git commit -m "Preparação para deploy no Vercel"
git push origin main
```

### 2. Configuração no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

#### Variáveis de Ambiente Necessárias:
```
VITE_FIREBASE_API_KEY=AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM
VITE_FIREBASE_AUTH_DOMAIN=senaikey.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://senaikey-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=senaikey
VITE_FIREBASE_STORAGE_BUCKET=senaikey.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=471515293175
VITE_FIREBASE_APP_ID=1:471515293175:web:c4b6059d41d6f867f63af2
```

### 3. Configurações de Build
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: (deixe vazio)
- **Output Directory**: (deixe vazio)

## 🔒 Segurança

### Variáveis de Ambiente
1. No painel do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione cada variável listada acima
3. Selecione **Production**, **Preview** e **Development**

### Regras do Firebase
Certifique-se de que as regras do Firebase Realtime Database estão configuradas:

```json
{
  "rules": {
    "chaves": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 🌐 URLs do Sistema

Após o deploy, seu sistema estará disponível em:
- **Página inicial**: `https://seu-projeto.vercel.app/`
- **Painel Admin**: `https://seu-projeto.vercel.app/admin`
- **Painel Professor**: `https://seu-projeto.vercel.app/teacher`

## 🐛 Resolução de Problemas

### Erro 404 - NOT_FOUND
- Verifique se o arquivo `index.html` existe na raiz
- Confirme se o `vercel.json` está configurado corretamente

### Erro 500 - FUNCTION_INVOCATION_FAILED
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o Firebase está respondendo

### Erro 502 - DNS_HOSTNAME_RESOLVE_FAILED
- Aguarde alguns minutos para propagação DNS
- Verifique se o domínio está configurado corretamente

### Firebase não conecta
1. Verifique as variáveis de ambiente no Vercel
2. Confirme se as regras do Firebase permitem acesso
3. Teste a conexão no console do navegador

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Vercel
2. Abra o console do navegador para erros JavaScript
3. Confirme se o Firebase está funcionando acessando diretamente

## 🔄 Atualizações

Para atualizações futuras:
1. Faça as mudanças no código
2. Commit e push para o GitHub
3. O Vercel fará deploy automaticamente

---

✅ **Sistema pronto para produção!**
