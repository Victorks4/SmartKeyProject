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
    
    const dateData = getDataForDate(selectedDate);
    console.log(`[PROFESSOR] ==> dateData para ${selectedDate}:`, dateData);
    console.log(`[PROFESSOR] ==> dateData[${activeShift}]:`, dateData[activeShift]);
    console.log(`[PROFESSOR] ==> Tipo de dateData[${activeShift}]:`, typeof dateData[activeShift]);
    console.log(`[PROFESSOR] ==> É array?`, Array.isArray(dateData[activeShift]));
    
    const result = dateData[activeShift] || [];
    console.log(`[PROFESSOR] ==> Resultado final:`, result);
    return result;
}

// Carregar dados do localStorage
function loadSharedData() {
    console.log('[PROFESSOR] ==> loadSharedData iniciada');
    console.log('[PROFESSOR] ==> selectedDate atual:', selectedDate);
    console.log('[PROFESSOR] ==> activeShift atual:', activeShift);
    
    // Tentar carregar dados no novo formato (por data)
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
        dateSelector.addEventListener('change', function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            // Verificar se há dados para esta data
            const dateData = getDataForDate(selectedDate);
            const shiftData = dateData[activeShift] || [];
            console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            
            // Não sincronizar data - navegação independente
            
            renderTableForShift(activeShift);
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

function showAdmLogin() {
    window.location.href = 'paineladm.html';
}

function hideAdmLogin() {
    document.getElementById('overlay').style.visibility = 'hidden';
}

// ---------- Botão de Ação ----------
function getActionButton(recordId, record) {
    // Verificar se a chave está em uso usando campos do professor
    const isInUse = (record.horaRetirada && !record.horaDevolucao) || 
                   (record.withdrawalTime && !record.returnTime) ||
                   record.status === 'em_uso';
    
    if (isInUse) {
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
    } else {
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
                   currentData.find(r => r.sala === recordId);
    
    if(!record) {
        console.error('Registro não encontrado:', recordId);
        return;
    }

    executeKeyAction(record, action);
}

function executeKeyAction(record, action) {
    const now = new Date();
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = getCurrentShiftData();
    // Tentar encontrar por ID primeiro, depois por sala
    const recordIndex = currentShiftData.findIndex(r => r.id === record.id) || 
                        currentShiftData.findIndex(r => r.sala === record.sala);
    
    if (recordIndex !== -1) {
        if (action === 'remove') {
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

        // Atualizar o localStorage com os novos dados
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Marcar timestamp de atualização para sincronização entre abas
        localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
        
        // Disparar evento de atualização para sincronizar com o painel administrativo
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
            detail: { shift: activeShift, data: dataByDateAndShift }
        }));
        
        // Também salvar no formato antigo para compatibilidade
        const currentDateData = getDataForDate(selectedDate);
        localStorage.setItem('allShiftData', JSON.stringify(currentDateData));
    }

    renderTableForShift(activeShift);
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
    document.getElementById('loginModal').style.display = 'flex'; 
}

function closeLogin() { 
    document.getElementById('loginModal').style.display = 'none'; 
    activeAction = null; 
}

function confirmLogin() {
    const fast = (document.getElementById('loginFast').value || '').trim();

    if(!fast) {
        document.getElementById('msg-erro').textContent = 'Por favor, preencha o Fast!';
        return; 
    }

    const record = activeAction ? activeAction.record : null;

    if(!record || record.fast !== fast) {
        document.getElementById('msg-erro').textContent = 'Fast incorreto.';
        return;
    }

    document.getElementById('loginModal').style.display = 'none';

    if(activeAction) { 
        executeKeyAction(activeAction.record, activeAction.action); 
        activeAction = null; 
    }

    document.getElementById('loginId').value = '';
}

// ----------- Terceiros modal -----------
function openThirdPartyForm() { 
    document.getElementById('thirdPartyModal').style.display = 'flex'; 
}

function closeThirdPartyForm() {
    document.getElementById('thirdPartyModal').style.display = 'none'; 
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    document.getElementById('tpNotes').value = '';
    resetAllDropdowns();
}

// ----------- Dropdowns -----------
const dropdown = {
  "Bloco A": [
    { sala: "HIDRÁULICA",  numeros: [] },
    { sala: "AUT PREDIAL", numeros: [] }
  ],
  "Bloco B": [
    { sala: "QUÍMICA",     numeros: [] }
  ],
  "Bloco C": [
    { sala: "FABRICAÇÃO",  numeros: [] }
  ],
  "Bloco D": [
    { sala: "PLANTA CIM",  numeros: [] },
    { sala: "METROLOGIA",  numeros: [] },
    { sala: "LAB MAKER",   numeros: [] }
  ],
  "Bloco E": [
    { sala: "SALAS TÉRREO", numeros: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] }
  ],
  "Bloco F": [
    { sala: "LAB DE INFORMÁTICA", numeros: [1,2,3,4,5,6,7,8,9,10] },
    { sala: "LAB ELETROTÉCNICA",  numeros: [11] },
    { sala: "SALAS - 2º ANDAR",   numeros: [12,14,16,17,18,19,20] },
    { sala: "LAB ACIONAMENTOS",   numeros: [13] },
    { sala: "LAB ELETRÔNICA",     numeros: [15] }
  ],
  "Bloco G": [
    { sala: "ARMAZENAGEM",        numeros: [] },
    { sala: "SALA DE AUTOMOTIVA", numeros: [] },
    { sala: "MOTOCICLETAS",       numeros: [] },
    { sala: "FUNILARIA",          numeros: [] },
    { sala: "PREDIAL II",         numeros: [] }
  ],
  "Bloco H": [
    { sala: "SALA EMPILHADEIRA", numeros: [] },
    { sala: "MICROBIOLOGIA",     numeros: [] },
    { sala: "PANIFICAÇÃO",       numeros: [] }
  ]
};

// Variável de seleção atual para o funcionamento dos dropdowns (cascata)
let currentSelections = {
    block: null,
    room: null,
    roomNumber: null
};

// Função Salvar Terceiros
function saveThirdParty() {
    const name = document.getElementById('tpFullName').value.trim();
    const purpose = document.getElementById('tpPurpose').value.trim();
    const notes = document.getElementById('tpNotes').value.trim();
    
    // Recupera as opções do dropdown selecionadas
    const block = currentSelections.block;
    const room = currentSelections.room;
    const roomNumber = currentSelections.roomNumber;

    // Valida se os campos obrigatórios estão vazios
    if(!name || !purpose || !block || !room) { 
        alert('Preencha corretamente os campos obrigatórios.'); 
        return; 
    }

    // Encontra o objeto <sala> para recuperar o vetor de <numeros>
    const roomObj = dropdown[block].find(r => r.sala === room);
    const numbers = roomObj ? roomObj.numeros : [];

    // Valida se a sala selecionada há números e, caso tenha, se algum foi selecionado
    if(numbers.length > 0 && !roomNumber) {
        alert('Selecione uma sala para completar o cadastro!');
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
    const newRecord = {
        id: `terceiro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sala: salaIdentifier,
        professor: name + " (Terceiro)",
        disciplina: purpose,
        curso: "Terceiros",
        turma: "-",
        horaRetirada: timeString,
        horaDevolucao: null,
        notas: notes,
        
        roomDetails: {
            block: block,
            room: room,
            roomNumber: roomNumber
        },
        
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

    // Adicionar ao array do turno atual na data selecionada
    const dateData = getDataForDate(selectedDate);
    
    if(!dateData[activeShift]) {
        dateData[activeShift] = [];
    }

    dateData[activeShift].push(newRecord);
    
    // Atualizar localStorage e notificar TODOS os painéis (professor + admin)
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
    
    window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
        detail: { 
            shift: activeShift, 
            data:  dataByDateAndShift 
        } 
    }));

    // Limpar formulário
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    document.getElementById('tpNotes').value = '';
    
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
    
    if(selectedText) selectedText.textContent = placeholderText;
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

    const blocks = Object.keys(dropdown);

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
            
            // Exibe o dropdown de Salas
            const roomDropdown = document.querySelector('#room-dropdown');

            if(roomDropdown) {
                roomDropdown.classList.remove('hidden');
                roomDropdown.classList.add('visible');
            }
            
            // Preenche o próximo dropdown e reinicia os seguintes
            populateRoomDropdown(selectedBlock);
            resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
        });
    });
}

// Função que preenche os dropdowns de "Sala" (segundo dropdown)
function populateRoomDropdown(selectedBlock) {
    const roomDropdown = document.getElementById('room-dropdown');
    const roomOptions = document.getElementById('room-dropdown-op');
    
    if(!roomOptions || !roomDropdown) return;

    const rooms = dropdown[selectedBlock] || [];

    roomOptions.innerHTML = rooms.map(roomObj => `
        <li class="option" data-value="${roomObj.sala}">${roomObj.sala}</li>
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

            const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
            const numbers = roomObj ? roomObj.numeros : [];

            if(numbers.length != 0) {
                roomNumberDropdown.classList.remove('hidden');
                roomNumberDropdown.classList.remove('selectedOption');
                roomNumberDropdown.classList.remove('gradient');
                roomNumberDropdown.classList.add('visible');
            }
            
            // Preenche o próximo dropdown e reinicia os seguintes
            populateRoomNumberDropdown(selectedBlock, selectedRoom);
        });
    });
}

// Função que preenche os dropdowns de "Número da Sala" (terceiro dropdown)
function populateRoomNumberDropdown(selectedBlock, selectedRoom) {
    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    const roomNumberOptions = document.getElementById('room-number-op');
    
    if(!roomNumberOptions || !roomNumberDropdown) return;

    // Encontra o objeto <sala> para recuperar o vetor de <numeros>
    const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
    const numbers = roomObj ? roomObj.numeros : [];

    if(numbers.length === 0) {
        // Se não houver números disponíveis, desativa o dropdown e marca como "N/A"
        resetDropdown('room-number-dropdown', 'Sem numeração', true);
        currentSelections.roomNumber = null;
        roomNumberDropdown.classList.add('noOptions');
        roomNumberDropdown.classList.remove('hidden');

        setTimeout(() => {
            roomNumberDropdown.classList.add('selectedOption');
        }, 910);
        return;
    }

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
    document.querySelector('#block-dropdown .selected').classList.remove('gradient');
    document.querySelector('#room-dropdown .selected').classList.remove('gradient');
    document.querySelector('#room-number-dropdown .selected').classList.remove('gradient');

    // Remove all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
        item.classList.remove('selectedOption');
    });

    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    roomNumberDropdown.classList.remove('hidden');
    roomNumberDropdown.classList.remove('noOptions');
    roomNumberDropdown.classList.add('invisible');

    // Preenche novamente o primeiro dropdown
    populateBlockDropdown();
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
        
        if(btn) {
            btn.setAttribute('aria-pressed', String(sortAlphabetically));
            renderTableForShift(activeShift);
        }
    });

    // Iniciar verificação automática de turno
    setInterval(autoShiftTick, 60000);
    
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