// Dados mock (equivalente ao mockData do React)
const mockData = [
    {
        id: "1",
        professorName: "Prof. Moises Lima",
        room: "Laboratório 07 - Desenvolvimento Web",
        time: "13:00 - 17:00",
        subject: "Desenvolvimento Web",
        course: "Desenvolvimento de Sistemas",
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
        status: "devolvida",
        withdrawalTime: "18:35",
        returnTime: "21:20",
        requiresLogin: false
    },
    {
        id: "3",
        professorName: "Prof. Ana Costa",
        room: "Sala 305",
        time: "14:00 - 16:00",
        subject: "História",
        course: "Humanidades",
        status: "retirada",
        withdrawalTime: "13:45",
        requiresLogin: true
    }
];

// Função para obter o badge de status (equivalente ao getStatusBadge do React)
function getStatusBadge(status) {
    const variants = {
        'em_uso': { variant: 'default', label: 'Em Uso' },
        'devolvida': { variant: 'outline', label: 'Devolvida' },
        'retirada': { variant: 'secondary', label: 'Retirada' }
    };
    
    const config = variants[status];
    return `<span class="badge badge-${config.variant}">${config.label}</span>`;
}

// Função para renderizar os cards de estatísticas
function renderStatsCards() {
    const statsCardsContainer = document.getElementById('statsCards');
    
    const stats = {
        total: mockData.length,
        emUso: mockData.filter(r => r.status === 'em_uso').length,
        devolvidas: mockData.filter(r => r.status === 'devolvida').length,
        retiradas: mockData.filter(r => r.status === 'retirada').length
    };

    const cards = [
        {
            title: 'Total de Registros',
            value: stats.total,
            icon: 'key',
            color: ''
        },
        {
            title: 'Em Uso',
            value: stats.emUso,
            icon: 'clock',
            color: 'text-primary'
        },
        {
            title: 'Devolvidas',
            value: stats.devolvidas,
            icon: 'check-circle',
            color: 'text-success'
        },
        {
            title: 'Retiradas',
            value: stats.retiradas,
            icon: 'alert-circle',
            color: 'text-warning'
        }
    ];

    const cardsHTML = cards.map(card => `
        <div class="stats-card">
            <div class="stats-card-header">
                <span class="stats-card-title">${card.title}</span>
                <i data-lucide="${card.icon}" class="h-4 w-4 ${card.color}"></i>
            </div>
            <div class="stats-card-value ${card.color}">${card.value}</div>
        </div>
    `).join('');

    statsCardsContainer.innerHTML = cardsHTML;
}

// Função para renderizar a tabela
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    const rowsHTML = mockData.map(record => `
        <tr>
            <td class="font-medium flex items-center gap-2">
                <i data-lucide="user" class="h-4 w-4 text-muted-foreground"></i>
                ${record.professorName}
            </td>
            <td>${record.room}</td>
            <td>${record.time}</td>
            <td class="flex items-center gap-2">
                <i data-lucide="book-open" class="h-4 w-4 text-muted-foreground"></i>
                ${record.subject}
            </td>
            <td>${record.course}</td>
            <td>${getStatusBadge(record.status)}</td>
            <td>${record.withdrawalTime}</td>
            <td>${record.returnTime || "-"}</td>
            <td>
                <button 
                    class="btn btn-outline btn-sm"
                    ${record.status === 'em_uso' ? 'disabled' : ''}
                    onclick="handleKeyAction('${record.id}', '${record.status}')"
                >
                    <i data-lucide="key" class="h-3 w-3"></i>
                    Retirar
                </button>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = rowsHTML;
}

// Função para lidar com ações de chave
function handleKeyAction(recordId, currentStatus) {
    if (currentStatus === 'em_uso') {
        alert('Esta chave já está em uso!');
        return;
    }

    const record = mockData.find(r => r.id === recordId);
    if (!record) return;

    if (currentStatus === 'retirada') {
        // Simular retirada da chave
        record.status = 'em_uso';
        record.withdrawalTime = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        alert(`Chave retirada por ${record.professorName} às ${record.withdrawalTime}`);
    } else if (currentStatus === 'devolvida') {
        // Simular nova retirada
        record.status = 'retirada';
        record.withdrawalTime = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        record.returnTime = undefined;
        alert(`Chave disponível para retirada por ${record.professorName}`);
    }

    // Re-renderizar a interface
    renderStatsCards();
    renderTable();
}

// Função para inicializar os ícones Lucide
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Função principal de inicialização
function initializeDashboard() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            renderStatsCards();
            renderTable();
            initializeLucideIcons();
        });
    } else {
        renderStatsCards();
        renderTable();
        initializeLucideIcons();
    }
}

// Inicializar o dashboard quando a página carregar
initializeDashboard();

// Re-inicializar ícones quando a página estiver totalmente carregada
window.addEventListener('load', function() {
    // Aguardar um pouco para garantir que o Lucide esteja carregado
    setTimeout(initializeLucideIcons, 100);
});
