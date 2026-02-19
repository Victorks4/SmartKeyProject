// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJulZn1wPo3k2I7Mvo2RpnW_8D3Z5T8yM",
  authDomain: "senaikey.firebaseapp.com",
  databaseURL: "https://senaikey-default-rtdb.firebaseio.com",
  projectId: "senaikey",
  storageBucket: "senaikey.firebasestorage.app",
  messagingSenderId: "471515293175",
  appId: "1:471515293175:web:c4b6059d41d6f867f63af2"
};

// Inicializar Firebase
let database;
let firestore;
try {
    // Verificar se Firebase já foi inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    firestore = firebase.firestore();
    console.log('✅ Firebase inicializado com sucesso (Realtime Database + Firestore)');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    database = null;
    firestore = null;
}

// Função para salvar dados no Firebase
function saveDataToFirebase(date, shift, data) {
    console.log(' FIREBASE: Tentando salvar dados', {date, shift, dataLength: data ? data.length : 'undefined'});
    
    // Verificar se Firebase está inicializado
    if (!database) {
        console.error(' FIREBASE: Database não inicializado');
        return Promise.reject('Database não inicializado');
    }
    
    // Verificar se data é válido
    if (!data || !Array.isArray(data)) {
        console.error(' FIREBASE: Dados inválidos recebidos:', data);
        return Promise.reject('Dados inválidos');
    }
    
    // Arrays vazios são válidos - representam turnos sem registros após exclusões
    if (data.length === 0) {
        console.log(' FIREBASE: Array vazio recebido - sincronizando estado sem registros para o turno');
        // Continuar com o salvamento - arrays vazios são válidos
    }
    
    // Limpar dados removendo valores undefined antes de salvar
    const cleanData = data.map(item => {
        if (!item || typeof item !== 'object') {
            console.warn(' FIREBASE: Item inválido encontrado:', item);
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
    
    console.log(' FIREBASE: Dados limpos para salvar:', cleanData);
    console.log(' FIREBASE: Quantidade de registros válidos:', cleanData.length);
    
    // Arrays vazios após limpeza também são válidos (turnos sem registros)
    if (cleanData.length === 0) {
        console.log(' FIREBASE: Array vazio após limpeza - sincronizando estado sem registros');
        // Continuar com o salvamento mesmo com array vazio
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(' FIREBASE: Referência criada:', ref.toString());
    
    return ref.set(cleanData).then(() => {
        console.log(' FIREBASE: Dados salvos com sucesso!');
        console.log(' FIREBASE: Registros salvos:', cleanData.length);
    }).catch(error => {
        console.error(' FIREBASE: Erro ao salvar:', error);
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
    console.log(` SYNC: Iniciando sincronização para ${date}/${shift}`);
    
    if (!database) {
        console.error(' SYNC: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(` SYNC: Referência criada: ${ref.toString()}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`� SYNC [ADMIN]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
        if (dataByDateAndShift[date]) {
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            console.log(` SYNC: Comparando dados - Antigo: ${oldData.length} chars, Novo: ${newData.length} chars`);
            console.log(` SYNC: Data atual: ${selectedDate}, Turno atual: ${activeShift}`);
            console.log(` SYNC: Data sync: ${date}, Turno sync: ${shift}`);
            
            dataByDateAndShift[date][shift] = data;
            
            // Só atualizar se estamos visualizando esta data e turno e se os dados mudaram
            if (date === selectedDate && shift === activeShift && oldData !== newData) {
                console.log(' SYNC: Atualizando tabela - dados mudaram!');
                // Garantir que os dados sejam ordenados antes de atualizar
                if (dataByDateAndShift[date] && dataByDateAndShift[date][shift]) {
                    dataByDateAndShift[date][shift] = dataByDateAndShift[date][shift].sort((a, b) => {
                        const professorA = (a.professorName || '').trim();
                        const professorB = (b.professorName || '').trim();
                        if (!professorA || !professorB) return 0;
                        return professorA.localeCompare(professorB, 'pt-BR');
                    });
                }
                updateTable();
                showNotification('Dados atualizados em tempo real!', 'info');
            } else {
                console.log('⏭ SYNC: Não atualizando - mesmos dados ou data/turno diferente');
            }
        } else {
            console.log(' SYNC: dataByDateAndShift não tem entrada para a data:', date);
        }
    }, (error) => {
        console.error(' SYNC: Erro na sincronização:', error);
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
        console.error('Erro ao carregar dados do Firebase:', error);
        return false;
    }
}

// Função específica para o painel do professor - sincronização em tempo real
function syncTeacherDataRealtime(date, shift) {
    console.log(` SYNC [PROFESSOR]: Iniciando sincronização para ${date}/${shift}`);
    
    if (!database) {
        console.error(' SYNC [PROFESSOR]: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(` SYNC [PROFESSOR]: Referência criada: ${ref.toString()}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`� SYNC [PROFESSOR]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
        // Verifica se a variável global do painel professor existe
        if (typeof dataByDateAndShift !== 'undefined') {
            // Inicializar estrutura se não existir
            if (!dataByDateAndShift[date]) {
                dataByDateAndShift[date] = {
                    'manhã': [],
                    'tarde': [],
                    'noite': []
                };
            }
            
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            console.log(` SYNC [PROFESSOR]: Comparando dados - Antigo: ${oldData.length} chars, Novo: ${newData.length} chars`);
            
            // Converter dados do formato admin para professor se necessário
            const convertedData = data.map(item => {
                if (item.room && item.professorName) {
                    // Formato admin - converter para professor
                    return {
                        sala: item.room || 'Sala não especificada',
                        professor: item.professorName || 'Professor não especificado',
                        disciplina: item.subject || '-',
                        curso: item.course || '-',
                        turma: item.turmaNumber || '-',
                        horaRetirada: item.withdrawalTime || null,
                        horaDevolucao: item.returnTime || null,
                        id: item.id || item.room
                    };
                } else {
                    // Já está no formato do professor ou é compatível
                    return item;
                }
            });
            
            dataByDateAndShift[date][shift] = convertedData;
            
            // Só atualizar se estamos visualizando esta data e turno e se os dados mudaram
            if (typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined' && 
                date === selectedDate && shift === activeShift && oldData !== newData) {
                console.log(' SYNC [PROFESSOR]: Atualizando tabela - dados mudaram!');
                if (typeof renderTableForShift === 'function') {
                    renderTableForShift(activeShift);
                }
            } else {
                console.log('⏭ SYNC [PROFESSOR]: Não atualizando - mesmos dados ou data/turno diferente');
            }
        }
    }, (error) => {
        console.error(' SYNC [PROFESSOR]: Erro na sincronização:', error);
    });
}

// Função para carregar dados do Firebase para o painel do professor
async function loadTeacherDataFromFirebase(date) {
    console.log(` [PROFESSOR]: Carregando dados do Firebase para ${date}`);
    
    try {
        const manhaData = await loadDataFromFirebase(date, 'manhã');
        const tardeData = await loadDataFromFirebase(date, 'tarde');
        const noiteData = await loadDataFromFirebase(date, 'noite');
        
        // Inicializar estrutura se não existir
        if (!dataByDateAndShift[date]) {
            dataByDateAndShift[date] = {
                'manhã': [],
                'tarde': [],
                'noite': []
            };
        }
        
        // Converter dados para o formato do professor
        const convertShiftData = (data) => {
            return (data || []).map(item => {
                if (item.room && item.professorName) {
                    return {
                        sala: item.room || 'Sala não especificada',
                        professor: item.professorName || 'Professor não especificado',
                        disciplina: item.subject || '-',
                        curso: item.course || '-',
                        turma: item.turmaNumber || '-',
                        horaRetirada: item.withdrawalTime || null,
                        horaDevolucao: item.returnTime || null,
                        id: item.id || item.room
                    };
                } else {
                    return item;
                }
            });
        };
        
        dataByDateAndShift[date]['manhã'] = convertShiftData(manhaData);
        dataByDateAndShift[date]['tarde'] = convertShiftData(tardeData);
        dataByDateAndShift[date]['noite'] = convertShiftData(noiteData);
        
        console.log(` [PROFESSOR]: Dados carregados do Firebase para ${date}:`, dataByDateAndShift[date]);
        return true;
    } catch (error) {
        console.error(' [PROFESSOR]: Erro ao carregar dados do Firebase:', error);
        return false;
    }
}

// Função para inicializar sincronização Firebase no painel do professor
function initializeFirebaseSync() {
    console.log(' [PROFESSOR]: Inicializando sincronização Firebase...');
    
    if (!database) {
        console.error(' [PROFESSOR]: Database não disponível para sincronização');
        return;
    }
    
    // Sincronizar dados para a data atual e turno atual
    if (typeof selectedDate !== 'undefined' && typeof activeShift !== 'undefined') {
        console.log(` [PROFESSOR]: Iniciando sincronização para ${selectedDate}/${activeShift}`);
        
        // Sincronizar todos os turnos da data atual usando a função específica do professor
        syncTeacherDataRealtime(selectedDate, 'manhã');
        syncTeacherDataRealtime(selectedDate, 'tarde');
        syncTeacherDataRealtime(selectedDate, 'noite');
        
        console.log(' [PROFESSOR]: Sincronização Firebase inicializada com sucesso!');
    } else {
        console.warn(' [PROFESSOR]: Variáveis selectedDate ou activeShift não definidas');
    }
}

// ============================================
// FUNÇÕES PARA GERENCIAR PROFESSORES NO FIRESTORE
// ============================================

/**
 * Salva todos os dados dos professores (codprof) no Firestore
 * @param {Object} teachersData - Objeto com mapeamento nome -> codprof
 * @returns {Promise<boolean>}
 */
async function saveTeachersToFirestore(teachersData) {
    console.log('💾 [FIRESTORE]: Salvando dados dos professores...');
    
    if (!firestore) {
        console.error('❌ [FIRESTORE]: Firestore não inicializado');
        return false;
    }
    
    if (!teachersData || typeof teachersData !== 'object') {
        console.error('❌ [FIRESTORE]: Dados inválidos recebidos');
        return false;
    }
    
    try {
        await firestore.collection('teachers').doc('codprof').set({
            mapping: teachersData,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            totalTeachers: Object.keys(teachersData).length
        });
        
        console.log(`✅ [FIRESTORE]: ${Object.keys(teachersData).length} professores salvos com sucesso!`);
        return true;
    } catch (error) {
        console.error('❌ [FIRESTORE]: Erro ao salvar professores:', error);
        return false;
    }
}

/**
 * Carrega todos os dados dos professores (codprof) do Firestore
 * @returns {Promise<Object|null>}
 */
async function loadTeachersFromFirestore() {
    console.log('📥 [FIRESTORE]: Carregando dados dos professores...');
    
    if (!firestore) {
        console.error('❌ [FIRESTORE]: Firestore não inicializado');
        return null;
    }
    
    try {
        const doc = await firestore.collection('teachers').doc('codprof').get();
        
        if (doc.exists) {
            const data = doc.data();
            console.log(`✅ [FIRESTORE]: ${data.totalTeachers || 0} professores carregados com sucesso!`);
            return data.mapping || {};
        } else {
            console.warn('⚠️ [FIRESTORE]: Nenhum dado de professores encontrado');
            return null;
        }
    } catch (error) {
        console.error('❌ [FIRESTORE]: Erro ao carregar professores:', error);
        return null;
    }
}

/**
 * Adiciona ou atualiza um professor no Firestore
 * @param {string} name - Nome do professor
 * @param {string} code - Código do professor (CODPROF)
 * @returns {Promise<boolean>}
 */
async function addOrUpdateTeacherInFirestore(name, code) {
    console.log(`💾 [FIRESTORE]: Atualizando professor: ${name} -> ${code}`);
    
    if (!firestore) {
        console.error('❌ [FIRESTORE]: Firestore não inicializado');
        return false;
    }
    
    if (!name || !code) {
        console.error('❌ [FIRESTORE]: Nome ou código inválido');
        return false;
    }
    
    try {
        await firestore.collection('teachers').doc('codprof').update({
            [`mapping.${name}`]: code,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ [FIRESTORE]: Professor ${name} atualizado com sucesso!`);
        return true;
    } catch (error) {
        if (error.code === 'not-found') {
            console.log('📝 [FIRESTORE]: Criando novo documento de professores...');
            return await saveTeachersToFirestore({ [name]: code });
        }
        console.error('❌ [FIRESTORE]: Erro ao adicionar/atualizar professor:', error);
        return false;
    }
}

/**
 * Remove um professor do Firestore
 * @param {string} name - Nome do professor a ser removido
 * @returns {Promise<boolean>}
 */
async function removeTeacherFromFirestore(name) {
    console.log(`🗑️ [FIRESTORE]: Removendo professor: ${name}`);
    
    if (!firestore) {
        console.error('❌ [FIRESTORE]: Firestore não inicializado');
        return false;
    }
    
    if (!name) {
        console.error('❌ [FIRESTORE]: Nome inválido');
        return false;
    }
    
    try {
        await firestore.collection('teachers').doc('codprof').update({
            [`mapping.${name}`]: firebase.firestore.FieldValue.delete(),
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ [FIRESTORE]: Professor ${name} removido com sucesso!`);
        return true;
    } catch (error) {
        console.error('❌ [FIRESTORE]: Erro ao remover professor:', error);
        return false;
    }
}

/**
 * Sincroniza dados dos professores em tempo real
 * @param {Function} callback - Função chamada quando os dados são atualizados
 * @returns {Function} - Função para parar a sincronização
 */
function syncTeachersRealtime(callback) {
    console.log('🔄 [FIRESTORE]: Iniciando sincronização em tempo real dos professores...');
    
    if (!firestore) {
        console.error('❌ [FIRESTORE]: Firestore não inicializado');
        return () => {};
    }
    
    if (typeof callback !== 'function') {
        console.error('❌ [FIRESTORE]: Callback inválido');
        return () => {};
    }
    
    const unsubscribe = firestore.collection('teachers').doc('codprof')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                console.log(`🔄 [FIRESTORE]: Dados dos professores atualizados (${data.totalTeachers || 0} professores)`);
                callback(data.mapping || {});
            } else {
                console.warn('⚠️ [FIRESTORE]: Documento de professores não encontrado');
                callback({});
            }
        }, (error) => {
            console.error('❌ [FIRESTORE]: Erro na sincronização:', error);
        });
    
    console.log('✅ [FIRESTORE]: Sincronização em tempo real ativada');
    return unsubscribe;
}
