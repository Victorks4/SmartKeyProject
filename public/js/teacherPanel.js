let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;
let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD 
// let selectedDate = "2025-08-31";
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Variáveis para seleção múltipla de chaves
let selectedKeys = [];
let multipleSelectionMode = false;
let currentKeyMode = null; // 'single' ou 'multiple'

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
    if (!professorName || !fast) {
        console.warn('Nome do professor e FAST são obrigatórios para adicionar ao mapeamento');
        return false;
    }
    
    // Normaliza o FAST para maiúsculas
    const normalizedFast = fast.toString().trim().toUpperCase();
    const normalizedName = professorName.trim();
    
    // Verifica se o professor já existe
    if (docentesCodprof[normalizedName]) {
        console.warn(`Professor ${normalizedName} já existe no mapeamento com FAST: ${docentesCodprof[normalizedName]}`);
        return false;
    }
    
    // Verifica se o FAST já está sendo usado por outro professor
    for (const [existingName, existingFast] of Object.entries(docentesCodprof)) {
        if (existingFast === normalizedFast) {
            console.warn(`FAST ${normalizedFast} já está sendo usado pelo professor: ${existingName}`);
            return false;
        }
    }
    
    // Adiciona o professor ao mapeamento
    docentesCodprof[normalizedName] = normalizedFast;
    
    // Salva no localStorage para persistência
    saveDocentesCodprofToStorage();
    
    console.log(` Professor ${normalizedName} adicionado ao mapeamento com FAST: ${normalizedFast}`);
    return true;
}

// Função para salvar o mapeamento docentesCodprof no localStorage
function saveDocentesCodprofToStorage() {
    try {
        localStorage.setItem('docentesCodprof', JSON.stringify(docentesCodprof));
        console.log('� Mapeamento docentesCodprof salvo no localStorage');
    } catch (error) {
        console.error(' Erro ao salvar mapeamento no localStorage:', error);
    }
}

// Função para carregar o mapeamento docentesCodprof do localStorage
function loadDocentesCodprofFromStorage() {
    try {
        const saved = localStorage.getItem('docentesCodprof');
        if (saved) {
            const savedMapping = JSON.parse(saved);
            // Merge com o mapeamento existente (localStorage tem prioridade)
            Object.assign(docentesCodprof, savedMapping);
            console.log('� Mapeamento docentesCodprof carregado do localStorage');
        }
    } catch (error) {
        console.error(' Erro ao carregar mapeamento do localStorage:', error);
    }
}

// Função global para ser chamada de outras páginas
window.addNewProfessorToTeacherPanel = function(professorName, fast) {
    return addProfessorToMapping(professorName, fast);
};

// Função para buscar professor por FAST
window.findProfessorByFast = function(fast) {
    for (const [name, professorFast] of Object.entries(docentesCodprof)) {
        if (professorFast === fast) {
            return name;
        }
    }
    return null;
};

// Função para exportar o mapeamento atualizado como código JavaScript
window.exportDocentesCodprof = function() {
    const mappingEntries = Object.entries(docentesCodprof)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, fast]) => `    "${name}": "${fast}"`)
        .join(',\n');
    
    const exportCode = `const docentesCodprof = {\n${mappingEntries}\n};`;
    
    console.log(' Código do mapeamento atualizado:');
    console.log(exportCode);
    
    // Copiar para clipboard se disponível
    if (navigator.clipboard) {
        navigator.clipboard.writeText(exportCode).then(() => {
            console.log(' Código copiado para a área de transferência!');
        }).catch(err => {
            console.error(' Erro ao copiar para área de transferência:', err);
        });
    }
    
    return exportCode;
};

// Evento para escutar mudanças no localStorage de outras páginas
window.addEventListener('storage', function(e) {
    console.log(' Evento storage recebido:', {
        key: e.key,
        oldValue: e.oldValue ? 'presente' : 'null',
        newValue: e.newValue ? 'presente' : 'null'
    });
    
    if (e.key === 'docentesCodprof') {
        console.log(' Detectada atualização no mapeamento docentesCodprof de outra página');
        loadDocentesCodprofFromStorage();
    }
    
    if (e.key === 'allDateShiftData') {
        console.log(' Detectada atualização nos dados de turnos de outra página');
        loadSharedData();
    }
    
    if (e.key === 'allShiftData') {
        console.log(' Detectada atualização no allShiftData de outra página');
        loadSharedData();
    }
});

// Evento para escutar cadastro de novos professores no painel administrativo (mesma aba)
window.addEventListener('teacherAdded', function(e) {
    console.log('�‍� Novo professor adicionado no painel administrativo:', e.detail);
    loadDocentesCodprofFromStorage();
});

// Evento para escutar mudanças específicas de registros do painel administrativo
window.addEventListener('dataUpdated', function(e) {
    console.log('� Evento dataUpdated recebido:', e.detail);
    
    if (e.detail && e.detail.type === 'recordUpdated') {
        console.log(' Detectada atualização de registro específico:', e.detail);
        
        // Recarregar dados e atualizar a tabela
        loadSharedData().then(() => {
            console.log(' Dados atualizados no painel do professor');
            
            // Mostrar notificação visual da atualização
            showUpdateNotification(e.detail);
        });
    }
});

// Função para mostrar notificação de atualização
function showUpdateNotification(updateDetail) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
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
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Retorna o FAST correspondente ao nome do professor informado
function getFastForProfessor(professorName) {
    if(!professorName || typeof professorName !== 'string') return '';
    
    if(docentesCodprof[professorName]) return String(docentesCodprof[professorName]).trim();
    
    const target = professorName.trim().toLocaleLowerCase('pt-BR');

    for(const name of Object.keys(docentesCodprof)) {
        if(name.trim().toLocaleLowerCase('pt-BR') === target) {
            return String(docentesCodprof[name]).trim();
        }
    }

    return '';
}

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
                            horaDevolucao: item.returnTime || null,
                            // Manter campos originais para compatibilidade
                            room: item.room,
                            professorName: item.professorName,
                            subject: item.subject,
                            course: item.course,
                            turmaNumber: item.turmaNumber,
                            withdrawalTime: item.withdrawalTime,
                            returnTime: item.returnTime,
                            status: item.status || 'disponivel',
                            id: item.id || ''
                        };
                    }
                    // Se já está no formato do professor, manter
                    else if (item.sala && item.professor) {
                        return {
                            ...item,
                            // Adicionar campos do formato admin para compatibilidade
                            room: item.sala,
                            professorName: item.professor,
                            subject: item.disciplina,
                            course: item.curso,
                            turmaNumber: item.turma,
                            withdrawalTime: item.horaRetirada,
                            returnTime: item.horaDevolucao,
                            status: item.horaRetirada && !item.horaDevolucao ? 'em_uso' : 
                                   item.horaRetirada && item.horaDevolucao ? 'devolvida' : 'disponivel',
                            id: item.id || item.sala
                        };
                    }
                    // Fallback para dados mal formatados
                    else {
                        return {
                            sala: item.sala || item.room || 'Sala não especificada',
                            professor: item.professor || item.professorName || 'Professor não especificado',
                            disciplina: item.disciplina || item.subject || '-',
                            curso: item.curso || item.course || '-',
                            turma: item.turma || item.turmaNumber || '-',
                            horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                            horaDevolucao: item.horaDevolucao || item.returnTime || null,
                            // Campos de compatibilidade
                            room: item.sala || item.room,
                            professorName: item.professor || item.professorName,
                            subject: item.disciplina || item.subject,
                            course: item.curso || item.course,
                            turmaNumber: item.turma || item.turmaNumber,
                            withdrawalTime: item.horaRetirada || item.withdrawalTime,
                            returnTime: item.horaDevolucao || item.returnTime,
                            status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                    (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime) ? 'devolvida' : 'disponivel',
                            id: item.id || item.sala || item.room
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
    console.log(`[PROFESSOR] ==> getCurrentShiftData chamada para data: ${selectedDate}, turno: ${activeShift}`);
    console.log(`[PROFESSOR] ==> dataByDateAndShift completo:`, dataByDateAndShift);
    
    // Validar se selectedDate e activeShift estão definidos
    if (!selectedDate || !activeShift) {
        console.error(`[PROFESSOR] ==> ERRO: selectedDate (${selectedDate}) ou activeShift (${activeShift}) não definidos`);
        return [];
    }
    
    const dateData = getDataForDate(selectedDate);
    console.log(`[PROFESSOR] ==> dateData para ${selectedDate}:`, dateData);
    console.log(`[PROFESSOR] ==> dateData[${activeShift}]:`, dateData[activeShift]);
    console.log(`[PROFESSOR] ==> Tipo de dateData[${activeShift}]:`, typeof dateData[activeShift]);
    console.log(`[PROFESSOR] ==> É array?`, Array.isArray(dateData[activeShift]));
    
    let result = dateData[activeShift] || [];
    
    // Garantir que result é sempre um array válido
    if (!Array.isArray(result)) {
        console.warn(`[PROFESSOR] ==> AVISO: dateData[${activeShift}] não é um array, convertendo:`, result);
        result = [];
    }
    
    // Filtrar dados inválidos
    result = result.filter(item => {
        if (!item || typeof item !== 'object') {
            console.warn(`[PROFESSOR] ==> Item inválido removido:`, item);
            return false;
        }
        return true;
    });
    
    console.log(`[PROFESSOR] ==> Resultado final (${result.length} registros):`, result);
    return result;
}

// Carregar dados do Firebase e localStorage como fallback
async function loadSharedData() {
    console.log('[PROFESSOR] ==> loadSharedData iniciada');
    console.log('[PROFESSOR] ==> selectedDate atual:', selectedDate);
    console.log('[PROFESSOR] ==> activeShift atual:', activeShift);
    
    // Primeiro, tentar carregar dados do Firebase
    let firebaseLoaded = false;
    if (typeof loadTeacherDataFromFirebase === 'function') {
        console.log('[PROFESSOR]  Tentando carregar dados do Firebase...');
        try {
            firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
            if (firebaseLoaded) {
                console.log('[PROFESSOR]  Dados carregados do Firebase com sucesso!');
                
                // Iniciar sincronização em tempo real para todos os turnos
                if (typeof syncTeacherDataRealtime === 'function') {
                    console.log('[PROFESSOR]  Iniciando sincronização em tempo real...');
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
    if (!firebaseLoaded) {
        console.log('[PROFESSOR] � Carregando dados do localStorage como fallback...');
        
        const newFormatData = localStorage.getItem('allDateShiftData');
        console.log('[PROFESSOR] Dados brutos do localStorage:', newFormatData);
        
        if(newFormatData) {
            try {
                dataByDateAndShift = JSON.parse(newFormatData);
                console.log('[PROFESSOR] Dados carregados no novo formato:', dataByDateAndShift);
                console.log('[PROFESSOR] Total de datas encontradas:', Object.keys(dataByDateAndShift).length);
                
                // Converter dados para garantir compatibilidade
                dataByDateAndShift = convertAdminDataToTeacherFormat(dataByDateAndShift);
                console.log('[PROFESSOR] Dados convertidos para formato do professor:', dataByDateAndShift);
                
                console.log('[PROFESSOR] ==> Chamando renderTableForShift com activeShift:', activeShift);
                renderTableForShift(activeShift);
                return;
            } catch (e) {
                console.error('[PROFESSOR] Erro ao carregar dados no novo formato:', e);
            }
        } else {
            console.log('[PROFESSOR] Nenhum dado encontrado em allDateShiftData');
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
            
            // Converter dados do formato do painel administrativo para o formato do professor
            console.log('[PROFESSOR] Convertendo dados do formato administrativo...');
            for (let turno in dateData) {
                if (Array.isArray(dateData[turno])) {
                    console.log(`[PROFESSOR] Convertendo ${dateData[turno].length} registros do turno ${turno}`);
                    dateData[turno] = dateData[turno].map(item => {
                        // Se o item já está no formato do professor, manter
                        if (item.sala && item.professor) {
                            return {
                                ...item,
                                // Garantir que tenha ID único
                                id: item.id || item.sala || `record_${Math.random().toString(36).substr(2, 9)}`
                            };
                        }
                        // Se está no formato do painel administrativo, converter
                        else if (item.room && item.professorName) {
                            console.log('[PROFESSOR] Convertendo item do formato admin:', item);
                            return {
                                id: item.id || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala: item.room || 'Sala não especificada',
                                professor: item.professorName || 'Professor não especificado',
                                disciplina: item.subject || '-',
                                curso: item.course || '-',
                                turma: item.turmaNumber || '-',
                                horaRetirada: item.withdrawalTime || null,
                                horaDevolucao: item.returnTime || null,
                                // Manter campos originais para compatibilidade
                                room: item.room,
                                professorName: item.professorName,
                                subject: item.subject,
                                course: item.course,
                                turmaNumber: item.turmaNumber,
                                withdrawalTime: item.withdrawalTime,
                                returnTime: item.returnTime,
                                status: item.status || 'disponivel'
                            };
                        }
                        // Fallback para dados mal formatados
                        else {
                            console.log('[PROFESSOR] Usando fallback para item:', item);
                            return {
                                id: item.id || item.sala || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala: item.sala || item.room || 'Sala não especificada',
                                professor: item.professor || item.professorName || 'Professor não especificado',
                                disciplina: item.disciplina || item.subject || '-',
                                curso: item.curso || item.course || '-',
                                turma: item.turma || item.turmaNumber || '-',
                                horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                                horaDevolucao: item.horaDevolucao || item.returnTime || null,
                                // Campos de compatibilidade
                                room: item.sala || item.room,
                                professorName: item.professor || item.professorName,
                                subject: item.disciplina || item.subject,
                                course: item.curso || item.course,
                                turmaNumber: item.turma || item.turmaNumber,
                                withdrawalTime: item.horaRetirada || item.withdrawalTime,
                                returnTime: item.horaDevolucao || item.returnTime,
                                status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                       (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime) ? 'devolvida' : 'disponivel'
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
        dateSelector.addEventListener('change', async function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            // Parar sincronização da data anterior
            if (typeof stopSyncDataRealtime === 'function') {
                console.log('[PROFESSOR]  Parando sincronização da data anterior...');
                stopSyncDataRealtime(oldDate, 'manhã');
                stopSyncDataRealtime(oldDate, 'tarde');
                stopSyncDataRealtime(oldDate, 'noite');
            }
            
            // Carregar dados da nova data do Firebase
            let firebaseLoaded = false;
            if (typeof loadTeacherDataFromFirebase === 'function') {
                console.log(`[PROFESSOR]  Carregando dados do Firebase para nova data: ${selectedDate}`);
                try {
                    firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
                    if (firebaseLoaded) {
                        console.log('[PROFESSOR]  Dados da nova data carregados do Firebase!');
                        
                        // Iniciar sincronização para a nova data
                        if (typeof syncTeacherDataRealtime === 'function') {
                            console.log('[PROFESSOR]  Iniciando sincronização para nova data...');
                            syncTeacherDataRealtime(selectedDate, 'manhã');
                            syncTeacherDataRealtime(selectedDate, 'tarde');
                            syncTeacherDataRealtime(selectedDate, 'noite');
                        }
                    }
                } catch (error) {
                    console.error('[PROFESSOR]  Erro ao carregar nova data do Firebase:', error);
                }
            }
            
            // Se não conseguiu carregar do Firebase, verificar localStorage
            if (!firebaseLoaded) {
                console.log('[PROFESSOR] � Verificando localStorage para nova data...');
                const dateData = getDataForDate(selectedDate);
                const shiftData = dateData[activeShift] || [];
                console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            }
            
            renderTableForShift(activeShift);
        });
    }

    // Carregar dados iniciais e renderizar
    console.log('[PROFESSOR] ==> Inicializando painel do professor');
    console.log('[PROFESSOR] ==> activeShift inicial:', activeShift);
    console.log('[PROFESSOR] ==> selectedDate inicial:', selectedDate);
    
    renderTabs(); // Garantir que as abas sejam renderizadas
    
    // Carregar dados de forma assíncrona
    loadSharedData().then(() => {
        console.log('[PROFESSOR] ==> Dados carregados, renderizando tabela...');
        renderTableForShift(activeShift);
    }).catch(error => {
        console.error('[PROFESSOR] ==> Erro ao carregar dados:', error);
        renderTableForShift(activeShift); // Tentar renderizar mesmo com erro
    });
    
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
    if (!record || typeof record !== 'object') {
        return `<span class="status-badge disponivel">Disponível</span>`;
    }

    let status = 'disponivel';
    let label = 'Disponível';

    // Verificar status usando campos do professor
    if (record.horaRetirada) {
        if (!record.horaDevolucao) {
            status = 'em_uso';
            label = 'Em Uso';
        } else {
            status = 'devolvida';
            label = 'Devolvida';
        }
    }
    // Verificar status usando campos do administrador se os do professor não estiverem disponíveis
    else if (record.withdrawalTime) {
        if (!record.returnTime) {
            status = 'em_uso';
            label = 'Em Uso';
        } else {
            status = 'devolvida';
            label = 'Devolvida';
        }
    }
    // Verificar status direto se disponível
    else if (record.status) {
        status = record.status;
        switch (record.status) {
            case 'em_uso':
                label = 'Em Uso';
                break;
            case 'devolvida':
                label = 'Devolvida';
                break;
            case 'retirada':
                label = 'Retirada';
                break;
            default:
                label = 'Disponível';
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

        // Sempre ordenar alfabeticamente por professor para manter consistência com painel administrativo
        return validData.sort((a, b) => {
            const professorA = (a.professor || '').trim();
            const professorB = (b.professor || '').trim();
            if (!professorA || !professorB) return 0;
            return professorA.localeCompare(professorB, 'pt-BR');
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
        
        // Garantir que cada registro tenha um ID único
        if (!item.id) {
            item.id = item.sala || item.room || `record_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Se está no formato admin (room, professorName), converter
        if (item.room && item.professorName && !item.sala && !item.professor) {
            console.log('[PROFESSOR] ==> Convertendo item do formato admin:', item);
            return {
                id: item.id,
                sala: item.room || 'Sala não especificada',
                professor: item.professorName || 'Professor não especificado',
                disciplina: item.subject || '-',
                curso: item.course || '-',
                turma: item.turmaNumber || '-',
                horaRetirada: item.withdrawalTime || null,
                horaDevolucao: item.returnTime || null,
                // Manter campos originais para compatibilidade
                room: item.room,
                professorName: item.professorName,
                subject: item.subject,
                course: item.course,
                turmaNumber: item.turmaNumber,
                withdrawalTime: item.withdrawalTime,
                returnTime: item.returnTime,
                status: item.status || 'disponivel'
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
        
        // Garantir que cada registro tenha um ID único
        if (!record.id) {
            record.id = record.sala || `record_${Math.random().toString(36).substr(2, 9)}`;
        }

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
function handleKey(recordId, action) {
    const currentData = getCurrentShiftData();
    // Tentar encontrar por ID primeiro, depois por sala
    const record = currentData.find(r => r.id === recordId) || 
                   currentData.find(r => r.sala === recordId) ||
                   currentData.find(r => r.curso === recordId) ||
                   currentData.find(r => r.horaDevolucao === recordId);
    
    if(!record) {
        console.error('Registro não encontrado:', recordId);
        return;
    }

    if(action === 'remove' && record.horaDevolucao) {
        showMensageConfirmationModal();
        return;
    }

    document.getElementById('btn-retirar-chave').innerText = (action === 'remove') ? 'Retirar a chave' : 'Devolver a chave';

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
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = getCurrentShiftData();
    
    // DEBUG: Validar dados antes de prosseguir
    console.log(' [DEBUG] executeKeyAction - Dados iniciais:');
    console.log(' [DEBUG] - record:', record);
    console.log(' [DEBUG] - action:', action);
    console.log(' [DEBUG] - currentShiftData length:', currentShiftData.length);
    console.log(' [DEBUG] - currentShiftData:', currentShiftData);
    
    // Validar se currentShiftData é válido
    if (!Array.isArray(currentShiftData)) {
        console.error(' [DEBUG] currentShiftData não é um array válido:', currentShiftData);
        return;
    }
    
    if (currentShiftData.length === 0) {
        console.warn(' [DEBUG] currentShiftData está vazio - isso pode causar problemas no Firebase');
    }
    
    // Tentar encontrar por ID primeiro, depois por sala
    let recordIndex = currentShiftData.findIndex(r => r.id === record.id);
    if (recordIndex === -1) {
        recordIndex = currentShiftData.findIndex(r => r.sala === record.sala);
    }
    if (recordIndex === -1) {
        recordIndex = currentShiftData.findIndex(r => r.curso === record.curso);
    }
    
    console.log(' [DEBUG] recordIndex encontrado:', recordIndex);
    
    if (recordIndex !== -1) {
        if (action === 'remove') {

            // if(currentShiftData[recordIndex].horaDevolucao != '-') {
            //     showMensageConfirmationModal();
            //     return;
            // } 
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaRetirada = hm;
            currentShiftData[recordIndex].horaDevolucao = undefined;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].withdrawalTime = hm;
            currentShiftData[recordIndex].returnTime = '';
            currentShiftData[recordIndex].status = 'em_uso';
            
            // Mostrar notificação de sucesso
            showNotification(`Chave retirada por ${record.professor} às ${hm}`, 'success');
        } else if (action === 'return') {
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaDevolucao = hm;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].returnTime = hm;
            currentShiftData[recordIndex].status = 'devolvida';

            
            // Mostrar notificação de sucesso
            showNotification(`Chave devolvida por ${record.professor} às ${hm}`, 'info');
        }

        // IMPORTANTE: Atualizar a estrutura dataByDateAndShift com os dados modificados
        dataByDateAndShift[selectedDate][activeShift] = currentShiftData;

        // Adicionar metadados de sincronização
        const completeTableData = {
            timestamp: Date.now(),
            lastModified: now.toISOString(),
            shift: activeShift,
            date: selectedDate,
            totalRecords: currentShiftData.length,
            modifiedRecordId: record.id || record.sala,
            action: action,
            data: currentShiftData
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
            // DEBUG: Log detalhado dos dados antes de enviar ao Firebase
            console.log(' [DEBUG] Dados antes de enviar ao Firebase:');
            console.log(' [DEBUG] - selectedDate:', selectedDate);
            console.log(' [DEBUG] - activeShift:', activeShift);
            console.log(' [DEBUG] - currentShiftData length:', currentShiftData.length);
            console.log(' [DEBUG] - currentShiftData completo:', currentShiftData);
            console.log(' [DEBUG] - dataByDateAndShift[selectedDate]:', dataByDateAndShift[selectedDate]);
            
            // Garantir que enviamos a tabela completa, não apenas o registro modificado
            saveDataToFirebase(selectedDate, activeShift, currentShiftData).then(() => {                
                console.log(' [DEBUG] Dados salvos no Firebase com sucesso!');
                // Notificar admin panel que a tabela completa foi atualizada
                if(typeof notifyAdminPanelUpdate === 'function') {
                    notifyAdminPanelUpdate(completeTableData);
                }
            }).catch(error => {
                console.error(' [DEBUG] Erro ao salvar TABELA COMPLETA no Firebase:', error);
                console.error(' [DEBUG] Dados que falharam:', {
                    date: selectedDate,
                    shift: activeShift,
                    recordCount: currentShiftData.length,
                    dataSample: currentShiftData.slice(0, 2) // Mostrar apenas os primeiros 2 registros
                });
            });
        } else {
            console.warn(' [DEBUG] Função saveDataToFirebase não disponível');
        }
        
        // Também salvar no formato antigo para compatibilidade
        const currentDateData = getDataForDate(selectedDate);
        localStorage.setItem('allShiftData', JSON.stringify(currentDateData));

        // Forçar sincronização com painel admin se disponível
        if(typeof syncWithAdminPanel === 'function') {
            syncWithAdminPanel(completeTableData);
        }

        // Verificar se os dados foram realmente salvos
        setTimeout(() => {
            verifyDataSyncronization(selectedDate, activeShift, currentShiftData);
        }, 1000);
        
    } else {
        console.warn('| ERRO: Registro não encontrado para ação:', {
            recordId: record.id,
            sala: record.sala,
            action: action
        });
    }

    renderTableForShift(activeShift);
}

// Função auxiliar para verificar se os dados foram sincronizados corretamente
function verifyDataSyncronization(date, shift, expectedData) {
    if(typeof getFirebaseData === 'function') {
        getFirebaseData(date, shift).then(firebaseData => {
            if(firebaseData && firebaseData.length === expectedData.length) {
                console.log('| Dados sincronizados corretamente no firebase');
            } else {
                console.warn('| ERRO: problema na sincronização:', {
                    expected: expectedData.length,
                    firebase: firebaseData ? firebaseData.length : 0
                });
            }
        }).catch(error => {
            console.error('| Erro ao verificar sincronização:', error);
        });
    }
}

// Função auxiliar para notificar o painel administrativo sobre atualizações
function notifyAdminPanelUpdate(completeTableData) {
    // Enviar via WebSocket se disponível
    if(typeof sendWebSocketMessage === 'function') {
        sendWebSocketMessage('COMPLETE_TABLE_UPDATE', completeTableData);
    }
    
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

// ----------- Login modal -----------
function openLogin() { 
    // Limpar mensagens de erro anteriores
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';
    
    // Mostrar informações sobre a ação
    if(activeAction && activeAction.record) {
        const record = activeAction.record;
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
                if(e.key === 'Enter') {
                    confirmLogin();
                }
            };
            
            fastInput.addEventListener('keypress', handleEnter);
            
            // Armazenar o handler para remoção posterior
            fastInput._enterHandler = handleEnter;
        }
    }, 100);
}

function closeLogin() { 
    document.getElementById('loginModal').style.display = 'none'; 
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';
    
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
    const fastId = fastIdRaw.toUpperCase();

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
    if (ConstantManager.validate(fastId)) {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('msg-erro').textContent = '';
        document.getElementById('loginFast').value = '';
        if (activeAction) {
            executeKeyAction(activeAction.record, activeAction.action);
            activeAction = null;
        }
        return;
    }

    // 2) Senão, validar correspondência do FATS específico com o professor
    const professorName = record.professor;
    const expectedFastId = docentesCodprof[professorName];

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
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';

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
    document.getElementById('tpPurpose').value = '';
    
    // Resetar seleção múltipla e modo
    selectedKeys = [];
    multipleSelectionMode = false;
    currentKeyMode = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    hideMultipleSelectionSection();

    document.body.style.overflow = '';
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    updateSelectedKeysCount();
}

// Variável de seleção atual para o funcionamento dos dropdowns (cascata)
let currentSelections = {
    block: null,
    room: null,
    roomNumber: null
};

// Funções para controlar o modo de seleção de chaves
function selectKeyMode(mode) {
    currentKeyMode = mode;
    
    // Limpar seleções anteriores
    selectedKeys = [];
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Esconder a seção de quantidade de chaves
    document.getElementById('key-quantity-section').classList.remove('visible');
    document.getElementById('key-quantity-section').classList.add('hidden');
    
    // Esconder seção de seleção múltipla (será mostrada depois se necessário)
    hideMultipleSelectionSection();

    // Mostrar o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.remove('hidden');
    
    // Mostrar seleção de bloco
    document.getElementById('block-dropdown').classList.remove('hidden');
    document.getElementById('block-dropdown').classList.add('visible');
    
    // Atualizar indicador visual do modo
    updateModeIndicator(mode);
    
    // Configurar modo
    if (mode === 'multiple') {
        multipleSelectionMode = true;
        // No modo múltiplo, esconder dropdowns de sala e número da sala
        document.getElementById('room-dropdown').style.display = 'none';
        document.getElementById('room-number-dropdown').style.display = 'none';
    } else {
        multipleSelectionMode = false;
        // No modo single, garantir que dropdowns estejam disponíveis
        document.getElementById('room-dropdown').style.display = '';
        document.getElementById('room-number-dropdown').style.display = '';
        // Esconder esses dropdowns inicialmente
        document.getElementById('room-dropdown').classList.remove('visible');
        document.getElementById('room-dropdown').classList.add('hidden');
        document.getElementById('room-number-dropdown').classList.remove('visible');
        document.getElementById('room-number-dropdown').classList.add('invisible');
    }
    
    // Resetar e popular o primeiro dropdown
    resetAllDropdowns();
}

function updateModeIndicator(mode) {
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        if (mode === 'single') {
            indicator.innerHTML = '<i class="bi bi-key"></i> Chave Específica';
            indicator.className = 'badge bg-primary';
        } else if (mode === 'multiple') {
            indicator.innerHTML = '<i class="bi bi-key-fill"></i> Múltiplas Chaves';
            indicator.className = 'badge bg-success';
        }
    }
}

function goBackToKeyQuantity() {
    // Resetar tudo
    currentKeyMode = null;
    multipleSelectionMode = false;
    selectedKeys = [];
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Mostrar novamente a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');

    // Oculta o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.add('hidden');
    
    // Esconder todas as outras seções
    hideMultipleSelectionSection();
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Resetar dropdowns
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
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
    const container = document.getElementById('available-keys-container');
    const block = currentSelections.block;
    const dropdownData = getDropdownData();

    if (!block) {
        container.innerHTML = '<div class="empty-keys-message">Selecione um bloco primeiro</div>';
        return;
    }

    // Atualizar o nome do bloco no título
    document.getElementById('selected-block-name').textContent = block;

    // Obter dados atuais para verificar disponibilidade
    const dateData = getDataForDate(selectedDate);
    const currentShiftData = dateData[activeShift] || [];
    
    container.innerHTML = '';
    
    if (currentKeyMode === 'multiple') {
        // Modo múltiplo: mostrar todas as chaves do bloco
        const blockRooms = dropdownData.filter(item => item.bloco === block);
        
        if (!blockRooms || blockRooms.length === 0) {
            container.innerHTML = '<div class="empty-keys-message">Nenhuma sala encontrada neste bloco</div>';
            return;
        }
        
        blockRooms.forEach(roomItem => {
            const room = roomItem.sala;
            const roomNumber = roomItem.numero;
            let salaIdentifier;
            
            if(roomNumber && roomNumber !== "") {
                salaIdentifier = `${block} - ${room} - Sala ${roomNumber}`;
            } else {
                salaIdentifier = `${block} - ${room}`;
            }
            
            const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block: block,
                room: room,
                roomNumber: roomNumber && roomNumber !== "" ? roomNumber : null
            });

            container.appendChild(keyItem);
        });
    } else {
        // Modo single: funcionalidade original (baseada em room selecionada)
        const room = currentSelections.room;
        
        if (!room) {
            container.innerHTML = '<div class="empty-keys-message">Selecione uma sala primeiro</div>';
            return;
        }

        // Encontrar as salas/números disponíveis    
        const numbers = getRoomNumbers(dropdownData, block, room);

        if (numbers.length === 0) {
            // Sala sem numeração - apenas uma chave
            const salaIdentifier = `${block} - ${room}`;
            const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block: block,
                room: room,
                roomNumber: null
            });
            container.appendChild(keyItem);
        } else {
            // Sala com numeração - múltiplas chaves
            numbers.forEach(number => {
                const salaIdentifier = `${block} - ${room} - Sala ${number}`;
                const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
                
                const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                    block: block,
                    room: room,
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
    checkbox.type = 'checkbox';
    checkbox.disabled = isInUse;
    checkbox.value = salaIdentifier;
    checkbox.addEventListener('change', () => toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked));
    
    const keyInfo = document.createElement('div');
    keyInfo.className = 'key-info';
    
    const keyName = document.createElement('div');
    keyName.className = 'key-name';
    keyName.textContent = salaIdentifier;
    
    const keyStatus = document.createElement('div');
    keyStatus.className = `key-status ${isInUse ? 'in-use' : 'available'}`;
    keyStatus.textContent = isInUse ? 'Em uso' : 'Disponível';
    
    keyInfo.appendChild(keyName);
    keyInfo.appendChild(keyStatus);
    
    item.appendChild(checkbox);
    item.appendChild(keyInfo);
    
    if (!isInUse) {
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked);
            }
        });
    }
    
    return item;
}

function toggleKeySelection(salaIdentifier, roomDetails, isSelected) {
    if (isSelected) {
        if (!selectedKeys.find(key => key.identifier === salaIdentifier)) {
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
        if (checkbox && checkbox.checked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function updateSelectedKeysCount() {
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = selectedKeys.length;
    }
}

function selectAllAvailableKeys() {
    const checkboxes = document.querySelectorAll('.key-selection-item:not(.unavailable) input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            const item = checkbox.closest('.key-selection-item');
            const salaIdentifier = checkbox.value;
            
            // Extrair detalhes da sala a partir do identificador
            const parts = salaIdentifier.split(' - ');
            const roomDetails = {
                block: parts[0],
                room: parts[1],
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
    const name = document.getElementById('tpFullName').value.trim();
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
    const block = currentSelections.block;
    const room = currentSelections.room;
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
    const numbers = getRoomNumbers(dropdownData, block, room);

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

    if(roomNumber) {
        salaIdentifier += ` - Sala ${roomNumber}`;
    }
    
    // Dados do terceiro
    const newRecord = createThirdPartyRecord(name, purpose, salaIdentifier, {
        block: block,
        room: room,
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

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', 
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
        id: `terceiro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sala: salaIdentifier,
        professor: name + " (Terceiro)",
        disciplina: purpose,
        curso: "Terceiros",
        turma: "-",
        horaRetirada: timeString,
        horaDevolucao: null,
        notas: '-',
        
        roomDetails: roomDetails,
        
        // Campos de compatibilidade com o painel administrativo
        room: salaIdentifier,
        professorName: name + " (Terceiro)",
        subject: purpose,
        course: "Terceiros",
        turmaNumber: "-",
        withdrawalTime: timeString,
        returnTime: null,
        status: 'em_uso'
    };
}

function addRecordToCurrentShift(records) {
    // Adicionar ao array do turno atual na data selecionada
    const dateData = getDataForDate(selectedDate);
    
    if(!dateData[activeShift]) {
        dateData[activeShift] = [];
    }

    records.forEach(record => {
        dateData[activeShift].push(record);
    });
    
    // Atualizar localStorage e notificar TODOS os painéis (professor + admin)
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
    
    // Salvar no Firebase para persistência e sincronização em tempo real
    if(typeof saveDataToFirebase === 'function') {
        console.log(' [TERCEIROS]: Salvando dados de terceiro no Firebase...');

        saveDataToFirebase(selectedDate, activeShift, dateData[activeShift]).then(() => {
            console.log(' [TERCEIROS]: Dados de terceiro salvos no Firebase com sucesso!');
        }).catch(error => {
            console.error(' [TERCEIROS]: Erro ao salvar dados de terceiro no Firebase:', error);
        });
    } else {
        console.warn(' [TERCEIROS]: Função saveDataToFirebase não disponível');
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
    document.getElementById('tpPurpose').value = '';
    
    // Resetar seleções
    selectedKeys = [];
    multipleSelectionMode = false;
    currentKeyMode = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');
    
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
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
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
    setupDropdownToggle(document.getElementById('block-dropdown'));
    setupDropdownToggle(document.getElementById('room-dropdown'));
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
    const options = dropdownElement.querySelector('.options');
    
    if(!selected || !options) return;
    
    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if(dropdownElement.classList.contains('disabled')) {
            return;
        }

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
        const selected = options.parentElement.querySelector('.selected');
        const dropdownItem = options.closest('.drop-down-item');

        options.classList.remove('show');

        if(selected) {
            selected.classList.remove('active');
        }
        if(dropdownItem) {
            dropdownItem.classList.remove('dropdown-active');
        }
    });
});

// Função para resetar os dropdowns
function resetDropdown(dropdownId, placeholderText, disable = true) {
    const dropdown = document.getElementById(dropdownId);

    // Interrompe a execução da função, caso o dropdown não for encontrado
    if(!dropdown) return;
    
    // Variáveis para armazenar o texto selecionado e a lista de opções
    let selectedText, options;
    
    if(dropdownId === 'block-dropdown') {
        selectedText = document.getElementById('valueBlock');
        options = dropdown.querySelector('.options');
    } else if(dropdownId === 'room-dropdown') {
        selectedText = document.getElementById('valueRoom');
        options = document.getElementById('room-dropdown-op');
    } else if(dropdownId === 'room-number-dropdown') {
        selectedText = document.getElementById('valueRoomNumber');
        options = document.getElementById('room-number-op');
    }
    
    if(selectedText) selectedText.innerText = placeholderText;
    if(options) options.innerHTML = '';    
    
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

    // const blocks = Object.keys(dropdown);

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

            if(selectedBlock !== currentSelections.block) {
                resetAllDropdowns();
            }
            
            // Atualiza as seleções
            currentSelections.block = selectedBlock;
            currentSelections.room = null;
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
            
            if (currentKeyMode === 'multiple') {
                // Modo múltiplo: mostrar imediatamente todas as chaves do bloco
                showMultipleSelectionSection();
                document.getElementById('room-dropdown').style.display = 'none';
                document.getElementById('room-number-dropdown').style.display = 'none';
                // Não chamar populateRoomDropdown no modo múltiplo
                return;
            } else {
                // Modo single: continuar com o fluxo normal
                // Garantir que room e room-number dropdowns estejam visíveis
                document.getElementById('room-dropdown').style.display = '';
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
    const roomOptions = document.getElementById('room-dropdown-op');
    
    if(!roomOptions || !roomDropdown) return;

    // const rooms = dropdown[selectedBlock] || [];

    const dropdownData = getDropdownData();
    const rooms = getUniqueRoomsForBlock(dropdownData, selectedBlock);

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
            document.getElementById('valueRoom').textContent = selectedRoom;
            document.querySelector('#room-dropdown .selected').classList.remove('active');
            document.querySelector('#room-dropdown .selected').classList.add('gradient');
            roomOptions.classList.remove('show');
            document.getElementById('room-dropdown').classList.add('selectedOption');

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
                if (currentKeyMode === 'single') {
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
    const roomNumberOptions = document.getElementById('room-number-op');
    
    if(!roomNumberOptions || !roomNumberDropdown) return;

    const dropdownData = getDropdownData();
    const numbers = getRoomNumbers(dropdownData, selectedBlock, selectedRoom);

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
            if (currentKeyMode === 'multiple') {
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
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Reseta os "placeholders" do dropdown e os estados
    resetDropdown('block-dropdown', 'Selecione o bloco', false);
    resetDropdown('room-dropdown',  'Selecione a sala',  true);
    resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);

    // Reseta o gradiente do dropdown selecionado
    const blockSelected = document.querySelector('#block-dropdown .selected');
    const roomSelected = document.querySelector('#room-dropdown .selected');
    const roomNumberSelected = document.querySelector('#room-number-dropdown .selected');
    
    if(blockSelected) blockSelected.classList.remove('gradient');
    if(roomSelected) roomSelected.classList.remove('gradient');
    if(roomNumberSelected) roomNumberSelected.classList.remove('gradient');

    // Remove all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
        item.classList.remove('selectedOption');
    });

    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    roomNumberDropdown.classList.remove('hidden');
    roomNumberDropdown.classList.remove('noOptions');
    roomNumberDropdown.classList.add('invisible');

    // Limpar conteúdo das opções
    const blockOptions = document.querySelector('#block-dropdown .options');
    const roomOptions = document.querySelector('#room-dropdown .options');
    const roomNumberOptions = document.querySelector('#room-number-dropdown .options');
    
    if(blockOptions) blockOptions.innerHTML = '';
    if(roomOptions) roomOptions.innerHTML = '';
    if(roomNumberOptions) roomNumberOptions.innerHTML = '';

    // Preenche novamente o primeiro dropdown
    populateBlockDropdown();
}


// ----------- Inicialização e mudança de turno -----------
function initialize() {
    console.log('Inicializando painel do professor...');
    const h = new Date().getHours();

    activeShift = (h < 12) ? 'manhã' : ((h < 18) ? 'tarde' : 'noite');
    console.log('Turno inicial:', activeShift);

    // Carregar mapeamento de professores do localStorage
    loadDocentesCodprofFromStorage();

    // Carregar dados e configurar interface
    loadSharedData();
    renderTabs();
    
    // Configurar os eventos
    document.getElementById('sortToggle')?.addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn = document.getElementById('sortToggle');
        
        if(btn) {
            btn.setAttribute('aria-pressed', String(sortAlphabetically));
            renderTableForShift(activeShift);
        }
    });

    // Iniciar verificação automática de turno
    setInterval(autoShiftTick, 60000);
    
    // Inicializar sincronização Firebase se estiver disponível
    if(typeof initializeFirebaseSync === 'function') {
        console.log(' [PROFESSOR]: Inicializando sincronização Firebase...');
        initializeFirebaseSync();
    } else {
        console.warn(' [PROFESSOR]: Função initializeFirebaseSync não disponível');
    }
    
    // Inicializar ícones
    if(typeof lucide !== 'undefined') {
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
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}


