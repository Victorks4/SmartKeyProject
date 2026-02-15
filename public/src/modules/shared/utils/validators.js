// Input Validation and Sanitization Module
const Validators = {
  // Sanitiza string removendo caracteres perigosos
  sanitizeString(input) {
    if(typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '')         // Remove tags HTML básicas
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '')   // Remove event handlers
      .substring(0, 500);           // Limita tamanho
  },

  // Valida email
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Valida data no formato YYYY-MM-DD
  isValidDate(date) {
    if(typeof date !== 'string') return false;

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if(!regex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  },

  // Valida turno
  isValidShift(shift) {
    return ['manhã', 'tarde', 'noite'].includes(shift);
  },

  // Valida objeto de sala
  isValidRoom(room) {
    if(!room || typeof room !== 'object') return false;
    
    return (
      typeof room.sala  === 'string' &&
      typeof room.bloco === 'string' &&
      room.sala.trim().length  > 0   &&
      room.bloco.trim().length > 0
    );
  },

  // Valida registro de alocação
  isValidAllocationRecord(record) {
    if(!record || typeof record !== 'object') return false;

    return (
      record.id &&
      typeof record.teacher === 'string' &&
      typeof record.course  === 'string' &&
      this.isValidRoom(record.room)
    );
  },

  // Sanitiza objeto removendo propriedades undefined/null
  cleanObject(obj) {
    if(!obj || typeof obj !== 'object') return {};
    
    const cleaned = {};

    for(const [key, value] of Object.entries(obj)) {
      if(value !== undefined && value !== null) 
        cleaned[key] = value;
    }
    return cleaned;
  },

  // Valida e sanitiza input genérico
  validate(input, type) {
    switch (type) {
      case 'string': return this.sanitizeString(input);
      case 'email':  return this.isValidEmail(input) ? input : null;
      case 'date':   return this.isValidDate(input)  ? input : null;
      case 'shift':  return this.isValidShift(input) ? input : null;
      case 'room':   return this.isValidRoom(input)  ? input : null;
      default:      return input;
    }
  }
};

// Exportar para uso em outros módulos
if(typeof module !== 'undefined' && module.exports) 
  module.exports = Validators;