/**
 * Teachers Data Module - Gestão de dados de docentes
 * @module teachers-data
 * 
 * Este módulo fornece uma interface unificada para acessar dados de professores.
 * Os dados são carregados do localStorage/Firestore (via window.docentesCodprof).
 * 
 * NOTA: Os dados reais dos professores são gerenciados pelo sistema de sincronização
 * do Firebase Firestore. Este módulo apenas provê funções utilitárias de acesso.
 */

const TeachersData = {
  /**
   * Obtém o mapeamento atual de professores
   * @returns {Object} Mapeamento nome -> código
   * @private
   */
  _getMapping() {
    // Prioridade: window.docentesCodprof (carregado do Firebase/localStorage)
    if (typeof window !== 'undefined' && window.docentesCodprof) {
      return window.docentesCodprof;
    }
    
    // Fallback: tentar carregar do localStorage
    try {
      const stored = localStorage.getItem('docentesCodprof');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[TeachersData] Erro ao carregar dados do localStorage:', error);
    }
    
    return {};
  },

  /**
   * Obtém código de professor pelo nome
   * @param {string} teacherName 
   * @returns {string|null}
   */
  getTeacherCode(teacherName) {
    if (!teacherName || typeof teacherName !== 'string') return null;
    const mapping = this._getMapping();
    return mapping[teacherName.trim()] || null;
  },

  /**
   * Obtém nome de professor pelo código
   * @param {string} code 
   * @returns {string|null}
   */
  getTeacherName(code) {
    if (!code || typeof code !== 'string') return null;
    const mapping = this._getMapping();
    const normalizedCode = code.trim().toUpperCase();
    const entry = Object.entries(mapping).find(([_, c]) => c === normalizedCode);
    return entry ? entry[0] : null;
  },

  /**
   * Obtém lista de todos os professores
   * @returns {Array<string>}
   */
  getAllTeachers() {
    const mapping = this._getMapping();
    return Object.keys(mapping).sort();
  },

  /**
   * Obtém total de professores cadastrados
   * @returns {number}
   */
  getTeacherCount() {
    const mapping = this._getMapping();
    return Object.keys(mapping).length;
  },

  /**
   * Busca professores por termo
   * @param {string} searchTerm 
   * @returns {Array<{name: string, code: string}>}
   */
  searchTeachers(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') return [];
    
    const mapping = this._getMapping();
    const term = searchTerm.toLowerCase().trim();
    const results = [];

    for (const [name, code] of Object.entries(mapping)) {
      if (
        name.toLowerCase().includes(term) || 
        code.toLowerCase().includes(term)
      ) {
        results.push({ name, code });
      }
    }

    return results;
  },

  /**
   * Valida se professor existe
   * @param {string} teacherName 
   * @returns {boolean}
   */
  isValidTeacher(teacherName) {
    if (!teacherName || typeof teacherName !== 'string') return false;
    const mapping = this._getMapping();
    return teacherName.trim() in mapping;
  },

  /**
   * Valida se um código (FATS) existe
   * @param {string} code 
   * @returns {boolean}
   */
  isValidCode(code) {
    if (!code || typeof code !== 'string') return false;
    const mapping = this._getMapping();
    const normalizedCode = code.trim().toUpperCase();
    return Object.values(mapping).includes(normalizedCode);
  }
};

// Exportar para uso em módulos Node.js (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TeachersData };
}
