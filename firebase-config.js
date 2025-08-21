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
    const ref = database.ref(`chaves/${date}/${shift}`);
    return ref.set(data);
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
    const ref = database.ref(`chaves/${date}/${shift}`);
    ref.on('value', (snapshot) => {
        const data = snapshot.val() || [];
        if (dataByDateAndShift[date]) {
            dataByDateAndShift[date][shift] = data;
            updateTable();
            showNotification('Dados sincronizados em tempo real!', 'success');
        }
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
