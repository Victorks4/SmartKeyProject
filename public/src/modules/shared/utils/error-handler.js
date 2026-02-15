// Error Handling Module - Tratamento centralizado de erros

const ErrorHandler = {
  // Tipos de erro conhecidos
  ErrorTypes: {
    NETWORK:    'NETWORK_ERROR',
    FIREBASE:   'FIREBASE_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    STORAGE:    'STORAGE_ERROR',
    UNKNOWN:    'UNKNOWN_ERROR'
  },

  // Logs de erro (últimos 50)
  errorLog:     [],
  MAX_LOG_SIZE: 50,

  // Trata erro de forma centralizada
  handle(error, context = 'Unknown', metadata = {}) {
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      message: error?.message || String(error),
      type:    this.classifyError(error),
      stack:   error?.stack,
      metadata
    };

    // Adicionar ao log
    this.errorLog.push(errorData);
    if(this.errorLog.length > this.MAX_LOG_SIZE)
      this.errorLog.shift();

    // Notificar usuário (se disponível)
    this.notifyUser(errorData);

    // Em produção, enviar para serviço de monitoramento (ex: Sentry)
    if(!this.isDevelopment()) this.reportToMonitoring(errorData);

    return errorData;
  },

  // Classifica tipo de erro
  classifyError(error) {
    const message = error?.message || String(error);

    if(message.includes('Firebase') || message.includes('database')) 
      return this.ErrorTypes.FIREBASE;
    if(message.includes('network') || message.includes('fetch') || message.includes('timeout')) 
      return this.ErrorTypes.NETWORK;
    if(message.includes('validação') || message.includes('inválido')) 
      return this.ErrorTypes.VALIDATION;
    if(message.includes('localStorage') || message.includes('storage')) 
      return this.ErrorTypes.STORAGE;

    return this.ErrorTypes.UNKNOWN;
  }, 

  // Notifica usuário sobre o erro
  notifyUser(errorData) {
    // Verificar se função showNotification existe (do paineladm.js)
    if(typeof showNotification === 'function') {
      const userMessage = this.getUserFriendlyMessage(errorData);
      showNotification(userMessage, 'error');
    }
  },

  // Converte erro técnico em mensagem amigável
  getUserFriendlyMessage(errorData) {
    switch (errorData.type) {
      case this.ErrorTypes.FIREBASE:
        return 'Erro ao comunicar com o servidor. Tente novamente.';
      
      case this.ErrorTypes.NETWORK:
        return 'Erro de conexão. Verifique sua internet.';
      
      case this.ErrorTypes.VALIDATION:
        return 'Dados inválidos. Verifique os campos preenchidos.';
      
      case this.ErrorTypes.STORAGE:
        return 'Erro ao salvar dados localmente. Espaço insuficiente?';
      
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  },

  // Detecta se está em ambiente de desenvolvimento
  isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost')
    );
  },

  // Envia erro para serviço de monitoramento
  reportToMonitoring(errorData) {
    // TODO: Integrar com Sentry, LogRocket ou similar
    // Exemplo: Sentry.captureException(errorData);
  },

  // Retorna últimos erros registrados
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  },

  // Limpa log de erros
  clearLog() {
    this.errorLog = [];
  },
  
  // Wrapper para executar função com tratamento de erro
  wrap(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch(error) {
        this.handle(error, context, { args });
        throw error; // Re-throw para permitir tratamento específico
      }
    };
  }
};

// Capturar erros não tratados globalmente
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'Global Error Handler', {
    filename: event.filename,
    lineno:   event.lineno,
    colno:    event.colno
  });
});

// Capturar promises rejeitadas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'Unhandled Promise Rejection', {
    promise: event.promise
  });
});

// Exportar
if(typeof module !== 'undefined' && module.exports)
  module.exports = ErrorHandler;