// Configuração do Firebase com variáveis de ambiente
// Para desenvolvimento local, use .env.local
// Para produção no Vercel, configure as variáveis no painel

// Configuração do Firebase - As variáveis de ambiente são injetadas pelo Vercel durante o build
const firebaseConfig = {
  apiKey:            "AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM",
  authDomain:        "senaikey.firebaseapp.com",
  databaseURL:       "https://senaikey-default-rtdb.firebaseio.com",
  projectId:         "senaikey",
  storageBucket:     "senaikey.firebasestorage.app",
  messagingSenderId: "471515293175",
  appId:             "1:471515293175:web:c4b6059d41d6f867f63af2"
};

// Inicializar Firebase com tratamento de erros aprimorado
let database;
let firebaseInitialized = false;

function initializeFirebase() {
  try {
    // Verificar se Firebase SDK está disponível
    if(typeof firebase === 'undefined') return false;

    // Verificar se Firebase já foi inicializado
    if(!firebase.apps.length) 
        firebase.initializeApp(firebaseConfig);
    
    database = firebase.database();
    firebaseInitialized = true;
    
    // Testar conexão
    database.ref('.info/connected').on('value', (snapshot) => {});
    
    return true;
  } catch (error) {
    database            = null;
    firebaseInitialized = false;
    return false;
  }
}

// Tentar inicializar quando o script carregar
if(typeof firebase !== 'undefined') {
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
    // Verificar se Firebase está inicializado
    if(!isFirebaseReady())
        return Promise.reject('Database não inicializado');
    
    // Verificar se data é válido
    if(!data || !Array.isArray(data))
        return Promise.reject('Dados inválidos');
    
    // Verificar se data não está vazio
    if(data.length === 0)
        return Promise.reject('Array vazio - abortando para evitar exclusão');
    
    // Limpar dados removendo valores undefined antes de salvar
    const cleanData = data.map(item => {
        if(!item || typeof item !== 'object') return null;
        
        const cleanItem = {};
        
        // Copiar todas as propriedades, substituindo undefined por string vazia
        Object.keys(item).forEach(key => {
            if(item[key] === undefined || item[key] === null)
                cleanItem[key] = '';
            else
                cleanItem[key] = item[key];
        });
        
        return cleanItem;
    }).filter(item => item !== null); // Remover itens nulos
    
    // Verificar novamente se ainda temos dados válidos após limpeza
    if(cleanData.length === 0)
        return Promise.reject('Nenhum dado válido após limpeza');
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    return ref.set(cleanData).then(() => {
        // Dados salvos com sucesso
    }).catch(error => {
        throw error;
    });
}

// Função para carregar dados do Firebase
function loadDataFromFirebase(date, shift) {
    if(!isFirebaseReady())
        return Promise.reject('Database não inicializado');
    
    const ref = database.ref(`chaves/${date}/${shift}`);

    return ref.once('value').then((snapshot) => {
        return snapshot.val() || [];
    }).catch(error => {
        throw error;
    });
}

// Função para sincronizar dados em tempo real
function syncDataRealtime(date, shift) {
    if(!isFirebaseReady()) return;
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];

        if(typeof dataByDateAndShift !== 'undefined' && dataByDateAndShift[date]) {
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            if(oldData !== newData) {
                // Atualizar estrutura de dados local
                if(!dataByDateAndShift[date])
                    dataByDateAndShift[date] = {};

                dataByDateAndShift[date][shift] = data;
                
                // Atualizar interface se estivermos visualizando esta data/turno
                if(typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
                    if(selectedDate === date && activeShift === shift) {
                        if(typeof updateTable === 'function') updateTable();
                    }
                }
                
                // Disparar evento personalizado para outras partes do sistema
                if(typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('firebaseDataUpdated', {
                        detail: { date, shift, data }
                    }));
                }
            }
        }
    }, (error) => {
        // Erro na sincronização
    });
}

// Função para parar sincronização
function stopSyncDataRealtime(date, shift) {
    if(!isFirebaseReady()) return;
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    ref.off('value');
}

// Função para carregar todos os dados de uma data
async function loadAllDataForDate(date) {
    if(!isFirebaseReady()) return {};
    
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
        
        return allData;
    } catch (error) {
        return {};
    }
}

// Funções específicas para o painel do professor
function syncTeacherDataRealtime(date, shift) {
    if(!isFirebaseReady()) return;
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];

        // Atualizar dados locais se existir a estrutura
        if(typeof dataByDateAndShift !== 'undefined') {
            if(!dataByDateAndShift[date]) 
                dataByDateAndShift[date] = {};
                
            dataByDateAndShift[date][shift] = data;
            
            // Atualizar interface se estivermos no turno correto
            if(typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
                if(selectedDate === date && activeShift === shift) {
                    if(typeof loadShiftData === 'function') loadShiftData(shift);
                }
            }
        }
    }, (error) => {
        // Erro na sincronização
    });
}

// Função para carregar dados do Firebase para o painel do professor
async function loadTeacherDataFromFirebase(date) {
    if(!isFirebaseReady())  return false;
    
    try {
        const allData = await loadAllDataForDate(date);
        
        // Atualizar estrutura de dados local
        if(typeof dataByDateAndShift !== 'undefined')
            dataByDateAndShift[date] = allData;
        
        return true;
    } catch (error) {
        return false;
    }
}

// Função para inicializar sincronização Firebase no painel do professor
function initializeFirebaseSync() {
    if(!isFirebaseReady()) return;
    
    // Sincronizar dados para a data atual e turno atual
    if(typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
        // Sincronizar todos os turnos da data atual usando a função específica do professor
        syncTeacherDataRealtime(selectedDate, 'manhã');
        syncTeacherDataRealtime(selectedDate, 'tarde');
        syncTeacherDataRealtime(selectedDate, 'noite');
    }
}