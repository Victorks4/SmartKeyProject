// Dados base de salas - utilizados como seed/fallback
const ROOMS_SEED_DATA = [
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

function normalizeRoomKey(room) {
    const sala   = (room.sala || '').toString().trim().toUpperCase();
    const bloco  = (room.bloco || '').toString().trim().toUpperCase();
    const numero = (room.numero ?? '').toString().trim();
    return `${sala}|${bloco}|${numero}`;
}

function generateNextRoomId(existingRooms) {
    const maxId = existingRooms.length > 0 
        ? Math.max(...existingRooms.map(r => Number(r.id) || 0)) 
        : 0;
    return maxId + 1;
}

// Garante que as salas base existam no localStorage sem duplicar
function ensureRoomsSeeded() {
    try {
        const storedRaw = localStorage.getItem('rooms');
        let existing = [];

        if(storedRaw) {
            existing = JSON.parse(storedRaw);
            if(!Array.isArray(existing)) existing = [];
        }

        // Índice por chave normalizada
        const index = new Map(existing.map(r => [normalizeRoomKey(r), r]));

        // Base a mesclar: dados seed locais
        const baseSeed = ROOMS_SEED_DATA;
        let mutated    = false;

        for(const seed of baseSeed) {
            const seedObj = {
                id:     seed.id,
                sala:   seed.sala,
                bloco:  seed.bloco,
                numero: seed.numero ?? ''
            };
            const key = normalizeRoomKey(seedObj);

            if(!index.has(key)) {
                // Novo registro – atribuir ID sequencial
                const nextId = generateNextRoomId(existing);
                seedObj.id   = seedObj.id ?? nextId;

                existing.push(seedObj);
                index.set(key, seedObj);

                mutated = true;
            }
        }

        if(!storedRaw) {
            // Não havia nada salvo – salvar tudo
            localStorage.setItem('rooms', JSON.stringify(existing));
        } else if(mutated) {
            // Havia dados e adicionamos novos – persistir merge
            localStorage.setItem('rooms', JSON.stringify(existing));
        }
    } catch (e) {
        // Fallback mínimo para garantir funcionamento
        if(!localStorage.getItem('rooms'))
            localStorage.setItem('rooms', JSON.stringify(ROOMS_SEED_DATA));
    }
}

// Executa o seed/merge ao carregar o script para refletir mudanças de código
ensureRoomsSeeded();

// Função para obter os dados do dropdown do localStorage ou usar o padrão
function getDropdownData() {
    const stored = localStorage.getItem("rooms");
    return stored ? JSON.parse(stored) : ROOMS_SEED_DATA;
}

// Função para obter blocos únicos a partir dos dados
function getUniqueBlocks(data) {
    const blocks = [ ...new Set(data.map(item => item.bloco))];
    return blocks.sort();
}

// Função para obter nomes de salas únicos de um bloco
function getUniqueRoomsForBlock(data, selectedBlock) {
    const rooms = data
        .filter(item => item.bloco === selectedBlock)
        .map(item => item.sala);

    return [...new Set(rooms)];
}

// Função para obter números de sala de um bloco e sala específicos
function getRoomNumbers(data, selectedBlock, selectedRoom) {
    return data
        .filter(item => item.bloco === selectedBlock && item.sala === selectedRoom)
        .map(item => item.numero)
        .filter(numero => numero !== ""); // Filtra números vazios
}

// Verifica se um professor existe no mapeamento docentesCodprof. 
// Se não existir e o codprof for fornecido, adiciona automaticamente.
function ensureTeacherExists(professorName, codprof) {
    if(!professorName || typeof professorName !== 'string') return false;

    const normalizedName = professorName.trim();
    
    // Verifica se o professor já existe
    if(window.docentesCodprof[normalizedName]) return true;

    // Se o codprof foi fornecido, adiciona o professor
    if(codprof && typeof codprof === 'string') {
        const normalizedCodprof = codprof.trim().toUpperCase();
        
        // Verifica se o codprof já está em uso por outro professor
        for(const [existingName, existingCodprof] of Object.entries(window.docentesCodprof)) {
            if(existingCodprof === normalizedCodprof) return false;
        }

        // Adiciona o novo professor
        window.docentesCodprof[normalizedName] = normalizedCodprof;
        
        // Persiste no localStorage
        try {
            localStorage.setItem("docentesCodprof", JSON.stringify(window.docentesCodprof));
            
            // Persiste no Firestore
            if(typeof addOrUpdateTeacherInFirestore === 'function')
                addOrUpdateTeacherInFirestore(normalizedName, normalizedCodprof);
            
            return true;
        } catch (error) {
            return false;
        }
    }
    return false;
}

// Busca o código (CODPROF) de um professor pelo nome.
function getTeacherCodprof(professorName) {
    if(!professorName || typeof professorName !== 'string') return null;
    return window.docentesCodprof[professorName.trim()] || null;
}

// Busca o nome de um professor pelo código (CODPROF).
function getTeacherByCodeprof(codprof) {
    if(!codprof || typeof codprof !== 'string') 
        return null;
    
    const normalizedCodprof = codprof.trim().toUpperCase();

    for(const [name, code] of Object.entries(window.docentesCodprof)) {
        if(code === normalizedCodprof) return name;
    }
    return null;
}

// Expor funções globalmente
window.ensureTeacherExists  = ensureTeacherExists;
window.getTeacherCodprof    = getTeacherCodprof;
window.getTeacherByCodeprof = getTeacherByCodeprof;
window.getRoomNumbers       = getRoomNumbers;
window.getUniqueRoomsForBlock = getUniqueRoomsForBlock;
window.getUniqueBlocks      = getUniqueBlocks;
window.getDropdownData      = getDropdownData;
window.normalizeRoomKey     = normalizeRoomKey;
window.generateNextRoomId   = generateNextRoomId;
window.ensureRoomsSeeded    = ensureRoomsSeeded;