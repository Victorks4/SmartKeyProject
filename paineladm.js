// Dados mock (equivalente ao mockData do React)

function login(){
    const username = document.getElementById('username').value;
    const senha = document.getElementById('senha').value;
    if(username === 'admin' && senha === 'adm@123'){
        document.getElementById('overlay').style.display = 'none';
        // Inicializar o painel após login bem-sucedido
        initializePainelAdm();
    } else {
        // Mostrar mensagem de erro
        document.getElementById('msg-erro').textContent = 'Usuário ou senha incorretos!';
        document.getElementById('msg-erro').style.color = 'red';
    }
}

// Botão cancelar (voltar para a tela anterior FUNCIONANDOOOO)
function cancel(){
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'teacherPanel.html';
    }
}
   


const mockData = [
    {
        id: "1",
        professorName: "Prof. Moises Lima",
        room: "Laboratório 07 - Desenvolvimento Web",
        time: "13:00 - 17:00",
        subject: "Desenvolvimento Web",
        course: "Desenvolvimento de Sistemas",
        turmaNumber: "91134",
        status: "em_uso",
        withdrawalTime: "13:10",
        requiresLogin: true
    },
    {
        id: "2", 
        professorName: "Prof. Icaro Alvim",
        room: "Laboratório 03 - Programação de app",
        time: "18:40 - 21:10",
        subject: "Programação de app",
        course: "Desenvolvimento de Sistemas",
        turmaNumber: "2024B",
        status: "devolvida",
        withdrawalTime: "13:10",
        returnTime: "21:20",
        requiresLogin: true
    },
    {
        id: "3",
        professorName: "Prof. Ana",
        room: "Sala 305",
        time: "14:00 - 16:00",
        subject: "História",
        course: "Humanidades",
        turmaNumber: "2024C",
        status: "retirada",
        withdrawalTime: "13:10",
        requiresLogin: true
    },
    {
        id: "4",
        professorName: "Prof. Carlos Silva",
        room: "Laboratório 05 - Matemática",
        time: "08:00 - 10:00",
        subject: "Matemática Aplicada",
        course: "Engenharia",
        turmaNumber: "2024D",
        status: "devolvida",
        withdrawalTime: "08:05",
        returnTime: "10:15",
        requiresLogin: true
    },
    {
        id: "5",
        professorName: "Maria Santos Cerqueira",
        room: "Sala 401",
        time: "15:30 - 17:30",
        subject: "Física",
        course: "Ciências Exatas",
        turmaNumber: "2024E",
        status: "em_uso",
        withdrawalTime: "15:35",
        requiresLogin: true
    }
];

// Função para obter o badge de status
function getStatusBadge(status) {
    const variants = {
        'em_uso': { variant: 'em-uso', label: 'Em Uso' },
        'devolvida': { variant: 'devolvida', label: 'Devolvida' },
        'retirada': { variant: 'retirada', label: 'Retirada' }
    };
    
    const config = variants[status];
    return `<span class="status-badge ${config.variant}">${config.label}</span>`;
}

// Função para gerar o botão de ação baseado no status da chave
function getActionButton(recordId, status) {
    if (status === 'em_uso') {
        // Chave em uso - botão "Devolver" ativo
        return `
            <button 
                class="btn action-btn devolver"
                onclick="handleKeyAction('${recordId}', '${status}')"
            >
                <i class="bi bi-arrow-return-left me-1"></i>
                Devolver
            </button>
        `;
    } else if (status === 'retirada' || status === 'devolvida') {
        // Chave disponível - botão "Retirar" ativo
        return `
            <button 
                class="btn action-btn retirar"
                onclick="handleKeyAction('${recordId}', '${status}')"
            >
                <i class="bi bi-key me-1"></i>
                Retirar
            </button>
        `;
    }
    
    // Fallback para outros status
    return `
        <button 
            class="btn action-btn retirar"
            onclick="handleKeyAction('${recordId}', '${status}')"
        >
            <i class="bi bi-key me-1"></i>
            Retirar
        </button>
    `;
}

// Função para renderizar os cards de estatísticas
function renderStatsCards() {
    const statsCardsContainer = document.getElementById('statsCards');
    
    const stats = {
        total: mockData.length,
        emUso: mockData.filter(r => r.status === 'em_uso').length,
        devolvidas: mockData.filter(r => r.status === 'devolvida').length
    };

    const cards = [
        {
            title: 'Total de Registros',
            value: stats.total,
            icon: 'bi-key-fill',
            iconClass: 'info'
        },
        {
            title: 'Em uso',
            value: stats.emUso,
            icon: 'bi-clock-fill',
            iconClass: 'primary'
        },
        {
            title: 'Devolvidas',
            value: stats.devolvidas,
            icon: 'bi-check-circle-fill',
            iconClass: 'success'
        }
    ];

    const cardsHTML = cards.map(card => `
        <div class="col-lg-4 col-md-6 col-sm-12 mb-3">
            <div class="stats-card">
                <div class="stats-card-header">
                    <span class="stats-card-title">${card.title}</span>
                    <div class="stats-card-icon ${card.iconClass}">
                        <i class="${card.icon}"></i>
                    </div>
                </div>
                <div class="stats-card-value text-${card.iconClass === 'info' ? 'info' : card.iconClass}">${card.value}</div>
            </div>
        </div>
    `).join('');

    statsCardsContainer.innerHTML = cardsHTML;
}

// Função para renderizar a tabela
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    const rowsHTML = mockData.map(record => `
        <tr>
            <td>${record.room}</td>
            <td>${record.course}</td>
            <td>
                <span class="badge fw-bold text-dark">${record.turmaNumber}</span>
            </td>
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
            <td>${getStatusBadge(record.status)}</td>
            <td class="text-center">
                ${getActionButton(record.id, record.status)}
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = rowsHTML;
}

// Função para lidar com ações de chave
function handleKeyAction(recordId, currentStatus) {
    const record = mockData.find(r => r.id === recordId);
    if (!record) return;

    if (currentStatus === 'em_uso') {
        // Devolver a chave
        record.status = 'devolvida';
        record.returnTime = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave devolvida por ${record.professorName} às ${record.returnTime}`, 'success');
    } else if (currentStatus === 'retirada' || currentStatus === 'devolvida') {
        // Retirar a chave
        record.status = 'em_uso';
        record.withdrawalTime = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        record.returnTime = undefined;
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave retirada por ${record.professorName} às ${record.withdrawalTime}`, 'info');
    }

    // Re-renderizar a interface
    renderStatsCards();
    renderTable();
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

// Função principal de inicialização
function initializePainelAdm() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            renderStatsCards();
            renderTable();
        });
    } else {
        renderStatsCards();
        renderTable();
    }
}

// Não inicializar automaticamente - apenas após login
// initializePainelAdm();

// Adicionar funcionalidade aos botões do header e eventos de login
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de Enter para os campos de login
    const usernameInput = document.getElementById('username');
    const senhaInput = document.getElementById('senha');
    
    if (usernameInput && senhaInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                senhaInput.focus();
            }
        });
        
        senhaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
        
        // Focar no primeiro campo quando a página carregar
        usernameInput.focus();
    }
    
    // Botão Adicionar
    const addButton = document.querySelector('button[title="Adicionar Nova Chave"]');
    if (addButton) {
        addButton.addEventListener('click', function() {
            showNotification('Funcionalidade de adicionar será implementada em breve!', 'warning');
        });
    }
    
    // Botão Editar
    const editButton = document.querySelector('button[title="Editar Configurações"]');
    if (editButton) {
        editButton.addEventListener('click', function() {
            showNotification('Funcionalidade de editar será implementada em breve!', 'warning');
        });
    }

    // Botão Cancelar do overlay (evita duplicidade se já houver onclick inline)
    const cancelButton = document.getElementById('cancel-btn');
    if (cancelButton && !cancelButton.getAttribute('onclick')) {
        cancelButton.addEventListener('click', cancel);
    }
});
