let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;
let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Função para obter ou criar estrutura de dados para uma data
function getDataForDate(date) {
    console.log(`[PROFESSOR] ==> getDataForDate chamada para: ${date}`);
    console.log(`[PROFESSOR] ==> dataByDateAndShift[${date}] existe?`, !!dataByDateAndShift[date]);
    
    if (!dataByDateAndShift[date]) {
        console.log(`[PROFESSOR] ==> Criando estrutura vazia para data ${date}`);
        dataByDateAndShift[date] = {
            'manhã': [],
            'tarde': [],
            'noite': []
        };
    }
    
    console.log(`[PROFESSOR] ==> Retornando dados para ${date}:`, dataByDateAndShift[date]);
    return dataByDateAndShift[date];
}

// Função para converter dados do formato admin para professor
function convertAdminDataToTeacherFormat(data) {
    const convertedData = {};
    
    for (let date in data) {
        convertedData[date] = {};
        for (let turno in data[date]) {
            if (Array.isArray(data[date][turno])) {
                convertedData[date][turno] = data[date][turno].map(item => {
                    // Se está no formato do painel administrativo, converter
                    if (item.room && item.professorName) {
                        return {
                            sala: item.room || 'Sala não especificada',
                            professor: item.professorName || 'Professor não especificado',
                            disciplina: item.subject || '-',
                            curso: item.course || '-',
                            turma: item.turmaNumber || '-',
                            horaRetirada: item.withdrawalTime || null,
                            horaDevolucao: item.returnTime || null
                        };
                    }
                    // Se já está no formato do professor, manter
                    else {
                        return item;
                    }
                });
            } else {
                convertedData[date][turno] = data[date][turno] || [];
            }
        }
    }
    
    return convertedData;
}

// Função para obter dados do turno atual na data selecionada
function getCurrentShiftData() {
    console.log(`[PROFESSOR] ==> getCurrentShiftData chamada para data: ${selectedDate}, turno: ${activeShift}`);
    console.log(`[PROFESSOR] ==> dataByDateAndShift completo:`, dataByDateAndShift);
    
    const dateData = getDataForDate(selectedDate);
    console.log(`[PROFESSOR] ==> dateData para ${selectedDate}:`, dateData);
    console.log(`[PROFESSOR] ==> dateData[${activeShift}]:`, dateData[activeShift]);
    console.log(`[PROFESSOR] ==> Tipo de dateData[${activeShift}]:`, typeof dateData[activeShift]);
    console.log(`[PROFESSOR] ==> É array?`, Array.isArray(dateData[activeShift]));
    
    const result = dateData[activeShift] || [];
    console.log(`[PROFESSOR] ==> Resultado final:`, result);
    return result;
}

// Função para sincronizar dados em tempo real com Firebase
function syncDataRealtimeTeacher(date, shift) {
    if (typeof database !== 'undefined') {
        const ref = database.ref(`chaves/${date}/${shift}`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val() || [];
            console.log(`[PROFESSOR] Dados sincronizados do Firebase para ${date}/${shift}:`, data);
            
            if (dataByDateAndShift[date]) {
                const oldData = JSON.stringify(dataByDateAndShift[date][shift] || []);
                const newData = JSON.stringify(data);
                
                dataByDateAndShift[date][shift] = data;
                
                // Se estamos visualizando esta data e turno e os dados mudaram, atualizar a tabela
                if (date === selectedDate && shift === activeShift && oldData !== newData) {
                    renderTableForShift(shift);
                    showNotification('Dados atualizados em tempo real!', 'info');
                }
            }
        });
    }
}

// Função para parar sincronização
function stopSyncDataRealtimeTeacher(date, shift) {
    if (typeof stopSyncDataRealtime === 'function') {
        const ref = database.ref(`chaves/${date}/${shift}`);
        ref.off('value');
    }
}

// Função para carregar dados do Firebase
async function loadDataFromFirebaseTeacher(date, shift) {
    if (typeof loadDataFromFirebase === 'function') {
        try {
            const data = await loadDataFromFirebase(date, shift);
            console.log(`[PROFESSOR] Dados carregados do Firebase para ${date}/${shift}:`, data);
            return data;
        } catch (error) {
            console.error('[PROFESSOR] Erro ao carregar do Firebase:', error);
            return [];
        }
    }
    return [];
}

// Carregar dados do localStorage e Firebase
function loadSharedData() {
    console.log('[PROFESSOR] ==> loadSharedData iniciada');
    console.log('[PROFESSOR] ==> selectedDate atual:', selectedDate);
    console.log('[PROFESSOR] ==> activeShift atual:', activeShift);
    
    // Tentar carregar dados no novo formato (por data)
    const newFormatData = localStorage.getItem('allDateShiftData');
    console.log('[PROFESSOR] Dados brutos do localStorage:', newFormatData);
    
    if (newFormatData) {
        try {
            dataByDateAndShift = JSON.parse(newFormatData);
            console.log('[PROFESSOR] Dados carregados no novo formato:', dataByDateAndShift);
            console.log('[PROFESSOR] Total de datas encontradas:', Object.keys(dataByDateAndShift).length);
            console.log('[PROFESSOR] ==> Chamando renderTableForShift com activeShift:', activeShift);
            renderTableForShift(activeShift);
            
            // Iniciar sincronização Firebase para a data atual
            if (typeof syncDataRealtimeTeacher === 'function') {
                syncDataRealtimeTeacher(selectedDate, 'manhã');
                syncDataRealtimeTeacher(selectedDate, 'tarde');
                syncDataRealtimeTeacher(selectedDate, 'noite');
            }
            
            return;
        } catch (e) {
            console.error('[PROFESSOR] Erro ao carregar dados no novo formato:', e);
        }
    } else {
        console.log('[PROFESSOR] Nenhum dado encontrado em allDateShiftData');
        
        // Tentar carregar do Firebase se localStorage estiver vazio
        if (typeof loadDataFromFirebaseTeacher === 'function') {
            loadDataFromFirebaseTeacher(selectedDate, 'manhã').then(manhaData => {
                loadDataFromFirebaseTeacher(selectedDate, 'tarde').then(tardeData => {
                    loadDataFromFirebaseTeacher(selectedDate, 'noite').then(noiteData => {
                        dataByDateAndShift[selectedDate] = {
                            'manhã': manhaData,
                            'tarde': tardeData,
                            'noite': noiteData
                        };
                        
                        renderTableForShift(activeShift);
                        
                        // Iniciar sincronização
                        syncDataRealtimeTeacher(selectedDate, 'manhã');
                        syncDataRealtimeTeacher(selectedDate, 'tarde');
                        syncDataRealtimeTeacher(selectedDate, 'noite');
                    });
                });
            });
        }
    }
    
    // Fallback: tentar carregar dados no formato antigo e migrar
    const oldFormatData = localStorage.getItem('allShiftData');
    if (oldFormatData) {
        try {
            const parsedData = JSON.parse(oldFormatData);
            console.log('Migrando dados do formato antigo...');
            
            // Migrar dados antigos para a data atual
            const dateData = getDataForDate(selectedDate);
            
            if (Array.isArray(parsedData)) {
                // Formato muito antigo
                dateData['manhã'] = parsedData.filter(item => item && item.turno === 'manhã');
                dateData['tarde'] = parsedData.filter(item => item && item.turno === 'tarde');
                dateData['noite'] = parsedData.filter(item => item && item.turno === 'noite');
            } else {
                // Formato intermediário
                dateData['manhã'] = Array.isArray(parsedData['manhã']) ? parsedData['manhã'].filter(Boolean) : [];
                dateData['tarde'] = Array.isArray(parsedData['tarde']) ? parsedData['tarde'].filter(Boolean) : [];
                dateData['noite'] = Array.isArray(parsedData['noite']) ? parsedData['noite'].filter(Boolean) : [];
            }
            
            // Converter dados do formato do painel administrativo para o formato do painel do professor
            console.log('[PROFESSOR] Convertendo dados do formato administrativo...');
            for (let turno in dateData) {
                if (Array.isArray(dateData[turno])) {
                    console.log(`[PROFESSOR] Convertendo ${dateData[turno].length} registros do turno ${turno}`);
                    dateData[turno] = dateData[turno].map(item => {
                        // Se o item já está no formato do professor, manter
                        if (item.sala && item.professor) {
                            return {
                                sala: item.sala,
                                professor: item.professor,
                                disciplina: item.disciplina || '-',
                                curso: item.curso || '-',
                                turma: item.turma || '-',
                                horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                                horaDevolucao: item.horaDevolucao || item.returnTime || null
                            };
                        }
                        // Se está no formato do painel administrativo, converter
                        else if (item.room && item.professorName) {
                            console.log('[PROFESSOR] Convertendo item do formato admin:', item);
                            return {
                                sala: item.room || 'Sala não especificada',
                                professor: item.professorName || 'Professor não especificado',
                                disciplina: item.subject || '-',
                                curso: item.course || '-',
                                turma: item.turmaNumber || '-',
                                horaRetirada: item.withdrawalTime || null,
                                horaDevolucao: item.returnTime || null
                            };
                        }
                        // Fallback para dados mal formatados
                        else {
                            console.log('[PROFESSOR] Usando fallback para item:', item);
                            return {
                                sala: item.sala || item.room || 'Sala não especificada',
                                professor: item.professor || item.professorName || 'Professor não especificado',
                                disciplina: item.disciplina || item.subject || '-',
                                curso: item.curso || item.course || '-',
                                turma: item.turma || item.turmaNumber || '-',
                                horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                                horaDevolucao: item.horaDevolucao || item.returnTime || null
                            };
                        }
                    });
                }
            }
            
            // Salvar no novo formato
            localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
            console.log('Dados migrados e estruturados:', dataByDateAndShift);
            renderTableForShift(activeShift);
        } catch (e) {
            console.error('Erro ao carregar dados compartilhados:', e);
            dataByDateAndShift = {};
        }
    } else {
        console.log('Nenhum dado encontrado no localStorage');
    }
}

// Escutar por atualizações de dados
window.addEventListener('shiftDataUpdated', function(event) {
    console.log('[PROFESSOR] Evento de atualização recebido:', event.detail);
    if (event.detail && event.detail.data) {
        // Atualizar estrutura de dados completa
        const oldData = JSON.stringify(dataByDateAndShift);
        
        // Converter dados do formato admin para professor
        dataByDateAndShift = convertAdminDataToTeacherFormat(event.detail.data);
        
        console.log('[PROFESSOR] Dados atualizados de:', oldData);
        console.log('[PROFESSOR] Para:', JSON.stringify(dataByDateAndShift));
        
        // Salvar também no localStorage
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Não sincronizar data - cada painel navega independentemente
        // Apenas atualizar os dados se estivermos visualizando a data atual
        console.log('[PROFESSOR] Renderizando tabela para data atual:', selectedDate);
        renderTableForShift(activeShift);
    } else {
        console.error('[PROFESSOR] Evento de atualização recebido sem dados válidos:', event);
    }
});

// Listener para detectar mudanças no localStorage (para sincronização entre abas)
window.addEventListener('storage', function(e) {
    if (e.key === 'allDateShiftData' || e.key === 'allShiftData' || e.key === 'dataUpdateTimestamp') {
        console.log('[PROFESSOR] Detectada atualização de dados em outra aba/janela, chave:', e.key);
        console.log('[PROFESSOR] Novo valor:', e.newValue);
        
        if (e.key === 'allDateShiftData' && e.newValue) {
            try {
                const newData = JSON.parse(e.newValue);
                console.log('[PROFESSOR] Dados brutos recebidos via storage:', newData);
                
                // Converter dados do formato admin para professor
                dataByDateAndShift = convertAdminDataToTeacherFormat(newData);
                console.log('[PROFESSOR] Dados convertidos:', dataByDateAndShift);
                
                renderTableForShift(activeShift);
            } catch (error) {
                console.error('[PROFESSOR] Erro ao processar dados do storage:', error);
            }
        } else {
            loadSharedData();
        }
    }
});

// Inicializar o calendário e carregar dados
document.addEventListener('DOMContentLoaded', function() {
    // Cada painel mantém sua própria data selecionada independentemente

    // Configurar seletor de data
    const dateSelector = document.getElementById('teacherDateSelector');
    if (dateSelector) {
        // Definir data atual como padrão
        dateSelector.value = selectedDate;
        
        // Evento de mudança de data
        dateSelector.addEventListener('change', function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            // Parar sincronização da data anterior
            if (typeof stopSyncDataRealtimeTeacher === 'function') {
                stopSyncDataRealtimeTeacher(oldDate, 'manhã');
                stopSyncDataRealtimeTeacher(oldDate, 'tarde');
                stopSyncDataRealtimeTeacher(oldDate, 'noite');
            }
            
            // Verificar se há dados para esta data
            const dateData = getDataForDate(selectedDate);
            const shiftData = dateData[activeShift] || [];
            console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            
            // Carregar dados do Firebase para a nova data
            if (typeof loadDataFromFirebaseTeacher === 'function') {
                loadDataFromFirebaseTeacher(selectedDate, 'manhã').then(manhaData => {
                    loadDataFromFirebaseTeacher(selectedDate, 'tarde').then(tardeData => {
                        loadDataFromFirebaseTeacher(selectedDate, 'noite').then(noiteData => {
                            dataByDateAndShift[selectedDate] = {
                                'manhã': manhaData,
                                'tarde': tardeData,
                                'noite': noiteData
                            };
                            
                            // Iniciar sincronização em tempo real para a nova data
                            if (typeof syncDataRealtimeTeacher === 'function') {
                                syncDataRealtimeTeacher(selectedDate, 'manhã');
                                syncDataRealtimeTeacher(selectedDate, 'tarde');
                                syncDataRealtimeTeacher(selectedDate, 'noite');
                            }
                            
                            renderTableForShift(activeShift);
                        });
                    });
                });
            } else {
                renderTableForShift(activeShift);
            }
        });
    }

    // Carregar dados iniciais e renderizar
    console.log('[PROFESSOR] ==> Inicializando painel do professor');
    console.log('[PROFESSOR] ==> activeShift inicial:', activeShift);
    console.log('[PROFESSOR] ==> selectedDate inicial:', selectedDate);
    
    renderTabs(); // Garantir que as abas sejam renderizadas
    loadSharedData();
    renderTableForShift(activeShift);
    
    // Teste: verificar se há dados no localStorage
    setTimeout(function() {
        console.log('[PROFESSOR] ==> TESTE: Verificando localStorage após 1 segundo...');
        const testData = localStorage.getItem('allDateShiftData');
        if (testData) {
            console.log('[PROFESSOR] ==> TESTE: Dados encontrados no localStorage');
            const parsed = JSON.parse(testData);
            console.log('[PROFESSOR] ==> TESTE: Dados parseados:', parsed);
            
            // Forçar recarregamento
            dataByDateAndShift = convertAdminDataToTeacherFormat(parsed);
            console.log('[PROFESSOR] ==> TESTE: Dados convertidos forçadamente:', dataByDateAndShift);
            renderTableForShift(activeShift);
        } else {
            console.log('[PROFESSOR] ==> TESTE: Nenhum dado encontrado no localStorage');
        }
    }, 1000);
    
    // Verificar periodicamente por atualizações (fallback para sincronização)
    setInterval(function() {
        const currentTimestamp = localStorage.getItem('dataUpdateTimestamp');
        const lastChecked = window.lastDataCheck || '0';
        
        if (currentTimestamp && currentTimestamp !== lastChecked) {
            console.log('[PROFESSOR] Detectada atualização via polling, recarregando dados...');
            window.lastDataCheck = currentTimestamp;
            loadSharedData();
        }
    }, 2000); // Verificar a cada 2 segundos
});



function login(){
    const username = document.getElementById('username').value;
    const senha = document.getElementById('senha').value;
    if(username === 'admin' && senha === 'adm@123'){
        document.getElementById('overlay').style.display = 'none';
        window.location.href = 'paineladm.html';
    } else {
        document.getElementById('msg-erro').textContent = 'Usuário ou senha incorretos!';
        document.getElementById('msg-erro').style.color = 'red';
    }
}

function showAdmLogin() {
    window.location.href = 'paineladm.html';
}

function hideAdmLogin() {
    document.getElementById('overlay').style.visibility = 'hidden';
}

// ---------- Botão de Ação ----------
function getActionButton(recordId, record) {
    if (record.horaRetirada && !record.horaDevolucao) {
        // Já retirada - opção de devolver
        return `
            <button 
                class="btn action-btn devolver"
                onclick="handleKey('${recordId}', 'return')"
            >
                <i class="bi bi-arrow-return-left me-1"></i>
                Devolver
            </button>
        `;
    } else {
        // Disponível - opção de retirar
        return `
            <button 
                class="btn action-btn retirar"
                onclick="handleKey('${recordId}', 'remove')"
            >
                <i class="bi bi-key me-1"></i>
                Retirar
            </button>
        `;
    }
}

function getStatusBadgeTP(record) {
    if (!record || typeof record !== 'object') {
        return `<span class="status-badge disponivel">Disponível</span>`;
    }

    let status = 'disponivel';
    let label = 'Disponível';

    if (record.horaRetirada) {
        if (!record.horaDevolucao) {
            status = 'em_uso';
            label = 'Em Uso';
        } else {
            status = 'devolvida';
            label = 'Devolvida';
        }
    }

    return `<span class="status-badge ${status}">${label}</span>`;
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando...');
    initialize(); // Usar a função de inicialização única
});

// ---------- Renderização ----------
function renderTabs() {
    const tabs = [
        { id:'manhã', label:'Manhã' },
        { id:'tarde', label:'Tarde' },
        { id:'noite', label:'Noite' },
    ];

    const el = document.getElementById('shiftTabs');

    el.innerHTML = tabs.map(t => `
        <button class="tab ${(t.id === activeShift) ? 'active' : ''}" onclick="switchShift('${t.id}')">
            ${t.label}
        </button>
    `).join('');
}


function sorted(data) {
    if (!Array.isArray(data)) {
        console.error('Dados inválidos para ordenação:', data);
        return [];
    }

    try {
        const validData = data.filter(item => item && typeof item === 'object');
        if (validData.length !== data.length) {
            console.warn('Alguns itens foram removidos por serem inválidos:', data);
        }

        if (sortAlphabetically) {
            return validData.sort((a, b) => {
                if (!a.professor || !b.professor) return 0;
                return (a.professor || '').localeCompare((b.professor || ''), 'pt-BR');
            });
        }
        return validData.sort((a, b) => {
            if (!a.sala || !b.sala) return 0;
            return (a.sala || '').localeCompare((b.sala || ''), 'pt-BR');
        });
    } catch (error) {
        console.error('Erro ao ordenar dados:', error);
        return [];
    }
}

function renderTableForShift(shift) {
    console.log('[PROFESSOR] ==> Renderizando dados para o turno:', shift, 'na data:', selectedDate);
    console.log('[PROFESSOR] ==> Estado atual de dataByDateAndShift:', dataByDateAndShift);
    
    const container = document.getElementById('shiftContent');
    if (!container) {
        console.error('[PROFESSOR] ==> Elemento shiftContent não encontrado!');
        return;
    }
    
    // Usar dados da data e turno selecionados
    let shiftData = getCurrentShiftData();
    console.log('[PROFESSOR] ==> Dados brutos obtidos de getCurrentShiftData():', shiftData);
    console.log('[PROFESSOR] ==> Tipo dos dados:', typeof shiftData, 'É array?', Array.isArray(shiftData));
    
    if (!Array.isArray(shiftData)) {
        console.warn('[PROFESSOR] ==> Dados do turno não são um array:', shift);
        shiftData = [];
    }
    
    console.log('[PROFESSOR] ==> Dados antes da conversão:', shiftData.length, 'itens');
    
    // PRIMEIRO: Converter dados do formato admin para professor se necessário
    shiftData = shiftData.map(item => {
        if (!item || typeof item !== 'object') return item;
        
        // Se está no formato admin (room, professorName), converter
        if (item.room && item.professorName && !item.sala && !item.professor) {
            console.log('[PROFESSOR] ==> Convertendo item do formato admin:', item);
            return {
                sala: item.room || 'Sala não especificada',
                professor: item.professorName || 'Professor não especificado',
                disciplina: item.subject || '-',
                curso: item.course || '-',
                turma: item.turmaNumber || '-',
                horaRetirada: item.withdrawalTime || null,
                horaDevolucao: item.returnTime || null
            };
        }
        
        // Se já está no formato professor ou é outro formato, manter
        return item;
    });
    
    console.log('[PROFESSOR] ==> Dados após conversão:', shiftData);
    console.log('[PROFESSOR] ==> Dados antes da filtragem:', shiftData.length, 'itens');
    
    // SEGUNDO: Filtrar dados inválidos
    const originalLength = shiftData.length;
    shiftData = shiftData.filter(item => {
        if (!item || typeof item !== 'object') {
            console.log('[PROFESSOR] ==> Item rejeitado (não é objeto):', item);
            return false;
        }
        // Garantir que pelo menos a sala e o professor existem
        const valid = item.sala && typeof item.sala === 'string' &&
               item.professor && typeof item.professor === 'string' &&
               item.sala.trim() !== '' && item.professor.trim() !== '';
        
        if (!valid) {
            console.log('[PROFESSOR] ==> Item rejeitado (dados inválidos):');
            console.log('[PROFESSOR] ==> - Objeto completo:', item);
            console.log('[PROFESSOR] ==> - Propriedades do objeto:', Object.keys(item));
            console.log('[PROFESSOR] ==> - item.sala:', item.sala, '(tipo:', typeof item.sala, ')');
            console.log('[PROFESSOR] ==> - item.professor:', item.professor, '(tipo:', typeof item.professor, ')');
            console.log('[PROFESSOR] ==> - item.room:', item.room, '(tipo:', typeof item.room, ')');
            console.log('[PROFESSOR] ==> - item.professorName:', item.professorName, '(tipo:', typeof item.professorName, ')');
        }
        return valid;
    });
    
    console.log('[PROFESSOR] ==> Dados após filtragem:', shiftData.length, 'de', originalLength, 'itens');
    console.log('[PROFESSOR] ==> Dados filtrados:', shiftData);
    const records = sorted(shiftData);

    console.log('Gerando linhas para os registros:', records);
    
    // Se não há dados, mostrar mensagem
    let rows = '';
    if (records.length === 0) {
        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        const shiftCapitalized = shift.charAt(0).toUpperCase() + shift.slice(1);
        
        rows = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x me-2"></i>
                    Nenhum dado encontrado para ${formattedDate} no turno da ${shiftCapitalized.toLowerCase()}
                    <br>
                    <small class="text-muted">Aguarde a importação de dados pelo administrador</small>
                </td>
            </tr>
        `;
    } else {
        rows = records.map(record => {
        // Sanitizar valores para garantir que não são undefined
        const sala = record.sala || '-';
        const curso = record.curso || '-';
        const turma = record.turma || '-';
        const professor = record.professor || '-';
        const disciplina = record.disciplina || '-';
        const horaRetirada = record.horaRetirada || '-';
        const horaDevolucao = record.horaDevolucao || '-';

        return `
        <tr>
            <td>${sala}</td>
            <td>${curso}</td>
            <td>${turma}</td>
            <td class="fw-medium">
                <i class="bi bi-person-circle table-icon"></i>
                ${professor}
            </td>
            <td>
                <i class="bi bi-book table-icon"></i>
                ${disciplina}
            </td>
            <td>${horaRetirada}</td>
            <td>${horaDevolucao}</td>
            <td>${getStatusBadgeTP(record)}</td>
            <td class="text-center">
                ${getActionButton(sala, record)}
            </td>
        </tr>
        `;
        }).join('');
    }

    // Corrigir problema de fuso horário ao exibir a data
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    container.innerHTML = `
        <div class="card-header d-flex align-items-center justify-content-between">
            <h2 class="card-title">
                <i class="bi bi-clock"></i>
                Turno da ${shift}
            </h2>
            <span class="text-muted">
                <i class="bi bi-calendar3 me-1"></i>
                ${formattedDate}
            </span>
        </div>
        <div class="card-body p-0">
        
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="border-0">Sala</th>
                            <th class="border-0">Curso</th>
                            <th class="border-0">Turma</th>
                            <th class="border-0">Professor</th>
                            <th class="border-0">Disciplina</th>
                            <th class="border-0">Hora Inicial</th>
                            <th class="border-0">Hora Final</th>
                            <th class="border-0">Status</th>
                            <th class="border-0 text-center">Devolução</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        ${rows || ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ----------- Ações da chave -----------
function handleKey(salaId, action) {
    const currentData = getCurrentShiftData();
    const record = currentData.find(r => r.sala === salaId);
    if(!record) {
        console.error('Registro não encontrado:', salaId);
        return;
    }

    executeKeyAction(record, action);
}

function executeKeyAction(record, action) {
    const now = new Date();
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = getCurrentShiftData();
    const recordIndex = currentShiftData.findIndex(r => r.sala === record.sala);
    
    if (recordIndex !== -1) {
        if (action === 'remove') {
            currentShiftData[recordIndex].horaRetirada = hm;
            currentShiftData[recordIndex].horaDevolucao = '';  // String vazia ao invés de undefined
            
            // Mostrar notificação
            showNotification(`Chave da ${record.sala} retirada por ${record.professorName} às ${hm}`, 'info');
        } else if (action === 'return') {
            currentShiftData[recordIndex].horaDevolucao = hm;
            
            // Mostrar notificação
            showNotification(`Chave da ${record.sala} devolvida por ${record.professorName} às ${hm}`, 'success');
        }

        // Salvar no Firebase para sincronização em tempo real
        if (typeof saveDataToFirebase === 'function') {
            saveDataToFirebase(selectedDate, activeShift, currentShiftData).then(() => {
                console.log('Dados salvos no Firebase após ação de chave no painel do professor');
            }).catch(error => {
                console.error('Erro ao salvar no Firebase:', error);
            });
        }

        // Atualizar o localStorage com os novos dados
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Disparar evento de atualização (sem sincronizar data)
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
            detail: { shift: activeShift, data: dataByDateAndShift } 
        }));
    }

    renderTableForShift(activeShift);
}

// ----------- Login modal -----------
function openLogin() { 
    document.getElementById('loginModal').style.display = 'flex'; 
}

function closeLogin() { 
    document.getElementById('loginModal').style.display = 'none'; 
    activeAction = null; 
}

function confirmLogin() {
    const name = (document.getElementById('loginName').value || '').trim();
    const id = (document.getElementById('loginId').value || '').trim();

    if(!name || !id) { 
        alert('Por favor, preencha o nome completo e o ID.'); 
        return; 
    }

    const record = activeAction ? activeAction.record : null;
    const professorNameWithoutPrefix = record.professorName.replace(/^Prof\. /, '');

    if(!record || professorNameWithoutPrefix !== name || record.id !== id) {
        alert('Nome de professor ou ID incorretos.');
        return;
    }

    document.getElementById('loginModal').style.display = 'none';

    if(activeAction) { 
        executeKeyAction(activeAction.record, activeAction.action); 
        activeAction = null; 
    }

    document.getElementById('loginName').value = ''; 
    document.getElementById('loginId').value = '';
}

// ----------- Terceiros modal -----------
function openThirdPartyForm() { 
    document.getElementById('thirdPartyModal').style.display = 'flex'; 
}

function closeThirdPartyForm() { 
    document.getElementById('thirdPartyModal').style.display = 'none'; 
}

function saveThirdParty() {
    const name = document.getElementById('tpFullName').value.trim();
    const purpose = document.getElementById('tpPurpose').value.trim();
    const contact = document.getElementById('tpContact').value.trim();
    const notes = document.getElementById('tpNotes').value.trim();

    if(!name || !purpose) { 
        alert('Nome Completo, informações de contato e motivo são obrigatórios.'); 
        return; 
    }

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const newRecord = {
        sala: contact,
        professor: name + " (Terceiro)",
        disciplina: purpose,
        curso: "Terceiros",
        turma: "-",
        horaRetirada: timeString,
        horaDevolucao: undefined,
        notas: notes
    };

    // Adicionar ao array do turno atual na data selecionada
    const dateData = getDataForDate(selectedDate);
    if (!dateData[activeShift]) {
        dateData[activeShift] = [];
    }
    dateData[activeShift].push(newRecord);
    
    // Atualizar localStorage e notificar outros painéis (sem sincronizar data)
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
        detail: { shift: activeShift, data: dataByDateAndShift } 
    }));

    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    document.getElementById('tpContact').value = '';
    document.getElementById('tpNotes').value = '';
    
    closeThirdPartyForm();
    renderTableForShift(activeShift);
}

// ----------- Inicialização e mudança de turno -----------
function initialize() {
    console.log('Inicializando painel do professor...');
    const h = new Date().getHours();
    activeShift = (h < 12) ? 'manhã' : ((h < 18) ? 'tarde' : 'noite');
    console.log('Turno inicial:', activeShift);

    // Carregar dados e configurar interface
    loadSharedData();
    renderTabs();
    
    // Configurar os eventos
    document.getElementById('sortToggle')?.addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn = document.getElementById('sortToggle');
        if (btn) {
            btn.setAttribute('aria-pressed', String(sortAlphabetically));
            renderTableForShift(activeShift);
        }
    });

    // Iniciar verificação automática de turno
    setInterval(autoShiftTick, 60000);
    
    // Inicializar ícones
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function switchShift(shift) { 
    console.log('Mudando para o turno:', shift);
    activeShift = shift; 
    renderTabs(); 
    renderTableForShift(activeShift); // Renderizar dados do novo turno
}

function autoShiftTick() {
    const d = new Date();
    if(d.getHours() === 12 && d.getMinutes() === 0) {
        switchShift('tarde');
    }
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Verificar se a página já foi carregada e inicializar
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
