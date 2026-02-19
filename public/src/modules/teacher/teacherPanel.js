let activeAction       = null;
let activeShift        = 'manhã';
let sortAlphabetically = false;
let selectedDate       = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Variáveis para seleção múltipla de chaves
let selectedKeys          = [];
let multipleSelectionMode = false;
let currentKeyMode        = null; // 'single' ou 'multiple'

// FATS GERAL - com constante privada  
const PRIVATE_KEY = Symbol('sharedTeacherFats');

const ConstantManager = {
  [PRIVATE_KEY]: "GFATS964",

  validate(input) {
    return input === this[PRIVATE_KEY];
  },
  getEncodedValue() {
    return btoa(this[PRIVATE_KEY]);
  }
};

// Função para adicionar novo professor ao mapeamento docentesCodprof
function addProfessorToMapping(professorName, fast) {
    if(!professorName || !fast) return false;
    
    // Normaliza o FAST para maiúsculas
    const normalizedFast = fast.toString().trim().toUpperCase();
    const normalizedName = professorName.trim();
    
    // Verifica se o professor já existe
    if(window.docentesCodprof[normalizedName]) return false;
    
    // Verifica se o FAST já está sendo usado por outro professor
    for(const [existingName, existingFast] of Object.entries(window.docentesCodprof)) {
        if(existingFast === normalizedFast) return false;
    }
    
    // Adiciona o professor ao mapeamento
    window.docentesCodprof[normalizedName] = normalizedFast;
    
    // Salva no localStorage para persistência
    saveDocentesCodprofToStorage();
    
<<<<<<< HEAD:public/src/modules/teacher/teacherPanel.js
    // Salva no Firestore
    if(typeof addOrUpdateTeacherInFirestore === 'function')
        addOrUpdateTeacherInFirestore(normalizedName, normalizedFast)
    
=======
    console.log(`✅ Professor ${normalizedName} adicionado ao mapeamento com FAST: ${normalizedFast}`);
>>>>>>> parent of 0f45289 (🔥 Atualização cadastro dos professores):public/js/teacherPanel.js
    return true;
}

// Função para salvar o mapeamento docentesCodprof no localStorage
function saveDocentesCodprofToStorage() {
    try {
        localStorage.setItem('docentesCodprof', JSON.stringify(window.docentesCodprof));
    } catch(error) {
        console.error('Erro ao salvar mapeamento no localStorage: ', error);
    }
}

// Função para carregar o mapeamento docentesCodprof do localStorage
function loadDocentesCodprofFromStorage() {
    try {
        const saved = localStorage.getItem('docentesCodprof');
        if(saved) {
            const savedMapping = JSON.parse(saved);
            // Atualizar window.docentesCodprof com dados do localStorage
            window.docentesCodprof = savedMapping;
        }
    } catch(error) {
        console.error('❌ Erro ao carregar mapeamento do localStorage:', error);
    }
}

// Função global para ser chamada de outras páginas
window.addNewProfessorToTeacherPanel = (professorName, fast) => {
    return addProfessorToMapping(professorName, fast);
};

// Função para buscar professor por FAST
window.findProfessorByFast = (fast) => {
    for (const [name, professorFast] of Object.entries(window.docentesCodprof)) {
        if(professorFast === fast) return name;
    }
    return null;
};

// Função para exportar o mapeamento atualizado como código JavaScript
window.exportDocentesCodprof = () => {
    const mappingEntries = Object.entries(window.docentesCodprof)
        .sort(([a], [b])    => a.localeCompare(b))
        .map(([name, fast]) => `    "${name}": "${fast}"`)
        .join(',\n');
    
    const exportCode = `const docentesCodprof = {\n${mappingEntries}\n};`;
    
    // Copiar para clipboard se disponível
    if(navigator.clipboard) {
        navigator.clipboard.writeText(exportCode).then(() => {
            console.log(' Código copiado para a área de transferência!');
        });
    }
    
    return exportCode;
};

// Evento para escutar mudanças no localStorage de outras páginas
window.addEventListener('storage', (e) => {
    console.log(' Evento storage recebido:', {
        key:      e.key,
        oldValue: e.oldValue ? 'presente' : 'null',
        newValue: e.newValue ? 'presente' : 'null'
    });
    
    if(e.key === 'docentesCodprof')  loadDocentesCodprofFromStorage();
    if(e.key === 'allDateShiftData') loadSharedData();
    if(e.key === 'allShiftData')     loadSharedData();
});

// Evento para escutar cadastro de novos professores no painel administrativo (mesma aba)
window.addEventListener('teacherAdded', (e) => {
    loadDocentesCodprofFromStorage();
});

// Evento para escutar mudanças específicas de registros do painel administrativo
window.addEventListener('dataUpdated', (e) => {
    if(e.detail && e.detail.type === 'recordUpdated') {
        // Recarregar dados e atualizar a tabela
        loadSharedData().then(() => {
            // Mostrar notificação visual da atualização
            showUpdateNotification(e.detail);
        });
    }
});

// Função para mostrar notificação de atualização
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className     = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    notification.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        <strong>Dados Atualizados!</strong><br>
        <small>Registro atualizado pelo administrador</small>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if(notification.parentNode) notification.remove();
    }, 5000);
}

// Retorna o FAST correspondente ao nome do professor informado
function getFastForProfessor(professorName) {
    if(!professorName || typeof professorName !== 'string') return '';
    
    if(window.docentesCodprof[professorName]) 
        return String(window.docentesCodprof[professorName]).trim();
    
    const target = professorName.trim().toLocaleLowerCase('pt-BR');

    for(const name of Object.keys(window.docentesCodprof)) {
        if(name.trim().toLocaleLowerCase('pt-BR') === target)
            return String(window.docentesCodprof[name]).trim();
    }

    return '';
}

// Função para obter ou criar estrutura de dados para uma data
function getDataForDate(date) {
    if(!dataByDateAndShift[date]) {
        dataByDateAndShift[date] = {
            'manhã': [],
            'tarde': [],
            'noite': []
        };
    }
    
    return dataByDateAndShift[date];
}

// Função para converter dados do formato admin para professor
function convertAdminDataToTeacherFormat(data) {
    const convertedData = {};
    
    for (let date in data) {
        convertedData[date] = {};
        for (let turno in data[date]) {
            if(Array.isArray(data[date][turno])) {
                convertedData[date][turno] = data[date][turno].map(item => {
                    // Se está no formato do painel administrativo, converter
                    if(item.room && item.professorName) {
                        return {
                            id:             item.id             || '',
                            sala:           item.room           || 'Sala não especificada',
                            professor:      item.professorName  || 'Professor não especificado',
                            disciplina:     item.subject        || '-',
                            curso:          item.course         || '-',
                            turma:          item.turmaNumber    || '-',
                            horaRetirada:   item.withdrawalTime || null,
                            horaDevolucao:  item.returnTime     || null,
                            // Manter campos originais para compatibilidade
                            room:           item.room,
                            professorName:  item.professorName,
                            subject:        item.subject,
                            course:         item.course,
                            turmaNumber:    item.turmaNumber,
                            withdrawalTime: item.withdrawalTime,
                            returnTime:     item.returnTime,
                            status:         item.status || 'disponivel',
                        };
                    }
                    // Se já está no formato do professor, manter
                    else if(item.sala && item.professor) {
                        return {
                            ...item,
                            // Adicionar campos do formato admin para compatibilidade
                            id:             item.id || item.sala,
                            room:           item.sala,
                            professorName:  item.professor,
                            subject:        item.disciplina,
                            course:         item.curso,
                            turmaNumber:    item.turma,
                            withdrawalTime: item.horaRetirada,
                            returnTime:     item.horaDevolucao,
                            status: item.horaRetirada && !item.horaDevolucao ? 'em_uso'    : 
                                    item.horaRetirada && item.horaDevolucao  ? 'devolvida' : 'disponivel'
                        };
                    }
                    // Fallback para dados mal formatados
                    else {
                        return {
                            id:             item.id            || item.sala           || item.room,
                            sala:           item.sala          || item.room           || 'Sala não especificada',
                            professor:      item.professor     || item.professorName  || 'Professor não especificado',
                            disciplina:     item.disciplina    || item.subject        || '-',
                            curso:          item.curso         || item.course         || '-',
                            turma:          item.turma         || item.turmaNumber    || '-',
                            horaRetirada:   item.horaRetirada  || item.withdrawalTime || null,
                            horaDevolucao:  item.horaDevolucao || item.returnTime     || null,
                            // Campos de compatibilidade
                            room:           item.sala          || item.room,
                            professorName:  item.professor     || item.professorName,
                            subject:        item.disciplina    || item.subject,
                            course:         item.curso         || item.course,
                            turmaNumber:    item.turma         || item.turmaNumber,
                            withdrawalTime: item.horaRetirada  || item.withdrawalTime,
                            returnTime:     item.horaDevolucao || item.returnTime,
                            status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                    (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime)  ? 'devolvida' : 'disponivel'
                        };
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
    // Validar se selectedDate e activeShift estão definidos
    if(!selectedDate || !activeShift) return [];
    
    const dateData = getDataForDate(selectedDate);
    let result     = dateData[activeShift] || [];
    
    // Garantir que result é sempre um array válido
    if(!Array.isArray(result)) result = [];
    
    // Filtrar dados inválidos
    result = result.filter(item => {
        return !item || typeof item !== 'object' ? 0 : 1;
    });
    
    return result;
}

// Carregar dados do Firebase e localStorage como fallback
async function loadSharedData() {    
    // Primeiro, tentar carregar dados do Firebase
    let firebaseLoaded = false;

    if(typeof loadTeacherDataFromFirebase === 'function') {
        try {
            firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
            if(firebaseLoaded) {
                // Iniciar sincronização em tempo real para todos os turnos
                if(typeof syncTeacherDataRealtime === 'function') {
                    syncTeacherDataRealtime(selectedDate, 'manhã');
                    syncTeacherDataRealtime(selectedDate, 'tarde');
                    syncTeacherDataRealtime(selectedDate, 'noite');
                }
                
                renderTableForShift(activeShift);
                return;
            }
        } catch (error) {
            console.error('[PROFESSOR]  Erro ao carregar do Firebase:', error);
        }
    }
    
    // Fallback: tentar carregar dados do localStorage se Firebase falhou
    if(!firebaseLoaded) {
        const newFormatData = localStorage.getItem('allDateShiftData');
        
        if(newFormatData) {
            try {
                dataByDateAndShift = JSON.parse(newFormatData);
                // Converter dados para garantir compatibilidade
                dataByDateAndShift = convertAdminDataToTeacherFormat(dataByDateAndShift);
                renderTableForShift(activeShift);
                return;
            } catch (e) {
                console.error('[PROFESSOR] Erro ao carregar dados no novo formato:', e);
            }
        }
    }
    
    // Fallback: tentar carregar dados no formato antigo e migrar
    const oldFormatData = localStorage.getItem('allShiftData');
    
    if(oldFormatData) {
        try {
            const parsedData = JSON.parse(oldFormatData);
            // Migrar dados antigos para a data atual
            const dateData = getDataForDate(selectedDate);
            
            if(Array.isArray(parsedData)) {
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
            
            // Converter dados do formato do painel administrativo para o formato do professor
            for (let turno in dateData) {
                if(Array.isArray(dateData[turno])) {
                    dateData[turno] = dateData[turno].map(item => {
                        // Se o item já está no formato do professor, manter
                        if(item.sala && item.professor) {
                            return {
                                ...item,
                                // Garantir que tenha ID único
                                id: item.id || item.sala || `record_${Math.random().toString(36).substr(2, 9)}`
                            };
                        }
                        // Se está no formato do painel administrativo, converter
                        else if(item.room && item.professorName) {
                            return {
                                id:             item.id || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala:           item.room            || 'Sala não especificada',
                                professor:      item.professorName   || 'Professor não especificado',
                                disciplina:     item.subject         || '-',
                                curso:          item.course          || '-',
                                turma:          item.turmaNumber     || '-',
                                horaRetirada:   item.withdrawalTime  || null,
                                horaDevolucao:  item.returnTime      || null,
                                // Manter campos originais para compatibilidade
                                room:           item.room,
                                professorName:  item.professorName,
                                subject:        item.subject,
                                course:         item.course,
                                turmaNumber:    item.turmaNumber,
                                withdrawalTime: item.withdrawalTime,
                                returnTime:     item.returnTime,
                                status:         item.status || 'disponivel'
                            };
                        }
                        // Fallback para dados mal formatados
                        else {
                            console.log('[PROFESSOR] Usando fallback para item:', item);
                            return {
                                id:             item.id            || item.sala           || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala:           item.sala          || item.room           || 'Sala não especificada',
                                professor:      item.professor     || item.professorName  || 'Professor não especificado',
                                disciplina:     item.disciplina    || item.subject        || '-',
                                curso:          item.curso         || item.course         || '-',
                                turma:          item.turma         || item.turmaNumber    || '-',
                                horaRetirada:   item.horaRetirada  || item.withdrawalTime || null,
                                horaDevolucao:  item.horaDevolucao || item.returnTime     || null,
                                // Campos de compatibilidade
                                room:           item.sala          || item.room,
                                professorName:  item.professor     || item.professorName,
                                subject:        item.disciplina    || item.subject,
                                course:         item.curso         || item.course,
                                turmaNumber:    item.turma         || item.turmaNumber,
                                withdrawalTime: item.horaRetirada  || item.withdrawalTime,
                                returnTime: item.horaDevolucao     || item.returnTime,
                                status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                        (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime)  ? 'devolvida' : 'disponivel'
                            };
                        }
                    });
                }
            }
            
            // Salvar no novo formato
            localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
            renderTableForShift(activeShift);
        } catch (e) {
            dataByDateAndShift = {};
        }
    }
}

// Escutar por atualizações de dados
window.addEventListener('shiftDataUpdated', (event) => {
    console.log('[PROFESSOR] Evento de atualização recebido:', event.detail);
    if(event.detail && event.detail.data) {
        // Atualizar estrutura de dados completa
        JSON.stringify(dataByDateAndShift);
        
        // Converter dados do formato admin para professor
        dataByDateAndShift = convertAdminDataToTeacherFormat(event.detail.data);
        
        // Salvar também no localStorage
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Não sincronizar data - cada painel navega independentemente
        // Apenas atualizar os dados se estivermos visualizando a data atual
        renderTableForShift(activeShift);
    } else {
        console.error('[PROFESSOR] Evento de atualização recebido sem dados válidos:', event);
    }
});

// Listener para detectar mudanças no localStorage (para sincronização entre abas)
window.addEventListener('storage', function(e) {
    if(e.key === 'allDateShiftData' || e.key === 'allShiftData' || e.key === 'dataUpdateTimestamp') {        
        if(e.key === 'allDateShiftData' && e.newValue) {
            try {
                const newData = JSON.parse(e.newValue);
                
                // Converter dados do formato admin para professor
                dataByDateAndShift = convertAdminDataToTeacherFormat(newData);
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
    // Configurar seletor de data
    const dateSelector = document.getElementById('teacherDateSelector');
    if(dateSelector) {
        // Definir data atual como padrão
        dateSelector.value = selectedDate;
        
        // Evento de mudança de data
        dateSelector.addEventListener('change', async function() {
            const oldDate = selectedDate;
            selectedDate  = this.value;
            
            // Parar sincronização da data anterior
            if(typeof stopSyncDataRealtime === 'function') {
                stopSyncDataRealtime(oldDate, 'manhã');
                stopSyncDataRealtime(oldDate, 'tarde');
                stopSyncDataRealtime(oldDate, 'noite');
            }
            
            // Carregar dados da nova data do Firebase
            let firebaseLoaded = false;
            if(typeof loadTeacherDataFromFirebase === 'function') {
                try {
                    firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
                    if(firebaseLoaded) {
                        // Iniciar sincronização para a nova data
                        if(typeof syncTeacherDataRealtime === 'function') {
                            syncTeacherDataRealtime(selectedDate, 'manhã');
                            syncTeacherDataRealtime(selectedDate, 'tarde');
                            syncTeacherDataRealtime(selectedDate, 'noite');
                        }
                    }
                } catch(error) {
                    console.error('[PROFESSOR]  Erro ao carregar nova data do Firebase:', error);
                }
            }
            
            // Se não conseguiu carregar do Firebase, verificar localStorage
            if(!firebaseLoaded) {
                const dateData  = getDataForDate(selectedDate);
                const shiftData = dateData[activeShift] || [];
            }
            
            renderTableForShift(activeShift);
        });
    }

    renderTabs(); // Garantir que as abas sejam renderizadas
    
    // Carregar dados de forma assíncrona
    loadSharedData().then(() => {
        renderTableForShift(activeShift);
    }).catch(error => {
        renderTableForShift(activeShift); // Tentar renderizar mesmo com erro
    });
    
    // Teste: verificar se há dados no localStorage
    setTimeout(() => {
        const testData = localStorage.getItem('allDateShiftData');
        if(testData) {
            const parsed = JSON.parse(testData);
            // Forçar recarregamento
            dataByDateAndShift = convertAdminDataToTeacherFormat(parsed);
            renderTableForShift(activeShift);
        }
    }, 1000);
    
    // Verificar periodicamente por atualizações (fallback para sincronização)
    setInterval(() => {
        const currentTimestamp = localStorage.getItem('dataUpdateTimestamp');
        const lastChecked      = window.lastDataCheck || '0';
        
        if(currentTimestamp && currentTimestamp !== lastChecked) {
            window.lastDataCheck = currentTimestamp;
            loadSharedData();
        }
    }, 2000); // Verificar a cada 2 segundos
});

function showAdmLogin() {
    window.location.href = 'paineladm.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

function hideAdmLogin() {
    document.getElementById('overlay').style.visibility = 'hidden';
}

// ---------- Botão de Ação ----------
function getActionButton(recordId, record) {
    // Verificar se a chave está em uso usando campos do professor
    const isInUse = (record.horaRetirada && !record.horaDevolucao) || 
                    (record.withdrawalTime && !record.returnTime)  ||
                    record.status === 'em_uso';
    
    if(isInUse) {
        // Já retirada - opção de devolver
        return `
            <button 
                class="btn action-btn devolver"
                onclick="handleKey('${record.id || record.sala}', 'return')"
            >
                <i class="bi bi-arrow-return-left me-1"></i>
                Devolver
            </button>
        `;
    } else if(record.horaDevolucao) {
        // Indisponível - opção de retirar bloqueada após devolução
        return `
            <div style="cursor: not-allowed">
                <button class="btn action-btn btn-locked">
                    <i class="bi bi-key me-1"></i>
                    Retirar
                </button>
            </div>
        `;
    } 
    else {
        // Disponível - opção de retirar
        return `
            <button 
                class="btn action-btn retirar"
                onclick="handleKey('${record.id || record.sala}', 'remove')"
            >
                <i class="bi bi-key me-1"></i>
                Retirar
            </button>
        `;
    }
}

function getStatusBadgeTP(record) {
    if(!record || typeof record !== 'object')
        return `<span class="status-badge disponivel">Disponível</span>`;

    let status = 'disponivel';
    let label  = 'Disponível';

    // Verificar status usando campos do professor
    if(record.horaRetirada) {
        if(!record.horaDevolucao) {
            status = 'em_uso';
            label  = 'Em Uso';
        } else {
            status = 'devolvida';
            label  = 'Devolvida';
        }
    }
    // Verificar status usando campos do administrador se os do professor não estiverem disponíveis
    else if(record.withdrawalTime) {
        if(!record.returnTime) {
            status = 'em_uso';
            label  = 'Em Uso';
        } else {
            status = 'devolvida';
            label  = 'Devolvida';
        }
    }
    // Verificar status direto se disponível
    else if(record.status) {
        status = record.status;

        switch (record.status) {
            case 'em_uso':    label = 'Em Uso';     break;
            case 'devolvida': label = 'Devolvida';  break;
            case 'retirada':  label = 'Retirada';   break;
            default:          label = 'Disponível';
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
    if(!Array.isArray(data)) return [];

    try {
        const validData = data.filter(item => item && typeof item === 'object');

        // Sempre ordenar alfabeticamente por professor para manter consistência com painel administrativo
        return validData.sort((a, b) => {
            const professorA = (a.professor || '').trim();
            const professorB = (b.professor || '').trim();

            if(!professorA || !professorB) return 0;
            return professorA.localeCompare(professorB, 'pt-BR');
        });
    } catch (error) {
        return [];
    }
}

function renderTableForShift(shift) {
    const container = document.getElementById('shiftContent');
    if(!container) return;
    
    // Usar dados da data e turno selecionados
    let shiftData = getCurrentShiftData();    
    if(!Array.isArray(shiftData)) shiftData = [];
    
    // PRIMEIRO: Converter dados do formato admin para professor se necessário
    shiftData = shiftData.map(item => {
        if(!item || typeof item !== 'object') return item;
        
        // Garantir que cada registro tenha um ID único
        if(!item.id) item.id = item.sala || item.room || `record_${Math.random().toString(36).substr(2, 9)}`;
        
        // Se está no formato admin (room, professorName), converter
        if(item.room && item.professorName && !item.sala && !item.professor) {
            console.log('[PROFESSOR] ==> Convertendo item do formato admin:', item);
            return {
                id:             item.id,
                sala:           item.room           || 'Sala não especificada',
                professor:      item.professorName  || 'Professor não especificado',
                disciplina:     item.subject        || '-',
                curso:          item.course         || '-',
                turma:          item.turmaNumber    || '-',
                horaRetirada:   item.withdrawalTime || null,
                horaDevolucao:  item.returnTime     || null,
                // Manter campos originais para compatibilidade
                room:           item.room,
                professorName:  item.professorName,
                subject:        item.subject,
                course:         item.course,
                turmaNumber:    item.turmaNumber,
                withdrawalTime: item.withdrawalTime,
                returnTime:     item.returnTime,
                status:         item.status          || 'disponivel'
            };
        }
        
        // Se já está no formato professor ou é outro formato, manter
        return item;
    });
    
    shiftData = shiftData.filter(item => {
        if(!item || typeof item !== 'object') return false;

        // Garantir que pelo menos a sala e o professor existem
        const valid = item.sala && typeof item.sala      === 'string' &&
               item.professor   && typeof item.professor === 'string' &&
               item.sala.trim() !== '' && item.professor.trim() !== '';

        return valid;
    });

    const records = sorted(shiftData);
    let rows = '';

    if(records.length === 0) {
        const [year, month, day] = selectedDate.split('-');
        const formattedDate      = `${day}/${month}/${year}`;
        const shiftCapitalized   = shift.charAt(0).toUpperCase() + shift.slice(1);
        
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
        const sala          = record.sala          || '-';
        const curso         = record.curso         || '-';
        const turma         = record.turma         || '-';
        const professor     = record.professor     || '-';
        const disciplina    = record.disciplina    || '-';
        const horaRetirada  = record.horaRetirada  || '-';
        const horaDevolucao = record.horaDevolucao || '-';
        
        // Garantir que cada registro tenha um ID único
        if(!record.id)
            record.id = record.sala || `record_${Math.random().toString(36).substr(2, 9)}`;

        return `
        <tr>
            <td>${sala}</td>
            <td>${curso}</td>
            <td>
                <span class="badge fw-bold text-dark">${turma}</span>
            </td>
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
                ${getActionButton(record.id, record)}
            </td>
        </tr>
        `;
        }).join('');
    }

    // Corrigir problema de fuso horário ao exibir a data
    const [year, month, day] = selectedDate.split('-');
    const formattedDate      = `${day}/${month}/${year}`;
    
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
function handleKey(recordId, action) {
    const currentData = getCurrentShiftData();
    // Tentar encontrar por ID primeiro, depois por sala
    const record = currentData.find(r => r.id === recordId)    || 
                   currentData.find(r => r.sala === recordId)  ||
                   currentData.find(r => r.curso === recordId) ||
                   currentData.find(r => r.horaDevolucao === recordId);
    
    if(!record) return;

    if(action === 'remove' && record.horaDevolucao) {
        showMensageConfirmationModal();
        return;
    }

    document.getElementById('btn-retirar-chave').innerText = (action === 'remove') 
        ? 'Retirar a chave' 
        : 'Devolver a chave';

    // Para ações de remoção por professores, abrir modal de login para validação
    if((action === 'remove' || action === 'return') && record.curso != "Terceiros") {
        activeAction = { record, action };
        openLogin();
        return;
    }

    // Para outras ações (ex.: devolução) e para remoção de chaves por terceiros, executar diretamente
    executeKeyAction(record, action);
}

function executeKeyAction(record, action) {
    const now = new Date();
    const hm  = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = getCurrentShiftData();

    // Validar se currentShiftData é válido
    if(!Array.isArray(currentShiftData)) return;
    
    // Tentar encontrar por ID primeiro, depois por sala
    let recordIndex = currentShiftData.findIndex(r => r.id === record.id);

    if(recordIndex === -1) recordIndex = currentShiftData.findIndex(r => r.sala === record.sala);
    if(recordIndex === -1) recordIndex = currentShiftData.findIndex(r => r.curso === record.curso);
    
    console.log(' [DEBUG] recordIndex encontrado:', recordIndex);
    
    if(recordIndex !== -1) {
        if(action === 'remove') {
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaRetirada  = hm;
            currentShiftData[recordIndex].horaDevolucao = undefined;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].withdrawalTime = hm;
            currentShiftData[recordIndex].returnTime     = '';
            currentShiftData[recordIndex].status         = 'em_uso';
            
            // Mostrar notificação de sucesso
            showNotification(`Chave retirada por ${record.professor} às ${hm}`, 'success');
        } else if(action === 'return') {
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaDevolucao = hm;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].returnTime = hm;
            currentShiftData[recordIndex].status     = 'devolvida';

            // Mostrar notificação de sucesso
            showNotification(`Chave devolvida por ${record.professor} às ${hm}`, 'info');
        }

        // IMPORTANTE: Atualizar a estrutura dataByDateAndShift com os dados modificados
        dataByDateAndShift[selectedDate][activeShift] = currentShiftData;

        // Adicionar metadados de sincronização
        const completeTableData = {
            timestamp:        Date.now(),
            lastModified:     now.toISOString(),
            shift:            activeShift,
            date:             selectedDate,
            totalRecords:     currentShiftData.length,
            modifiedRecordId: record.id || record.sala,
            action:           action,
            data:             currentShiftData
        };

        // Atualizar o localStorage com os novos dados
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Marcar timestamp de atualização para sincronização entre abas
        localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
        
        // Disparar evento de atualização para sincronizar com o painel administrativo
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
            detail: completeTableData
        }));
        
        // Salvar TODA A TABELA no Firebase para persistência e sincronização em tempo real
        if(typeof saveDataToFirebase === 'function') {
            // Garantir que enviamos a tabela completa, não apenas o registro modificado
            saveDataToFirebase(selectedDate, activeShift, currentShiftData).then(() => {
                if(typeof notifyAdminPanelUpdate === 'function')
                    notifyAdminPanelUpdate(completeTableData);
            });
        }
        
        // Também salvar no formato antigo para compatibilidade
        const currentDateData = getDataForDate(selectedDate);
        localStorage.setItem('allShiftData', JSON.stringify(currentDateData));

        // Forçar sincronização com painel admin se disponível
        if(typeof syncWithAdminPanel === 'function')
            syncWithAdminPanel(completeTableData);
    }

    renderTableForShift(activeShift);
}

// Função auxiliar para notificar o painel administrativo sobre atualizações
function notifyAdminPanelUpdate(completeTableData) {
    // Enviar via WebSocket se disponível
    if(typeof sendWebSocketMessage === 'function')
        sendWebSocketMessage('COMPLETE_TABLE_UPDATE', completeTableData);
    
    // Ou via custom event para comunicação entre componentes
    window.dispatchEvent(new CustomEvent('adminPanelTableUpdate', {
        detail: completeTableData
    }));
    
    console.log('Sucesso em notificar paineladm');
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');

    notification.className     = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML     = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if(notification.parentNode) notification.remove();
    }, 5000);
}

// ----------- Login modal -----------
function openLogin() { 
    // Limpar mensagens de erro anteriores
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value      = '';
    
    // Mostrar informações sobre a ação
    if(activeAction && activeAction.record) {
        const record        = activeAction.record;
        const professorName = record.professor;
        
        // Atualizar o título do modal para mostrar qual professor
        const modalTitle = document.getElementById('loginModalTitle');
        
        if(modalTitle) {
            modalTitle.textContent = `Validação - ${professorName}`;
        }
        
        const helpMessage = document.getElementById('msg-erro');

        if(helpMessage) {
            helpMessage.innerHTML = `<p class="text-info-fast">Digite o FAST ID correspondente ao professor: <br> <strong>${professorName}</strong></p>`;
        }
    }
    
    document.getElementById('loginModal').style.display = 'flex';
    
    // Foca no campo de input e adiciona event listener ao pressionar Enter
    setTimeout(() => {
        const fastInput = document.getElementById('loginFast');

        if(fastInput) {
            fastInput.focus();
            
            // Adicionar event listener para Enter
            const handleEnter = (e) => {
                if(e.key === 'Enter') confirmLogin();
            };
            
            fastInput.addEventListener('keypress', handleEnter);
            
            // Armazenar o handler para remoção posterior
            fastInput._enterHandler = handleEnter;
        }
    }, 100);
}

function closeLogin() { 
    document.getElementById('loginModal').style.display = 'none'; 
    document.getElementById('msg-erro').textContent     = '';
    document.getElementById('loginFast').value          = '';
    
    // Remover event listener do Enter
    const fastInput = document.getElementById('loginFast');

    if(fastInput && fastInput._enterHandler) {
        fastInput.removeEventListener('keypress', fastInput._enterHandler);
        delete fastInput._enterHandler;
    }
    
    activeAction = null; 
}

// Faz o que for digitado no campo de fast ser convertido para UPPERCASE automáticamente
const inputFast = document.getElementById("loginFast");

inputFast.addEventListener("input", () => {
    inputFast.value = inputFast.value.toUpperCase();
});

// Função para confirmar login
function confirmLogin() {
    const fastIdRaw = (document.getElementById('loginFast').value || '').trim();
    const fastId    = fastIdRaw.toUpperCase();

    if(!fastId) {
        document.getElementById('msg-erro').textContent = 'Por favor, preencha o FAST ID!';
        return; 
    }

    const record = activeAction ? activeAction.record : null;

    if(!record) {
        document.getElementById('msg-erro').textContent = 'Erro: Registro não encontrado.';
        return;
    }

    // 1) Aceita o FATS geral para qualquer registro e executa imediatamente
    if(ConstantManager.validate(fastId)) {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('msg-erro').textContent     = '';
        document.getElementById('loginFast').value          = '';

        if(activeAction) {
            executeKeyAction(activeAction.record, activeAction.action);
            activeAction = null;
        }
        return;
    }

    // 2) Senão, validar correspondência do FATS específico com o professor
    const professorName  = record.professor;
    const expectedFastId = window.docentesCodprof[professorName];

    if(!expectedFastId) {
        document.getElementById('msg-erro').textContent = 'Erro: Professor não encontrado na base de dados.';
        return;
    }

    if(fastId !== expectedFastId) {
        document.getElementById('msg-erro').textContent = 'FAST ID incorreto para este professor.';
        return;
    }

    // Validação bem-sucedida - fechar modal e executar ação
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('msg-erro').textContent     = '';
    document.getElementById('loginFast').value          = '';

    if(activeAction) {
        executeKeyAction(activeAction.record, activeAction.action);
        activeAction = null;
    }
}

// ----------- Terceiros modal -----------
function openThirdPartyForm() { 
    document.getElementById('thirdPartyModal').classList.add('active'); 
    document.body.style.overflow = 'hidden';
}

function closeThirdPartyForm() {
    document.getElementById('thirdPartyModal').classList.remove('active'); 
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value  = '';
    
    // Resetar seleção múltipla e modo
    selectedKeys          = [];
    multipleSelectionMode = false;
    currentKeyMode        = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block:      null,
        room:       null,
        roomNumber: null
    };
    
    hideMultipleSelectionSection();

    document.body.style.overflow = '';
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.add('visible');
    document.getElementById('key-quantity-section').classList.remove('hidden');

    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('block-dropdown').classList.remove('visible');

    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    
    document.getElementById('room-number-dropdown').classList.add('invisible');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display        = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if(indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    updateSelectedKeysCount();
}

// Variável de seleção atual para o funcionamento dos dropdowns (cascata)
let currentSelections = {
    block:      null,
    room:       null,
    roomNumber: null
};

// Funções para controlar o modo de seleção de chaves
function selectKeyMode(mode) {
    currentKeyMode = mode;
    
    // Limpar seleções anteriores
    selectedKeys = [];
    currentSelections = {
        block:      null,
        room:       null,
        roomNumber: null
    };
    
    // Esconder a seção de quantidade de chaves
    document.getElementById('key-quantity-section').classList.add('hidden');
    document.getElementById('key-quantity-section').classList.remove('visible');
    
    // Esconder seção de seleção múltipla (será mostrada depois se necessário)
    hideMultipleSelectionSection();

    // Mostrar o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.remove('hidden');
    
    // Mostrar seleção de bloco
    document.getElementById('block-dropdown').classList.add('visible');
    document.getElementById('block-dropdown').classList.remove('hidden');
    
    // Atualizar indicador visual do modo
    updateModeIndicator(mode);
    
    // Configurar modo
    if(mode === 'multiple') {
        multipleSelectionMode = true;
        // No modo múltiplo, esconder dropdowns de sala e número da sala
        document.getElementById('room-dropdown').style.display        = 'none';
        document.getElementById('room-number-dropdown').style.display = 'none';
    } else {
        multipleSelectionMode = false;
        // No modo single, garantir que dropdowns estejam disponíveis
        document.getElementById('room-dropdown').style.display        = '';
        document.getElementById('room-number-dropdown').style.display = '';
        // Esconder esses dropdowns inicialmente
        document.getElementById('room-dropdown').classList.add('hidden');
        document.getElementById('room-dropdown').classList.remove('visible');
        document.getElementById('room-number-dropdown').classList.add('invisible');
        document.getElementById('room-number-dropdown').classList.remove('visible');
    }
    
    // Resetar e popular o primeiro dropdown
    resetAllDropdowns();
}

function updateModeIndicator(mode) {
    const indicator = document.getElementById('mode-indicator');
    if(indicator) {
        if(mode === 'single') {
            indicator.innerHTML = '<i class="bi bi-key"></i> Chave Específica';
            indicator.className = 'badge bg-primary';
        } else if(mode === 'multiple') {
            indicator.innerHTML = '<i class="bi bi-key-fill"></i> Múltiplas Chaves';
            indicator.className = 'badge bg-success';
        }
    }
}

function goBackToKeyQuantity() {
    // Resetar tudo
    currentKeyMode        = null;
    multipleSelectionMode = false;
    selectedKeys          = [];
    
    // Limpar seleções atuais
    currentSelections = {
        block:      null,
        room:       null,
        roomNumber: null
    };
    
    // Mostrar novamente a pergunta inicial
    document.getElementById('key-quantity-section').classList.add('visible');
    document.getElementById('key-quantity-section').classList.remove('hidden');

    // Oculta o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.add('hidden');
    
    // Esconder todas as outras seções
    hideMultipleSelectionSection();
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('block-dropdown').classList.remove('visible');

    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');

    document.getElementById('room-number-dropdown').classList.add('invisible');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display        = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Resetar dropdowns
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if(indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    // Atualizar contador de chaves selecionadas
    updateSelectedKeysCount();
}

// Funções para seleção múltipla de chaves
function showMultipleSelectionSection() {
    const section = document.getElementById('multiple-selection-section');
    section.classList.remove('invisible');
    section.classList.add('visible');
    multipleSelectionMode = true;
    populateAvailableKeys();
}

function hideMultipleSelectionSection() {
    const section = document.getElementById('multiple-selection-section');
    section.classList.remove('visible');
    section.classList.add('invisible');
    multipleSelectionMode = false;
    selectedKeys = [];
    updateSelectedKeysCount();
}

function populateAvailableKeys() {
    const container    = document.getElementById('available-keys-container');
    const block        = currentSelections.block;
    const dropdownData = getDropdownData();

    if(!block) {
        container.innerHTML = '<div class="empty-keys-message">Selecione um bloco primeiro</div>';
        return;
    }

    // Atualizar o nome do bloco no título
    document.getElementById('selected-block-name').textContent = block;

    // Obter dados atuais para verificar disponibilidade
    const dateData         = getDataForDate(selectedDate);
    const currentShiftData = dateData[activeShift] || [];
    
    container.innerHTML = '';
    
    if(currentKeyMode === 'multiple') {
        // Modo múltiplo: mostrar todas as chaves do bloco
        const blockRooms = dropdownData.filter(item => item.bloco === block);
        
        if(!blockRooms || blockRooms.length === 0) {
            container.innerHTML = '<div class="empty-keys-message">Nenhuma sala encontrada neste bloco</div>';
            return;
        }
        
        blockRooms.forEach(roomItem => {
            const room       = roomItem.sala;
            const roomNumber = roomItem.numero;

            let salaIdentifier;
            
            roomNumber && roomNumber !== "" 
                ? salaIdentifier = `${block} - ${room} - Sala ${roomNumber}`
                : salaIdentifier = `${block} - ${room}`;
            
            const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block:      block,
                room:       room,
                roomNumber: roomNumber && roomNumber !== "" ? roomNumber : null
            });

            container.appendChild(keyItem);
        });
    } else {
        // Modo single: funcionalidade original (baseada em room selecionada)
        const room = currentSelections.room;
        
        if(!room) {
            container.innerHTML = '<div class="empty-keys-message">Selecione uma sala primeiro</div>';
            return;
        }

        // Encontrar as salas/números disponíveis    
        const numbers = getRoomNumbers(dropdownData, block, room);

        if(numbers.length === 0) {
            // Sala sem numeração - apenas uma chave
            const salaIdentifier = `${block} - ${room}`;
            const isInUse        = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block:      block,
                room:       room,
                roomNumber: null
            });
            container.appendChild(keyItem);
        } else {
            // Sala com numeração - múltiplas chaves
            numbers.forEach(number => {
                const salaIdentifier = `${block} - ${room} - Sala ${number}`;
                const isInUse        = currentShiftData.some(record => record.sala === salaIdentifier);
                
                const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                    block:      block,
                    room:       room,
                    roomNumber: number
                });
                container.appendChild(keyItem);
            });
        }
    }
    
    updateSelectedKeysCount();
}

function createKeySelectionItem(salaIdentifier, isInUse, roomDetails) {
    const item = document.createElement('div');
    item.className = `key-selection-item ${isInUse ? 'unavailable' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type     = 'checkbox';
    checkbox.disabled = isInUse;
    checkbox.value    = salaIdentifier;
    checkbox.addEventListener('change', () => toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked));
    
    const keyInfo = document.createElement('div');
    keyInfo.className = 'key-info';
    
    const keyName = document.createElement('div');
    keyName.className   = 'key-name';
    keyName.textContent = salaIdentifier;
    
    const keyStatus = document.createElement('div');
    keyStatus.className   = `key-status ${isInUse ? 'in-use' : 'available'}`;
    keyStatus.textContent = isInUse ? 'Em uso' : 'Disponível';
    
    keyInfo.appendChild(keyName);
    keyInfo.appendChild(keyStatus);
    
    item.appendChild(checkbox);
    item.appendChild(keyInfo);
    
    if(!isInUse) {
        item.addEventListener('click', (e) => {
            if(e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked);
            }
        });
    }
    
    return item;
}

function toggleKeySelection(salaIdentifier, roomDetails, isSelected) {
    if(isSelected) {
        if(!selectedKeys.find(key => key.identifier === salaIdentifier)) {
            selectedKeys.push({
                identifier: salaIdentifier,
                roomDetails: roomDetails
            });
        }
    } else {
        selectedKeys = selectedKeys.filter(key => key.identifier !== salaIdentifier);
    }
    
    updateSelectedKeysCount();
    updateKeyItemAppearance();
}

function updateKeyItemAppearance() {
    const items = document.querySelectorAll('.key-selection-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox && checkbox.checked 
            ? item.classList.add('selected') 
            : item.classList.remove('selected');
    });
}

function updateSelectedKeysCount() {
    const countElement = document.getElementById('selected-count');
    if(countElement)
        countElement.textContent = selectedKeys.length;
}

function selectAllAvailableKeys() {
    const checkboxes = document.querySelectorAll('.key-selection-item:not(.unavailable) input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        if(!checkbox.checked) {
            checkbox.checked = true;
            const item = checkbox.closest('.key-selection-item');
            const salaIdentifier = checkbox.value;
            
            // Extrair detalhes da sala a partir do identificador
            const parts = salaIdentifier.split(' - ');

            const roomDetails = {
                block:      parts[0],
                room:       parts[1],
                roomNumber: parts[2] ? parts[2].replace('Sala ', '') : null
            };
            
            toggleKeySelection(salaIdentifier, roomDetails, true);
        }
    });
}

function clearAllSelectedKeys() {
    const checkboxes = document.querySelectorAll('.key-selection-item input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    selectedKeys = [];
    updateSelectedKeysCount();
    updateKeyItemAppearance();
}

// Função Salvar Terceiros
function saveThirdParty() {
    const name    = document.getElementById('tpFullName').value.trim();
    const purpose = document.getElementById('tpPurpose').value.trim();

    // Valida se os campos obrigatórios estão vazios
    if(!name || !purpose) {
        showNotification('Preencha corretamente os campos obrigatórios.', 'warning');
        return; 
    }

    // Verificar se um modo foi selecionado
    if(!currentKeyMode) {
        showNotification('Selecione o tipo de chave (específica ou múltipla).', 'warning');
        return;
    }

    // Verificar se estamos em modo de seleção múltipla
    if(currentKeyMode === 'multiple') {
        if(selectedKeys.length === 0) {
            showNotification('Selecione pelo menos uma chave.', 'warning');
            return;
        }
        // Salvar múltiplas chaves
        saveMultipleThirdPartyKeys(name, purpose);
    } else {
        // Salvar chave única (modo tradicional)
        saveSingleThirdPartyKey(name, purpose);
    }
}

function saveSingleThirdPartyKey(name, purpose) {
    // Recupera as opções do dropdown selecionadas
    const block      = currentSelections.block;
    const room       = currentSelections.room;
    const roomNumber = currentSelections.roomNumber;

    // Valida se os campos obrigatórios estão vazios
    if(!block) {
        showNotification('Selecione um bloco.', 'warning');
        return; 
    }
    
    if(!room) {
        showNotification('Selecione uma sala.', 'warning');
        return; 
    }

    // Encontra o objeto <sala> para recuperar o vetor de <numeros>
    const dropdownData = getDropdownData();
    const numbers      = getRoomNumbers(dropdownData, block, room);

    // Valida se a sala selecionada há números e, caso tenha, se algum foi selecionado
    if(numbers.length > 0 && !roomNumber) {
        showNotification('Selecione o número da sala para completar o cadastro!', 'warning');
        return;
    }

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', 
                                                                minute: '2-digit' 
    });
    
    // Variável que contém a forma de exibição da alocação
    let salaIdentifier = `${block} - ${room}`;

    if(roomNumber)
        salaIdentifier += ` - Sala ${roomNumber}`;
        
    // Dados do terceiro
    const newRecord = createThirdPartyRecord(name, purpose, salaIdentifier, {
        block:      block,
        room:       room,
        roomNumber: roomNumber
    }, timeString);

    // Adicionar ao array do turno atual na data selecionada
    addRecordToCurrentShift([newRecord]);
    
    // Limpar formulário e fechar modal
    clearFormAndClose();
    
    // Mostrar notificação de sucesso
    showNotification(`Chave registrada com sucesso para ${name}!`, 'success');
}

function saveMultipleThirdPartyKeys(name, purpose) {
    if(selectedKeys.length === 0) {
        showNotification('Selecione pelo menos uma chave.', 'warning');
        return;
    }

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour:   '2-digit', 
                                                                minute: '2-digit' 
    });

    // Criar registros para cada chave selecionada
    const newRecords = selectedKeys.map(keyData => {
        return createThirdPartyRecord(name, purpose, keyData.identifier, keyData.roomDetails, timeString);
    });

    // Adicionar todos os registros ao turno atual
    addRecordToCurrentShift(newRecords);
    
    // Mostrar notificação de sucesso
    showNotification(`${selectedKeys.length} chave(s) registrada(s) com sucesso para ${name}!`, 'success');

    // Limpar formulário e fechar modal
    clearFormAndClose();
}

function createThirdPartyRecord(name, purpose, salaIdentifier, roomDetails, timeString) {
    return {
        id:             `terceiro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sala:           salaIdentifier,
        professor:      name + " (Terceiro)",
        disciplina:     purpose,
        curso:          "Terceiros",
        turma:          "-",
        horaRetirada:   timeString,
        horaDevolucao:  null,
        notas:          '-',
        roomDetails:    roomDetails,
        // Campos de compatibilidade com o painel administrativo
        room:           salaIdentifier,
        professorName:  name + " (Terceiro)",
        subject:        purpose,
        course:         "Terceiros",
        turmaNumber:    "-",
        withdrawalTime: timeString,
        returnTime:     null,
        status:         'em_uso'
    };
}

function addRecordToCurrentShift(records) {
    // Adicionar ao array do turno atual na data selecionada
    const dateData = getDataForDate(selectedDate);
    
    if(!dateData[activeShift]) dateData[activeShift] = [];

    records.forEach(record => {
        dateData[activeShift].push(record);
    });
    
    // Atualizar localStorage e notificar TODOS os painéis (professor + admin)
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
    
    // Salvar no Firebase para persistência e sincronização em tempo real
    if(typeof saveDataToFirebase === 'function') {
        saveDataToFirebase(selectedDate, activeShift, dateData[activeShift])
    }
    
    window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
        detail: { 
            shift: activeShift, 
            data:  dataByDateAndShift 
        } 
    }));
}

function clearFormAndClose() {
    // Limpar formulário
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value  = '';
    
    // Resetar seleções
    selectedKeys          = [];
    multipleSelectionMode = false;
    currentKeyMode        = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block:      null,
        room:       null,
        roomNumber: null
    };
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.add('visible');
    document.getElementById('key-quantity-section').classList.remove('hidden');
    
    // Esconder todas as outras seções
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    document.getElementById('multiple-selection-section').classList.remove('visible');
    document.getElementById('multiple-selection-section').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display        = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if(indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    // Resetar dropdowns
    resetAllDropdowns();
    
    // Atualizar contador
    updateSelectedKeysCount();
    
    closeThirdPartyForm();
    renderTableForShift(activeShift);
}

// Inicia o sistema de Dropdowns
function initializeDropdowns() {
    // Configura os event listeners para todos os dropdowns
    setupDropdownToggle(document.getElementById('room-dropdown'));
    setupDropdownToggle(document.getElementById('block-dropdown'));
    setupDropdownToggle(document.getElementById('room-number-dropdown'));
    
    // Preenche o primeiro dropdown (Bloco)
    populateBlockDropdown();
    
    // Reseta os dropdowns dependentes
    resetDropdown('room-dropdown', 'Selecione a sala', true);
    resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
}

// Função para alternar os dropdowns
function setupDropdownToggle(dropdownElement) {
    if(!dropdownElement) return;
    
    const selected = dropdownElement.querySelector('.selected');
    const options  = dropdownElement.querySelector('.options');
    
    if(!selected || !options) return;
    
    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if(dropdownElement.classList.contains('disabled')) return;

        const isCurrentlyActive = selected.classList.contains('active');

        document.querySelectorAll('.drop-down-item').forEach(item => {
            item.classList.remove('dropdown-active');
        });
        
        // Fecha os outros dropdowns
        document.querySelectorAll('.drop-down-item .options').forEach(op => {
            if(op !== options) {
                op.classList.remove('show');
                op.parentElement.querySelector('.selected').classList.remove('active');
            }
        });

        // Caso o dropdown não esteja ativo, ele é ativado e recebe prioridade (z-index)
        if(!isCurrentlyActive) {
            options.classList.add('show');
            selected.classList.add('active');
            // Atribui também essa prioridade ao dropdown pai
            dropdownElement.closest('.drop-down-item').classList.add('dropdown-active');
        } else {
            // Se já estiver ativo, fecha
            options.classList.remove('show');
            selected.classList.remove('active');
        }
    });
}

// Ao usuário clicar fora o dropdown é fechado
document.addEventListener('click', function() {
    document.querySelectorAll('.options').forEach(options => {
        const selected     = options.parentElement.querySelector('.selected');
        const dropdownItem = options.closest('.drop-down-item');

        options.classList.remove('show');

        if(selected)
            selected.classList.remove('active');
        if(dropdownItem)
            dropdownItem.classList.remove('dropdown-active');
    });
});

// Função para resetar os dropdowns
function resetDropdown(dropdownId, placeholderText, disable = true) {
    const dropdown = document.getElementById(dropdownId);
    if(!dropdown) return;
    
    // Variáveis para armazenar o texto selecionado e a lista de opções
    let selectedText, options;
    
    if(dropdownId === 'block-dropdown') {
        selectedText = document.getElementById('valueBlock');
        options      = dropdown.querySelector('.options');
    } else if(dropdownId === 'room-dropdown') {
        selectedText = document.getElementById('valueRoom');
        options      = document.getElementById('room-dropdown-op');
    } else if(dropdownId === 'room-number-dropdown') {
        selectedText = document.getElementById('valueRoomNumber');
        options      = document.getElementById('room-number-op');
    }
    
    if(selectedText) selectedText.innerText = placeholderText;
    if(options)      options.innerHTML      = '';    
    
    if(disable) {
        dropdown.classList.add('disabled');
        dropdown.classList.remove('visible');
        dropdown.classList.add('hidden');
    } else {
        dropdown.classList.remove('disabled');
        dropdown.classList.remove('hidden');
        dropdown.classList.add('visible');
    }
}

// Função que preenche os dropdowns de "Bloco" (primeiro dropdown)
function populateBlockDropdown() {
    const blockOptions = document.querySelector('#block-dropdown .options');
    
    if(!blockOptions) return;

    const dropdownData = getDropdownData();
    const blocks = getUniqueBlocks(dropdownData);

    blockOptions.innerHTML = blocks.map(block => `
        <li class="option" data-value="${block}">${block}</li>
    `).join('');

    // Limpa todos as classes === "dropdown-active"
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    document.getElementById('block-dropdown').classList.add('dropdown-active');
    document.getElementById('room-dropdown').classList.remove('dropdown-active');
    document.getElementById('room-number-dropdown').classList.remove('dropdown-active');

    blockOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedBlock = this.getAttribute('data-value');

            if(selectedBlock !== currentSelections.block) resetAllDropdowns();
            
            // Atualiza as seleções
            currentSelections.block      = selectedBlock;
            currentSelections.room       = null;
            currentSelections.roomNumber = null;
            
            // Atualiza os ID's
            document.getElementById('valueBlock').textContent = selectedBlock;
            document.querySelector('#block-dropdown .selected').classList.remove('active');
            document.querySelector('#block-dropdown .options').classList.remove('show');
            document.querySelector('#block-dropdown .selected').classList.add('gradient');
            document.getElementById('block-dropdown').classList.add('selectedOption');
            
            // Remove a classe "dropdown-active" de block-dropdown
            document.getElementById('block-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');

            document.getElementById('room-number-dropdown').classList.remove('invisible');
            document.getElementById('room-number-dropdown').classList.add('hidden');
            
            if(currentKeyMode === 'multiple') {
                // Modo múltiplo: mostrar imediatamente todas as chaves do bloco
                showMultipleSelectionSection();
                document.getElementById('room-dropdown').style.display        = 'none';
                document.getElementById('room-number-dropdown').style.display = 'none';
                // Não chamar populateRoomDropdown no modo múltiplo
                return;
            } else {
                // Modo single: continuar com o fluxo normal
                // Garantir que room e room-number dropdowns estejam visíveis
                document.getElementById('room-dropdown').style.display        = '';
                document.getElementById('room-number-dropdown').style.display = '';
                
                // Exibe o dropdown de Salas
                const roomDropdown = document.querySelector('#room-dropdown');
                if(roomDropdown) {
                    roomDropdown.classList.remove('hidden');
                    roomDropdown.classList.add('visible');
                }
                
                // Preenche o próximo dropdown e reinicia os seguintes
                populateRoomDropdown(selectedBlock);
            }
            // resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
        });
    });
}

// Função que preenche os dropdowns de "Sala" (segundo dropdown)
function populateRoomDropdown(selectedBlock) {
    const roomDropdown = document.getElementById('room-dropdown');
    const roomOptions  = document.getElementById('room-dropdown-op');
    
    if(!roomOptions || !roomDropdown) return;

    // const rooms = dropdown[selectedBlock] || [];

    const dropdownData = getDropdownData();
    const rooms        = getUniqueRoomsForBlock(dropdownData, selectedBlock);

    roomOptions.innerHTML = rooms.map(room => `
        <li class="option" data-value="${room}">${room}</li>
    `).join('');

    // Ativa o dropdown
    roomDropdown.classList.remove('disabled');

    // Limpa todas as classes === "dropdown-active" 
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    roomOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoom = this.getAttribute('data-value');

            if(selectedRoom !== currentSelections.room) {
                document.getElementById('room-number-dropdown').classList.add('active');
                document.getElementById('room-number-dropdown').classList.remove('noOptions');
                document.getElementById('selected-room-number').classList.remove('gradient');
            }
            
            // Atualiza as seleções
            currentSelections.room = selectedRoom;
            currentSelections.roomNumber = null;
            
            // Atualizar os ID's
            roomOptions.classList.remove('show');
            document.querySelector('#room-dropdown .selected').classList.remove('active');
            document.querySelector('#room-dropdown .selected').classList.add('gradient');
            document.getElementById('room-dropdown').classList.add('selectedOption');
            document.getElementById('valueRoom').textContent = selectedRoom;

            // Remove "dropdown-active" de "room-dropdown"
            document.getElementById('room-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');
            
            // Exibe o dropdown de números de sala
            const roomNumberDropdown = document.querySelector('#room-number-dropdown');

            // const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
            // const numbers = roomObj ? roomObj.numeros : [];
            const numbers = getRoomNumbers(dropdownData, selectedBlock, selectedRoom);

            if(numbers.length > 0) {
                roomNumberDropdown.classList.remove('hidden');
                roomNumberDropdown.classList.remove('selectedOption');
                roomNumberDropdown.classList.remove('gradient');
                roomNumberDropdown.classList.add('visible');
                // Preenche o próximo dropdown e reinicia os seguintes
                populateRoomNumberDropdown(selectedBlock, selectedRoom);
            } else {
                // Se não há números de sala, considerar completo para modo single
                if(currentKeyMode === 'single') {
                    // Sala sem numeração - não precisamos mostrar seleção múltipla
                    resetDropdown('room-number-dropdown', 'Sem numeração', true);
                    currentSelections.roomNumber = null;
                    roomNumberDropdown.classList.add('noOptions');
                    roomNumberDropdown.classList.remove('hidden');
                    
                    setTimeout(() => {
                        roomNumberDropdown.classList.add('selectedOption');
                    }, 910);
                } else {
                    // Modo múltiplo: mostrar a seção de seleção múltipla
                    showMultipleSelectionSection();
                }
            }
        });
    });
}

// Função que preenche os dropdowns de "Número da Sala" (terceiro dropdown)
function populateRoomNumberDropdown(selectedBlock, selectedRoom) {
    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    const roomNumberOptions  = document.getElementById('room-number-op');
    
    if(!roomNumberOptions || !roomNumberDropdown) return;

    const dropdownData = getDropdownData();
    const numbers      = getRoomNumbers(dropdownData, selectedBlock, selectedRoom);

    // Preenche com os números disponíveis
    roomNumberOptions.innerHTML = numbers.map(number => `
        <li class="option" data-value="${number}">${number}</li>
    `).join('');

    // Ativa o dropdown
    roomNumberDropdown.classList.remove('disabled');
    document.getElementById('valueRoomNumber').textContent = 'Selecione o número da sala';

    // Clear all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    roomNumberOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoomNumber = this.getAttribute('data-value');
            
            // Atualiza as seleções
            currentSelections.roomNumber = selectedRoomNumber;
            
            // Atualiza os ID's
            document.getElementById('valueRoomNumber').textContent = selectedRoomNumber;
            document.querySelector('#room-number-dropdown .selected').classList.remove('active');
            document.querySelector('#room-number-dropdown .selected').classList.add('gradient');
            document.getElementById('room-number-dropdown').classList.add('selectedOption');
            roomNumberOptions.classList.remove('show');

            // Remove dropdown-active from room number dropdown
            document.getElementById('room-number-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');
            
            // No modo single, a seleção está completa - não mostrar seleção múltipla
            if(currentKeyMode === 'multiple') {
                // Mostrar seção de seleção múltipla apenas no modo múltiplo
                showMultipleSelectionSection();
            }
        });
    });
}

// Reseta todos os dropdowns para o estado inicial
function resetAllDropdowns() { 
    // Reseta os selecionados
    currentSelections = {
        block:      null,
        room:       null,
        roomNumber: null
    };
    
    // Reseta os "placeholders" do dropdown e os estados
    resetDropdown('block-dropdown', 'Selecione o bloco', false);
    resetDropdown('room-dropdown',  'Selecione a sala',  true);
    resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);

    // Reseta o gradiente do dropdown selecionado
    const blockSelected      = document.querySelector('#block-dropdown .selected');
    const roomSelected       = document.querySelector('#room-dropdown .selected');
    const roomNumberSelected = document.querySelector('#room-number-dropdown .selected');
    
    if(blockSelected)      blockSelected.classList.remove('gradient');
    if(roomSelected)       roomSelected.classList.remove('gradient');
    if(roomNumberSelected) roomNumberSelected.classList.remove('gradient');

    // Remove all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
        item.classList.remove('selectedOption');
    });

    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    roomNumberDropdown.classList.remove('noOptions');
    roomNumberDropdown.classList.remove('hidden');
    roomNumberDropdown.classList.add('invisible');

    // Limpar conteúdo das opções
    const roomOptions       = document.querySelector('#room-dropdown .options');
    const blockOptions      = document.querySelector('#block-dropdown .options');
    const roomNumberOptions = document.querySelector('#room-number-dropdown .options');
    
    if(blockOptions)      blockOptions.innerHTML = '';
    if(roomOptions)       roomOptions.innerHTML = '';
    if(roomNumberOptions) roomNumberOptions.innerHTML = '';

    // Preenche novamente o primeiro dropdown
    populateBlockDropdown();
}

// ----------- Inicialização e mudança de turno -----------
function initialize() {
    const h = new Date().getHours();
    activeShift = (h < 12) ? 'manhã' : ((h < 18) ? 'tarde' : 'noite');

    // Carregar mapeamento de professores do localStorage
    loadDocentesCodprofFromStorage();

    // Carregar dados e configurar interface
    loadSharedData();
    renderTabs();
    
    // Configurar os eventos
    document.getElementById('sortToggle')?.addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn          = document.getElementById('sortToggle');
        
        if(btn) {
            btn.setAttribute('aria-pressed', String(sortAlphabetically));
            renderTableForShift(activeShift);
        }
    });

    // Iniciar verificação automática de turno
    setInterval(autoShiftTick, 60000);
    
    // Inicializar sincronização Firebase se estiver disponível
    if(typeof initializeFirebaseSync === 'function') initializeFirebaseSync();

    // Inicializar ícones
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function switchShift(shift) { 
    console.log('Mudando para o turno:', shift);
    activeShift = shift; 
    renderTabs(); 
    renderTableForShift(activeShift); // Renderizar dados do novo turno
}

function autoShiftTick() {
    const d = new Date();
    
    if(d.getHours() === 12 && d.getMinutes() === 0)
        switchShift('tarde');
}

// Desabilita o clique direito e o F12 para inspeção
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("keydown", e => {
  if(e.ctrlKey && (e.key === "u" || e.key === "U")) e.preventDefault();
  if(e.key === "F12") e.preventDefault();
});

// Evento disparado quando todo o conteúdo DOM já foi carregado
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeDropdowns();
    }, 100);
});

// Verificar se a página já foi carregada e inicializar
if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initialize);
else
    initialize();