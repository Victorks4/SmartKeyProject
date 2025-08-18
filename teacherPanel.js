let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;

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

const mockData = [
    { 
        id: "1", 
        professorName: "Prof. Moises Lima", 
        room: "Laboratório 07 - Desenvolvimento Web", 
        time: "13:00 - 17:00", 
        subject: "Desenvolvimento Web", 
        course: "Desenvolvimento de Sistemas", 
        withdrawalTime: "13:10", 
        requiresLogin: true, 
        shift: "tarde" 
    },
    { 
        id: "2", 
        professorName: "Prof. Icaro Alvim", 
        room: "Laboratório 03 - Programação de app", 
        time: "18:40 - 21:10", 
        subject: "Programação de app", 
        course: "Desenvolvimento de Sistemas", 
        withdrawalTime: "18:35", 
        returnTime: "21:20", 
        requiresLogin: true, 
        shift: "tarde" 
    },
    { 
        id: "3", 
        professorName: "Prof. Ana Costa", 
        room: "Sala 305", 
        time: "14:00 - 16:00", 
        subject: "História", 
        course: "Humanidades", 
        withdrawalTime: "13:45", 
        requiresLogin: true, 
        shift: "tarde" 
    },
    { 
        id: "4", 
        professorName: "Prof. Bruno Alves", 
        room: "Sala 102", 
        time: "07:30 - 11:45", 
        subject: "Matemática", 
        course: "Exatas", 
        requiresLogin: true, 
        shift: "tarde" 
    }
];

const ORIGINAL_ORDER = [ ...mockData.map(m => m.id) ];

// ---------- Botão de Ação ----------
function getActionButton(recordId, record) {
    if (record.withdrawalTime && !record.returnTime) {
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
    let status = 'retirada';
    if (record.withdrawalTime && !record.returnTime) {
        status = 'em_uso';
    } else if (record.returnTime) {
        status = 'devolvida';
    }
    const variants = {
        'em_uso': { variant: 'em-uso', label: 'Em Uso' },
        'devolvida': { variant: 'devolvida', label: 'Devolvida' },
        'retirada': { variant: 'retirada', label: 'Retirada' }
    };
    const config = variants[status];
    return `<span class="status-badge ${config.variant}">${config.label}</span>`;
}

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
    if(sortAlphabetically) {
        return [ ...data ].sort((a, b) => a.professorName.localeCompare(b.professorName, 'pt-BR'));
    }
    const idx = new Map(ORIGINAL_ORDER.map((id, i) => [ id, i ]));
    return [ ...data ].sort((a, b) => idx.get(a.id) - idx.get(b.id));
}

function renderTableForShift(shift) {
    const container = document.getElementById('shiftContent');
    const records = sorted(mockData.filter(r => r.shift === shift));

    const rows = records.map(record => `
        <tr>
            <td>${record.room}</td>
            <td>${record.course}</td>
            <td>-</td>
            <td class="fw-medium">
                <i class="bi bi-person-circle table-icon"></i>
                ${record.professorName}
            </td>
            <td>
                <i class="bi bi-book table-icon"></i>
                ${record.subject}
            </td>
            <td>${record.withdrawalTime || '-'}</td>
            <td>${record.returnTime || '-'}</td>
            <td>${getStatusBadgeTP(record)}</td>
            <td class="text-center">
                ${getActionButton(record.id, record)}
            </td>
        </tr>
    `).join('');

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
function handleKey(id, action) {
    const record = mockData.find(r => r.id === id);
    if(!record) return;

    if(action === 'remove' && record.requiresLogin) {
        activeAction = { record, action };
        openLogin();
        return;
    }

    executeKeyAction(record, action);
}

function executeKeyAction(record, action) {
    const now = new Date();
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if(action === 'remove') {
        record.withdrawalTime = hm;
        record.returnTime = undefined;
    } else if(action === 'return') {
        record.returnTime = hm;
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
        id: String(mockData.length + 1),
        professorName: name + " (Terceiro)",
        room: "-", 
        time: "-",
        subject: purpose,
        course: "Terceiros",
        withdrawalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        returnTime: undefined,
        requiresLogin: false,
        shift: activeShift
    };

    mockData.push(newRecord);

    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    document.getElementById('tpContact').value = '';
    document.getElementById('tpNotes').value = '';
    
    closeThirdPartyForm();
    renderTableForShift(activeShift);
}

// ----------- Turno automático às 12:00 -----------
function switchShift(shift) { 
    activeShift = shift; 

    renderTabs(); 
    renderTableForShift(activeShift); 
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

    renderTabs();
    renderTableForShift(activeShift);

    lucide.createIcons();

    document.getElementById('sortToggle').addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn = document.getElementById('sortToggle');

        btn.setAttribute('aria-pressed', String(sortAlphabetically));
        renderTableForShift(activeShift);
    });

    setInterval(autoShiftTick, 60000);
}

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
