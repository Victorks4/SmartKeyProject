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
firebase.initializeApp(firebaseConfig);

// Referência ao banco de dados
const database = firebase.database();

// Função para salvar dados no Firebase
function saveDataToFirebase(date, shift, data) {
    console.log('🔥 FIREBASE: Tentando salvar dados', {date, shift, dataLength: data ? data.length : 'undefined'});
    
    // Verificar se Firebase está inicializado
    if (!database) {
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
    const ref = database.ref(`chaves/${date}/${shift}`);
    return ref.once('value').then((snapshot) => {
        return snapshot.val() || [];
    });
}

// Função para sincronizar dados em tempo real
function syncDataRealtime(date, shift) {
    console.log(`🔄 SYNC: Iniciando sincronização para ${date}/${shift}`);
    
    if (!database) {
        console.error('❌ SYNC: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(`🔄 SYNC: Referência criada: ${ref.toString()}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`📥 SYNC [ADMIN]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
        if (dataByDateAndShift[date]) {
            const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
            const newData = JSON.stringify(data);
            
            console.log(`🔍 SYNC: Comparando dados - Antigo: ${oldData.length} chars, Novo: ${newData.length} chars`);
            console.log(`🔍 SYNC: Data atual: ${selectedDate}, Turno atual: ${activeShift}`);
            console.log(`🔍 SYNC: Data sync: ${date}, Turno sync: ${shift}`);
            
            dataByDateAndShift[date][shift] = data;
            
            // Só atualizar se estamos visualizando esta data e turno e se os dados mudaram
            if (date === selectedDate && shift === activeShift && oldData !== newData) {
                console.log('✅ SYNC: Atualizando tabela - dados mudaram!');
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
                console.log('⏭️ SYNC: Não atualizando - mesmos dados ou data/turno diferente');
            }
        } else {
            console.log('❌ SYNC: dataByDateAndShift não tem entrada para a data:', date);
        }
    }, (error) => {
        console.error('❌ SYNC: Erro na sincronização:', error);
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
    console.log(`🔄 SYNC [PROFESSOR]: Iniciando sincronização para ${date}/${shift}`);
    
    if (!database) {
        console.error('❌ SYNC [PROFESSOR]: Database não disponível para sincronização');
        return;
    }
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log(`🔄 SYNC [PROFESSOR]: Referência criada: ${ref.toString()}`);
    
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        console.log(`📥 SYNC [PROFESSOR]: Dados recebidos do Firebase para ${date}/${shift}:`, data);
        
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
            
            console.log(`🔍 SYNC [PROFESSOR]: Comparando dados - Antigo: ${oldData.length} chars, Novo: ${newData.length} chars`);
            
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
                console.log('✅ SYNC [PROFESSOR]: Atualizando tabela - dados mudaram!');
                if (typeof renderTableForShift === 'function') {
                    renderTableForShift(activeShift);
                }
            } else {
                console.log('⏭️ SYNC [PROFESSOR]: Não atualizando - mesmos dados ou data/turno diferente');
            }
        }
    }, (error) => {
        console.error('❌ SYNC [PROFESSOR]: Erro na sincronização:', error);
    });
}

// Função para carregar dados do Firebase para o painel do professor
async function loadTeacherDataFromFirebase(date) {
    console.log(`🔄 [PROFESSOR]: Carregando dados do Firebase para ${date}`);
    
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
    
    if (!database) {
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
