# 🔒 GUIA DE SEGURANÇA CRÍTICO - SmartKeyProject

## ⚠️ AÇÃO IMEDIATA REQUERIDA

### 1. Proteger Credenciais Firebase (URGENTE)

#### No Vercel (Produção):
1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione as seguintes variáveis:

```
VITE_FIREBASE_API_KEY=AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM
VITE_FIREBASE_AUTH_DOMAIN=senaikey.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://senaikey-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=senaikey
VITE_FIREBASE_STORAGE_BUCKET=senaikey.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=471515293175
VITE_FIREBASE_APP_ID=1:471515293175:web:c4b6059d41d6f867f63af2
```

3. Selecione ambientes: Production, Preview, Development
4. Salve e faça redeploy

#### Desenvolvimento Local:
1. Copie `.env.example` para `.env.local`:
```powershell
Copy-Item .env.example .env.local
```

2. Edite `.env.local` com suas credenciais reais
3. NUNCA commite `.env.local` no Git

---

### 2. Implementar Firebase Security Rules (URGENTE)

#### No Firebase Console:
1. Acesse: https://console.firebase.google.com/project/senaikey/database/rules
2. Substitua as rules atuais por:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "allocations": {
      "$date": {
        "$shift": {
          ".validate": "newData.isString() || newData.hasChildren(['id', 'teacher', 'course', 'room'])",
          ".indexOn": ["id", "teacher", "date", "shift"]
        }
      }
    },
    
    "rooms": {
      "$roomId": {
        ".validate": "newData.hasChildren(['id', 'sala', 'bloco'])",
        ".indexOn": ["id", "bloco", "sala"]
      }
    }
  }
}
```

3. Clique em "Publicar"

⚠️ **IMPORTANTE**: Estas rules exigem autenticação. Implemente Firebase Auth antes de ativar.

---

### 3. Remover Credenciais Hardcoded (CRÍTICO)

#### Arquivos a Modificar:

**Arquivo**: `public/js/firebase-config.js`
**Ação**: Substituir credenciais hardcoded por:

```javascript
const firebaseConfig = {
  apiKey: window.__FIREBASE_API_KEY__ || '',
  authDomain: window.__FIREBASE_AUTH_DOMAIN__ || '',
  databaseURL: window.__FIREBASE_DATABASE_URL__ || '',
  projectId: window.__FIREBASE_PROJECT_ID__ || '',
  storageBucket: window.__FIREBASE_STORAGE_BUCKET__ || '',
  messagingSenderId: window.__FIREBASE_MESSAGING_SENDER_ID__ || '',
  appId: window.__FIREBASE_APP_ID__ || ''
};

// Validar antes de inicializar
if (!CONFIG.validateConfig || !CONFIG.validateConfig()) {
  throw new Error('Configuração Firebase incompleta');
}
```

---

## 🎯 Arquitetura Implementada

### Novos Módulos Criados:

```
public/js/
├── config.js              # Gestão segura de configurações
├── error-handler.js       # Tratamento centralizado de erros
├── validators.js          # Validação e sanitização de inputs
├── rooms-data.js          # Dados de salas (modularizado)
├── teachers-data.js       # Dados de professores (modularizado)
└── utilis.js             # Legacy (marcado como deprecado)
```

### Uso dos Novos Módulos:

#### Validação de Inputs:
```javascript
// Antes (inseguro):
const userInput = document.getElementById('input').value;

// Agora (seguro):
const userInput = Validators.sanitizeString(
  document.getElementById('input').value
);

if (!Validators.isValidDate(selectedDate)) {
  ErrorHandler.handle('Data inválida', 'Validation');
  return;
}
```

#### Tratamento de Erros:
```javascript
// Antes:
try {
  // código
} catch (e) {
  console.error(e);
}

// Agora:
try {
  // código
} catch (e) {
  ErrorHandler.handle(e, 'FunctionName', { contextData });
}
```

#### Gestão de Salas:
```javascript
// Antes:
const rooms = getDropdownData();

// Agora:
const rooms = RoomsData.getDropdownData();
const blocks = RoomsData.getUniqueBlocks(rooms);
```

---

## 📋 Checklist de Segurança

- [x] ✅ Criado `.env.example`
- [x] ✅ Criado módulo `config.js`
- [x] ✅ Criado módulo `validators.js`
- [x] ✅ Criado módulo `error-handler.js`
- [x] ✅ Modularizado dados de salas
- [x] ✅ Modularizado dados de professores
- [x] ✅ Criado `firebase.rules.json`
- [ ] ⚠️ **PENDENTE**: Configurar variáveis no Vercel
- [ ] ⚠️ **PENDENTE**: Publicar Security Rules no Firebase
- [ ] ⚠️ **PENDENTE**: Implementar Firebase Authentication
- [ ] ⚠️ **PENDENTE**: Atualizar `firebase-config.js`
- [ ] ⚠️ **PENDENTE**: Testar em ambiente local

---

## 🚀 Próximos Passos Recomendados

### Curto Prazo (Semana 1):
1. ✅ Implementar módulos de segurança básica
2. ⚠️ Configurar variáveis de ambiente
3. ⚠️ Publicar Firebase Rules
4. ⚠️ Adicionar Firebase Auth (email/senha)
5. ⚠️ Criar middleware de autenticação

### Médio Prazo (Semana 2-3):
1. Refatorar `paineladm.js` (4704 linhas)
2. Criar Service Layer para Firebase
3. Implementar testes unitários críticos
4. Adicionar logging estruturado
5. Implementar rate limiting

### Longo Prazo (Mês 2):
1. Migração para TypeScript
2. Implementar CI/CD completo
3. Adicionar testes E2E
4. Monitoramento com Sentry/DataDog
5. Performance optimization

---

## 🛠️ Comandos Úteis

### Desenvolvimento Local:
```powershell
# Copiar env example
Copy-Item .env.example .env.local

# Verificar gitignore
Get-Content .gitignore | Select-String "env"

# Instalar dependências (se necessário)
npm install
```

### Deploy:
```powershell
# Deploy no Vercel
vercel --prod

# Verificar logs
vercel logs
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar erros no console do navegador
2. Verificar logs do Vercel: https://vercel.com/seu-projeto/logs
3. Verificar logs do Firebase: https://console.firebase.google.com/project/senaikey/overview

---

**Última Atualização**: 8 de dezembro de 2025
**Status**: ⚠️ Ação Imediata Requerida
**Prioridade**: CRÍTICA
