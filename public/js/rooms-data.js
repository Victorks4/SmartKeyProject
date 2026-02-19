/**
 * Room Data Module - Gestão de dados de salas
 * @module rooms-data
 */

// Dados base de salas
const ROOMS_BASE_DATA = [
  // Bloco A
  { id: 1, sala: "HIDRÁULICA", bloco: "Bloco A", numero: "" },
  { id: 2, sala: "AUT PREDIAL", bloco: "Bloco A", numero: "" },

  // Bloco B
  { id: 3, sala: "QUÍMICA", bloco: "Bloco B", numero: "" },

  // Bloco C
  { id: 4, sala: "FABRICAÇÃO", bloco: "Bloco C", numero: "" },

  // Bloco D
  { id: 5, sala: "PLANTA CIM", bloco: "Bloco D", numero: "" },
  { id: 6, sala: "METROLOGIA", bloco: "Bloco D", numero: "" },
  { id: 7, sala: "LAB MAKER", bloco: "Bloco D", numero: "" },

  // Bloco E - Salas Térreo
  { id: 8, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "1" },
  { id: 9, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "2" },
  { id: 10, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "3" },
  { id: 11, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "4" },
  { id: 12, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "5" },
  { id: 13, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "6" },
  { id: 14, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "7" },
  { id: 15, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "8" },
  { id: 16, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "9" },
  { id: 17, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "10" },
  { id: 18, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "11" },
  { id: 19, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "12" },
  { id: 20, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "13" },
  { id: 21, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "14" },
  { id: 22, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "15" },
  { id: 23, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "16" },

  // Bloco F - Labs de Informática
  { id: 24, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "1" },
  { id: 25, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "2" },
  { id: 26, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "3" },
  { id: 27, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "4" },
  { id: 28, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "5" },
  { id: 29, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "6" },
  { id: 30, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "7" },
  { id: 31, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "8" },
  { id: 32, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "9" },
  { id: 33, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "10" },

  // Bloco F - Outros Labs e Salas
  { id: 34, sala: "LAB ELETROTÉCNICA", bloco: "Bloco F", numero: "11" },
  { id: 35, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "12" },
  { id: 36, sala: "LAB ACIONAMENTOS", bloco: "Bloco F", numero: "13" },
  { id: 37, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "14" },
  { id: 38, sala: "LAB ELETRÔNICA", bloco: "Bloco F", numero: "15" },
  { id: 39, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "16" },
  { id: 40, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "17" },
  { id: 41, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "18" },
  { id: 42, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "19" },
  { id: 43, sala: "SALAS - 2º ANDAR", bloco: "Bloco F", numero: "20" },

  // Bloco G
  { id: 44, sala: "ARMAZENAGEM", bloco: "Bloco G", numero: "" },
  { id: 45, sala: "SALA DE AUTOMOTIVA", bloco: "Bloco G", numero: "" },
  { id: 46, sala: "MOTOCICLETAS", bloco: "Bloco G", numero: "" },
  { id: 47, sala: "FUNILARIA", bloco: "Bloco G", numero: "" },
  { id: 48, sala: "PREDIAL II", bloco: "Bloco G", numero: "" },
  { id: 49, sala: "LABORATÓRIO DE SEGURANÇA", bloco: "Bloco G", numero: "" },

  // Bloco H
  { id: 50, sala: "SALA EMPILHADEIRA", bloco: "Bloco H", numero: "" },
  { id: 51, sala: "MICROBIOLOGIA", bloco: "Bloco H", numero: "" },
  { id: 52, sala: "PANIFICAÇÃO", bloco: "Bloco H", numero: "" }
];

// Novas salas a serem adicionadas (seed incremental)
const NEW_ROOMS_SEED = [
  { sala: "LABORATÓRIO DE SEGURANÇA", bloco: "Bloco G", numero: "" }
];

const RoomsData = {
  /**
   * Normaliza chave de sala para comparação
   * @param {Object} room 
   * @returns {string}
   */
  normalizeRoomKey(room) {
    const sala = (room.sala || '').toString().trim().toUpperCase();
    const bloco = (room.bloco || '').toString().trim().toUpperCase();
    const numero = (room.numero ?? '').toString().trim();
    return `${sala}|${bloco}|${numero}`;
  },

  /**
   * Gera próximo ID sequencial
   * @param {Array} existingRooms 
   * @returns {number}
   */
  generateNextRoomId(existingRooms) {
    if (!Array.isArray(existingRooms) || existingRooms.length === 0) {
      return 1;
    }
    const maxId = Math.max(...existingRooms.map(r => Number(r.id) || 0));
    return maxId + 1;
  },

  /**
   * Garante que as salas base existam no localStorage
   * Realiza merge sem duplicar dados
   */
  ensureRoomsSeeded() {
    try {
      const storedRaw = localStorage.getItem('rooms');
      let existing = [];

      if (storedRaw) {
        try {
          existing = JSON.parse(storedRaw);
          if (!Array.isArray(existing)) {
            console.warn('Dados de salas corrompidos, resetando...');
            existing = [];
          }
        } catch (parseError) {
          console.error('Erro ao parsear dados de salas:', parseError);
          existing = [];
        }
      }

      // Índice por chave normalizada
      const index = new Map(existing.map(r => [this.normalizeRoomKey(r), r]));

      // Base a mesclar
      const baseSeed = [...ROOMS_BASE_DATA, ...NEW_ROOMS_SEED];
      let mutated = false;

      for (const seed of baseSeed) {
        const seedObj = {
          id: seed.id,
          sala: seed.sala,
          bloco: seed.bloco,
          numero: seed.numero ?? ''
        };
        const key = this.normalizeRoomKey(seedObj);

        if (!index.has(key)) {
          // Novo registro
          const nextId = this.generateNextRoomId(existing);
          seedObj.id = seedObj.id ?? nextId;
          existing.push(seedObj);
          index.set(key, seedObj);
          mutated = true;
        }
      }

      if (!storedRaw || mutated) {
        localStorage.setItem('rooms', JSON.stringify(existing));
      }
    } catch (error) {
      if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handle(error, 'RoomsData.ensureRoomsSeeded');
      } else {
        console.error('Erro ao mesclar salas no localStorage:', error);
      }

      // Fallback
      if (!localStorage.getItem('rooms')) {
        localStorage.setItem('rooms', JSON.stringify(ROOMS_BASE_DATA));
      }
    }
  },

  /**
   * Obtém dados de salas do localStorage
   * @returns {Array}
   */
  getDropdownData() {
    try {
      const stored = localStorage.getItem('rooms');
      return stored ? JSON.parse(stored) : ROOMS_BASE_DATA;
    } catch (error) {
      if (typeof ErrorHandler !== 'undefined') {
        ErrorHandler.handle(error, 'RoomsData.getDropdownData');
      }
      return ROOMS_BASE_DATA;
    }
  },

  /**
   * Obtém blocos únicos ordenados
   * @param {Array} data 
   * @returns {Array<string>}
   */
  getUniqueBlocks(data) {
    if (!Array.isArray(data)) return [];
    const blocks = [...new Set(data.map(item => item.bloco))];
    return blocks.sort();
  },

  /**
   * Obtém salas únicas de um bloco
   * @param {Array} data 
   * @param {string} selectedBlock 
   * @returns {Array<string>}
   */
  getUniqueRoomsForBlock(data, selectedBlock) {
    if (!Array.isArray(data)) return [];
    const rooms = data
      .filter(item => item.bloco === selectedBlock)
      .map(item => item.sala);
    return [...new Set(rooms)];
  },

  /**
   * Obtém números de sala de um bloco e sala específicos
   * @param {Array} data 
   * @param {string} selectedBlock 
   * @param {string} selectedRoom 
   * @returns {Array<string>}
   */
  getRoomNumbers(data, selectedBlock, selectedRoom) {
    if (!Array.isArray(data)) return [];
    return data
      .filter(item => item.bloco === selectedBlock && item.sala === selectedRoom)
      .map(item => item.numero)
      .filter(numero => numero !== "");
  }
};

// Inicializa seed ao carregar
if (typeof document !== 'undefined') {
  RoomsData.ensureRoomsSeeded();
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoomsData;
}
