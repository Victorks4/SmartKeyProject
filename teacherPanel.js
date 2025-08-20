let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;
let dataByShift = {
    'manhã': [],
    'tarde': [],
    'noite': []
};

// Carregar dados do localStorage
function loadSharedData() {
    console.log('Carregando dados compartilhados...');
    const savedData = localStorage.getItem('allShiftData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log('Dados brutos carregados:', parsedData);
            
            // Se parsedData for um array (formato antigo), converter para o novo formato
            if (Array.isArray(parsedData)) {
                console.log('Convertendo dados do formato antigo...');
                dataByShift = {
                    'manhã': parsedData.filter(item => item && item.turno === 'manhã'),
                    'tarde': parsedData.filter(item => item && item.turno === 'tarde'),
                    'noite': parsedData.filter(item => item && item.turno === 'noite')
                };
            } else {
                // Garantir que o objeto tem a estrutura correta
                dataByShift = {
                    'manhã': Array.isArray(parsedData['manhã']) ? parsedData['manhã'].filter(Boolean) : [],
                    'tarde': Array.isArray(parsedData['tarde']) ? parsedData['tarde'].filter(Boolean) : [],
                    'noite': Array.isArray(parsedData['noite']) ? parsedData['noite'].filter(Boolean) : []
                };
            }
            
            // Sanitizar os dados
            for (let turno in dataByShift) {
                dataByShift[turno] = dataByShift[turno].map(item => ({
                    sala: item.sala || 'Sala não especificada',
                    professor: item.professor || 'Professor não especificado',
                    disciplina: item.disciplina || '-',
                    curso: item.curso || '-',
                    turma: item.turma || '-',
                    horaRetirada: item.horaRetirada || null,
                    horaDevolucao: item.horaDevolucao || null
                }));
            }
            
            console.log('Dados estruturados e sanitizados:', dataByShift);
            renderTableForShift(activeShift);
        } catch (e) {
            console.error('Erro ao carregar dados compartilhados:', e);
            // Resetar para estrutura vazia em caso de erro
            dataByShift = {
                'manhã': [],
                'tarde': [],
                'noite': []
            };
        }
    } else {
        console.log('Nenhum dado encontrado no localStorage');
    }
}

// Escutar por atualizações de dados
window.addEventListener('shiftDataUpdated', function(event) {
    console.log('Evento de atualização recebido:', event.detail);
    if (event.detail && event.detail.data) {
        // Garantir que o objeto tem a estrutura correta
        dataByShift = {
            'manhã': Array.isArray(event.detail.data['manhã']) ? event.detail.data['manhã'] : [],
            'tarde': Array.isArray(event.detail.data['tarde']) ? event.detail.data['tarde'] : [],
            'noite': Array.isArray(event.detail.data['noite']) ? event.detail.data['noite'] : []
        };
        console.log('Dados atualizados:', dataByShift);
        renderTableForShift(activeShift);
    } else {
        console.error('Evento de atualização recebido sem dados válidos:', event);
    }
});

// Inicializar o calendário e carregar dados
document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#teacherDateFilter", {
        locale: "pt",
        dateFormat: "d/m/Y",
        onChange: function(selectedDates, dateStr) {
            filterTeacherPanelByDate(selectedDates[0]);
        }
    });
    
    // Carregar dados iniciais e renderizar
    loadSharedData();
    renderTableForShift(activeShift);
});

// Função para filtrar por data no painel do professor
function filterTeacherPanelByDate(selectedDate) {
    const shiftContent = document.getElementById('shiftContent');
    const cards = shiftContent.getElementsByClassName('room-card');

    for (let card of cards) {
        const dateStr = card.getAttribute('data-date'); // Você precisará adicionar este atributo aos cards
        if (dateStr) {
            const cardDate = new Date(dateStr);
            if (selectedDate.toDateString() === cardDate.toDateString()) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    }
}

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
    console.log('Renderizando dados para o turno:', shift);
    const container = document.getElementById('shiftContent');
    if (!container) {
        console.error('Elemento shiftContent não encontrado!');
        return;
    }
    
    let shiftData = dataByShift[shift];
    if (!Array.isArray(shiftData)) {
        console.warn('Dados do turno não são um array:', shift);
        shiftData = [];
    }
    
    // Filtrar dados inválidos
    shiftData = shiftData.filter(item => {
        if (!item || typeof item !== 'object') return false;
        // Garantir que pelo menos a sala e o professor existem
        return item.sala && typeof item.sala === 'string' &&
               item.professor && typeof item.professor === 'string';
    });
    
    console.log('Dados filtrados do turno:', shiftData);
    const records = sorted(shiftData);

    console.log('Gerando linhas para os registros:', records);
    const rows = records.map(record => {
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

    container.innerHTML = `
        <div class="card-header d-flex align-items-center">
            <h2 class="card-title">
                <i class="bi bi-clock"></i>
                Turno da ${shift}
            </h2>
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
    const record = dataByShift[activeShift]?.find(r => r.sala === salaId);
    if(!record) {
        console.error('Registro não encontrado:', salaId);
        return;
    }

    executeKeyAction(record, action);
}

function executeKeyAction(record, action) {
    const now = new Date();
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = dataByShift[activeShift];
    const recordIndex = currentShiftData.findIndex(r => r.sala === record.sala);
    
    if (recordIndex !== -1) {
        if (action === 'remove') {
            currentShiftData[recordIndex].horaRetirada = hm;
            currentShiftData[recordIndex].horaDevolucao = undefined;
        } else if (action === 'return') {
            currentShiftData[recordIndex].horaDevolucao = hm;
        }

        // Atualizar o localStorage com os novos dados
        localStorage.setItem('allShiftData', JSON.stringify(dataByShift));
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { detail: { data: dataByShift } }));
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

    const newRecord = {
        sala: contact,
        professor: name + " (Terceiro)",
        disciplina: purpose,
        curso: "Terceiros",
        turma: "-",
        horaRetirada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        horaDevolucao: undefined,
        notas: notes
    };

    // Adicionar ao array do turno atual
    if (!dataByShift[activeShift]) {
        dataByShift[activeShift] = [];
    }
    dataByShift[activeShift].push(newRecord);
    
    // Atualizar localStorage e notificar outros painéis
    localStorage.setItem('allShiftData', JSON.stringify(dataByShift));
    window.dispatchEvent(new CustomEvent('shiftDataUpdated', { detail: { data: dataByShift } }));

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
    loadSharedData(); // Recarregar dados ao mudar de turno
    renderTabs(); 
}

function autoShiftTick() {
    const d = new Date();
    if(d.getHours() === 12 && d.getMinutes() === 0) {
        switchShift('tarde');
    }
}

// ----------- Inicialização da página -----------
function initialize() {
    const h = new Date().getHours();

    activeShift = (h < 12) ? 'manhã' : ((h < 18) ? 'tarde' : 'noite');

    // Carregar dados iniciais
    loadSharedData();
    
    renderTabs();
    renderTableForShift(activeShift);

    lucide.createIcons();

    document.getElementById('sortToggle').addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn = document.getElementById('sortToggle');

        btn.setAttribute('aria-pressed', String(sortAlphabetically));
        renderTableForShift(activeShift);
    });

    // Configurar atualização automática de turno
    setInterval(autoShiftTick, 60000);
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
