// Variáveis globais
let activeShift = 'manhã';
let dataByShift = {
    'manhã': [],
    'tarde': [],
    'noite': []
};

// Função para mudar o turno ativo
function changeShift(newShift) {
    if (newShift !== activeShift && ['manhã', 'tarde', 'noite'].includes(newShift)) {
        activeShift = newShift;
        updateTable();
        renderStatsCards(); // Atualizar cards ao mudar de turno
        
        // Atualizar interface visual de seleção de turno
        const tabs = document.querySelectorAll('.shift-tab');
        tabs.forEach(tab => {
            if (tab.dataset.shift === newShift) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        const shiftCapitalized = newShift.charAt(0).toUpperCase() + newShift.slice(1);
        showNotification(`Visualizando turno da ${shiftCapitalized}`, 'info');
    }
}
let selectedFileForImport = null;

// Função para mostrar o modal de seleção de turno
function showShiftSelectionModal(file) {
    selectedFileForImport = file;
    const modal = new bootstrap.Modal(document.getElementById('shiftSelectionModal'));
    modal.show();
}

// Função para processar arquivo importado
async function handleFileImport(file) {
    if (!file) return;
    
    // Mostrar modal de seleção de turno
    selectedFileForImport = file;
    const modal = new bootstrap.Modal(document.getElementById('shiftSelectionModal'));
    modal.show();
}

// Função para processar o arquivo após seleção do turno
async function processFileImport(file, selectedShift) {
    if (!file) return;

    // Verificar extensão do arquivo
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
        alert('Por favor, use apenas arquivos Excel (.xlsx, .xls) ou CSV (.csv)');
        return;
    }

    // Mostrar indicador de carregamento
    const importBtn = document.querySelector('button[title="Importar Arquivo"]');
    const originalText = importBtn.innerHTML;
    importBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Importando...';
    importBtn.disabled = true;

    try {
        // Pegar o turno atual antes de processar o arquivo
        const currentShift = activeShift.charAt(0).toUpperCase() + activeShift.slice(1); // Capitaliza o turno

        const data = await readFileData(file);
        if (data && data.length > 0) {
            // Converter os dados para o formato do mockData
            const convertedData = data.map((row, index) => {
                // Extrair informações da linha e limpar valores FALSE
                const sala = decodeText(row[0]);
                const curso = decodeText(row[1]);
                const turmaStr = decodeText(row[2]);
                const professorName = decodeText(row[3]);
                const disciplina = decodeText(row[4]);
                const registro = decodeText(row[5]);

                // Ignorar valores FALSE ou ---
                if (sala === 'FALSE' || sala === '---' || 
                    curso === 'FALSE' || curso === '---' ||
                    disciplina === 'FALSE' || disciplina === '---') {
                    return null;
                }

                // Usar o turno ativo atual para o novo registro
                const defaultShift = activeShift;

                return {
                    id: registro || (index + 1).toString(), // Usar G-number como ID se disponível
                    room: sala,
                    course: curso,
                    turmaNumber: turmaStr,
                    professorName: professorName,
                    subject: disciplina,
                    time: '', // Será preenchido quando a chave for retirada
                    status: 'disponivel',
                    withdrawalTime: '', // Será preenchido quando a chave for retirada
                    returnTime: '', // Será preenchido quando a chave for devolvida
                    requiresLogin: true,
                    shift: defaultShift
                };
            });

                // Filtrar e validar os dados convertidos
                const validData = convertedData.filter(item => {
                    // Verificar se é um registro válido
                    const isValidRoom = item.room && 
                                     item.room.trim() !== '' && 
                                     item.room !== 'FALSE' &&
                                     !item.room.includes('---') &&
                                     !item.room.toLowerCase().includes('sala');

                    // Remover espaços em branco extras e manter valores originais
                    if (isValidRoom) {
                        item.room = item.room.trim();
                        // Manter os valores originais do curso e disciplina se existirem
                        if (item.course) item.course = item.course.trim();
                        if (item.subject) item.subject = item.subject.trim();
                        if (item.professorName) item.professorName = item.professorName.trim();
                        item.status = 'disponivel';
                    }

                    return isValidRoom && (item.course || item.subject); // Pelo menos um dos dois deve existir
                });

                if (validData.length === 0) {
                    throw new Error('Nenhum registro válido encontrado no arquivo. Verifique o formato dos dados.');
                }

                // Atualizar os dados do turno selecionado
                dataByShift[selectedShift] = validData;
                console.log(`Dados importados com sucesso para o turno ${selectedShift}. Total de registros:`, validData.length);
            
                // Atualizar as visualizações se estivermos no turno selecionado
                if (activeShift === selectedShift) {
                    updateTable();
                    renderStatsCards(); // Atualizar os cards após importação
                }
            
                // Mostrar notificação de sucesso
                const shiftCapitalized = selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1);
                showNotification(
                    `Dados importados com sucesso para o turno da ${shiftCapitalized}!\nTotal de registros: ${validData.length}`,
                    'success'
                );
                
                // Salvar todos os dados no localStorage para persistência e compartilhamento
                localStorage.setItem('allShiftData', JSON.stringify(dataByShift));
                
                // Emitir evento de atualização de dados
                const updateEvent = new CustomEvent('shiftDataUpdated', { 
                    detail: { shift: selectedShift, data: dataByShift }
                });
                window.dispatchEvent(updateEvent);
            
                // Salvar no localStorage para persistência
                localStorage.setItem('importedData', JSON.stringify(mockData));
        } else {
            throw new Error('Nenhum dado válido encontrado no arquivo');
        }
    } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        showNotification(
            `Erro ao importar arquivo: ${error.message || 'Verifique se o formato está correto e tente novamente.'}`,
            'error'
        );
    } finally {
        // Restaurar botão
        importBtn.innerHTML = originalText;
        importBtn.disabled = false;
    }
}


// Função para determinar o turno baseado na sala (pode ser customizada conforme necessário)
function getShiftFromRoom(room) {
    if (!room) return '';
    // Aqui você pode adicionar lógica específica para determinar o turno
    // baseado no número ou nome da sala, se necessário
    return '';
}

// Função para decodificar texto com caracteres especiais
function decodeText(text) {
    if (!text) return '';
    // Tenta decodificar caracteres especiais que podem ter sido mal interpretados
    try {
        return text.toString()
            .replace(/�/g, 'á')  // á
            .replace(/�/g, 'é')  // é
            .replace(/�/g, 'í')  // í
            .replace(/�/g, 'ó')  // ó
            .replace(/�/g, 'ú')  // ú
            .replace(/�/g, 'ã')  // ã
            .replace(/�/g, 'õ')  // õ
            .replace(/�/g, 'â')  // â
            .replace(/�/g, 'ê')  // ê
            .replace(/�/g, 'î')  // î
            .replace(/�/g, 'ô')  // ô
            .replace(/�/g, 'û')  // û
            .replace(/�/g, 'ç')  // ç
            .replace(/Ã§/g, 'ç') // ç (outro encoding)
            .replace(/Ã£/g, 'ã') // ã (outro encoding)
            .replace(/Ã¡/g, 'á') // á (outro encoding)
            .replace(/Ã©/g, 'é') // é (outro encoding)
            .replace(/Ã³/g, 'ó') // ó (outro encoding)
            .trim();
    } catch (e) {
        return text.toString().trim();
    }
}

// Função para ler o arquivo
function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isCSV = file.name.toLowerCase().endsWith('.csv');
        
        reader.onerror = function(e) {
            reject(new Error('Erro ao ler o arquivo: ' + e.target.error));
        };

        reader.onload = function(e) {
            try {
                // Verificar se o arquivo está vazio
                if (!e.target.result) {
                    throw new Error('Arquivo vazio ou inválido');
                }

                let workbook;
                if (isCSV) {
                    // Processar CSV com encoding correto para caracteres especiais
                    const content = e.target.result;
                    workbook = XLSX.read(content, { 
                        type: 'string',
                        raw: true,
                        cellText: false,
                        cellDates: true,
                        codepage: 65001, // UTF-8
                        charset: 'UTF-8'
                    });
                    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error('Arquivo CSV inválido');
                    }
                } else {
                    // Processar Excel
                    const data = new Uint8Array(e.target.result);
                    if (!data || data.length === 0) {
                        throw new Error('Arquivo vazio ou corrompido');
                    }

                    workbook = XLSX.read(data, { 
                        type: 'array',
                        raw: true, // Mantém os dados brutos
                        cellText: false, // Não converte para texto ainda
                        cellDates: true,
                        cellNF: false,
                        codepage: 65001 // UTF-8
                    });

                    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error('Arquivo Excel inválido ou sem planilhas');
                    }
                }
                
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                if (!firstSheet) {
                    throw new Error('Primeira planilha está vazia ou inválida');
                }
                
                // Configurar opções para ignorar linhas e colunas vazias
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                    header: 1,
                    raw: false,
                    blankrows: false, 
                    skipHidden: true,    // pula linhas/colunas ocultas
                    defval: null,        // células vazias serão null ao invés de string vazia
                    dateNF: 'dd/mm/yyyy', // formato de data
                    encoding: 'UTF-8'     // encoding para caracteres especiais
                });

                console.log('Dados lidos do arquivo:', jsonData); // Debug

                // Processar o arquivo linha por linha
                let columnMap = {
                    sala: -1,
                    curso: -1,
                    turma: -1,
                    professor: -1,
                    disciplina: -1
                };

                // Encontrar cabeçalho e mapear colunas
                let startIndex = -1;
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!Array.isArray(row)) continue;

                    // Verificar se é uma linha de cabeçalho
                    let foundHeader = false;
                    for (let j = 0; j < row.length; j++) {
                        if (!row[j]) continue;
                        const cellValue = String(row[j]).trim().toUpperCase();
                        
                        if (cellValue === 'SALA' || cellValue === 'SALAS') {
                            columnMap.sala = j;
                            foundHeader = true;
                        } else if (cellValue === 'CURSO' || cellValue === 'CURSOS') {
                            columnMap.curso = j;
                        } else if (cellValue === 'TURMA' || cellValue === 'TURMAS') {
                            columnMap.turma = j;
                        } else if (cellValue.includes('PROFESSOR')) {
                            columnMap.professor = j;
                        } else if (cellValue === 'DISCIPLINA' || cellValue.includes('DISCIPLINAS')) {
                            columnMap.disciplina = j;
                        }
                    }

                    if (foundHeader) {
                        startIndex = i;
                        break;
                    }
                }

                // Se não encontrou o cabeçalho, tentar identificar pela primeira linha de dados
                if (startIndex === -1) {
                    for (let i = 0; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (!Array.isArray(row) || row.length < 2) continue;
                        
                        // Verificar se a linha parece conter dados válidos
                        const firstCell = String(row[0] || '').trim();
                        if (firstCell && !firstCell.includes('FALSE') && !firstCell.includes('---')) {
                            startIndex = i - 1; // Considerar esta como primeira linha de dados
                            // Mapear colunas baseado na estrutura esperada
                            columnMap = {
                                sala: 0,
                                curso: 1,
                                turma: 2,
                                professor: 3,
                                disciplina: 4
                            };
                            break;
                        }
                    }
                }

                if (startIndex === -1) {
                    throw new Error('Não foi possível encontrar o cabeçalho das colunas no arquivo.');
                }

                // Extrair apenas as colunas relevantes e formatar os dados
                const formattedData = jsonData.slice(startIndex + 1)
                    .filter(row => Array.isArray(row) && row.some(cell => cell)) // Manter linhas que têm pelo menos uma célula com conteúdo
                    .map(row => {
                        try {
                            // Verificar se os índices das colunas são válidos
                            if (columnMap.sala === -1) {
                                throw new Error('Coluna SALA não encontrada no arquivo');
                            }

                            // Obter valores com validação
                            const getSafeValue = (index) => {
                                if (index === -1) return '';
                                const value = row[index];
                                if (!value) return '';
                                const strValue = String(value).trim();
                                // Não retornar "FALSE" como valor e tratar células vazias
                                return strValue === 'FALSE' || strValue === '---' ? '' : strValue;
                            };

                            const sala = getSafeValue(columnMap.sala);
                            
                            // Pular linhas de cabeçalho ou divisória
                            if (!sala || sala.toUpperCase().includes('SALA') || sala.includes('---')) {
                                return null;
                            }

                            let professor = getSafeValue(columnMap.professor);
                            let disciplina = getSafeValue(columnMap.disciplina);
                            const curso = getSafeValue(columnMap.curso);
                            const turma = getSafeValue(columnMap.turma);
                            const registro = getSafeValue(columnMap.registro);

                            // Se o professor ou disciplina estiver vazio, tentar encontrar em linhas adjacentes
                            if (!professor || !disciplina) {
                                for (let i = -2; i <= 2; i++) {
                                    const adjRow = jsonData[startIndex + 1 + i];
                                    if (adjRow) {
                                        const adjProf = adjRow[columnMap.professor];
                                        if (!professor && adjProf) {
                                            const profStr = String(adjProf).trim();
                                            if (profStr !== 'FALSE') {
                                                professor = profStr;
                                            }
                                        }
                                        
                                        const adjDisc = adjRow[columnMap.disciplina];
                                        if (!disciplina && adjDisc) {
                                            const discStr = String(adjDisc).trim();
                                            if (discStr !== 'FALSE') {
                                                disciplina = discStr;
                                            }
                                        }
                                    }
                                }
                            }

                            return [
                                sala,
                                curso,
                                turma,
                                professor,
                                disciplina,
                                registro
                            ];
                        } catch (error) {
                            console.error('Erro ao processar linha:', error, row);
                            return null;
                        }
                    })
                    .filter(row => row !== null && row[0] && row[0].trim() !== ''); // Remover linhas nulas e vazias

                if (formattedData.length === 0) {
                    throw new Error('Nenhum dado válido encontrado na planilha. Verifique o formato.');
                }

                resolve(formattedData);
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                reject(new Error('Erro ao processar o arquivo. Verifique se o formato está correto e se há dados válidos.'));
            }
        };

        // Iniciar a leitura do arquivo depois de configurar os handlers
        if (isCSV) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

// Função para validar o formato dos dados
function isValidDataFormat(data) {
    if (!data || data.length === 0) return false;
    
    // Verifica se cada linha tem pelo menos os 5 campos obrigatórios
    return data.every(row => row && row.length >= 5);
}

// Carregar dados salvos ao iniciar
function loadSavedData() {
    const savedData = localStorage.getItem('importedData');
    if (savedData) {
        mockData = JSON.parse(savedData);
        updateTable();
    }
}

// Configuração dos turnos
const shifts = [
    { id: 'manhã', label: 'Manhã' },
    { id: 'tarde', label: 'Tarde' },
    { id: 'noite', label: 'Noite' }
];

// Renderiza as abas de turno
function renderShiftTabs() {
    const el = document.getElementById('shiftTabs');
    if (!el) return;

    el.innerHTML = shifts.map(t => `
        <button class="tab ${(t.id === activeShift) ? 'active' : ''}" onclick="switchShift('${t.id}')">
            ${t.label}
        </button>
    `).join('');
}

// Troca o turno ativo
function switchShift(shift) {
    activeShift = shift;
    renderShiftTabs();
    // Filtrar dados pelo turno antes de atualizar
    const filteredData = mockData.filter(item => item.shift === shift);
    updateTable(filteredData);
}

// Atualiza a tabela com base no turno selecionado
function updateTable() {
    // Filtrar dados pelo turno ativo
    const filteredData = mockData.filter(item => item.shift === activeShift);
    // Renderizar apenas os dados do turno atual
    renderTable(filteredData);
    // Atualizar os cards de estatísticas também com os dados filtrados
    renderStatsCards(filteredData);
}

// Dados mock (equivalente ao mockData do React)

// Variável global para o intervalo de atualização da data
let dateUpdateInterval;

// Limpar o intervalo quando a página for fechada
window.addEventListener('unload', function() {
    if (dateUpdateInterval) {
        clearInterval(dateUpdateInterval);
    }
});

// Inicializar o calendário e o atualizador de data
// Inicializar os event listeners do modal de seleção de turno
// Função para carregar dados salvos
function loadSavedData() {
    const savedData = localStorage.getItem('allShiftData');
    if (savedData) {
        try {
            dataByShift = JSON.parse(savedData);
            updateTable();
        } catch (e) {
            console.error('Erro ao carregar dados salvos:', e);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Iniciar o atualizador de data
    updateCurrentDate();
    dateUpdateInterval = setInterval(updateCurrentDate, 60000); // Atualizar a cada minuto

    // Carregar dados salvos
    loadSavedData();
    renderStatsCards(); // Carregar os cards iniciais

    // Configurar evento do botão de confirmação de importação
    document.getElementById('confirmImportShift').addEventListener('click', async function() {
        const selectedShift = document.querySelector('input[name="importShift"]:checked').value;
        const modal = bootstrap.Modal.getInstance(document.getElementById('shiftSelectionModal'));
        modal.hide();
        
        if (selectedFileForImport) {
            await processFileImport(selectedFileForImport, selectedShift);
            selectedFileForImport = null;
        }
    });

    // Event listener para o botão de confirmação do modal
    document.getElementById('confirmImportShift').addEventListener('click', async function() {
        const selectedShift = document.querySelector('input[name="importShift"]:checked').value;
        const modal = bootstrap.Modal.getInstance(document.getElementById('shiftSelectionModal'));
        modal.hide();
        
        if (selectedFileForImport) {
            await processFileImport(selectedFileForImport, selectedShift);
            selectedFileForImport = null; // Limpar a referência do arquivo
        }
    });
    flatpickr("#dateFilter", {
        locale: "pt",
        dateFormat: "d/m/Y",
        onChange: function(selectedDates, dateStr) {
            filterByDate(selectedDates[0]);
        }
    });
});

// Função para filtrar por data
function filterByDate(selectedDate) {
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const timeCell = row.querySelector('td:nth-child(6)'); // coluna da hora inicial
        if (timeCell) {
            const rowDate = new Date(); // Aqui você usaria a data real do registro
            if (selectedDate.toDateString() === rowDate.toDateString()) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }
}

function checkLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('overlay').style.display = 'none';
        initializePainelAdm();
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('overlay').style.display = 'flex';
}

function login(){
    const username = document.getElementById('username').value;
    const senha = document.getElementById('senha').value;
    if(username === 'admin' && senha === 'adm@123'){
        localStorage.setItem('adminLoggedIn', 'true');
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
   


// Array que irá armazenar os dados importados
let mockData = [];

// Função para obter o badge de status
function getStatusBadge(status) {
    const variants = {
        'em_uso': { variant: 'em-uso', label: 'Em Uso' },
        'devolvida': { variant: 'devolvida', label: 'Devolvida' },
        'retirada': { variant: 'retirada', label: 'Retirada' },
        'disponivel': { variant: 'disponivel', label: 'Disponível' }
    };
    
    const config = variants[status];
    return `<span class="status-badge ${config.variant}">${config.label}</span>`;
}

// Função para gerar o botão de ação baseado no status da chave
function getActionButton(recordId, status) {
    if (status === 'disponivel') {
        // Chave disponível - botão "Retirar" ativo
        return `
            <button 
                class="btn action-btn retirar"
                onclick="handleKeyAction('${recordId}', '${status}')"
            >
                <i class="bi bi-box-arrow-right me-1"></i>
                Retirar
            </button>
        `;
    } else if (status === 'em_uso') {
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
    if (!statsCardsContainer) return;

    // Usar os dados do turno atual
    const currentData = dataByShift[activeShift] || [];
    
    const stats = {
        total: currentData.length,
        emUso: currentData.filter(r => r.status === 'em_uso').length,
        devolvidas: currentData.filter(r => r.status === 'devolvida').length
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

// Função para atualizar a data atual
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        dateElement.textContent = `${formattedDate} - ${formattedTime}`;
    }
}

// Função para renderizar a tabela
function renderTable() {
    // Usar os dados do turno atual
    const data = dataByShift[activeShift] || [];
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.error('Elemento tableBody não encontrado');
        return;
    }
    
    // Atualizar a data atual
    updateCurrentDate();
    
    if (!Array.isArray(data)) {
        console.error('data não é um array:', data);
        return;
    }

    console.log(`Dados a serem renderizados (${activeShift}):`, data); // Debug

    // Filtrar registros apenas do turno atual
    const rowsHTML = data.filter(record => record.shift === activeShift).map(record => {
        // Garantir que temos valores seguros para exibição
        const safeRecord = {
            room: record.room || '',
            course: record.course || '',
            turmaNumber: record.turmaNumber || '',
            professorName: record.professorName || 'PROFESSOR',
            subject: record.subject || 'DISCIPLINA',
            withdrawalTime: record.withdrawalTime || '-',
            returnTime: record.returnTime || '-',
            status: record.status || 'disponivel',
            id: record.id || '',
            shift: record.shift || 'manhã'
        };

        return `
        <tr>
            <td>${safeRecord.room}</td>
            <td>${safeRecord.course}</td>
            <td>
                <span class="badge fw-bold text-dark">${safeRecord.turmaNumber}</span>
            </td>
            <td class="fw-medium">
                <i class="bi bi-person-circle table-icon"></i>
                ${safeRecord.professorName}
            </td>
            <td>
                <i class="bi bi-book table-icon"></i>
                ${safeRecord.subject}
            </td>
            <td>${safeRecord.withdrawalTime}</td>
            <td>${safeRecord.returnTime}</td>
            <td>${getStatusBadge(safeRecord.status)}</td>
            <td class="text-center">
                ${getActionButton(safeRecord.id, safeRecord.status)}
            </td>
        </tr>
        `;
    }).join('');

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
    console.log('Inicializando painel administrativo...');
    
    // Limpar dados antigos do localStorage para evitar conflitos
    if (!localStorage.getItem('importedData')) {
        console.log('Inicializando com dados padrão...');
        mockData = []; // Começar com array vazio até importar dados
        localStorage.setItem('importedData', JSON.stringify(mockData));
    }

    // Carregar dados salvos
    loadSavedData();
    
    // Verificar se temos dados válidos
    if (!Array.isArray(mockData)) {
        console.error('mockData inválido após carregamento:', mockData);
        mockData = [];
    }

    console.log('Dados carregados:', mockData);

    // Renderizar a interface
    renderStatsCards();
    renderShiftTabs();
    renderTable();
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
