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
    console.log('🔥 FIREBASE: Tentando salvar dados', {date, shift, dataLength: data.length});
    
    // Verificar se Firebase está inicializado
    if (!database) {
        console.error('❌ FIREBASE: Database não inicializado');
        return Promise.reject('Database não inicializado');
    }
    
    // Limpar dados removendo valores undefined antes de salvar
    const cleanData = data.map(item => {
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
    });
    
    console.log('✅ FIREBASE: Dados limpos para salvar:', cleanData);
    
    const ref = database.ref(`chaves/${date}/${shift}`);
    console.log('🔥 FIREBASE: Referência criada:', ref.toString());
    
    return ref.set(cleanData).then(() => {
        console.log('✅ FIREBASE: Dados salvos com sucesso!');
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
