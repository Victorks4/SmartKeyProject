/**
 * Teachers Data Module - Gestão de dados de docentes
 * @module teachers-data
 */

// Mapa de docentes (DOCENTE -> CODPROF)
const TEACHERS_CODPROF = {
  "Adalberto da Silva Correia": "FATS1578",
  "Adeildo Apolonio da Silva Junior": "FATS4451",
  "Aderlan dos Santos": "NORTE233",
  // ... (continua com todos os professores)
  // Nota: Por limitação de espaço, incluí apenas uma amostra
  // O arquivo real deve conter todos os 600+ professores
};

const TeachersData = {
  /**
   * Obtém código de professor pelo nome
   * @param {string} teacherName 
   * @returns {string|null}
   */
  getTeacherCode(teacherName) {
    if (!teacherName || typeof teacherName !== 'string') return null;
    return TEACHERS_CODPROF[teacherName] || null;
  },

  /**
   * Obtém nome de professor pelo código
   * @param {string} code 
   * @returns {string|null}
   */
  getTeacherName(code) {
    if (!code || typeof code !== 'string') return null;
    const entry = Object.entries(TEACHERS_CODPROF).find(([_, c]) => c === code);
    return entry ? entry[0] : null;
  },

  /**
   * Obtém lista de todos os professores
   * @returns {Array<string>}
   */
  getAllTeachers() {
    return Object.keys(TEACHERS_CODPROF).sort();
  },

  /**
   * Busca professores por termo
   * @param {string} searchTerm 
   * @returns {Array<{name: string, code: string}>}
   */
  searchTeachers(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') return [];
    
    const term = searchTerm.toLowerCase().trim();
    const results = [];

    for (const [name, code] of Object.entries(TEACHERS_CODPROF)) {
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
    return teacherName in TEACHERS_CODPROF;
  },

  /**
   * Adiciona novo professor (runtime)
   * @param {string} name 
   * @param {string} code 
   * @returns {boolean}
   */
  addTeacher(name, code) {
    if (!name || !code || typeof name !== 'string' || typeof code !== 'string') {
      return false;
    }

    if (TEACHERS_CODPROF[name]) {
      console.warn(`Professor ${name} já existe`);
      return false;
    }

    TEACHERS_CODPROF[name] = code;
    return true;
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TeachersData, TEACHERS_CODPROF };
}
