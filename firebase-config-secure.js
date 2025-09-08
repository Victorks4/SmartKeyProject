// Configuração do Firebase com variáveis de ambiente
// Para desenvolvimento local, use .env.local
// Para produção no Vercel, configure as variáveis no painel

const firebaseConfig = {
  apiKey: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_API_KEY : 
    "AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM",
  authDomain: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_AUTH_DOMAIN : 
    "senaikey.firebaseapp.com",
  databaseURL: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_DATABASE_URL : 
    "https://senaikey-default-rtdb.firebaseio.com",
  projectId: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_PROJECT_ID : 
    "senaikey",
  storageBucket: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_STORAGE_BUCKET : 
    "senaikey.firebasestorage.app",
  messagingSenderId: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID : 
    "471515293175",
  appId: typeof process !== 'undefined' && process.env ? 
    process.env.VITE_FIREBASE_APP_ID : 
    "1:471515293175:web:c4b6059d41d6f867f63af2"
};

// Inicializar Firebase com tratamento de erros aprimorado
let database;
let firebaseInitialized = false;

function initializeFirebase() {
  try {
    // Verificar se Firebase SDK está disponível
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK não carregado');
      return false;
    }

    // Verificar se Firebase já foi inicializado
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase inicializado com sucesso');
    }
    
    database = firebase.database();
    firebaseInitialized = true;
    
    // Testar conexão
    database.ref('.info/connected').on('value', (snapshot) => {
      if (snapshot.val() === true) {
        console.log('✅ Conectado ao Firebase');
      } else {
        console.warn('⚠️ Desconectado do Firebase');
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    database = null;
    firebaseInitialized = false;
    return false;
  }
}

// Tentar inicializar quando o script carregar
if (typeof firebase !== 'undefined') {
  initializeFirebase();
} else {
  // Se Firebase não estiver disponível ainda, aguardar
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeFirebase, 1000);
  });
}

// Função para verificar se Firebase está pronto
function isFirebaseReady() {
  return firebaseInitialized && database !== null;
}

// Função para salvar dados no Firebase com tratamento de erro aprimorado
function saveDataToFirebase(date, shift, data) {
    console.log('🔥 FIREBASE: Tentando salvar dados', {date, shift, dataLength: data ? data.length : 'undefined'});
    
    // Verificar se Firebase está inicializado
    if (!isFirebaseReady()) {
        console.error('❌ FIREBASE: Database não inicializado');
        return Promise.reject('Database não inicializado');
    }
    
    // Verificar se data é válido
    if (!data || !Array.isArray(data)) {
        console.error('❌ FIREBASE: Dados inválidos recebidos:', data);
        return Promise.reject('Dados inválidos');
    }
    
    // Verificar se data não está vazio
    if (data.length === 0) {
        console.warn('⚠️ FIREBASE: Array vazio recebido - isso pode causar exclusão de dados!');
        console.warn('⚠️ FIREBASE: Abortando salvamento para evitar exclusão acidental');
        return Promise.reject('Array vazio - abortando para evitar exclusão');
    }
    
    // Limpar dados removendo valores undefined antes de salvar
    const cleanData = data.map(item => {
        if (!item || typeof item !== 'object') {
            console.warn('⚠️ FIREBASE: Item inválido encontrado:', item);
            return null;
        }
        
        const cleanItem = {};
        
        // Copiar todas as propriedades, substituindo undefined por string vazia
        Object.keys(item).forEach(key => {
            if (item[key] === undefined || item[key] === null) {
                cleanItem[key] = '';
            } else {
                cleanItem[key] = item[key];
            }
        });
        
        return cleanItem;
    }).filter(item => item !== null); // Remover itens nulos
    
    console.log('✅ FIREBASE: Dados limpos para salvar:', cleanData);
    console.log('✅ FIREBASE: Quantidade de registros válidos:', cleanData.length);
    
    // Verificar novamente se ainda temos dados válidos após limpeza
    if (cleanData.length === 0) {
        console.error('❌ FIREBASE: Nenhum dado válido após limpeza - abortando');
        return Promise.reject('Nenhum dado válido após limpeza');
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log('🔥 FIREBASE: Referência criada:', ref.toString());
    
    return ref.set(cleanData).then(() => {
        console.log('✅ FIREBASE: Dados salvos com sucesso!');
        console.log('✅ FIREBASE: Registros salvos:', cleanData.length);
    }).catch(error => {
        console.error('❌ FIREBASE: Erro ao salvar:', error);
        throw error;
    });
}

// Função para carregar dados do Firebase
function loadDataFromFirebase(date, shift) {
    if (!isFirebaseReady()) {
        console.error('❌ FIREBASE: Database não inicializado para carregamento');
        return Promise.reject('Database não inicializado');
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    return ref.once('value').then((snapshot) => {
        return snapshot.val() || [];
    }).catch(error => {
        console.error('❌ FIREBASE: Erro ao carregar dados:', error);
        throw error;
    });
}

// Função para sincronizar dados em tempo real
function syncDataRealtime(date, shift) {
    console.log(`🔄 SYNC: Iniciando sincronização para ${date}/${shift}`);
    
    if (!isFirebaseReady()) {
        console.error('❌ SYNC: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(`🔄 SYNC: Referência criada: ${ref.toString()}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`📥 SYNC [ADMIN]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
        if (typeof dataByDateAndShift !== 'undefined' && dataByDateAndShift[date]) {
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            if (oldData !== newData) {
                console.log(`🔄 SYNC [ADMIN]: Dados diferentes detectados, atualizando interface...`);
                
                // Atualizar estrutura de dados local
                if (!dataByDateAndShift[date]) {
                    dataByDateAndShift[date] = {};
                }
                dataByDateAndShift[date][shift] = data;
                
                // Atualizar interface se estivermos visualizando esta data/turno
                if (typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
                    if (selectedDate === date && activeShift === shift) {
                        console.log(`🔄 SYNC [ADMIN]: Atualizando tabela para ${date}/${shift}`);
                        if (typeof updateTable === 'function') {
                            updateTable();
                        }
                    }
                }
                
                // Disparar evento personalizado para outras partes do sistema
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('firebaseDataUpdated', {
                        detail: { date, shift, data }
                    }));
                }
            }
        }
    }, (error) => {
        console.error('❌ SYNC: Erro na sincronização:', error);
    });
}

// Função para parar sincronização
function stopSyncDataRealtime(date, shift) {
    if (!isFirebaseReady()) {
        console.warn('⚠️ SYNC: Database não disponível para parar sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    ref.off('value');
    console.log(`🛑 SYNC: Sincronização parada para ${date}/${shift}`);
}

// Função para carregar todos os dados de uma data
async function loadAllDataForDate(date) {
    console.log(`📅 Carregando todos os dados para ${date}...`);
    
    if (!isFirebaseReady()) {
        console.error('❌ FIREBASE: Database não inicializado');
        return {};
    }
    
    try {
        const shifts = ['manhã', 'tarde', 'noite'];
        const promises = shifts.map(shift => 
            loadDataFromFirebase(date, shift).then(data => ({ shift, data }))
        );
        
        const results = await Promise.all(promises);
        
        const allData = {};
        results.forEach(({ shift, data }) => {
            allData[shift] = data;
        });
        
        console.log(`✅ Dados carregados para ${date}:`, allData);
        return allData;
    } catch (error) {
        console.error('❌ Erro ao carregar dados da data:', error);
        return {};
    }
}

// Funções específicas para o painel do professor
function syncTeacherDataRealtime(date, shift) {
    console.log(`🔄 [PROFESSOR]: Iniciando sincronização para ${date}/${shift}`);
    
    if (!isFirebaseReady()) {
        console.error('❌ [PROFESSOR]: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`📥 [PROFESSOR]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
        // Atualizar dados locais se existir a estrutura
        if (typeof dataByDateAndShift !== 'undefined') {
            if (!dataByDateAndShift[date]) {
                dataByDateAndShift[date] = {};
            }
            dataByDateAndShift[date][shift] = data;
            
            // Atualizar interface se estivermos no turno correto
            if (typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
                if (selectedDate === date && activeShift === shift) {
                    console.log(`🔄 [PROFESSOR]: Atualizando interface para ${date}/${shift}`);
                    if (typeof loadShiftData === 'function') {
                        loadShiftData(shift);
                    }
                }
            }
        }
    }, (error) => {
        console.error('❌ [PROFESSOR]: Erro na sincronização:', error);
    });
}

// Função para carregar dados do Firebase para o painel do professor
async function loadTeacherDataFromFirebase(date) {
    console.log(`📅 [PROFESSOR]: Carregando dados para ${date}...`);
    
    if (!isFirebaseReady()) {
        console.error('❌ [PROFESSOR]: Database não disponível');
        return false;
    }
    
    try {
        const allData = await loadAllDataForDate(date);
        
        // Atualizar estrutura de dados local
        if (typeof dataByDateAndShift !== 'undefined') {
            dataByDateAndShift[date] = allData;
        }
        
        console.log(`✅ [PROFESSOR]: Dados carregados do Firebase para ${date}:`, dataByDateAndShift[date]);
        return true;
    } catch (error) {
        console.error('❌ [PROFESSOR]: Erro ao carregar dados do Firebase:', error);
        return false;
    }
}

// Função para inicializar sincronização Firebase no painel do professor
function initializeFirebaseSync() {
    console.log('🔥 [PROFESSOR]: Inicializando sincronização Firebase...');
    
    if (!isFirebaseReady()) {
        console.error('❌ [PROFESSOR]: Database não disponível para sincronização');
        return;
    }
    
    // Sincronizar dados para a data atual e turno atual
    if (typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
        console.log(`🔄 [PROFESSOR]: Iniciando sincronização para ${selectedDate}/${activeShift}`);
        
        // Sincronizar todos os turnos da data atual usando a função específica do professor
        syncTeacherDataRealtime(selectedDate, 'manhã');
        syncTeacherDataRealtime(selectedDate, 'tarde');
        syncTeacherDataRealtime(selectedDate, 'noite');
        
        console.log('✅ [PROFESSOR]: Sincronização Firebase inicializada com sucesso!');
    } else {
        console.warn('⚠️ [PROFESSOR]: Variáveis selectedDate ou activeShift não definidas');
    }
}
