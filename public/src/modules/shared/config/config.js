/**
 * Configuration Manager - Gerenciamento seguro de configurações
 * @module config
 */

const CONFIG = {
  firebase: {
    // Variáveis de ambiente injetadas em tempo de build pelo Vercel
    // Para desenvolvimento local, configure .env.local
    apiKey: import.meta?.env?.VITE_FIREBASE_API_KEY || window.__FIREBASE_API_KEY__ || '',
    authDomain: import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || window.__FIREBASE_AUTH_DOMAIN__ || '',
    databaseURL: import.meta?.env?.VITE_FIREBASE_DATABASE_URL || window.__FIREBASE_DATABASE_URL__ || '',
    projectId: import.meta?.env?.VITE_FIREBASE_PROJECT_ID || window.__FIREBASE_PROJECT_ID__ || '',
    storageBucket: import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || window.__FIREBASE_STORAGE_BUCKET__ || '',
    messagingSenderId: import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || window.__FIREBASE_MESSAGING_SENDER_ID__ || '',
    appId: import.meta?.env?.VITE_FIREBASE_APP_ID || window.__FIREBASE_APP_ID__ || ''
  },

  app: {
    name: 'SmartKey System',
    version: '1.0.0',
    environment: import.meta?.env?.MODE || 'production'
  }
};

/**
 * Valida se todas as configurações necessárias estão presentes
 * @returns {boolean}
 */
function validateConfig() {
  const required = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missing = required.filter(key => !CONFIG.firebase[key]);

  if(missing.length > 0) {
    console.error('❌ Configurações Firebase faltando:', missing);
    console.error('Configure as variáveis de ambiente no Vercel ou crie .env.local');
    return false;
  }

  return true;
}

// Exportar configuração
if(typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, validateConfig };
}
