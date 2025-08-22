// Variáveis globais
let activeShift = 'manhã';
let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Função para obter ou criar estrutura de dados para uma data
function getDataForDate(date) {
    if (!dataByDateAndShift[date]) {
        dataByDateAndShift[date] = {
            'manhã': [],
            'tarde': [],
            'noite': []
        };
    }
    return dataByDateAndShift[date];
}

// Função para obter dados do turno atual na data selecionada
function getCurrentShiftData() {
    const dateData = getDataForDate(selectedDate);
    console.log(`Obtendo dados para data: ${selectedDate}, turno: ${activeShift}`, dateData[activeShift]);
    return dateData[activeShift] || [];
}

// Função para inicializar sincronização Firebase
function initializeFirebaseSync() {
    // Carregar dados da data atual
    loadAllDataForDate(selectedDate).then(() => {
        updateTable();
        // Iniciar sincronização em tempo real para todos os turnos
        syncDataRealtime(selectedDate, 'manhã');
        syncDataRealtime(selectedDate, 'tarde');
        syncDataRealtime(selectedDate, 'noite');
    });
}

// Função para mudar o turno ativo
function changeShift(newShift) {
    if (newShift !== activeShift && ['manhã', 'tarde', 'noite'].includes(newShift)) {
        console.log(`Mudando turno de ${activeShift} para ${newShift} na data ${selectedDate}`);
        activeShift = newShift;
        
        // Atualizar interface visual de seleção de turno
        renderShiftTabs();
        
        // Atualizar tabela com dados do novo turno
        updateTable();
        
        const shiftCapitalized = newShift.charAt(0).toUpperCase() + newShift.slice(1);
        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        showNotification(`Visualizando turno da ${shiftCapitalized} - ${formattedDate}`, 'info');
        
        // Sincronizar dados do novo turno com Firebase
        if (typeof syncDataRealtime === 'function') {
            syncDataRealtime(selectedDate, newShift);
        }
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

                // Ordenar dados alfabeticamente por nome do professor antes de salvar
                const sortedData = validData.sort((a, b) => {
                    const professorA = (a.professorName || '').trim();
                    const professorB = (b.professorName || '').trim();
                    if (!professorA || !professorB) return 0;
                    return professorA.localeCompare(professorB, 'pt-BR');
                });

                // Atualizar os dados do turno selecionado na data atual
                const dateData = getDataForDate(selectedDate);
                dateData[selectedShift] = sortedData;
                console.log(`Dados importados e ordenados com sucesso para o turno ${selectedShift}. Total de registros:`, sortedData.length);
            
                // Atualizar as visualizações se estivermos no turno selecionado
                if (activeShift === selectedShift) {
                    updateTable();
                }
            
                // Mostrar notificação de sucesso
                const shiftCapitalized = selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1);
                showNotification(
                    `Dados importados com sucesso para o turno da ${shiftCapitalized}!\nTotal de registros: ${validData.length}`,
                    'success'
                );
                
                // Salvar todos os dados no localStorage para persistência e compartilhamento
                console.log('Salvando dados no localStorage:', dataByDateAndShift);
                localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
                console.log('Dados salvos com sucesso no localStorage');
                
                // Também salvar no formato antigo para compatibilidade
                const currentDateData = getDataForDate(selectedDate);
                localStorage.setItem('allShiftData', JSON.stringify(currentDateData));
                
                // Emitir evento de atualização de dados para sincronizar com o painel do professor
                // Não incluir date para não forçar mudança de data no professor
                console.log('Disparando evento shiftDataUpdated...');
                const updateEvent = new CustomEvent('shiftDataUpdated', { 
                    detail: { shift: selectedShift, data: dataByDateAndShift }
                });
                window.dispatchEvent(updateEvent);
                console.log('Evento disparado com sucesso');
                
                // Forçar atualização em outras abas/janelas
                localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
            

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
        const originalText = text.toString();
        let decodedText = originalText;
        
        // Primeiro, tentar decodificar caracteres de substituição ()
        if (decodedText.includes('')) {
            try {
                // Tentar UTF-8
                const utf8Text = decodeURIComponent(escape(decodedText));
                if (!utf8Text.includes('')) {
                    decodedText = utf8Text;
                }
            } catch (e) {
                // Se falhar, continuar com as substituições manuais
            }
        }
        
        // Aplicar substituições manuais para caracteres específicos
        decodedText = decodedText
            // Caracteres minúsculos
            .replace(/Ã¡/g, 'á')  // á
            .replace(/Ã©/g, 'é')  // é
            .replace(/Ã­/g, 'í')  // í
            .replace(/Ã³/g, 'ó')  // ó
            .replace(/Ãº/g, 'ú')  // ú
            .replace(/Ã£/g, 'ã')  // ã
            .replace(/Ãµ/g, 'õ')  // õ
            .replace(/Ã¢/g, 'â')  // â
            .replace(/Ãª/g, 'ê')  // ê
            .replace(/Ã®/g, 'î')  // î
            .replace(/Ã´/g, 'ô')  // ô
            .replace(/Ã»/g, 'û')  // û
            .replace(/Ã§/g, 'ç')  // ç
            // Caracteres maiúsculos
            .replace(/Ã€/g, 'À')  // À
            .replace(/Ãˆ/g, 'È')  // È
            .replace(/ÃŒ/g, 'Ì')  // Ì
            .replace(/Ã"/g, 'Ò')  // Ò
            .replace(/Ã™/g, 'Ù')  // Ù
            .replace(/Ãƒ/g, 'Ã')  // Ã
            .replace(/Ã•/g, 'Õ')  // Õ
            .replace(/Ã‚/g, 'Â')  // Â
            .replace(/ÃŠ/g, 'Ê')  // Ê
            .replace(/ÃŽ/g, 'Î')  // Î
            .replace(/Ã"/g, 'Ô')  // Ô
            .replace(/Ã›/g, 'Û')  // Û
            .replace(/Ã‡/g, 'Ç')  // Ç
            // Outros caracteres comuns
            .replace(/Ã¨/g, 'è')  // è
            .replace(/Ã¬/g, 'ì')  // ì
            .replace(/Ã²/g, 'ò')  // ò
            .replace(/Ã¹/g, 'ù')  // ù
            // Caracteres de substituição () - tentar mapear baseado no contexto
            .replace(/\uFFFD/g, 'é')   // Substituir por é (mais comum)
            .trim();
        
        // Debug: mostrar apenas se o texto foi alterado
        if (originalText !== decodedText) {
            console.log('Texto decodificado:', { original: originalText, decoded: decodedText });
        }
        
        return decodedText;
    } catch (e) {
        console.warn('Erro ao decodificar texto:', e, 'Texto original:', text);
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
                    
                    // Tentar diferentes encodings para CSV
                    try {
                        // Primeira tentativa: UTF-8
                        workbook = XLSX.read(content, { 
                            type: 'string',
                            raw: true,
                            cellText: false,
                            cellDates: true,
                            codepage: 65001, // UTF-8
                            charset: 'UTF-8'
                        });
                    } catch (e) {
                        console.log('Tentativa UTF-8 falhou, tentando ISO-8859-1...');
                        try {
                            // Segunda tentativa: ISO-8859-1 (Latin-1)
                            workbook = XLSX.read(content, { 
                                type: 'string',
                                raw: true,
                                cellText: false,
                                cellDates: true,
                                codepage: 28591, // ISO-8859-1
                                charset: 'ISO-8859-1'
                            });
                        } catch (e2) {
                            console.log('Tentativa ISO-8859-1 falhou, tentando Windows-1252...');
                            // Terceira tentativa: Windows-1252
                            workbook = XLSX.read(content, { 
                                type: 'string',
                                raw: true,
                                cellText: false,
                                cellDates: true,
                                codepage: 1252, // Windows-1252
                                charset: 'Windows-1252'
                            });
                        }
                    }
                    
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
                    encoding: 'ISO-8859-1'     // encoding para caracteres especiais
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



// Configuração dos turnos
const shifts = [
    { id: 'manhã', label: 'Manhã' },
    { id: 'tarde', label: 'Tarde' },
    { id: 'noite', label: 'Noite' }
];

// Renderiza as abas de turno
function renderShiftTabs() {
    const el = document.getElementById('shiftTabs');
    if (!el) {
        console.error('Elemento shiftTabs não encontrado!');
        return;
    }

    const tabsHTML = shifts.map(t => `
        <button class="tab ${(t.id === activeShift) ? 'active' : ''}" onclick="changeShift('${t.id}')">
            ${t.label}
        </button>
    `).join('');
    
    console.log('Renderizando abas de turno:', tabsHTML);
    el.innerHTML = tabsHTML;
}

// Troca o turno ativo
function switchShift(shift) {
    activeShift = shift;
    renderShiftTabs();
    updateTable();
}

// Atualiza a tabela com base no turno selecionado
function updateTable() {
    // Renderizar apenas os dados do turno atual
    renderTable();
    
    // Salvar dados no Firebase se estiver disponível
    if (typeof saveDataToFirebase === 'function') {
        const currentData = getCurrentShiftData();
        saveDataToFirebase(selectedDate, activeShift, currentData).catch(error => {
            console.error('Erro ao salvar no Firebase:', error);
        });
    }
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
    // Tentar carregar dados no novo formato (por data)
    const newFormatData = localStorage.getItem('allDateShiftData');
    if (newFormatData) {
        try {
            dataByDateAndShift = JSON.parse(newFormatData);
            
            // Ordenar dados de todos os turnos alfabeticamente por nome do professor
            for (let date in dataByDateAndShift) {
                for (let turno in dataByDateAndShift[date]) {
                    if (Array.isArray(dataByDateAndShift[date][turno])) {
                        dataByDateAndShift[date][turno] = dataByDateAndShift[date][turno].sort((a, b) => {
                            const professorA = (a.professorName || '').trim();
                            const professorB = (b.professorName || '').trim();
                            if (!professorA || !professorB) return 0;
                            return professorA.localeCompare(professorB, 'pt-BR');
                        });
                    }
                }
            }
            
            console.log('Dados carregados e ordenados no novo formato:', dataByDateAndShift);
            updateTable();
            return;
        } catch (e) {
            console.error('Erro ao carregar dados no novo formato:', e);
        }
    }
    
    // Fallback: tentar carregar dados no formato antigo e migrar
    const oldFormatData = localStorage.getItem('allShiftData');
    if (oldFormatData) {
        try {
            const oldData = JSON.parse(oldFormatData);
            console.log('Migrando dados do formato antigo...');
            
            // Migrar dados antigos para a data atual
            dataByDateAndShift[selectedDate] = {
                'manhã': Array.isArray(oldData['manhã']) ? oldData['manhã'] : [],
                'tarde': Array.isArray(oldData['tarde']) ? oldData['tarde'] : [],
                'noite': Array.isArray(oldData['noite']) ? oldData['noite'] : []
            };
            
            // Salvar no novo formato
            localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
            updateTable();
        } catch (e) {
            console.error('Erro ao migrar dados antigos:', e);
            dataByDateAndShift = {};
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Iniciar o atualizador de data
    updateCurrentDate();
    dateUpdateInterval = setInterval(updateCurrentDate, 60000); // Atualizar a cada minuto

    // Cada painel mantém sua própria data selecionada independentemente

    // Configurar seletor de data
    const dateSelector = document.getElementById('dateSelector');
    if (dateSelector) {
        // Definir data atual como padrão
        dateSelector.value = selectedDate;
        
        // Evento de mudança de data
        dateSelector.addEventListener('change', function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            // Parar sincronização da data anterior
            if (typeof stopSyncDataRealtime === 'function') {
                stopSyncDataRealtime(oldDate, 'manhã');
                stopSyncDataRealtime(oldDate, 'tarde');
                stopSyncDataRealtime(oldDate, 'noite');
            }
            
            // Verificar se há dados para esta data
            const dateData = getDataForDate(selectedDate);
            const shiftData = dateData[activeShift] || [];
            console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            console.log('Estrutura completa de dados por data:', dataByDateAndShift);
            
            // Carregar dados do Firebase para a nova data
            if (typeof loadAllDataForDate === 'function') {
                loadAllDataForDate(selectedDate).then(() => {
                    // Ordenar dados de todos os turnos alfabeticamente por nome do professor
                    for (let turno in dataByDateAndShift[selectedDate]) {
                        if (Array.isArray(dataByDateAndShift[selectedDate][turno])) {
                            dataByDateAndShift[selectedDate][turno] = dataByDateAndShift[selectedDate][turno].sort((a, b) => {
                                const professorA = (a.professorName || '').trim();
                                const professorB = (b.professorName || '').trim();
                                if (!professorA || !professorB) return 0;
                                return professorA.localeCompare(professorB, 'pt-BR');
                            });
                        }
                    }
                    
                    // Iniciar sincronização em tempo real para a nova data
                    if (typeof syncDataRealtime === 'function') {
                        syncDataRealtime(selectedDate, 'manhã');
                        syncDataRealtime(selectedDate, 'tarde');
                        syncDataRealtime(selectedDate, 'noite');
                    }
                    updateTable();
                });
            } else {
                updateTable();
            }
            
            // Não sincronizar data, apenas salvar dados para acesso independente
            localStorage.setItem('allShiftData', JSON.stringify(dateData));
            
            // Corrigir problema de fuso horário ao exibir a data
            const [year, month, day] = selectedDate.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            
            // Contar total de registros em todos os turnos para esta data
            const totalRecords = (dateData['manhã']?.length || 0) + 
                               (dateData['tarde']?.length || 0) + 
                               (dateData['noite']?.length || 0);
            
            showNotification(`Visualizando ${formattedDate} - ${shiftData.length} registros no turno (${totalRecords} total)`, 'info');
        });
    }

    // Carregar dados salvos
    loadSavedData();
    
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
    
    // Listener para detectar mudanças no localStorage (sincronização entre abas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'allDateShiftData' || e.key === 'allShiftData' || e.key === 'dataUpdateTimestamp') {
            console.log('[ADMIN] Detectada atualização de dados em outra aba/janela, chave:', e.key);
            console.log('[ADMIN] Novo valor:', e.newValue);
            
            if (e.key === 'allDateShiftData' && e.newValue) {
                try {
                    const newData = JSON.parse(e.newValue);
                    console.log('[ADMIN] Dados brutos recebidos via storage:', newData);
                    
                    // Ordenar dados de todos os turnos alfabeticamente por nome do professor
                    for (let date in newData) {
                        for (let turno in newData[date]) {
                            if (Array.isArray(newData[date][turno])) {
                                newData[date][turno] = newData[date][turno].sort((a, b) => {
                                    const professorA = (a.professorName || '').trim();
                                    const professorB = (b.professorName || '').trim();
                                    if (!professorA || !professorB) return 0;
                                    return professorA.localeCompare(professorB, 'pt-BR');
                                });
                            }
                        }
                    }
                    
                    dataByDateAndShift = newData;
                    console.log('[ADMIN] Dados atualizados e ordenados:', dataByDateAndShift);
                    
                    renderTable();
                    showNotification('Dados atualizados por outro painel!', 'info');
                } catch (error) {
                    console.error('[ADMIN] Erro ao processar dados do storage:', error);
                }
            } else {
                loadSavedData();
            }
        }
    });

});

function checkLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('overlay').style.display = 'none';
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            initializePainelAdm();
        }, 100);
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
        setTimeout(() => {
            initializePainelAdm();
        }, 100);
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

// Função para renderizar a tabela (similar ao teacherPanel)
function renderTable() {
    console.log('Renderizando dados para o turno:', activeShift);
    const container = document.getElementById('shiftContent');
    if (!container) {
        console.error('Elemento shiftContent não encontrado!');
        return;
    }
    
    // Atualizar a data atual
    updateCurrentDate();
    
    // Usar os dados do turno atual na data selecionada
    let shiftData = getCurrentShiftData();
    if (!Array.isArray(shiftData)) {
        console.warn('Dados do turno não são um array:', activeShift);
        shiftData = [];
    }
    
    console.log(`Dados a serem renderizados (${activeShift}) na data ${selectedDate}:`, shiftData);

    // Filtrar dados inválidos
    shiftData = shiftData.filter(item => {
        if (!item || typeof item !== 'object') return false;
        return item.room && typeof item.room === 'string' &&
               item.professorName && typeof item.professorName === 'string' &&
               item.room.trim() !== '' && item.professorName.trim() !== '';
    });
    
    // Ordenar dados alfabeticamente por nome do professor
    shiftData = shiftData.sort((a, b) => {
        const professorA = (a.professorName || '').trim();
        const professorB = (b.professorName || '').trim();
        if (!professorA || !professorB) return 0;
        return professorA.localeCompare(professorB, 'pt-BR');
    });
    
    console.log(`Dados válidos após filtro e ordenação:`, shiftData);

    const shiftCapitalized = activeShift.charAt(0).toUpperCase() + activeShift.slice(1);
    // Corrigir problema de fuso horário ao exibir a data
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // Se não há dados, mostrar mensagem
    let rows = '';
    if (shiftData.length === 0) {
        rows = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x me-2"></i>
                    Nenhum dado encontrado para ${formattedDate} no turno da ${shiftCapitalized.toLowerCase()}
                    <br>
                    <small class="text-muted">Importe um arquivo ou selecione outra data</small>
                </td>
            </tr>
        `;
    } else {
        rows = shiftData.map(record => {
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
            shift: record.shift || activeShift
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
    }
    
    container.innerHTML = `
        <div class="card-header d-flex align-items-center justify-content-between">
            <h2 class="card-title">
                <i class="bi bi-clock"></i>
                Turno da ${shiftCapitalized}
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

// Função para lidar com ações de chave
function handleKeyAction(recordId, currentStatus) {
    // Encontrar o registro no turno atual da data selecionada
    const currentData = getCurrentShiftData();
    const record = currentData.find(r => r.id === recordId);
    if (!record) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    if (currentStatus === 'em_uso') {
        // Devolver a chave
        record.status = 'devolvida';
        record.returnTime = timeString;
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave devolvida por ${record.professorName} às ${record.returnTime}`, 'success');
    } else if (currentStatus === 'retirada' || currentStatus === 'devolvida' || currentStatus === 'disponivel') {
        // Retirar a chave
        record.status = 'em_uso';
        record.withdrawalTime = timeString;
        record.returnTime = '';  // String vazia ao invés de undefined
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave retirada por ${record.professorName} às ${record.withdrawalTime}`, 'info');
    }

    // Salvar no Firebase para sincronização em tempo real
    if (typeof saveDataToFirebase === 'function') {
        saveDataToFirebase(selectedDate, activeShift, currentData).then(() => {
            console.log('Dados salvos no Firebase após ação de chave no painel administrativo');
        }).catch(error => {
            console.error('Erro ao salvar no Firebase:', error);
        });
    }

    // Atualizar os dados no localStorage
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    
    // Também salvar no formato antigo para compatibilidade
    const currentDateData = getDataForDate(selectedDate);
    localStorage.setItem('allShiftData', JSON.stringify(currentDateData));
    
    // Emitir evento de atualização para sincronizar com o painel do professor
    // Não incluir date para não forçar mudança de data no professor
    const updateEvent = new CustomEvent('shiftDataUpdated', { 
        detail: { shift: activeShift, data: dataByDateAndShift }
    });
    window.dispatchEvent(updateEvent);
    
    // Marcar timestamp de atualização para sincronização entre abas
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());

    // Re-renderizar a interface
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
    
    // Carregar dados salvos
    loadSavedData();
    
    console.log('Dados carregados por data:', dataByDateAndShift);

    // Renderizar a interface
    console.log('Inicializando renderização das abas...');
    renderShiftTabs();
    updateTable();
    
    // Inicializar sincronização Firebase se estiver disponível
    if (typeof initializeFirebaseSync === 'function') {
        console.log('Inicializando sincronização Firebase...');
        initializeFirebaseSync();
    }
    
    // Verificar se as abas foram renderizadas
    setTimeout(() => {
        const tabsElement = document.getElementById('shiftTabs');
        if (tabsElement) {
            console.log('Conteúdo das abas após renderização:', tabsElement.innerHTML);
        }
    }, 200);
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
