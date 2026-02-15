// Configuração do Firebase
const firebaseConfig = {
  apiKey:            "AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM",
  authDomain:        "senaikey.firebaseapp.com",
  databaseURL:       "https://senaikey-default-rtdb.firebaseio.com",
  projectId:         "senaikey",
  storageBucket:     "senaikey.firebasestorage.app",
  messagingSenderId: "471515293175",
  appId:             "1:471515293175:web:c4b6059d41d6f867f63af2"
};

// Inicializar Firebase
let database;
let firestore;

try {
    // Verificar se Firebase já foi inicializado
    if(!firebase.apps.length)
        firebase.initializeApp(firebaseConfig);

    database  = firebase.database();
    firestore = firebase.firestore();
} catch (error) {
    database  = null;
    firestore = null;
}

// Função para salvar dados no Firebase
function saveDataToFirebase(date, shift, data) {
    // Verificar se Firebase está inicializado
    if(!database) return Promise.reject('Database não inicializado');
    
    // Verificar se data é válido
    if(!data || !Array.isArray(data))
        return Promise.reject('Dados inválidos');
    
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
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    return ref.set(cleanData).catch(error => {
        throw error;
    });
}

// Função para carregar dados do Firebase
function loadDataFromFirebase(date, shift) {
    const ref = database.ref(`chaves/${date}/${shift}`);
    return ref.once('value').then((snapshot) => {
        return snapshot.val() || [];
    });
}

// Função para sincronizar dados em tempo real
function syncDataRealtime(date, shift) {
    if(!database) return;
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        
        if(dataByDateAndShift[date]) {
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            dataByDateAndShift[date][shift] = data;
            
            // Só atualizar se estamos visualizando esta data e turno e se os dados mudaram
            if(date === selectedDate && shift === activeShift && oldData !== newData) {
                // Garantir que os dados sejam ordenados antes de atualizar
                if(dataByDateAndShift[date] && dataByDateAndShift[date][shift]) {
                    dataByDateAndShift[date][shift] = dataByDateAndShift[date][shift].sort((a, b) => {
                        const professorA = (a.professorName || '').trim();
                        const professorB = (b.professorName || '').trim();

                        if(!professorA || !professorB) return 0;

                        return professorA.localeCompare(professorB, 'pt-BR');
                    });
                }
                updateTable();
                showNotification('Dados atualizados em tempo real!', 'info');
            }
        }
    }, (error) => {
    });
}

// Função para parar sincronização
function stopSyncDataRealtime(date, shift) {
    const ref = database.ref(`chaves/${date}/${shift}`);
    ref.off('value');
}

// Função para carregar todos os dados de uma data
async function loadAllDataForDate(date) {
    try {
        const manhaData = await loadDataFromFirebase(date, 'manhã');
        const tardeData = await loadDataFromFirebase(date, 'tarde');
        const noiteData = await loadDataFromFirebase(date, 'noite');
        
        dataByDateAndShift[date] = {
            'manhã': manhaData,
            'tarde': tardeData,
            'noite': noiteData
        };
        
        return true;
    } catch (error) {
        return false;
    }
}

// Função específica para o painel do professor - sincronização em tempo real
function syncTeacherDataRealtime(date, shift) {
    if(!database) return;
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];

        // Verifica se a variável global do painel professor existe
        if(typeof dataByDateAndShift !== 'undefined') {
            // Inicializar estrutura se não existir
            if(!dataByDateAndShift[date]) {
                dataByDateAndShift[date] = {
                    'manhã': [],
                    'tarde': [],
                    'noite': []
                };
            }
            
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            // Converter dados do formato admin para professor se necessário
            const convertedData = data.map(item => {
                if(item.room && item.professorName) {
                    // Formato admin - converter para professor
                    return {
                        id:            item.id             || item.room,
                        sala:          item.room           || 'Sala não especificada',
                        professor:     item.professorName  || 'Professor não especificado',
                        disciplina:    item.subject        || '-',
                        curso:         item.course         || '-',
                        turma:         item.turmaNumber    || '-',
                        horaRetirada:  item.withdrawalTime || null,
                        horaDevolucao: item.returnTime     || null,
                    };
                } else {
                    // Já está no formato do professor ou é compatível
                    return item;
                }
            });
            
            dataByDateAndShift[date][shift] = convertedData;
            
            // Só atualizar se estamos visualizando esta data e turno e se os dados mudaram
            if(typeof selectedDate !== 'undefined' && 
                typeof activeShift !== 'undefined' && 
                date    === selectedDate && 
                shift   === activeShift  && 
                oldData !== newData
            ) {
                if(typeof renderTableForShift === 'function') renderTableForShift(activeShift);
            }
        }
    }, (error) => {
    });
}

// Função para carregar dados do Firebase para o painel do professor
async function loadTeacherDataFromFirebase(date) {
    try {
        const manhaData = await loadDataFromFirebase(date, 'manhã');
        const tardeData = await loadDataFromFirebase(date, 'tarde');
        const noiteData = await loadDataFromFirebase(date, 'noite');
        
        // Inicializar estrutura se não existir
        if(!dataByDateAndShift[date]) {
            dataByDateAndShift[date] = {
                'manhã': [],
                'tarde': [],
                'noite': []
            };
        }
        
        // Converter dados para o formato do professor
        const convertShiftData = (data) => {
            return (data || []).map(item => {
                if(item.room && item.professorName) {
                    return {
                        id:            item.id             || item.room,
                        sala:          item.room           || 'Sala não especificada',
                        professor:     item.professorName  || 'Professor não especificado',
                        disciplina:    item.subject        || '-',
                        curso:         item.course         || '-',
                        turma:         item.turmaNumber    || '-',
                        horaRetirada:  item.withdrawalTime || null,
                        horaDevolucao: item.returnTime     || null
                    };
                } else {
                    return item;
                }
            });
        };
        
        dataByDateAndShift[date]['manhã'] = convertShiftData(manhaData);
        dataByDateAndShift[date]['tarde'] = convertShiftData(tardeData);
        dataByDateAndShift[date]['noite'] = convertShiftData(noiteData);
        
        return true;
    } catch (error) {
        return false;
    }
}

// Função para inicializar sincronização Firebase no painel do professor
function initializeFirebaseSync() {
    if(!database) return;
    
    // Sincronizar dados para a data atual e turno atual
    if(typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
        // Sincronizar todos os turnos da data atual usando a função específica do professor
        syncTeacherDataRealtime(selectedDate, 'manhã');
        syncTeacherDataRealtime(selectedDate, 'tarde');
        syncTeacherDataRealtime(selectedDate, 'noite');
    }
}

// ================ FUNÇÕES PARA GERENCIAR PROFESSORES NO FIRESTORE ================

// Salva todos os dados dos professores (codprof) no Firestore
async function saveTeachersToFirestore(teachersData) {
    if(!firestore || !teachersData || typeof teachersData !== 'object') 
        return false;
    
    try {
        await firestore.collection('teachers').doc('codprof').set({
            mapping:       teachersData,
            lastUpdate:    firebase.firestore.FieldValue.serverTimestamp(),
            totalTeachers: Object.keys(teachersData).length
        });
        
        return true;
    } catch (error) {
        return false;
    }
}

// Carrega todos os dados dos professores (codprof) do Firestore
async function loadTeachersFromFirestore() {
    if(!firestore) return null;
    
    try {
        const doc = await firestore.collection('teachers').doc('codprof').get();
        
        if(doc.exists) {
            const data = doc.data();
            return data.mapping || {};
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Adiciona ou atualiza um professor no Firestore
async function addOrUpdateTeacherInFirestore(name, code) {
    if(!name || !code || !firestore) return false;
    
    try {
        await firestore.collection('teachers').doc('codprof').update({
            [`mapping.${name}`]: code,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        if(error.code === 'not-found') 
            return await saveTeachersToFirestore({ [name]: code });

        return false;
    }
}

// Remove um professor do Firestore
async function removeTeacherFromFirestore(name) {
    if(!firestore || !name) return false;
    
    try {
        await firestore.collection('teachers').doc('codprof').update({
            [`mapping.${name}`]: firebase.firestore.FieldValue.delete(),
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return true;
    } catch (error) {
        return false;
    }
}

// Sincroniza dados dos professores em tempo real
function syncTeachersRealtime(callback) {
    if(!firestore) return () => {};
    
    if(typeof callback !== 'function') return () => {};
    
    const unsubscribe = firestore.collection('teachers').doc('codprof')
        .onSnapshot((doc) => {
            if(doc.exists) {
                const data = doc.data();
                callback(data.mapping || {});
            } else {
                callback({});
            }
        }, (error) => {
        });
    
    return unsubscribe;
}
