// Variáveis globais
let teacherModalActive = false;
let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD 
// let selectedDate = "2025-08-31";
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }
let activeShift = getCurrentShiftByTime();

// Função para determinar o turno atual com base no horário
function getCurrentShiftByTime() {
    const now = new Date();
    const hour = now.getHours();

    if(hour >= 6 && hour < 12) {
        return 'manhã';
    } else if(hour >= 12 && hour < 18) {
        return 'tarde';
    } else {
        return 'noite';
    }
}

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
    
    const modalElement = document.getElementById('shiftSelectionModal');
    if (!modalElement) {
        console.error('Modal shiftSelectionModal não encontrado!');
        return;
    }
    
    // Verificar se já existe uma instância do modal e destruí-la
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
        existingModal.dispose();
    }
    
    // Criar nova instância e mostrar
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Função para processar arquivo importado
async function handleFileImport(file) {
    if (!file) return;
    
    console.log('� Iniciando importação de arquivo:', file.name);
    
    // Mostrar modal de seleção de turno
    selectedFileForImport = file;
    
    const modalElement = document.getElementById('shiftSelectionModal');
    if (!modalElement) {
        console.error('Modal shiftSelectionModal não encontrado!');
        return;
    }
    
    // Verificar se já existe uma instância do modal e destruí-la
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
        console.log('Removendo instância anterior do modal');
        existingModal.dispose();
    }
    
    // Criar nova instância e mostrar
    console.log(' Criando nova instância do modal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log(' Modal exibido');
}

// Função para processar o arquivo após seleção do turno
async function processFileImport(file, selectedShift) {
    if(!file) return;

    // Verificar extensão do arquivo - aceitar todos os formatos Excel e CSV
    const fileExt = file.name.split('.').pop().toLowerCase();
    const validExcelFormats = ['xlsx', 'xls', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xlam'];
    const validCSVFormats = ['csv', 'tsv', 'txt'];
    const allValidFormats = [...validExcelFormats, ...validCSVFormats];
    
    if (!allValidFormats.includes(fileExt)) {
        showNotification(`Formato de arquivo não suportado: .${fileExt}\nFormatos aceitos: Excel (${validExcelFormats.join(', ')}) e CSV/texto (${validCSVFormats.join(', ')})`, 'warning');
        return;
    }
    
    console.log(`Processando arquivo ${file.name} (formato: .${fileExt})`);

    // Mostrar indicador de carregamento
    const importBtn = document.querySelector('button[title="Importar Arquivo"]');
    const originalText = importBtn.innerHTML;
    importBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Importando...';
    importBtn.disabled = true;

    try {
        // Pegar o turno atual antes de processar o arquivo
        // const currentShift = activeShift.charAt(0).toUpperCase() + activeShift.slice(1); // Capitaliza o turno - *Não está sendo usado

        const data = await readFileData(file);

        if(data && data.length > 0) {
            // Converter os dados para o formato do mockData
            const convertedData = data.map((row, index) => {
                // Extrair informações da linha e limpar valores FALSE
                const sala = decodeText(row[0]);
                const curso = decodeText(row[1]);
                const turmaStr = decodeText(row[2]);
                const professorName = decodeText(row[3]);
                const disciplina = decodeText(row[4]);
                const registro = decodeText(row[5]);

                // Ignorar somente quando a sala for claramente inválida
                if(sala === 'FALSE' || sala === '---' || !sala || !sala.trim()) {
                    return null;
                }
                
                // Pular somente linhas que são claramente cabeçalho/divisória
                // (exatamente "SALA"/"SALAS" ou linhas com separadores), mas
                // NÃO descartar salas válidas como "SALA 01", "SALA A01", etc.
                const salaTrim = (sala || '').trim();
                const isHeaderSala = /^sala(s)?$/i.test(salaTrim);
                const isDivider = salaTrim.startsWith('---');

                if(!salaTrim || isHeaderSala || isDivider) {
                    return null;
                }

                // Usar o turno ativo atual para o novo registro
                const defaultShift = activeShift;
                
                // Gerar ID único se não houver registro
                const uniqueId = registro || `import_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;

                return {
                    id: uniqueId,
                    room: sala,
                    course: curso,
                    turmaNumber: turmaStr,
                    professorName: professorName,
                    subject: disciplina,
                    time: '',             // Será preenchido quando a chave for retirada
                    status: 'disponivel',
                    withdrawalTime: '',   // Será preenchido quando a chave for retirada
                    returnTime: '',       // Será preenchido quando a chave for devolvida
                    requiresLogin: true,
                    shift: defaultShift,
                    // Campos de compatibilidade com o painel do professor
                    sala: sala,
                    professor: professorName,
                    disciplina: disciplina,
                    curso: curso,
                    turma: turmaStr,
                    horaRetirada: null,
                    horaDevolucao: null
                };
            });

                // Filtrar e validar os dados convertidos
                const validData = convertedData.filter(item => {
                    // Verificar se é um registro válido
                    if(!item || !item.room) return false;

                    const room = item.room.toString();
                    const roomTrim = room.trim();
                    const isDivider = roomTrim.startsWith('---');
                    const isFalse = roomTrim.toUpperCase() === 'FALSE';
                    const isEmpty = roomTrim === '';
                    // Aceitar qualquer sala não vazia (inclusive "SALA 01" e afins)
                    const isValidRoom = !(isDivider || isFalse || isEmpty);

                    // Normalização leve
                    if (isValidRoom) {
                        item.room = roomTrim;
                        if (item.course) item.course = item.course.toString().trim();
                        if (item.subject) item.subject = item.subject.toString().trim();
                        if (item.disciplina) item.disciplina = item.disciplina.toString().trim();
                        if (item.professorName) item.professorName = item.professorName.toString().trim();
                        if (item.turmaNumber) item.turmaNumber = item.turmaNumber.toString().trim();
                        item.status = 'disponivel';
                        
                        // Debug: verificar campos de disciplina
                        if (!item.subject && !item.disciplina) {
                            console.warn(' Registro sem disciplina:', item);
                        } else {
                            console.log(' Disciplina encontrada:', { subject: item.subject, disciplina: item.disciplina });
                        }
                    }

                    // Não obrigar curso/disciplinas/professor para manter a linha; serão mostrados como "-"
                    return isValidRoom;
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
            
                // Salvar no Firebase imediatamente após importação
                if (typeof saveDataToFirebase === 'function') {
                    console.log(' Salvando dados importados no Firebase...');
                    saveDataToFirebase(selectedDate, selectedShift, sortedData).then(() => {
                        console.log(' Dados importados salvos no Firebase com sucesso!');
                    }).catch(error => {
                        console.error(' Erro ao salvar dados importados no Firebase:', error);
                    });
                }
            
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
        
        // Limpar o input de arquivo para permitir importar o mesmo arquivo novamente
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Limpar variável global
        selectedFileForImport = null;
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

function readFileData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        // Detectar se é CSV/texto ou Excel
        const isCSVType = ['csv', 'tsv', 'txt'].includes(fileExt);
        const isExcelType = ['xlsx', 'xls', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xlam'].includes(fileExt);
        
        console.log(`Processando arquivo: ${file.name}`);
        console.log(`Tipo detectado: ${isCSVType ? 'CSV/Texto' : isExcelType ? 'Excel' : 'Desconhecido'}`);
        
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
                if (isCSVType) {
                    // Processar CSV/TSV/TXT com encoding correto para caracteres especiais
                    const content = e.target.result;
                    console.log(`Processando como arquivo de texto (${fileExt})`);
                    
                    // Configurar separador baseado na extensão
                    const separator = fileExt === 'tsv' ? '\t' : fileExt === 'txt' ? '\t' : ',';
                    
                    // Tentar diferentes encodings para CSV/texto
                    try {
                        // Primeira tentativa: UTF-8
                        workbook = XLSX.read(content, { 
                            type: 'string',
                            raw: true,
                            cellText: false,
                            cellDates: true,
                            codepage: 65001, // UTF-8
                            charset: 'UTF-8',
                            // Opções para lidar com células mescladas
                            cellStyles: true,
                            sheetStubs: true,
                            defval: '',
                            // Separador personalizado
                            FS: separator
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
                                charset: 'ISO-8859-1',
                                cellStyles: true,
                                sheetStubs: true,
                                defval: '',
                                FS: separator
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
                                charset: 'Windows-1252',
                                cellStyles: true,
                                sheetStubs: true,
                                defval: '',
                                FS: separator
                            });
                        }
                    }
                    
                    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error(`Arquivo ${fileExt.toUpperCase()} inválido ou vazio`);
                    }
                } else if (isExcelType) {
                    // Processar qualquer formato Excel
                    const data = new Uint8Array(e.target.result);
                    if (!data || data.length === 0) {
                        throw new Error('Arquivo vazio ou corrompido');
                    }

                    console.log(`Processando como arquivo Excel (${fileExt})`);
                    
                    // Configuração robusta para diferentes formatos Excel
                    workbook = XLSX.read(data, { 
                        type: 'array',
                        raw: true, // Mantém os dados brutos
                        cellText: false, // Não converte para texto ainda
                        cellDates: true,
                        cellNF: false,
                        codepage: 65001, // UTF-8
                        // Opções para lidar com células mescladas
                        cellStyles: true,
                        sheetStubs: true, // Incluir células vazias
                        defval: null, // Valor padrão para células vazias
                        // Opções para diferentes formatos Excel
                        password: "", // Para arquivos protegidos (vazio = sem senha)
                        WTF: false // Modo de compatibilidade
                    });

                    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error(`Arquivo Excel (${fileExt}) inválido ou sem planilhas`);
                    }
                } else {
                    throw new Error(`Formato de arquivo não reconhecido: ${fileExt}`);
                }
                
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                if (!firstSheet) {
                    throw new Error('Primeira planilha está vazia ou inválida');
                }
                
                // Converter planilha para JSON lidando com células mescladas
                let allData = XLSX.utils.sheet_to_json(firstSheet, { 
                    header: 1,
                    raw: false,
                    blankrows: true, // Incluir linhas em branco para manter estrutura
                    skipHidden: false,
                    defval: '', // Usar string vazia para células vazias
                    dateNF: 'dd/mm/yyyy',
                    encoding: 'ISO-8859-1'
                });

                console.log('Dados brutos lidos do arquivo (com células mescladas):', allData);

                // Processar células mescladas - propagar valores das células mescladas
                if (firstSheet['!merges']) {
                    console.log(' Detectadas células mescladas:', firstSheet['!merges']);
                    
                    // Para cada região mesclada, propagar o valor da primeira célula para todas as células da região
                    firstSheet['!merges'].forEach(merge => {
                        const startRow = merge.s.r;
                        const endRow = merge.e.r;
                        const startCol = merge.s.c;
                        const endCol = merge.e.c;
                        
                        // Obter o valor da primeira célula da região mesclada
                        const firstCellRef = XLSX.utils.encode_cell({r: startRow, c: startCol});
                        const firstCellValue = firstSheet[firstCellRef] ? firstSheet[firstCellRef].v : '';
                        
                        if (firstCellValue) {
                            console.log(`� Propagando valor "${firstCellValue}" da célula mesclada ${firstCellRef}`);
                            
                            // Propagar para todas as linhas e colunas afetadas no array allData
                            for (let row = startRow; row <= endRow; row++) {
                                for (let col = startCol; col <= endCol; col++) {
                                    if (allData[row] && col < allData[row].length) {
                                        if (!allData[row][col] || allData[row][col] === '') {
                                            allData[row][col] = firstCellValue;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    
                    console.log('Dados após processar células mescladas:', allData.slice(0, 10));
                }

                // Detectar automaticamente onde está o cabeçalho (lidando com células mescladas)
                let headerRowIndex = -1;
                let headers = [];
                
                // Procurar por uma linha que contenha termos de cabeçalho esperados
                for (let i = 0; i < allData.length; i++) {
                    const row = allData[i];
                    if (!Array.isArray(row) || row.length === 0) continue;
                    
                    // Verificar se esta linha contém cabeçalhos típicos
                    const rowStr = row.join('').toUpperCase();
                    const hasHeaderTerms = ['SALA', 'CURSO', 'TURMA', 'PROFESSOR', 'DISCIPLINA', 'MATERIA', 'MATÉRIA'].some(term => 
                        rowStr.includes(term)
                    );
                    
                    // Verificar se pelo menos 3 células não estão vazias
                    const nonEmptyCells = row.filter(cell => cell && String(cell).trim() !== '').length;
                    
                    if (hasHeaderTerms && nonEmptyCells >= 3) {
                        headerRowIndex = i;
                        // Limpar headers vazios e normalizar
                        headers = row.map(cell => {
                            const cellStr = String(cell || '').trim();
                            return cellStr;
                        });
                        
                        console.log(`Cabeçalho detectado na linha ${i}:`, headers);
                        console.log('Conteúdo da linha:', row);
                        
                        // Debug das colunas identificadas
                        headers.forEach((header, index) => {
                            if (header) {
                                console.log(`Coluna ${index}: "${header}"`);
                            }
                        });
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error('Não foi possível detectar automaticamente o cabeçalho do arquivo. Verifique se o arquivo contém colunas como SALA, CURSO, PROFESSOR, etc.');
                }

                // Extrair dados após o cabeçalho (similar ao slice no Node.js)
                const dataRows = allData.slice(headerRowIndex + 1);
                console.log(`Processando ${dataRows.length} linhas de dados após o cabeçalho`);
                console.log('Primeiras 3 linhas de dados brutos:', dataRows.slice(0, 3));

                // Mapear dados em objetos (lidando com células mescladas)
                const mappedData = dataRows
                    .filter(row => {
                        // Incluir linhas que tenham pelo menos uma célula com conteúdo
                        const hasContent = Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== '');
                        if (!hasContent && dataRows.indexOf(row) < 5) {
                            console.log(` Linha ${dataRows.indexOf(row) + 1} filtrada (sem conteúdo):`, row);
                        } else if (hasContent && dataRows.indexOf(row) < 5) {
                            console.log(` Linha ${dataRows.indexOf(row) + 1} aprovada:`, row);
                        }
                        return hasContent;
                    })
                    .map((row, index) => {
                        try {
                            let obj = {};
                            
                            // Garantir que a linha tenha o mesmo comprimento dos headers
                            const normalizedRow = [...row];
                            while (normalizedRow.length < headers.length) {
                                normalizedRow.push('');
                            }
                            
                            headers.forEach((header, colIndex) => {
                                const cellValue = normalizedRow[colIndex];
                                // Para células mescladas, usar o valor propagado ou string vazia
                                const finalValue = cellValue && String(cellValue).trim() !== '' ? String(cellValue).trim() : '';
                                obj[header] = finalValue;
                            });
                            
                            // Adicionar índice para debug
                            obj._rowIndex = headerRowIndex + 1 + index;
                            return obj;
                        } catch (error) {
                            console.error('Erro ao mapear linha:', error, row);
                            return null;
                        }
                    })
                    .filter(obj => obj !== null);

                console.log('Primeiros 5 registros mapeados:', mappedData.slice(0, 5));

                // Debug adicional: mostrar estrutura completa dos primeiros registros
                console.log(' ANÁLISE DETALHADA DA ESTRUTURA:');
                console.log('Headers detectados:', headers);
                if (mappedData.length > 0) {
                    console.log('Primeiro registro completo:', mappedData[0]);
                    console.log('Chaves disponíveis:', Object.keys(mappedData[0]));
                    console.log('Valores do primeiro registro:');
                    Object.keys(mappedData[0]).forEach((key, index) => {
                        console.log(`  ${index}: "${key}" = "${mappedData[0][key]}"`);
                    });
                }

                // Processar dados para preencher campos vazios com valores das linhas anteriores (células mescladas)
                console.log(' Processando dados para preencher campos de células mescladas...');
                for (let i = 1; i < mappedData.length; i++) {
                    const currentRow = mappedData[i];
                    const previousRow = mappedData[i - 1];
                    
                    // Para cada campo, se estiver vazio, tentar usar o valor da linha anterior
                    Object.keys(currentRow).forEach(key => {
                        if (key !== '_rowIndex' && (!currentRow[key] || currentRow[key] === '')) {
                            if (previousRow[key] && previousRow[key] !== '') {
                                currentRow[key] = previousRow[key];
                                if (i < 3) console.log(`� Preenchendo campo vazio "${key}" com valor "${previousRow[key]}" da linha anterior`);
                            }
                        }
                    });
                }

                // Converter objetos mapeados para formato esperado pelo sistema
                const formattedData = mappedData
                    .map((obj, index) => {
                        // Tentar identificar as colunas por nome (flexível)
                        const findColumn = (patterns, excludePatterns = []) => {
                            // Debug detalhado apenas para o primeiro registro
                            if (index === 0) {
                                console.log(` [Registro ${index + 1}] Procurando coluna para padrões: ${patterns.join(', ')}`);
                                console.log(` [Registro ${index + 1}] Excluir padrões: ${excludePatterns.join(', ')}`);
                                console.log(` [Registro ${index + 1}] Objeto disponível:`, obj);
                                console.log(` [Registro ${index + 1}] Chaves disponíveis:`, Object.keys(obj));
                            }
                            
                            for (let pattern of patterns) {
                                for (let key in obj) {
                                    const keyUpper = key.toUpperCase();
                                    const patternUpper = pattern.toUpperCase();
                                    
                                    // Verificar se não deve ser excluída
                                    const shouldExclude = excludePatterns.some(exclude => 
                                        keyUpper.includes(exclude.toUpperCase())
                                    );
                                    if (shouldExclude) {
                                        if (index === 0) console.log(`   Excluindo coluna "${key}" (contém: ${excludePatterns.join(', ')})`);
                                        continue;
                                    }
                                    
                                    // Busca exata primeiro
                                    if (keyUpper === patternUpper) {
                                        const value = obj[key];
                                        if (value && String(value).trim() !== '') {
                                            if (index === 0) console.log(`   Encontrado por correspondência exata: "${key}" = "${value}"`);
                                            return String(value).trim();
                                        }
                                    }
                                    
                                    // Busca por inclusão
                                    if (keyUpper.includes(patternUpper)) {
                                        const value = obj[key];
                                        if (value && String(value).trim() !== '') {
                                            if (index === 0) console.log(`   Encontrado por inclusão: "${key}" = "${value}"`);
                                            return String(value).trim();
                                        }
                                    }
                                }
                            }
                            if (index === 0) console.log(`   Nenhuma coluna encontrada para: ${patterns.join(', ')}`);
                            
                            // Debug extra: se for sala e não encontrou nada, mostrar todas as colunas
                            if (index === 0 && patterns.includes('SALA')) {
                                console.log('� SALA NÃO ENCONTRADA! Analisando todas as colunas disponíveis:');
                                Object.keys(obj).forEach((key, idx) => {
                                    const value = obj[key];
                                    const hasContent = value && String(value).trim() !== '';
                                    console.log(`  ${idx}: "${key}" = "${value}" ${hasContent ? '' : ''}`);
                                });
                            }
                            
                            return '';
                        };

                        const sala = findColumn(['SALA', 'ROOM', 'CLASSROOM']);
                        const curso = findColumn(['CURSO', 'COURSE']);
                        const turma = findColumn(['TURMA', 'CLASS', 'TURNO']);
                        const professor = findColumn(['PROFESSOR', 'TEACHER', 'DOCENTE']);
                        // Para disciplina, tentar vários padrões possíveis
                        const disciplina = findColumn([
                            'DISCIPLINA', 'SUBJECT', 'MATERIA', 'MATÉRIA', 
                            'COMPONENTE', 'UNIDADE', 'UC', 'CURRICULAR',
                            'COMPONENTE CURRICULAR', 'UNIDADE CURRICULAR'
                        ], ['PROFESSOR', 'CURSO', 'COURSE']);
                        const registro = findColumn(['REGISTRO', 'ID', 'CODIGO', 'CÓDIGO']);

                        // Debug especial: mostrar todos os valores encontrados
                        if (index < 5) {
                            console.log(` VALORES ENCONTRADOS ${index + 1}:`, {
                                sala: `"${sala}" (${typeof sala})`,
                                curso: `"${curso}" (${typeof curso})`,
                                turma: `"${turma}" (${typeof turma})`,
                                professor: `"${professor}" (${typeof professor})`,
                                disciplina: `"${disciplina}" (${typeof disciplina})`,
                                registro: `"${registro}" (${typeof registro})`
                            });
                        }

                        // Fallback: se disciplina não foi encontrada, procurar manualmente
                        let disciplinaFinal = disciplina;
                        if (!disciplinaFinal) {
                            if (index === 0) {
                                console.log(' Procurando disciplina manualmente - TODAS as colunas disponíveis:');
                                Object.keys(obj).forEach((key, idx) => {
                                    console.log(`  ${idx}: "${key}" = "${obj[key]}"`);
                                });
                            }
                            
                            // Estratégia 1: Buscar qualquer coluna que não seja sala, curso, turma, professor
                            const knownFields = [sala, curso, turma, professor, registro].filter(f => f);
                            for (let key in obj) {
                                const value = obj[key];
                                if (value && String(value).trim() !== '') {
                                    const valueTrim = String(value).trim();
                                    
                                    // Se não é nenhum dos campos conhecidos
                                    if (!knownFields.includes(valueTrim)) {
                                        // Verificar se não é código de turma (padrão G + números)
                                        if (!valueTrim.match(/^G\d+/) && 
                                            !valueTrim.match(/^\d+$/) && 
                                            valueTrim.length > 2) {
                                            disciplinaFinal = valueTrim;
                                            if (index === 0) console.log(`� Disciplina encontrada por eliminação na coluna "${key}": "${disciplinaFinal}"`);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Estratégia 2: Se ainda não encontrou, pegar a primeira coluna não identificada
                            if (!disciplinaFinal) {
                                const allKeys = Object.keys(obj);
                                for (let i = 0; i < allKeys.length; i++) {
                                    const key = allKeys[i];
                                    const value = obj[key];
                                    
                                    if (value && String(value).trim() !== '') {
                                        const valueTrim = String(value).trim();
                                        
                                        // Pular campos já identificados
                                        if (valueTrim !== sala && valueTrim !== curso && 
                                            valueTrim !== turma && valueTrim !== professor && 
                                            valueTrim !== registro) {
                                            
                                            // Se parece com uma disciplina (não é código)
                                            if (!valueTrim.match(/^(G\d+|\d+|SALA|LAB)$/i) && 
                                                valueTrim.length > 3) {
                                                disciplinaFinal = valueTrim;
                                                if (index === 0) console.log(`� Disciplina encontrada por tentativa na coluna "${key}": "${disciplinaFinal}"`);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Debug: mostrar mapeamento para os primeiros registros
                        if (index < 3) {
                            console.log(`Registro ${index + 1} mapeado:`, {
                                sala, curso, turma, professor, 
                                disciplina: disciplinaFinal, 
                                registro,
                                objetoOriginal: obj,
                                chaves: Object.keys(obj)
                            });
                            
                            // Debug específico para disciplina
                            if (!disciplinaFinal) {
                                console.log(' Debug disciplina vazia - verificando todas as colunas:');
                                Object.keys(obj).forEach((key, idx) => {
                                    const keyUpper = key.toUpperCase();
                                    const isDisciplinaCol = keyUpper.includes('DISCIPLINA') || keyUpper.includes('MATERIA') || keyUpper.includes('MATÉRIA');
                                    console.log(`  Coluna ${idx} "${key}": "${obj[key]}" ${isDisciplinaCol ? '← POSSÍVEL DISCIPLINA' : ''}`);
                                });
                            } else if (disciplinaFinal === professor) {
                                console.warn(' Disciplina igual ao professor:', {
                                    disciplina: disciplinaFinal,
                                    professor: professor
                                });
                            } else if (disciplinaFinal === curso) {
                                console.warn(' Disciplina igual ao curso:', {
                                    disciplina: disciplinaFinal,
                                    curso: curso
                                });
                            } else {
                                console.log(' Disciplina válida encontrada:', disciplinaFinal);
                            }
                        }

                        // Debug: mostrar todos os valores de sala para entender o problema
                        if (index < 5) {
                            console.log(` Debug Sala ${index + 1}:`, {
                                sala: sala,
                                salaType: typeof sala,
                                salaLength: sala ? sala.length : 0,
                                salaEmpty: !sala,
                                salaFalse: sala === 'FALSE',
                                salaDash: sala === '---',
                                salaRegex: sala ? /^sala(s)?$/i.test(String(sala).trim()) : false,
                                salaStartsDash: sala ? String(sala).startsWith('---') : false
                            });
                        }

                        // Validação mais tolerante da sala
                        const salaStr = String(sala || '').trim();
                        const salaInvalida = !salaStr || 
                                           salaStr === '' ||
                                           salaStr.toUpperCase() === 'FALSE' || 
                                           salaStr === '---' || 
                                           /^sala(s)?$/i.test(salaStr) ||
                                           salaStr.startsWith('---');

                        if (salaInvalida) {
                            if (index < 5) console.log(` Registro ${index + 1} rejeitado por sala inválida: "${sala}" (string: "${salaStr}")`);
                            return null;
                        }

                        if (index < 5) console.log(` Registro ${index + 1} aprovado com sala: "${sala}" (string: "${salaStr}")`);

                        // Validar disciplina: evitar confusão com curso, professor, etc.
                        if (disciplinaFinal) {
                            // Se disciplina for igual ao curso, procurar a verdadeira disciplina
                            if (disciplinaFinal === curso) {
                                console.warn(` Disciplina "${disciplinaFinal}" é igual ao curso, procurando disciplina real...`);
                                disciplinaFinal = '';
                                
                                // Buscar em outras colunas por uma disciplina válida
                                for (let key in obj) {
                                    const keyUpper = key.toUpperCase();
                                    const value = obj[key];
                                    
                                    // Buscar especificamente colunas que parecem ser de disciplina
                                    if ((keyUpper.includes('DISCIPLINA') || keyUpper.includes('MATERIA') || keyUpper.includes('MATÉRIA')) &&
                                        !keyUpper.includes('PROFESSOR') && !keyUpper.includes('CURSO')) {
                                        
                                        if (value && String(value).trim() !== '' && 
                                            value !== professor && value !== sala && value !== curso && value !== turma) {
                                            const valorTrim = String(value).trim();
                                            disciplinaFinal = valorTrim;
                                            console.log(` Disciplina corrigida: "${disciplinaFinal}" (encontrada na coluna "${key}")`);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Se ainda for igual ao professor, procurar alternativa
                            if (disciplinaFinal === professor) {
                                console.warn(` Disciplina "${disciplinaFinal}" é igual ao professor, procurando disciplina real...`);
                                disciplinaFinal = '';
                                
                                for (let key in obj) {
                                    const value = obj[key];
                                    if (value && String(value).trim() !== '' && 
                                        value !== professor && value !== sala && value !== curso && value !== turma) {
                                        const valorTrim = String(value).trim();
                                        // Verificar se parece com disciplina (não é número, não é sala)
                                        if (!valorTrim.match(/^(SALA|A\d+|B\d+|C\d+|\d+)$/i) && valorTrim.length > 2) {
                                            disciplinaFinal = valorTrim;
                                            console.log(` Disciplina corrigida: "${disciplinaFinal}" (encontrada na coluna "${key}")`);
                                            break;
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
                            disciplinaFinal,
                            registro
                        ];
                    })
                    .filter(row => row !== null);

                console.log(` RESUMO DO PROCESSAMENTO:`);
                console.log(`- Linhas brutas após cabeçalho: ${dataRows.length}`);
                console.log(`- Linhas válidas mapeadas: ${mappedData.length}`);
                console.log(`- Registros formatados: ${formattedData.length}`);
                console.log(`- Registros rejeitados: ${mappedData.length - formattedData.length}`);
                
                if (formattedData.length === 0) {
                    console.error('� ERRO: Nenhum registro válido encontrado!');
                    console.log('Debug completo das últimas etapas:');
                    console.log('1. Headers detectados:', headers);
                    console.log('2. Primeira linha de dados:', dataRows[0]);
                    console.log('3. Primeiro objeto mapeado:', mappedData[0]);
                    console.log('4. Resultado do processamento:', formattedData);
                    
                    throw new Error(`Nenhum dado válido encontrado na planilha após detectar cabeçalho. 
Debug: ${dataRows.length} linhas brutas, ${mappedData.length} mapeadas, ${formattedData.length} formatadas.
Verifique se há dados válidos após a linha de cabeçalho.`);
                }

                console.log('Primeiros 3 registros formatados:', formattedData.slice(0, 3));
                resolve(formattedData);
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                reject(new Error('Erro ao processar o arquivo. Verifique se o formato está correto e se há dados válidos.'));
            }
        };

        // Iniciar a leitura do arquivo depois de configurar os handlers
        if (isCSVType) {
            // Ler como texto para CSV/TSV/TXT
            reader.readAsText(file, 'UTF-8');
        } else if (isExcelType) {
            // Ler como array buffer para Excel
            reader.readAsArrayBuffer(file);
        } else {
            reject(new Error(`Formato de arquivo não suportado: ${fileExt}`));
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
        <button class="tab ${(t.id === activeShift) ? 'active' : ''}" onclick="changeShift('${t.id}')" aria-label="Selecionar turno da ${t.label}">
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
    
    console.log(' [ADMIN] updateTable executada - tabela renderizada');
}

// Variável global para o intervalo de atualização da data
let dateUpdateInterval;

// Limpar o intervalo quando a página for fechada
window.addEventListener('unload', function() {
    if (dateUpdateInterval) {
        clearInterval(dateUpdateInterval);
    }
});

// Função para carregar dados salvos
function loadSavedData() {
    // Limpar IDs duplicados antes de tudo
    console.log(' [INIT] Limpando IDs duplicados...');
    const wasCleared = cleanDuplicateIds();
    if (wasCleared) {
        console.log(' [INIT] IDs duplicados foram limpos');
    }
    
    // Tentar carregar dados no novo formato (por data)
    const newFormatData = localStorage.getItem('allDateShiftData');
    if (newFormatData) {
        try {
            dataByDateAndShift = JSON.parse(newFormatData);
            
            // Converter dados para garantir compatibilidade com o painel do professor
            for (let date in dataByDateAndShift) {
                for (let turno in dataByDateAndShift[date]) {
                    if (Array.isArray(dataByDateAndShift[date][turno])) {
                        dataByDateAndShift[date][turno] = dataByDateAndShift[date][turno].map(item => {
                            if (!item || typeof item !== 'object') return item;
                            
                            // Garantir que cada registro tenha um ID único
                            if (!item.id) {
                                item.id = item.room || item.sala || `record_${Math.random().toString(36).substr(2, 9)}`;
                            }
                            
                            // Se está no formato do professor, adicionar campos do admin
                            if (item.sala && item.professor && !item.room) {
                                return {
                                    ...item,
                                    room: item.sala,
                                    professorName: item.professor,
                                    subject: item.disciplina,
                                    course: item.curso,
                                    turmaNumber: item.turma,
                                    withdrawalTime: item.horaRetirada,
                                    returnTime: item.horaDevolucao,
                                    status: item.horaRetirada && !item.horaDevolucao ? 'em_uso' : 
                                           item.horaRetirada && item.horaDevolucao ? 'devolvida' : 'disponivel'
                                };
                            }
                            
                            // Se já está no formato do admin, manter
                            return item;
                        });
                    }
                }
            }
            
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
    const confirmImportBtn = document.getElementById('confirmImportShift');
    if (confirmImportBtn && !confirmImportBtn.hasAttribute('data-listener-added')) {
        confirmImportBtn.setAttribute('data-listener-added', 'true');
        confirmImportBtn.addEventListener('click', async function() {
            console.log(' Botão de confirmar importação clicado');
            
            const checkedInput = document.querySelector('input[name="importShift"]:checked');
            if (!checkedInput) {
                console.warn(' Nenhum turno selecionado');
                return;
            }
            
            const selectedShift = checkedInput.value;
            console.log('� Turno selecionado:', selectedShift);
            
            const modalElement = document.getElementById('shiftSelectionModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    console.log('� Fechando modal');
                    modal.hide();
                }
            }
            
            if (selectedFileForImport) {
                console.log('� Processando arquivo:', selectedFileForImport.name);
                await processFileImport(selectedFileForImport, selectedShift);
                selectedFileForImport = null;
                
                // Limpar o input de arquivo para permitir nova importação
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = '';
                    console.log(' Input de arquivo limpo');
                }
            }
        });
    }
    
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

// ==================== CADASTRO DE PROFESSORES ====================

/**
 * Abre o modal de cadastro de professor
 */
function openRegisterTeacherModal() {
    const modal = document.getElementById('registerTeacherModal');
    if (!modal) {
        console.error('❌ Modal não encontrado');
        return;
    }
    modal.style.display = 'flex';
    setTimeout(() => {
        const nameInput = document.getElementById('tpFullName');
        if (nameInput) nameInput.focus();
    }, 100);
}

/**
 * Fecha o modal e limpa os campos
 */
function closeRegisterTeacherModal() {
    const modal = document.getElementById('registerTeacherModal');
    if (!modal) return;
    modal.style.display = 'none';
    const nameInput = document.getElementById('tpFullName');
    const fatsInput = document.getElementById('tpFast');
    if (nameInput) nameInput.value = '';
    if (fatsInput) fatsInput.value = '';
}

// Inicializar campo FATS com uppercase automático
const inputFast = document.getElementById("tpFast");
if(inputFast) {
    inputFast.addEventListener("input", () => {
        inputFast.value = inputFast.value.toUpperCase();
    });
    inputFast.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNewTeacher();
        }
    });
}

/**
 * Salva novo professor com sincronização completa
 */
function saveNewTeacher() {
    console.log('🔄 Cadastrando professor');
    
    const nameInput = document.getElementById('tpFullName');
    const fatsInput = document.getElementById('tpFast');
    
    if (!nameInput || !fatsInput) {
        console.error('❌ Campos não encontrados');
        showNotification('Erro: Campos do formulário não encontrados!', 'danger');
        return false;
    }
    
    const name = nameInput.value.trim();
    const fats = fatsInput.value.trim().toUpperCase();

    // Validações
    if(!name || !fats) {
        showNotification('Preencha todos os campos obrigatórios!', 'warning');
        return false;
    }

    if(name.length < 3) {
        showNotification('O nome do professor deve ter pelo menos 3 caracteres.', 'warning');
        return false;
    }
    
    if(fats.length < 2) {
        showNotification('O código FATS deve ter pelo menos 2 caracteres.', 'warning');
        return false;
    }

    try {
        // Obtém os dados atuais do localStorage
        const currentMapping = JSON.parse(localStorage.getItem('docentesCodprof') || '{}');
        console.log('📚 Professores atuais:', Object.keys(currentMapping).length);

        // Verificar se o professor já existe pelo nome
        if(currentMapping[name]) {
            showNotification(`O professor "${name}" já está cadastrado no sistema.`, 'warning');
            return false;
        }

        // Verificar se o código FATS já está sendo usado por outro professor
        for(const [existingName, existingFats] of Object.entries(currentMapping)) {
            if(existingFats === fats) {
                showNotification(`O FATS "${fats}" já está sendo usado pelo professor: ${existingName}.`, 'warning');
                return false;
            }
        }

        // Adicionar professor ao mapeamento
        currentMapping[name] = fats;
        localStorage.setItem('docentesCodprof', JSON.stringify(currentMapping));
        console.log('✅ Professor salvo no localStorage');
        
        // Atualiza teacherNames para consistência
        const existingTeacherNames = JSON.parse(localStorage.getItem('teacherNames') || '{}');
        existingTeacherNames[name] = fats;
        localStorage.setItem('teacherNames', JSON.stringify(existingTeacherNames));
        
        // Sincronizar com TeachersData se disponível
        if (typeof TeachersData !== 'undefined' && TeachersData.addTeacher) {
            TeachersData.addTeacher(name, fats);
            console.log('✅ Sincronizado com TeachersData');
        }
        
        // Sincronizar com teacherPanel se disponível
        if (typeof window.addNewProfessorToTeacherPanel === 'function') {
            window.addNewProfessorToTeacherPanel(name, fats);
            console.log('✅ Sincronizado com teacherPanel');
        }
        
        // Atualizar variável global docentesCodprof
        if (typeof window.docentesCodprof !== 'undefined') {
            window.docentesCodprof[name] = fats;
            console.log('✅ Atualizado em window.docentesCodprof');
            
            // Salvar no Firestore
            console.log('🔍 DEBUG: Verificando Firestore...', {
                funcaoExiste: typeof addOrUpdateTeacherInFirestore === 'function',
                firestoreExiste: typeof firestore !== 'undefined' && firestore !== null,
                name: name,
                fats: fats
            });
            
            if (typeof addOrUpdateTeacherInFirestore === 'function') {
                console.log('💾 Chamando addOrUpdateTeacherInFirestore...');
                addOrUpdateTeacherInFirestore(name, fats)
                    .then(() => {
                        console.log('✅ Professor salvo no Firestore com sucesso!');
                        showProfessorSuccessModal(name, fats);
                    })
                    .catch(err => {
                        console.error('❌ Erro ao salvar no Firestore:', err);
                        showProfessorErrorModal('Erro ao salvar no Firestore: ' + err.message);
                    });
            } else {
                console.error('❌ Função addOrUpdateTeacherInFirestore não encontrada!');
                showProfessorErrorModal('Firestore não está disponível. Professor salvo apenas localmente.');
            }
        }
        
        // Disparar evento para outras partes do sistema
        window.dispatchEvent(new CustomEvent('teacherAdded', {
            detail: { name, fats, timestamp: new Date().toISOString() }
        }));
        console.log('✅ Evento disparado');
        
        // Atualizar interface
        updateTeacherTable();
        closeRegisterTeacherModal();
        
        showNotification(`Professor "${name}" cadastrado com sucesso!`, 'success');
        console.log('✅ Cadastro concluído:', { name, fats });
        return true;
        
    } catch(error) {
        console.error('❌ Erro ao cadastrar professor:', error);
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handle(error, 'saveNewTeacher', { name, fats });
        }
        showNotification('Erro ao cadastrar professor. Verifique os dados e tente novamente.', 'danger');
        return false;
    }
}

function initializeAll() {
    // Inicializar mapeamento de professores se não existir
    let storedTeachers = localStorage.getItem('docentesCodprof');
    if (!storedTeachers) {
        console.log(' Inicializando mapeamento docentesCodprof no localStorage...');
        localStorage.setItem('docentesCodprof', JSON.stringify({}));
    } else {
        try {
            const parsed = JSON.parse(storedTeachers);
            if (typeof parsed !==  "object" || Array.isArray(parsed)) {
                throw new Error('Formato inválido para docentesCodprof');
            }
            console.log(' Mapeamento docentesCodprof carregado com sucesso:', Object.keys(parsed).length, 'professores');
        } catch (error) {
            console.warn(' Mapeamento docentesCodprof inválido, reinicializando...', error);
            localStorage.setItem('docentesCodprof', JSON.stringify({}));
        }
    }    // ...existing code...
    // Adicionar evento ao botão "Adicionar" - verificar se está funcionando
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar se o botão existe
        const addButton = document.querySelector('button[title="Adicionar Nova Chave"]');
        
        if (addButton) {
            console.log('✅ Botão Adicionar encontrado');
            addButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔄 Abrindo modal de cadastro de professor');
                openRegisterTeacherModal();
            });
        } else {
            console.warn('⚠️ Botão Adicionar não encontrado!');
            // Buscar por outros seletores possíveis
            const alternativeButton = document.querySelector('[data-action="add-teacher"], .btn-add-teacher, #addTeacherBtn');
            if (alternativeButton) {
                console.log('✅ Botão alternativo encontrado');
                alternativeButton.addEventListener('click', openRegisterTeacherModal);
            }
        }
        
        // Verificar se o modal existe
        const modal = document.getElementById('registerTeacherModal');
        if (!modal) {
            console.error('❌ Modal registerTeacherModal não encontrado no DOM!');
        } else {
            console.log('✅ Modal de cadastro encontrado');
        }
    });
    // ...existing code...    // ...existing code...
    function saveNewTeacher() {
        console.log('🔄 Iniciando cadastro de novo professor');
        
        const nameInput = document.getElementById('tpFullName');
        const fatsInput = document.getElementById('tpFast');
        
        if (!nameInput || !fatsInput) {
            console.error('❌ Campos de input não encontrados:', { nameInput, fatsInput });
            showNotification('Erro: Campos do formulário não encontrados!', 'danger');
            return;
        }
        
        const name = nameInput.value.trim();
        const fats = fatsInput.value.trim();
        
        console.log('📝 Dados capturados:', { name, fats });
    
        if(!name || !fats) {
            console.warn('⚠️ Campos obrigatórios não preenchidos');
            showNotification('Preencha todos os campos obrigatórios!!', 'warning');
            return;
        }
    
        // Validar se o nome tem pelo menos 3 caracteres
        if(name.length < 3) {
            console.warn('⚠️ Nome muito curto:', name.length);
            showNotification('O nome do professor deve ter pelo menos 3 caracteres.', 'warning');
            return;
        }
    
        // Valida se o professor já existe
        try {
            const currentMapping = JSON.parse(localStorage.getItem('docentesCodprof') || '{}');
            console.log('📚 Mapeamento atual:', Object.keys(currentMapping).length, 'professores');
    
            if(currentMapping[name]) {
                console.warn('⚠️ Professor já existe:', name);
                showNotification(`O professor "${name}" já está cadastrado no sistema.`, 'warning');
                return;
            }
    
            // Verifica se o FAST já está sendo usado por outro professor
            for(const [existingName, existingFast] of Object.entries(currentMapping)) {
                if(existingFast === fats) {
                    console.warn('⚠️ FATS já em uso:', { fats, existingName });
                    showNotification(`O FATS <strong>"${fats}"</strong> já está sendo usado pelo professor: <strong>${existingName}</strong>.`, 'warning');
                    return;
                }
            }
    
            // Adicionar novo professor
            currentMapping[name] = fats;
            localStorage.setItem('docentesCodprof', JSON.stringify(currentMapping));
            
            console.log('✅ Professor cadastrado com sucesso:', { name, fats });
            
            // Disparar evento customizado para notificar outras partes do sistema
            window.dispatchEvent(new CustomEvent('teacherAdded', {
                detail: { name: name, fats: fats }
            }));
            
            // Atualizar a tabela de professores na interface
            updateTeacherTable();
            
            // Fechar o modal e limpar os campos
            closeRegisterTeacherModal();
            
            showNotification(`Professor '<strong>${name}</strong>' cadastrado(a) com sucesso!`, 'success');
            
            return true;
        } catch(error) {
            console.error('❌ Erro ao cadastrar professor:', error);
            showNotification('Erro ao cadastrar professor.', 'danger');
            return false;
        }
    }

    };
    
    // REMOVIDO: Código legado que causava erro - o salvamento agora é feito dentro de saveNewTeacher()
    // localStorage.setItem("docentesCodprof", JSON.stringify(docentesCodprof));
   

    if (!localStorage.getItem('docentesCodprof')) {
        console.log(' Inicializando mapeamento docentesCodprof no localStorage...');
        localStorage.setItem('docentesCodprof', JSON.stringify({}));
    }


if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeAll();

        const addButton = document.querySelector('button[title="Adicionar Nova Chave"]');

        if(addButton) {
            addButton.addEventListener('click', openRegisterTeacherModal);
        }
    });
} else {
    initializeAll();
    // Adiciona evento ao botão "Adicionar"
    const addButton = document.querySelector('button[title="Adicionar Nova Chave"]');

    if(addButton) {
        addButton.addEventListener('click', openRegisterTeacherModal);
    }
}

// Event listener unificado para todos os botões da tabela
document.addEventListener("click", function (e) {
    // Botão editar
    if(e.target.closest(".btn-edit")) {
        handleEditButton(e);
        return;
    }
    
    // Botão salvar
    if(e.target.closest(".btn-save")) {
        handleSaveButton(e);
        return;
    }
    
    // Botão cancelar
    if(e.target.closest(".btn-cancel")) {
        handleCancelButton(e);
        return;
    }
});

// Função para lidar com o botão editar
function handleEditButton(e) {
    const button = e.target.closest(".btn-edit");
    if(!button) return;

    const row = button.closest("tr");
    if(!row) return;
    
    const cells = row.querySelectorAll("td");
    if(!cells.length) return;

    // Armazena os valores originais
    row.dataset.originalValues = JSON.stringify(
        Array.from(cells).map(cell => cell.innerHTML.trim())
    );

    // Torna as células editáveis
    cells.forEach((cell, index) => {
        if([5, 6, 7, 8, cells.length - 1].includes(index)) return;

        const value = cell.innerText.trim();

        cell.innerHTML = `<input 
                             type="text" 
                             class="form-control" 
                             value="${value}"
                         >`;
    });

    // Substitui as células de ação pelos botões "salvar" e "cancelar"
    const actionCell = cells[cells.length - 1];

    actionCell.innerHTML = `
        <div class="d-flex">
            <button class="btn btn-save btn-save-group me-2" aria-label="Salvar alterações">
                <i class="bi bi-floppy"></i>
            </button>
            <button class="btn btn-cancel btn-cancel-group" aria-label="Cancelar edição">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    `;
}

// Função para lidar com o botão salvar
function handleSaveButton(e) {
    const button = e.target.closest(".btn-save");
    if(!button) return;

    const row = button.closest("tr");   
    if(!row) return;
    
    const cells = row.querySelectorAll("td");
    if(!cells.length) return;

    // Captura os dados editados antes de alterar o dom
    const updatedData = {};
    const rowId = row.dataset.recordId || row.dataset.id;

    cells.forEach((cell, index) => {
        if([5, 6, 7, 8, cells.length - 1].includes(index)) return;
        
        const input = cell.querySelector("input");

        if(input) {
            const newValue = input.value.trim();
            
            // Mapear índices para campos de dados
            switch(index) {
                case 0: updatedData.room = newValue; break;
                case 1: updatedData.course = newValue; break;
                case 2: updatedData.turmaNumber = newValue; break;
                case 3: updatedData.professorName = newValue; break;
                case 4: updatedData.subject = newValue; break;
                // índices 5-8 são campos não editáveis (horários, status)
            }
            
            // Atualiza o DOM
            cell.textContent = newValue;
        }
    });

    console.log(' Dados capturados para sincronização:', {
        rowId: rowId,
        updatedData: updatedData,
        hasData: Object.keys(updatedData).length > 0
    });

    // Atualiza os dados compartilhados se há um ID de registro
    if(rowId && Object.keys(updatedData).length > 0) {
        updateSharedDataRecord(rowId, updatedData);
    }

    // Faz a célula de ação voltar ao botão Editar
    const actionCell = cells[cells.length - 1];

    actionCell.innerHTML = `
        <div class="d-flex">
            <button class="btn btn-edit btn-edit-group me-1" aria-label="Editar registro">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-delete btn-delete-group" aria-label="Cancelar edição">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `;
    renderTable();
}

// Função para atualizar um registro específico nos dados compartilhados
function updateSharedDataRecord(recordId, updatedFields) {
    try {
        console.log(` Atualizando registro ${recordId} com:`, updatedFields);
        
        // Encontrar e atualizar o registro nos dados por data e turno
        let recordFound = false;
        
        for(const date in dataByDateAndShift) {
            for(const shift in dataByDateAndShift[date]) {
                const records = dataByDateAndShift[date][shift];
                
                console.log(` Verificando ${date}/${shift}:`, {
                    recordsType: typeof records,
                    isArray: Array.isArray(records),
                    records: records
                });
                
                // Verificar se records é um array
                if (!Array.isArray(records)) {
                    console.warn(` records não é um array em ${date}/${shift}:`, records);
                    continue;
                }
                
                const recordIndex = records.findIndex(record => record && record.id === recordId);
                
                if (recordIndex !== -1) {
                    // Atualizar o registro com os novos dados
                    Object.assign(records[recordIndex], updatedFields);
                    
                    // Adicionar timestamp de última edição
                    records[recordIndex].lastEdited = new Date().toISOString();
                    records[recordIndex].editedBy = 'admin';
                    
                    console.log(` Registro atualizado:`, records[recordIndex]);
                    recordFound = true;
                    
                    // Sincronizar via localStorage
                    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
                    
                    // Também atualizar na estrutura allShiftData se existir
                    const currentDateData = dataByDateAndShift[date];
                    if (currentDateData) {
                        localStorage.setItem('allShiftData', JSON.stringify(currentDateData));
                    }
                    
                    // Sincronizar via Firebase se disponível
                    if (typeof saveDataToFirebase === 'function') {
                        // DEBUG: Verificar dados antes de enviar ao Firebase
                        console.log(' [ADMIN] Edição de registro - Dados antes de enviar ao Firebase:');
                        console.log(' [ADMIN] - date:', date);
                        console.log(' [ADMIN] - shift:', shift);
                        console.log(' [ADMIN] - records length:', records.length);
                        
                        // Sempre sincronizar com Firebase após atualização, mesmo se o array ficar vazio
                        if (records && Array.isArray(records)) {
                            console.log(' [ADMIN] Sincronizando atualização com Firebase...', {
                                date,
                                shift,
                                recordsLength: records.length,
                                recordsContent: records
                            });
                            
                            saveDataToFirebase(date, shift, records)
                                .then(() => {
                                    console.log(` [ADMIN] Dados sincronizados no Firebase para ${date}/${shift}`);
                                })
                                .catch(error => {
                                    console.error(' [ADMIN] Erro ao sincronizar no Firebase:', error);
                                });
                        } else {
                            console.error(' [ADMIN] Dados inválidos - records não é um array:', records);
                        }
                    }
                    
                    // Disparar evento customizado para notificar outras páginas
                    window.dispatchEvent(new CustomEvent('dataUpdated', {
                        detail: {
                            type: 'recordUpdated',
                            recordId: recordId,
                            updatedFields: updatedFields,
                            date: date,
                            shift: shift,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    
                    break;
                }
            }
            if (recordFound) break;
        }
        
        // Se não encontrou na estrutura principal, tentar na estrutura legacy
        if (!recordFound) {
            console.log(' Tentando encontrar na estrutura legacy allShiftData...');
            
            const allShiftDataStr = localStorage.getItem('allShiftData');
            if (allShiftDataStr) {
                try {
                    const allShiftData = JSON.parse(allShiftDataStr);
                    
                    for (const shift in allShiftData) {
                        const shiftRecords = allShiftData[shift];
                        
                        if (Array.isArray(shiftRecords)) {
                            const recordIndex = shiftRecords.findIndex(record => record && record.id === recordId);
                            
                            if (recordIndex !== -1) {
                                Object.assign(shiftRecords[recordIndex], updatedFields);
                                shiftRecords[recordIndex].lastEdited = new Date().toISOString();
                                shiftRecords[recordIndex].editedBy = 'admin';
                                
                                localStorage.setItem('allShiftData', JSON.stringify(allShiftData));
                                
                                console.log(` Registro atualizado na estrutura legacy:`, shiftRecords[recordIndex]);
                                recordFound = true;
                                
                                // Disparar evento customizado
                                window.dispatchEvent(new CustomEvent('dataUpdated', {
                                    detail: {
                                        type: 'recordUpdated',
                                        recordId: recordId,
                                        updatedFields: updatedFields,
                                        shift: shift,
                                        timestamp: new Date().toISOString()
                                    }
                                }));
                                
                                break;
                            }
                        }
                    }
                } catch (error) {
                    console.error(' Erro ao processar allShiftData:', error);
                }
            }
        }
        
        if (!recordFound) {
            console.warn(` Registro com ID ${recordId} não encontrado em nenhuma estrutura`);
        }
        
        return recordFound;
        
    } catch (error) {
        console.error(' Erro ao atualizar dados compartilhados:', error);
        return false;
    }
}

// Função para lidar com o botão cancelar
function handleCancelButton(e) {
    const button = e.target.closest(".btn-cancel");
    if(!button) return;

    const row = button.closest("tr");
    if(!row) return;
    
    const cells = row.querySelectorAll("td");
    if(!cells.length) return;

    // Verifica se há dados originais salvos
    if(!row.dataset.originalValues) return;

    // Recupera os valores originais de cada célula
    const originalValues = JSON.parse(row.dataset.originalValues);
    
    cells.forEach((cell, index) => {
        if([5, 6, 7, 8, cells.length - 1].includes(index)) return;
        cell.innerHTML = originalValues[index];
    });

    // Reinicia a célula de ação para o Botão de Edição
    const actionCell = cells[cells.length - 1];

    actionCell.innerHTML = `
        <div class="d-flex">
            <button class="btn btn-edit btn-edit-group me-2" aria-label="Editar registro">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-delete btn-delete-group" aria-label="Cancelar edição">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `;
}

// Função para deletar row da tabela com sincronização de dados
document.addEventListener("click", function(e) {
    const button = e.target.closest("#btn-delete-row, .btn-delete-row");

    if(!button) return;

    const recordId = button.getAttribute("data-id");
    const row = button.closest("tr");
    
    if(!recordId || !row) return;

    showDeleteConfirmationModal(recordId, row);
});

// Função para criar e mostrar modal de confirmação de exclusão
function showDeleteConfirmationModal(recordId, row) {
    // Remover modal existente
    document.getElementById('deleteConfirmationModal')?.remove();
    
    // Obter informações do registro
    const cells = row.querySelectorAll('td');

    const recordInfo = {
        room:      cells[0]?.textContent.trim() || '-',
        course:    cells[1]?.textContent.trim() || '-',
        turma:     cells[2]?.textContent.trim() || '-',
        professor: cells[3]?.textContent.trim() || '-',
        subject:   cells[4]?.textContent.trim() || '-'
    };
    
    // Criar o modal
    const modal = document.createElement('div');

    modal.id = 'deleteConfirmationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg d-flex gap-0">
                <div class="d-flex justify-content-center modal-header bg-danger text-white border-0" style="position: relative;">
                    <div class="d-flex align-self-center justify-content-center align-items-center position-absolute" style="width: 100px; height: 100px; border-radius: 50%; background-color: #dc3545;">
                        <i class="bi bi-trash3-fill text-white" style="font-size: 3.5rem;"></i>
                    </div>
                    
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 d-flex flex-column">
                    <div class="text-center mb-3"></div>

                    <h3 class="text-center mb-2 mt-3" style="color: #323232">
                        Deletar Registro?
                    </h3>

                    <p class="text-center align-self-center mb-4" style="color: #4D4D4D; width: 378px">
                        Tem certeza que deseja excluir permanentemente este registro? Esta ação não pode ser desfeita!
                    </p>

                    <div class="card bg-light border-0 ">
                        <div class="card-body p-3">
                            <h6 class="card-subtitle mb-2 pb-2 text-muted border-1 border-bottom">
                                <i class="bi bi-info-circle me-1"></i>
                                Detalhes do Registro
                            </h6>
                            <div class="small d-flex flex-column register-details">
                                <p><strong>Professor:</strong> ${recordInfo.professor}</p>
                                <p><strong>Sala:</strong> ${recordInfo.room}</p>
                                <p><strong>Curso:</strong> ${recordInfo.course}</p>
                                <p><strong>Turma:</strong> ${recordInfo.turma}</p>
                                <p><strong>Disciplina:</strong> ${recordInfo.subject}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-body modal-actions border-0 d-flex gap-2">
                    <button type="button" id="cancel-btn" class="btn" data-bs-dismiss="modal" style="width: 100%;">
                        Cancelar
                    </button>

                    <button type="button" class="btn" id="confirmDeleteBtn" style="width: 100%;">
                        Deletar Registro
                    </button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);
    
    // Event listener para confirmação
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', function() {
        this.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Excluindo...';
        this.disabled = true;
        
        const deletionResult = deleteSharedDataRecord(recordId);
        
        if(deletionResult.success) {
            // Animar exclusão
            row.style.cssText = 'transition: all 0.3s ease; transform: translateX(-100%); opacity: 0;';

            setTimeout(() => row.remove(), 300);
            
            bootstrapModal.hide();
        } else {
            showNotification('Erro ao deletar registro!', 'danger');
            this.innerHTML = '<i class="bi bi-trash3-fill me-1"></i> Deletar Registro';
            this.disabled = false;
        }
    });
    
    // Auto-cleanup
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    bootstrapModal.show();
}

function showDeleteRoomConfirmationModal(roomId) {
    // Criar o modal
    const modal = document.createElement('div');

    const rooms = getRooms();
    const roomExists = rooms.filter(r => r.id === roomId);
    // const textRoomNumber = (roomExists[0].numero != 'Sem numeração') ? roomExists[0].numero : 'Sem numeração';

    modal.id = 'deleteRoomConfirmationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg d-flex gap-0">
                <div class="d-flex justify-content-center modal-header bg-danger text-white border-0" style="position: relative;">
                    <div class="d-flex align-self-center justify-content-center align-items-center position-absolute" style="width: 100px; height: 100px; border-radius: 50%; background-color: #dc3545;">
                        <i class="bi bi-trash3-fill text-white" style="font-size: 3.5rem;"></i>
                    </div>
                    
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 d-flex flex-column">
                    <div class="text-center mb-3"></div>

                    <h3 class="text-center mb-2 mt-3" style="color: #323232">
                        Remover Sala?
                    </h3>

                    <p class="text-center align-self-center mb-4" style="color: #4D4D4D; width: 378px">
                        Tem certeza que deseja <strong class="text-light-emphasis">excluir permanentemente</strong> esta sala? Esta ação não pode ser desfeita!
                    </p>

                    <div class="card bg-light border-0 ">
                        <div class="card-body p-3">
                            <h6 class="card-subtitle mb-2 pb-2 text-muted border-1 border-bottom">
                                <i class="bi bi-info-circle me-1"></i>
                                Detalhes da Sala
                            </h6>
                            <div class="small d-flex flex-column register-details">
                                <p><strong>Sala:</strong> ${roomExists[0].sala}</p>
                                <p><strong>Bloco:</strong> ${roomExists[0].bloco}</p>
                                <p><strong>Numero da sala:</strong> ${roomExists[0].numero || 'sem numeração'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-body modal-actions border-0 d-flex gap-2">
                    <button type="button" id="cancel-btn" class="btn" data-bs-dismiss="modal" style="width: 100%;">
                        Cancelar
                    </button>

                    <button type="button" class="btn" id="confirmDeleteRoomBtn" style="width: 100%;">
                        Deletar Registro
                    </button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);
    
    // Event listener para confirmação
    modal.querySelector('#confirmDeleteRoomBtn').addEventListener('click', function() {
        deleteRoom(roomId);
        bootstrapModal.hide();
    });
    
    // Auto-cleanup
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    bootstrapModal.show();
}

function showDeleteTeacherConfirmationModal(roomId) {
    // Criar o modal
    const modal = document.createElement('div');

    const rooms = getRooms();
    const roomExists = rooms.filter(r => r.id === roomId);
    // const textRoomNumber = (roomExists[0].numero != 'Sem numeração') ? roomExists[0].numero : 'Sem numeração';

    modal.id = 'deleteRoomConfirmationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg d-flex gap-0">
                <div class="d-flex justify-content-center modal-header bg-danger text-white border-0" style="position: relative;">
                    <div class="d-flex align-self-center justify-content-center align-items-center position-absolute" style="width: 100px; height: 100px; border-radius: 50%; background-color: #dc3545;">
                        <i class="bi bi-trash3-fill text-white" style="font-size: 3.5rem;"></i>
                    </div>
                    
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 d-flex flex-column">
                    <div class="text-center mb-3"></div>

                    <h3 class="text-center mb-2 mt-3" style="color: #323232">
                        Remover Sala?
                    </h3>

                    <p class="text-center align-self-center mb-4" style="color: #4D4D4D; width: 378px">
                        Tem certeza que deseja <strong class="text-light-emphasis">excluir permanentemente</strong> esta sala? Esta ação não pode ser desfeita!
                    </p>

                    <div class="card bg-light border-0 ">
                        <div class="card-body p-3">
                            <h6 class="card-subtitle mb-2 pb-2 text-muted border-1 border-bottom">
                                <i class="bi bi-info-circle me-1"></i>
                                Detalhes da Sala
                            </h6>
                            <div class="small d-flex flex-column register-details">
                                <p><strong>Sala:</strong> ${roomExists[0].sala}</p>
                                <p><strong>Bloco:</strong> ${roomExists[0].bloco}</p>
                                <p><strong>Numero da sala:</strong> ${roomExists[0].numero || 'sem numeração'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-body modal-actions border-0 d-flex gap-2">
                    <button type="button" id="cancel-btn" class="btn" data-bs-dismiss="modal" style="width: 100%;">
                        Cancelar
                    </button>

                    <button type="button" class="btn" id="confirmDeleteRoomBtn" style="width: 100%;">
                        Deletar Registro
                    </button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);
    
    // Event listener para confirmação
    modal.querySelector('#confirmDeleteRoomBtn').addEventListener('click', function() {
        deleteRoom(roomId);
        bootstrapModal.hide();
    });
    
    // Auto-cleanup
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    bootstrapModal.show();
}

// Função para deletar registro dos dados compartilhados
function deleteSharedDataRecord(recordId) {
    try {
        let recordFound = false;
        let deletionDetails = {};
        
        // Buscar em dataByDateAndShift
        for(const date in dataByDateAndShift) {
            for(const shift in dataByDateAndShift[date]) {
                const records = dataByDateAndShift[date][shift];

                if(!Array.isArray(records)) continue;
                
                const recordIndex = records.findIndex(r => r?.id === recordId);

                if(recordIndex === -1) continue;
                
                deletionDetails = { date, shift, deletedRecord: { ...records[recordIndex] } };
                records.splice(recordIndex, 1);
                recordFound = true;
                
                // Sincronizar dados
                localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
                localStorage.setItem('allShiftData', JSON.stringify(dataByDateAndShift[date]));
                
                // Sincroniza com o Firebase 
                if(typeof saveDataToFirebase === 'function') {
                    // DEBUG: Verificar dados antes de enviar ao Firebase
                    console.log(' [ADMIN] Exclusão de registro - Dados antes de enviar ao Firebase:');
                    console.log(' [ADMIN] - date:', date);
                    console.log(' [ADMIN] - shift:', shift);
                    console.log(' [ADMIN] - records length:', records.length);
                    
                    // Sempre sincronizar com Firebase após exclusão, mesmo se o array ficar vazio
                    if (records && Array.isArray(records)) {
                        console.log(' [ADMIN] Sincronizando exclusão com Firebase...', {
                            date,
                            shift,
                            recordsLength: records.length,
                            recordsContent: records
                        });
                        
                        saveDataToFirebase(date, shift, records).then(() => {
                            console.log(' [ADMIN] Exclusão sincronizada com Firebase com sucesso!');
                        }).catch(error => {
                            console.error(' [ADMIN] Erro ao sincronizar exclusão no Firebase:', error);
                        });
                    } else {
                        console.error(' [ADMIN] Dados inválidos - records não é um array:', records);
                    }
                }
                
                // Notificar outras telas
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: {
                        type: 'recordDeleted',
                        recordId,
                        ...deletionDetails,
                        timestamp: new Date().toISOString(),
                        deletedBy: 'admin'
                    }
                }));
                
                break;
            }

            if(recordFound) break;
        }
        
        // Fallback: buscar em allShiftData legacy 
        if(!recordFound) {
            const allShiftDataStr = localStorage.getItem('allShiftData');

            if(allShiftDataStr) {
                const allShiftData = JSON.parse(allShiftDataStr);
                
                for(const shift in allShiftData) {
                    const shiftRecords = allShiftData[shift];
                    
                    if(!Array.isArray(shiftRecords)) continue;
                    
                    const recordIndex = shiftRecords.findIndex(r => r?.id === recordId);                 
                    if(recordIndex === -1) continue;
                    
                    deletionDetails = { shift, deletedRecord: { ...shiftRecords[recordIndex] }, source: 'legacy' };
                    shiftRecords.splice(recordIndex, 1);
                    recordFound = true;
                    
                    localStorage.setItem('allShiftData', JSON.stringify(allShiftData));
                    
                    window.dispatchEvent(new CustomEvent('dataUpdated', {
                        detail: {
                            type: 'recordDeleted',
                            recordId,
                            ...deletionDetails,
                            timestamp: new Date().toISOString(),
                            deletedBy: 'admin'
                        }
                    }));

                    break;
                }
            }
        }
        
        if(!recordFound) return { success: false };

        return { success: true, details: deletionDetails };       
    } catch(error) { return { success: false, error: error.message } }
}

function showMensageConfirmationModal(nameTeacher, fats) {
    // Remove modal existente
    document.getElementById('messageConfirmationModal')?.remove();
    
    // Cria o modal
    const modal = document.createElement('div');
    modal.id = 'messageConfirmationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered" style="z-index: 2000 !important;">
            <div class="modal-content border-0 shadow-lg">
                
                <!-- Cabeçalho -->
                <div class="modal-header text-white border-0 justify-content-center position-relative" style="background-color: #1C9B60;">
                    <div class="d-flex justify-content-center align-items-center position-absolute" style="width: 100px; height: 100px; border-radius: 50%; background-color: #1C9B60; top: -28px;">
                        <i class="bi bi-check-circle text-white" style="font-size: 3.2rem;"></i>                       
                    </div>
                    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>

                <!-- Corpo -->
                <div class="modal-body p-4 text-center">
                    <h3 class="mb-3 mt-4" style="color: #323232;">
                        Professor Cadastrado!
                    </h3>
                    <p class="text-center mb-1 mx-auto fw-semibold" style="color: #4D4D4D; max-width: 380px;">
                        Cadastro realizado com sucesso!
                    </p>
                    <p class="text-center mb-1 mx-auto" style="color: #4D4D4D; max-width: 380px;">
                        <strong>Professor(a):</strong> ${nameTeacher}
                    </p>
                    <p class="text-center mb-0 mx-auto" style="color: #4D4D4D; max-width: 380px;">
                        <strong>FATS:</strong> ${fats}
                    </p>
                </div>
                
                <!-- Rodapé (ações) -->
                <div class="modal-footer border-0 mb-1 d-flex">
                    <button type="button" class="btn w-100" id="confirmMessageBtn" style="margin: 0 28px;">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);

    // Event listener para confirmação
    modal.querySelector('#confirmMessageBtn').addEventListener('click', function() {
        bootstrapModal.hide();
    });
    
    // Limpa tudo ao fechar
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    bootstrapModal.show();
}

// Listener para atualizações de outras telas
window.addEventListener('dataUpdated', function(event) {
    if(event.detail.type === 'recordDeleted') {
        const row = document.querySelector(`tr[data-record-id="${event.detail.recordId}"]`);
        
        if(row) {
            row.style.cssText = 'transition: opacity 0.3s ease; opacity: 0;';
            setTimeout(() => {
                row.remove();
                updateTableCounters();
            }, 300);
        }
    }
});

// Atualizar contadores da tabela
function updateTableCounters() {
    const visibleRows = document.querySelectorAll('#tableBody tr:not([style*="display: none"])').length;
    const counterBadge = document.querySelector('.record-counter');

    if(counterBadge) counterBadge.textContent = visibleRows;
}

function checkLogin() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if(isLoggedIn === 'true') {
        document.getElementById('overlay').style.display = 'none';
        document.body.classList.remove('overlay-open');
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            initializePainelAdm();
        }, 100);
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    
    // Redirecionar para a página inicial
    window.location.href = 'index.html';
}

function login(){
    const username = document.getElementById('username').value;
    const senha = document.getElementById('senha').value;
    if(username === 'admin' && senha === 'adm@123'){
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('overlay').style.display = 'none';
        document.body.classList.remove('overlay-open');
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
        'em_uso':     { variant: 'em-uso',     label: 'Em Uso' },
        'devolvida':  { variant: 'devolvida',  label: 'Devolvida' },
        'retirada':   { variant: 'retirada',   label: 'Retirada' },
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
                aria-label="Retirar chave"
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
                aria-label="Devolver chave"
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
                aria-label="Retirar chave"
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

// // Função de para renderizar a tabela
function renderTable() {
    console.log('Renderizando dados do turno:', activeShift);
    const container = document.getElementById('shiftContent');
    const manualAllocationsContainer = document.getElementById('manualAllocationsTableBody');
    
    if(!container) {
        console.error('Elemento shiftContent não encontrado');
        return;
    }
    
    updateCurrentDate();
    
    let shiftData = getCurrentShiftData();
    
    if(!Array.isArray(shiftData)) {
        console.warn('Dados do turno não são um array:', activeShift);
        shiftData = [];
    }
    
    // Filtro, normalização e ordenação
    const validData = shiftData
    
    .filter(isValidRecord)
    .map(normalizeRecord)
    .sort((a, b) => (a.professorName || '').localeCompare(b.professorName || '', 'pt-BR'));
    
    const shiftCapitalized = activeShift.charAt(0).toUpperCase() + activeShift.slice(1);
    const formattedDate = formatDate(selectedDate);
    
    container.innerHTML = generateTableHTML(validData, shiftCapitalized, formattedDate);
}

// Função de validação
function isValidRecord(item) {
    if(!item || typeof item !== 'object') return false;
    
    const room = getFirstValidValue(item, ['room', 'sala', 'roomName', 'classroom']);
    // Aceitar registros que tenham ao menos a sala preenchida
    return (room && room.trim());
}

// Função de normalização
function normalizeRecord(item) {
    const normalized = {
        ...item,
        room: getFirstValidValue(item, ['room', 'sala', 'roomName', 'classroom']) || '',
        professorName: getFirstValidValue(item, ['professorName', 'professor', 'teacherName']) || '',
        course: getFirstValidValue(item, ['course', 'curso']) || '',
        subject: getFirstValidValue(item, ['subject', 'disciplina', 'materia']) || '',
        turmaNumber: getFirstValidValue(item, ['turmaNumber', 'turma']) || '',
        withdrawalTime: getFirstValidValue(item, ['withdrawalTime', 'horaRetirada']) || '',
        returnTime: getFirstValidValue(item, ['returnTime', 'horaDevolucao']) || '',
        status: item.status || determineStatus(item),
        id: item.id || generateId(item),
        shift: item.shift || activeShift
    };    
    return normalized;
}

// Função para obter o primeiro valor não vazio
function getFirstValidValue(obj, fields) {
    return fields.find(field => obj[field] && 
                       obj[field].toString().trim()) && 
                       obj[fields.find(field => obj[field] && 
                       obj[field].toString().trim())];
}

// Função de determinação do status (em uso, devolvida ou disponível)
function determineStatus(record) {
    const hasWithdrawal = getFirstValidValue(record, ['withdrawalTime', 'horaRetirada']);
    const hasReturn = getFirstValidValue(record, ['returnTime', 'horaDevolucao']);
    
    if(hasWithdrawal && hasReturn) return 'devolvida';
    if(hasWithdrawal) return 'em_uso';
    else return 'disponivel';
}

// Finção de geração de ID único
function generateId(record) {
    const room = getFirstValidValue(record, ['room', 'sala']) || 'unknown';
    const prof = (getFirstValidValue(record, ['professorName', 'professor']) || 'unknown').replace(/\s+/g, '');
    
    return `${Date.now()}_${prof}_${room}`.toLowerCase();
}

// Inicia o sistema de Dropdowns
function initializeDropdowns() {
    // Configura os event listeners para todos os dropdowns
    setupDropdownToggle(document.getElementById('add-data-dropdown'));
    setupDropdownToggle(document.getElementById('show-data-dropdown'));
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

function searchTeachers(e) {
    const tableContainer = document.getElementById('teachersTable');
    const valorInput = e.target.value.toLowerCase();
    const teachers = getStoredTeachers();

    // Verificar se o container existe
    if(!tableContainer) return;

    // Se o input estiver vazio, exibe a tabela normal
    if(valorInput.trim() === '') {
        updateTeacherTable();
        return;
    }

    // Filtragem de professores que começam a inicial digitada
    const filteredTeachers = {};
    
    Object.entries(teachers).forEach(([ nome, fats ]) => {
        if(nome.toLowerCase().startsWith(valorInput)) {
            filteredTeachers[nome] = fats;
        }
    });

    // Valida se há resultados para o valor digitado
    if(Object.keys(filteredTeachers).length === 0) {
        // Mostra mensagem caso não tenha nenhum resultado
        tableContainer.innerHTML = `
            <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="card-title mb-0">
                    <i class="bi bi-person-fill-check "></i>
                    Professores Cadastrados
                </h2>
                <span class="badge bg-secondary">
                    <i class="bi bi-file-earmark-text-fill"></i>
                    Total de Resultados: ${0}
                </span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <div class="text-center py-4">
                        <i class="bi bi-person-x fs-3 mb-2 text-muted"></i>
                        <p class="mb-1">Nenhum professor encontrado</p>

                        <small class="text-muted">
                            Nenhum professor tem nome começando com "<strong>${escapeHtml(e.target.value)}</strong>"
                        </small>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Gera uma tabela com os resultados
    tableContainer.innerHTML = generateTeacherTableHTML(filteredTeachers);
    
    // Adiciona os event listeners para os botões da tabela com os resultados do search
    addTeacherEventListeners();
}

// Formatação de data (AAAA-MM-DD <para> DD/MM/AAAA)
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Constants and Configuration
const STORAGE_KEYS = {
    TEACHERS: "docentesCodprof"  // Corrigido para usar a mesma chave que saveNewTeacher()
};

const TABLE_CONFIG = {
    MAIN_TABLE_COLUMNS: 10, // Updated column count
    TEACHER_TABLE_COLUMNS: 3
};

// Utility Functions
function sanitizeId(str) {
    return str.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

function getStoredTeachers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TEACHERS);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        return {};
    }
}

function saveTeachers(teachers) {
    try {
        localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
        return true;
    } catch (error) {
        return false;
    }
}

// Main Table Generation Functions
function generateTableHTML(validData, shiftCapitalized, formattedDate) {
    if(!Array.isArray(validData) || typeof shiftCapitalized !== 'string' || typeof formattedDate !== 'string') {
        return generateErrorHTML('Erro ao gerar tabela: parâmetros inválidos');
    }

    const rows = validData.length === 0 
        ? generateEmptyRow(shiftCapitalized, formattedDate)
        : validData.map(record => generateTableRow(record)).join('');
    
    return `
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
                            <th class="border-0 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Geração de linha de tabela vazia
function generateEmptyRow(shiftCapitalized, formattedDate) {
    return `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                <i class="bi bi-calendar-x me-2"></i>
                Nenhum dado encontrado para ${formattedDate} no turno da ${shiftCapitalized.toLowerCase()}
                <br>
                <small class="text-muted">Importe um arquivo ou selecione outra data</small>
            </td>
        </tr>
    `;
}

// Geração de linha de tabela com dados
function generateTableRow(record) {
    // Debug para alocações manuais
    if (record.tipo === 'manual_allocation') {
        console.log(' [DEBUG] Gerando linha para alocação manual:', { id: record.id, sala: record.sala, bloco: record.bloco, numero: record.numero, professor: record.professor });
    }
    
    // Para alocações manuais, concatenar bloco + sala + número
    let room;
    if (record.tipo === 'manual_allocation') {
        const bloco = record.bloco || '';
        const sala = record.sala || record.room || '';
        const numero = record.numero || '';
        
        // Formatar: "Bloco Sala Número" ou variações dependendo do que está disponível
        if (bloco && sala && numero) {
            room = `${bloco} ${sala} ${numero}`;
        } else if (bloco && sala) {
            room = `${bloco} ${sala}`;
        } else {
            room = sala || record.room || '-';
        }
    } else {
        room = record.room || record.sala || '-';
    }
    
    const course = record.course || record.curso || '-';
    const turma = record.turmaNumber || record.turma || '-';
    const professor = record.professorName || record.professor || '-';
    const subject = record.subject || record.disciplina || record.materia || '-';
    const withdrawalTime = record.withdrawalTime || record.horaRetirada || '-';
    const returnTime = record.returnTime || record.horaDevolucao || '-';
    
    return `
        <tr data-record-id="${record.id}" data-id="${record.id}">
            <td>${room}</td>
            <td>${course}</td>
            <td><span class="badge fw-bold text-dark">${turma}</span></td>
            <td class="fw-medium">
                <i class="bi bi-person-circle table-icon"></i>
                ${professor}
            </td>
            <td>
                <i class="bi bi-book table-icon"></i>
                ${subject}
            </td>
            <td>${withdrawalTime}</td>
            <td>${returnTime}</td>
            <td>${getStatusBadge(record.status)}</td>
            <td class="text-center">
                ${getActionButton(record.id, record.status)}
            </td>
            <td class="text-center">
                <div id="btns-edit-delete" class="edit-delete-group d-flex">
                    <button class="btn btn-edit me-2 btn-edit-group" data-id="${record.id}" aria-label="Editar registro">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button id="btn-delete-row" class="btn btn-delete btn-delete-row btn-delete-group" data-id="${record.id}" aria-label="Deletar registro">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div id="btns-save-back" class="d-flex justify-content-center disabled save-cancel-group d-none">
                    <button class="btn btn-save me-2 btn-save-group" aria-label="Salvar alterações">
                        <i class="bi bi-floppy"></i>
                    </button>
                    <button class="btn btn-cancel btn-cancel-group" aria-label="Cancelar edição">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Funções relacionadas à gestão dos professores no sistema
document.getElementById('goBackToKeysTable').addEventListener('click', () => {
    hideRoomsTable();
    hideTeacherTable();
    hideManualAllocationsTable();
})

function generateErrorRow(message) {
    return `
        <tr role="row" class="table-danger">
            <td colspan="${TABLE_CONFIG.MAIN_TABLE_COLUMNS}" class="text-center py-3">
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}

function generateErrorHTML(message) {
    return `
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${escapeHtml(message)}
        </div>
    `;
}

// Funções de geração de tabela do professor
function generateTeacherTableHTML(teachersData = null) {
    const teachers = teachersData || getStoredTeachers();
    const hasTeachers = Object.keys(teachers).length > 0;
    
    const rows = hasTeachers 
        ? Object.entries(teachers)
            .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)) // remover se necessário
            .map(([nome, fats]) => generateTeacherRow(nome, fats))
            .join('')
        : generateEmptyTeacherRow();
    
    return `
        <div class="card-header d-flex align-items-center justify-content-between">
            <h2 class="card-title mb-0">
                <i class="bi bi-person-fill-check "></i>
                Professores Cadastrados
            </h2>
            <span class="badge bg-secondary">
                <i class="bi bi-file-earmark-text-fill"></i>
                Total de Cadastros: ${Object.keys(teachers).length}
            </span>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="border-0" style="width: 65%;">Nome</th>
                            <th class="border-0" style="width: 5%;">FATS</th>
                            <th class="border-0 text-center" style="width: 5%;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="teacherTableBody">
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateEmptyTeacherRow() {
    return `
        <tr>
            <td class="text-center text-muted py-4">
                <div class="d-flex flex-column align-items-center">
                    <i class="bi bi-person-x fs-3 mb-2" aria-hidden="true"></i>
                    <p class="mb-1">Nenhum professor cadastrado</p>
                    <small class="text-muted">
                        Adicione professores para começar
                    </small>
                </div>
            </td>
        </tr>
    `;
}

function generateTeacherRow(nome, fats) {
    if(!nome || nome.trim() === '') return generateErrorRow('Nome do professor inválido');

    const teacherId = sanitizeId(nome);
    const escapedName = escapeHtml(nome);
    const escapedFats = escapeHtml(String(fats || ''));
    
    return `
        <tr data-teacher-name="${escapedName}" data-teacher-id="${teacherId}">
            <td class="fw-medium teacher-name teacher-name-cell">
                <i class="bi bi-person-circle table-icon"></i>
                <span class="teacher-name-text">${escapedName}</span>
            </td>
            <td class="fats-badge-cell">
                <span class="fats-badge">${escapedFats}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <div class="edit-delete-group d-flex justify-content-center">
                        <button type="button" class="btn me-2 btn-edit-teacher btn-edit-group" 
                                data-teacher-name="${escapedName}" 
                                aria-label="Editar professor ${escapedName}"
                            >
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" class="btn btn-delete-teacher btn-delete-group" 
                                data-teacher-name="${escapedName}" 
                                aria-label="Excluir professor ${escapedName}"
                            >
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>

                    <div class="save-cancel-group d-none justify-content-center align-items-center">
                        <button type="button" class="btn me-2 btn-save-teacher btn-save-group" 
                                data-teacher-name="${escapedName}"
                                aria-label="Salvar alterações do professor"
                            >
                            <i class="bi bi-floppy"></i>
                        </button>
                        <button type="button" class="btn btn-cancel-teacher btn-cancel-group" 
                                data-teacher-name="${escapedName}"
                                aria-label="Cancelar edição do professor"
                            >
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

// Estado global para a gestão dos professores
let teacherManagerState = {
    teachers: {},
    isActive: false
};

function updateTeacherTable(teachersData = null) {
    const tableContainer = document.getElementById('teachersTable');

    if(!tableContainer) {
        console.warn('teachersTable element not found');
        return false;
    }

    try {
        teacherManagerState.teachers = teachersData || getStoredTeachers();
        tableContainer.innerHTML = generateTeacherTableHTML(teacherManagerState.teachers);
        addTeacherEventListeners();
        return true;
    } catch(error) {
        console.error('Error updating teacher table:', error);
        tableContainer.innerHTML = generateErrorHTML('Erro ao carregar tabela de professores');
        return false;
    }
}

function updateTeacherTableBody(teachersData = null) {
    const tbody = document.getElementById('teacherTableBody');

    if(!tbody) {
        console.warn('teacherTableBody element not found');
        return false;
    }

    try {
        teacherManagerState.teachers = teachersData || getStoredTeachers();

        const hasTeachers = Object.keys(teacherManagerState.teachers).length > 0;
        
        const rows = hasTeachers 
            ? Object.entries(teacherManagerState.teachers)
                .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
                .map(([nome, fats]) => generateTeacherRow(nome, fats))
                .join('')
            : generateEmptyTeacherRow();
        
        tbody.innerHTML = rows;
        addTeacherEventListeners();
        return true;
    } catch(error) {
        console.error('Erro:', error);
        tbody.innerHTML = generateErrorRow('Erro ao carregar professores.');
        return false;
    }
}

function addTeacherEventListeners() {
    // Para botões de Editar
    document.querySelectorAll('.btn-edit-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const teacherName = btn.getAttribute('data-teacher-name');
            startEditTeacher(teacherName);
        });
    });

    // Para botões de Remover
    document.querySelectorAll('.btn-delete-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const teacherName = btn.getAttribute('data-teacher-name');
            deleteTeacher(teacherName);
        });
    });

    // Para botões de Salvar
    document.querySelectorAll('.btn-save-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const teacherName = btn.getAttribute('data-teacher-name');
            saveEditTeacher(teacherName);
        });
    });

    // Para botões de Cancelar
    document.querySelectorAll('.btn-cancel-teacher').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const teacherName = btn.getAttribute('data-teacher-name');
            cancelEditTeacher(teacherName);
        });
    });
}

function startEditTeacher(teacherName) {
    const row = document.querySelector(`tr[data-teacher-name="${teacherName}"]`);
    if(!row) return false;
    
    const fatsText = row.querySelector('.fats-badge');
    const nameText = row.querySelector('.teacher-name');
    const fatsCell = row.querySelector('.fats-badge-cell');
    const nameCell = row.querySelector('.teacher-name-cell');
    const editDeleteGroup = row.querySelector('.edit-delete-group');
    const saveCancelGroup = row.querySelector('.save-cancel-group');

    if(!nameCell || !fatsCell || !editDeleteGroup || !saveCancelGroup) return false;

    // Armazena os valores originais
    const originalName = nameText.textContent.trim();
    const originalFats = fatsText.textContent.trim();

    // Substitui por inputs
    nameCell.innerHTML = `
        <input 
            type="text" 
            class="form-control" 
            value="${escapeHtml(originalName)}" 
            data-original="${escapeHtml(originalName)}"
        >
    `;
    fatsCell.innerHTML = `
        <input 
            type="text"
            class="form-control" 
            value="${escapeHtml(originalFats)}" 
            data-original="${escapeHtml(originalFats)}"
            style="text-transform: uppercase;"
        >
    `;

    // Alterna os grupos de botões
    editDeleteGroup.classList.add('d-none');
    editDeleteGroup.classList.remove('d-flex');
    saveCancelGroup.classList.remove('d-none');
    saveCancelGroup.classList.add('d-flex');

    return true;
}

// Função para salvar alterações feitas na linha
function saveEditTeacher(teacherName) {
    const row = document.querySelector(`tr[data-teacher-name="${teacherName}"]`);
    if(!row) return false;

    const nameInput = row.querySelector('.teacher-name-cell input');
    const fatsInput = row.querySelector('.fats-badge-cell input');

    if(!nameInput || !fatsInput) return false;

    const newName = nameInput.value.trim();
    const newFats = fatsInput.value.trim().toUpperCase();
    const originalName = nameInput.getAttribute('data-original');

    // Valida as entradas
    if(!newName) {
        showNotification('Nome do professor não pode estar vazio.', 'warning');
        nameInput.focus();
        return false;
    }
    
    if(!newFats) {
        showNotification('FATS não pode estar vazio.', 'warning');
        fatsInput.focus();
        return false;
    }

    // Valida se o nome inserido já existe
    if(newName !== originalName && teacherManagerState.teachers[newName]) {
        showNotification('Já existe um professor com este nome.', 'warning');
        nameInput.focus();
        return false;
    }

    try {
        // Atualiza os dados dos professores
        if(newName !== originalName) {
            delete teacherManagerState.teachers[originalName];
        }
        
        teacherManagerState.teachers[newName] = newFats;

        // Salva os dados no localStorage
        if(!saveTeachers(teacherManagerState.teachers)) {
            throw new Error('Erro ao salvar no localStorage!');
        }

        // Atualiza a tabela
        updateTeacherTableBody();
        
        console.log('Professor atualizado com sucesso:', { originalName, newName, newFats });
        return true;
    } catch(error) {
        console.error('Erro ao salvar professor:', error);
        showNotification('Erro ao salvar professor. Tente novamente!', 'danger');
        return false;
    }
}

function cancelEditTeacher() {
    updateTeacherTableBody();
}

function deleteTeacher(teacherName) {
    if(!confirm(`Tem certeza que deseja excluir o professor "${teacherName}"?`)) {
        return false;
    }

    try {
        delete teacherManagerState.teachers[teacherName];
        
        if(!saveTeachers(teacherManagerState.teachers)) {
            throw new Error('Erro ao salvar no localStorage!');
        }

        updateTeacherTableBody();
        console.log(`Professor "${teacherName}" removido(a) com sucesso!`);

        return true;
    } catch(error) {
        console.error('Erro ao remover professor:', error);
        alert('Erro ao remover professor. Tente novamente!');

        return false;
    }
}

function hiddenDefaultOptions() {
    document.getElementById('shiftContent').style.display = 'none';
    document.getElementById('showTeacherBtn').style.display = 'none';
    document.getElementById('import-files-btn').style.display = 'none';
    document.getElementById('show-data-dropdown').style.display = 'none';
    document.getElementById('goBackToKeysTable').style.display = 'flex';
    document.getElementById('dateSelector').classList.add('disabled');
}

function showDefaultOptions() {
    document.getElementById('shiftContent').style.display = 'block';
    document.getElementById('showTeacherBtn').style.display = 'block';
    document.getElementById('import-files-btn').style.display = 'block';
    document.getElementById('show-data-dropdown').style.display = 'flex';
    document.getElementById('goBackToKeysTable').style.display = 'none';
    document.getElementById('dateSelector').classList.remove('disabled');
}

// Função para exibir a tabela de professores
function showTeacherTable() {
    const tableContainer = document.getElementById('teachersTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'block';
    tableContainer.classList.remove('d-none');

    hiddenDefaultOptions()
    document.getElementById('shiftTabs').style.display = 'none';
    document.getElementById('register-room-option').style.display = 'none';
    
    // Visibilidade da barra de pesquisas
    document.getElementById('search-bar').classList.add('d-flex');
    document.getElementById('search-bar').classList.remove('d-none');
    

    teacherManagerState.isActive = true;
}

// Função para ocultar a tabela de professores
function hideTeacherTable() {
    const tableContainer = document.getElementById('teachersTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'none';
    tableContainer.classList.add('d-none');
    
    showDefaultOptions();
    document.getElementById('shiftTabs').style.display = 'flex';
    document.getElementById('register-room-option').style.display = 'flex';
    // Visibilidade da barra de pesquisas
    document.getElementById('search-bar').classList.remove('d-flex');
    document.getElementById('search-bar').classList.add('d-none');
    
    teacherManagerState.isActive = false;
}

// Recupera as salas do localstorage
function getRooms() {
    const rooms = localStorage.getItem("rooms");
    return rooms ? JSON.parse(rooms) : [];
}

// Salva as salas no localstorage
function saveRooms(rooms) {
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

// Recupera os dados do dropdown
function getDropdownData() {
    const data = localStorage.getItem("rooms");
    return data ? JSON.parse(data) : []; // Retornar array vazio em vez de objeto vazio
}

// Generate unique ID for new room
function generateRoomId() {
    const rooms = getRooms();
    const maxId = rooms.length > 0 ? Math.max(...rooms.map(room => room.id)) : 0;
    return maxId + 1;
}

// Generate unique ID for records (manual allocations, etc)
function generateUniqueRecordId() {
    // Obter todos os IDs existentes para garantir unicidade
    const allData = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
    const existingIds = new Set();
    
    // Coletar todos os IDs existentes
    for (const date in allData) {
        for (const shift in allData[date]) {
            if (Array.isArray(allData[date][shift])) {
                allData[date][shift].forEach(record => {
                    if (record.id) existingIds.add(record.id);
                });
            }
        }
    }
    
    // Gerar um ID único que não colida com os existentes
    let newId;
    let attempts = 0;

    do {
        newId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${attempts}`;
        attempts++;
    } while (existingIds.has(newId) && attempts < 100);
    
    console.log(' [DEBUG] ID gerado para alocação manual:', newId);
    return newId;
}

// Função para limpar IDs duplicados (executar uma vez para limpar dados corrompidos)
function cleanDuplicateIds() {
    const allData = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
    let cleaned = false;
    
    for (const date in allData) {
        for (const shift in allData[date]) {
            if (Array.isArray(allData[date][shift])) {
                const seenIds = new Set();
                const cleanArray = [];
                
                allData[date][shift].forEach(record => {
                    if (!record.id || !seenIds.has(record.id)) {
                        if (!record.id) {
                            record.id = generateUniqueRecordId();
                            console.log(' [CLEAN] ID criado para registro sem ID:', record.id);
                        }
                        seenIds.add(record.id);
                        cleanArray.push(record);
                    } else {
                        console.log(' [CLEAN] Registro duplicado removido:', record.id);
                        cleaned = true;
                    }
                });
                
                allData[date][shift] = cleanArray;
            }
        }
    }
    
    if (cleaned) {
        localStorage.setItem('allDateShiftData', JSON.stringify(allData));
        dataByDateAndShift = allData;
        console.log(' [CLEAN] Dados limpos e salvos');
        return true;
    }
    
    return false;
}

// Cria a linha da sala no modo padrão de exibição
function createRoomRow(room) {
    return `
        <tr data-room-id="${room.id}">
            <td class="room-sala">
                <i class="bi bi-bookmark table-icon"></i>
                ${room.sala}
            </td>
            <td class="room-bloco">
                <p class="block-badge mb-0" style="width: fit-content; padding: 1px 12px; border-radius: 6px">
                    ${room.bloco}
                </p>
            </td>
            <td class="room-numero fw-medium">
                ${room.numero || 'Sem numeração'}
            </td>
            <td class="room-actions text-center">
                <div id="btns-edit-delete" class="edit-delete-group d-flex">
                    <button class="btn me-2 btn-edit-room btn-edit-group" onclick="editRoom(${room.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>

                    <button class="btn btn-delete-room btn-delete-group" onclick="showDeleteRoomConfirmationModal(${room.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Função para o processamento do cadastro das salas
function handleRoomRegistration() {
    const salaInput = document.getElementById('roomName');
    const blocoInput = document.getElementById('blockName');
    const numeroInput = document.getElementById('roomNumber');

    if(!salaInput || !blocoInput || !numeroInput) {
        console.error('Form elements not found');
        return;
    }

    const sala = salaInput.value.trim().toUpperCase();
    const bloco = blocoInput.value.trim();
    const numero = numeroInput.value.trim();
    
    // Validação dos campos obrigatórios
    if(!sala || sala === '') {
        showNotification('Nome da sala é obrigatório.', 'warning');
        return;
    }
    
    if(!bloco || bloco === '') {
        showNotification('Nome do bloco é obrigatório.', 'warning');
        return;
    }
    
    // Validação do tamanho dos campos
    if(sala && sala.length > 50) {
        showNotification('Nome da sala não pode ter mais de 50 caracteres.', 'warning');
        return;
    }
    
    if(numero && numero.length > 10) {
        showNotification('Número da sala não pode ter mais de 10 caracteres.', 'warning');
        return;
    }
    
    // Valida se a sala já existe
    const registredRooms = getRooms();

    const roomExists = registredRooms.some(room => {
        return room.sala.toLowerCase().trim() === sala.toLowerCase() &&
               room.bloco.toLowerCase().trim() === "bloco " + bloco.toLowerCase().trim() &&
               room.numero.toLowerCase().trim() === (numero || '').toLowerCase()
    });
    
    if(roomExists) {
        showNotification('Essa sala já foi cadastrada.', 'warning');
        return;
    }
    
    // Cria um objeto da nova sala
    const newRoom = {
        id: generateRoomId(),
        sala: sala,
        bloco: "Bloco " + bloco,
        numero: numero
    };
    
    // Salva os dados no localstorage
    const rooms = getRooms();
    rooms.push(newRoom);
    
    saveRooms(rooms);
    
    // Recarrega a tabela das salas
    loadRoomsTable();
    closeRoomRegistrationModal();
    showNotification('Nova sala cadastrada com sucesso!', 'success');
}

// Função que exibe o modal de cadastro de novas salas
function openRoomRegistrationModal() {
    document.getElementById('roomRegistrationModal').style.display = 'flex';
}

// Função que oculta e limpa o modal de cadastro de novas salas
function closeRoomRegistrationModal() {
    document.getElementById('roomRegistrationModal').style.display = 'none';
    document.getElementById('roomName').value = '';
    document.getElementById('blockName').value = '';
    document.getElementById('roomNumber').value = '';
}

// Cria a linha da sala no modo de Edição
function createEditRoomRow(room) {
    return `
        <tr data-room-id="${room.id}">
            <td class="room-sala">
                <input 
                    type="text" 
                    class="form-control edit-input" 
                    id="edit-sala-${room.id}" 
                    value="${room.sala}" 
                />
            </td>
            <td class="room-bloco">
                <input 
                    type="text" 
                    class="form-control edit-input" 
                    id="edit-bloco-${room.id}" 
                    value="${room.bloco}" 
                />
            </td>
            <td class="room-numero">
                <input 
                    type="text" 
                    class="form-control edit-input" 
                    id="edit-numero-${room.id}" 
                    value="${room.numero || 'Sem numeração'}" 
                />
            </td>
            <td class="room-actions">
                <div id="btns-save-back" class="d-flex justify-content-center">
                    <button class="btn me-2 btn-save-room btn-save-group" onclick="saveRoom(${room.id})">
                        <i class="bi bi-floppy"></i>
                    </button>

                    <button class="btn btn-cancel-room btn-cancel-group" onclick="cancelEdit(${room.id})">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Função para editar sala
function editRoom(roomId) {
    const rooms = getRooms();
    const room = rooms.find(r => r.id === roomId);

    if(!room) return;

    const row = document.querySelector(`tr[data-room-id="${roomId}"]`);
    row.outerHTML = createEditRoomRow(room); 
}

// Função para salvar sala
function saveRoom(roomId) {
    const salaInput = document.getElementById(`edit-sala-${roomId}`);
    const blocoInput = document.getElementById(`edit-bloco-${roomId}`);
    const numeroInput = document.getElementById(`edit-numero-${roomId}`);
    
    const newData = {
        sala: salaInput.value.trim(),
        bloco: blocoInput.value.trim(),
        numero: numeroInput.value.trim() || ''
    };

    // Atualiza a sala no localStorage
    const rooms = getRooms();
    const roomIndex = rooms.findIndex(r => r.id === roomId);

    if(roomIndex !== -1) {
        rooms[roomIndex] = { ...rooms[roomIndex], ...newData };
        saveRooms(rooms);
    }

    // Recarrega a tabela
    loadRoomsTable();
}

// Função para cancelar edição
function cancelEdit(roomId) {
    loadRoomsTable(); // apenas recarrega a tabela original
}

// Função para excluir sala
function deleteRoom(roomId) {
    const rooms = getRooms();
    const filteredRooms = rooms.filter(r => r.id !== roomId);

    showNotification('Sala removida com sucesso!', 'success');

    saveRooms(filteredRooms);
    loadRoomsTable();    
}

// Função para carregar e exibir a tabela de salas
function loadRoomsTable() {
    const rooms = getRooms();
    const tbody = document.getElementById('roomsTableBody');
    const dropdownData = getDropdownData();

    document.getElementById('total-registered-rooms').innerHTML = dropdownData.length;
    
    if(rooms.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    Nenhuma sala cadastrada
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = rooms.map(room => createRoomRow(room)).join('');
}

// Função para exibir a tabela de salas
function showRoomsTable() {
    const tableContainer = document.getElementById('roomsTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'block';
    tableContainer.classList.remove('d-none');
    
    hiddenDefaultOptions();
    document.getElementById('shiftTabs').classList.add('disabled');
    document.getElementById('register-teacher-option').style.display = 'none';
    
    teacherManagerState.isActive = true;
}

// Função para ocultar a tabela de salas
function hideRoomsTable() {
    const tableContainer = document.getElementById('roomsTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'none';
    tableContainer.classList.add('d-none');
    
    showDefaultOptions()
    document.getElementById('shiftTabs').classList.remove('disabled');
    document.getElementById('register-teacher-option').style.display = 'flex';
    teacherManagerState.isActive = false;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateTeacherTable();
    loadRoomsTable();
});

// Função para lidar com ações de chave
function handleKeyAction(recordId, currentStatus) {
    console.log(' [DEBUG] Procurando registro ID:', recordId, 'Status:', currentStatus);
    
    // Encontrar o registro no turno atual da data selecionada
    let currentData = getCurrentShiftData();
    
    // Garantir que currentData é um array
    if (!Array.isArray(currentData)) {
        currentData = [];
    }
    
    console.log(' [DEBUG] Dados do turno atual:', currentData.length, 'registros');
    currentData.forEach((r, index) => {
        console.log(` [DEBUG] Registro ${index}:`, { id: r.id, sala: r.sala, professor: r.professor, status: r.status });
    });
    
    // Buscar com comparação estrita de string
    let record = currentData.find(r => String(r.id) === String(recordId));
    let targetData = currentData; // Array onde o registro foi encontrado
    
    // Se não encontrou no turno atual, procurar em todos os dados da variável global
    if (!record) {
        console.log(' [DEBUG] Não encontrado no turno atual, procurando globalmente...');
        // Garantir que dataByDateAndShift está atualizada
        dataByDateAndShift = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
        
        for (const date in dataByDateAndShift) {
            for (const shift in dataByDateAndShift[date]) {
                const shiftData = dataByDateAndShift[date][shift];
                if (Array.isArray(shiftData)) {
                    const foundRecord = shiftData.find(r => String(r.id) === String(recordId));
                    if (foundRecord) {
                        console.log(' [DEBUG] Registro encontrado em', date, shift, ':', foundRecord);
                        record = foundRecord;
                        targetData = shiftData;
                        break;
                    }
                }
            }
            if (record) break;
        }
    }
    
    if (!record) {
        console.error(' [DEBUG] Registro não encontrado:', recordId);
        return;
    }
    
    console.log(' [DEBUG] Registro encontrado, processando ação...');

    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    if (currentStatus === 'em_uso') {
        // Devolver a chave
        record.status = 'devolvida';
        record.returnTime = timeString;
        
        // Atualizar campos do painel do professor para compatibilidade
        record.horaDevolucao = timeString;
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave devolvida por ${record.professorName} às ${record.returnTime}`, 'success');
    } else if (currentStatus === 'retirada' || currentStatus === 'devolvida' || currentStatus === 'disponivel') {
        // Retirar a chave
        record.status = 'em_uso';
        record.withdrawalTime = timeString;
        record.returnTime = '';  // String vazia ao invés de undefined
        
        // Atualizar campos do painel do professor para compatibilidade
        record.horaRetirada = timeString;
        record.horaDevolucao = undefined;
        
        // Mostrar notificação Bootstrap
        showNotification(`Chave retirada por ${record.professorName} às ${record.withdrawalTime}`, 'info');
    }

    // Salvar no Firebase para sincronização em tempo real
    if (typeof saveDataToFirebase === 'function') {
        // Encontrar a data e turno corretos para salvar no Firebase
        let saveDate = selectedDate;
        let saveShift = activeShift;
        
        // Se o registro foi encontrado em outra data/turno, usar essa informação
        for (const date in dataByDateAndShift) {
            for (const shift in dataByDateAndShift[date]) {
                if (dataByDateAndShift[date][shift] === targetData) {
                    saveDate = date;
                    saveShift = shift;
                    break;
                }
            }
        }
        
        if (targetData && Array.isArray(targetData) && targetData.length > 0) {
            saveDataToFirebase(saveDate, saveShift, targetData).then(() => {
                console.log(' [ADMIN] Dados salvos no Firebase após ação de chave');
            }).catch(error => {
                console.error(' [ADMIN] Erro ao salvar no Firebase:', error);
            });
        }
    }

    // Atualizar os dados no localStorage
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
    
    // Também salvar no formato antigo para compatibilidade
    const currentDateData = getDataForDate(selectedDate);
    localStorage.setItem('allShiftData', JSON.stringify(currentDateData));
    
    // Emitir evento de atualização para sincronizar com o painel do professor
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
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar notificação"></button>
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
    initializeDropdowns();
    
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
    // const addButton = document.querySelector('button[title="Adicionar Nova Chave"]');
    // if (addButton) {
    //     addButton.addEventListener('click', function() {
    //         showNotification('Funcionalidade de adicionar será implementada em breve!', 'warning');
    //     });
    // }
    
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

// Impede foco/tab no conteúdo fora do overlay e mantém foco em ciclo dentro do popup
function trapFocusInOverlay() {
    const overlay = document.getElementById('overlay');
    if (!overlay || overlay.style.display === 'none') return;

    document.body.classList.add('overlay-open');

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const popup = overlay.querySelector('.popup');
    if (!popup) return;

    const focusable = Array.from(popup.querySelectorAll(focusableSelectors))
        .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    // Força foco inicial
    if (firstEl) firstEl.focus();

    function handleKeydown(e) {
        if (e.key === 'Tab') {
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        } else if (e.key === 'Escape') {
            // Permite fechar com ESC
            cancel();
        }
    }

    function preventFocusOutside(e) {
        if (!popup.contains(e.target)) {
            e.stopPropagation();
            e.preventDefault();
            if (firstEl) firstEl.focus();
        }
    }

    document.addEventListener('keydown', handleKeydown, true);
    document.addEventListener('focusin', preventFocusOutside, true);

    // Remover handlers ao fechar
    const observer = new MutationObserver(() => {
        if (overlay.style.display === 'none') {
            document.removeEventListener('keydown', handleKeydown, true);
            document.removeEventListener('focusin', preventFocusOutside, true);
            observer.disconnect();
        }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
}

// Ativar trapFocus se o overlay iniciar visível (sem login)
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('overlay');
    if (overlay && overlay.style.display !== 'none') {
        trapFocusInOverlay();
    }
});

// ==================== MANUAL ALLOCATION FUNCTIONS ====================

// Seleções atuais para alocação manual
let manualCurrentSelections = {
    block: null,
    room: null,
    roomNumber: null
};

// Função para obter dados dos dropdowns (reutiliza a função existente)
function getDropdownData() {
    const rooms = getRooms(); // Função existente que obtém as salas
    return rooms;
}

// Função para obter blocos únicos
function getUniqueBlocks(rooms) {
    const blocks = [...new Set(rooms.map(room => room.bloco))];
    return blocks.sort();
}

// Função para obter salas únicas para um bloco
function getUniqueRoomsForBlock(rooms, selectedBlock) {
    const roomsInBlock = rooms.filter(room => room.bloco === selectedBlock);
    const uniqueRooms = [...new Set(roomsInBlock.map(room => room.sala))];
    return uniqueRooms.sort();
}

// Reseta todos os dropdowns para o estado inicial
function resetAllDropdowns() { 
    // Reseta os selecionados
    manualCurrentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Reseta os "placeholders" do dropdown e os estados
    document.getElementById('manualValueBlock').innerText = 'Selecione o bloco';
    document.getElementById('manualValueRoom').innerText = 'Selecione a sala';
    document.getElementById('manualValueRoomNumber').innerText = 'Selecione o número da sala';

    // Reseta o gradiente do dropdown selecionado
    const blockSelected = document.querySelector('#manual-block-dropdown .selected');
    const roomSelected = document.querySelector('#manual-room-dropdown .selected');
    const roomNumberSelected = document.querySelector('#manual-room-number-dropdown .selected');
    
    if(blockSelected) blockSelected.classList.remove('gradient');
    if(roomSelected) roomSelected.classList.remove('gradient');
    if(roomNumberSelected) roomNumberSelected.classList.remove('gradient');

    // Remove all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
        item.classList.remove('selectedOption');
    });

    const roomNumberDropdown = document.getElementById('manual-room-number-dropdown');
    roomNumberDropdown.classList.remove('hidden');
    roomNumberDropdown.classList.remove('noOptions');
    roomNumberDropdown.classList.add('invisible');

    // Limpar conteúdo das opções
    const blockOptions = document.querySelector('#manual-block-dropdown .options');
    const roomOptions = document.querySelector('#manual-room-dropdown .options');
    const roomNumberOptions = document.querySelector('#room-number-dropdown .options');
    
    if(blockOptions) blockOptions.innerHTML = '';
    if(roomOptions) roomOptions.innerHTML = '';
    if(roomNumberOptions) roomNumberOptions.innerHTML = '';

    // Preenche novamente o primeiro dropdown
    populateManualBlockDropdown();
}

// Função para obter números de sala únicos para um bloco e sala
function getUniqueRoomNumbersForRoom(rooms, selectedBlock, selectedRoom) {
    const roomNumbers = rooms
        .filter(room => room.bloco === selectedBlock && room.sala === selectedRoom)
        .map(room => room.numero)
        .filter(num => num && num.trim() !== '');
    return [...new Set(roomNumbers)].sort();
}

// Função que preenche o dropdown de blocos para alocação manual
function populateManualBlockDropdown() {
    const blockOptions = document.getElementById('manual-block-options');
    
    if(!blockOptions) return;

    const rooms = getDropdownData();
    const blocks = getUniqueBlocks(rooms);

    blockOptions.innerHTML = blocks.map(block => `
        <li class="option" data-value="${block}">${block}</li>
    `).join('');

    blockOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedBlock = this.getAttribute('data-value');

            if(selectedBlock !== manualCurrentSelections.block) {
                resetAllDropdowns();
            }
            
            // Atualiza as seleções
            manualCurrentSelections.block = selectedBlock;
            manualCurrentSelections.room = null;
            manualCurrentSelections.roomNumber = null;
            
            // Atualiza a UI
            document.getElementById('manualValueBlock').textContent = selectedBlock;
            document.querySelector('#manual-block-dropdown .selected').classList.remove('active');
            document.querySelector('#manual-block-dropdown .selected').classList.add('gradient');
            document.querySelector('#manual-block-dropdown .options').classList.remove('show');
            document.querySelector('#manual-block-dropdown').classList.add('selectedOption');
            
            // Mostra o dropdown de salas e popula
            document.getElementById('manual-room-dropdown').classList.remove('hidden');
            populateManualRoomDropdown(selectedBlock);
            
            // Esconde o dropdown de números de sala
            document.getElementById('manual-room-number-dropdown').classList.add('invisible');
            document.getElementById('manualValueRoomNumber').textContent = 'Selecione o número da sala';
        });
    });
}

// Função que preenche o dropdown de salas para alocação manual
function populateManualRoomDropdown(selectedBlock) {
    const roomOptions = document.getElementById('manual-room-dropdown-op');
    
    if(!roomOptions) return;

    const rooms = getDropdownData();
    const roomsInBlock = getUniqueRoomsForBlock(rooms, selectedBlock);

    roomOptions.innerHTML = roomsInBlock.map(room => `
        <li class="option" data-value="${room}">${room}</li>
    `).join('');

    roomOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoom = this.getAttribute('data-value');

            if(selectedRoom !== manualCurrentSelections.room) {
                document.getElementById('manual-room-number-dropdown').classList.add('active');
                document.getElementById('manual-room-number-dropdown').classList.remove('noOptions');
                document.getElementById('manual-selected-room-number').classList.remove('gradient');
            }
            
            // Atualiza as seleções
            manualCurrentSelections.room = selectedRoom;
            manualCurrentSelections.roomNumber = null;
            
            // Atualiza a UI
            document.getElementById('manualValueRoom').textContent = selectedRoom;
            document.querySelector('#manual-room-dropdown .selected').classList.remove('active');
            document.querySelector('#manual-room-dropdown .selected').classList.add('gradient');
            document.querySelector('#manual-room-dropdown .options').classList.remove('show');
            document.querySelector('#manual-room-dropdown').classList.add('selectedOption');
            
            // Mostra o dropdown de números de sala e popula
            document.getElementById('manual-room-number-dropdown').classList.remove('invisible');
            populateManualRoomNumberDropdown(selectedBlock, selectedRoom);
        });
    });
}

// Função que preenche o dropdown de números de sala para alocação manual
function populateManualRoomNumberDropdown(selectedBlock, selectedRoom) {
    const roomNumberOptions = document.getElementById('manual-room-number-op');
    const roomNumberDropdown = document.getElementById('manual-room-number-dropdown');
    const roomNumberValue = document.getElementById('manualValueRoomNumber');
    
    if(!roomNumberOptions) return;

    const rooms = getDropdownData();
    const roomNumbers = getUniqueRoomNumbersForRoom(rooms, selectedBlock, selectedRoom);

    if(roomNumbers.length === 0) {
        roomNumberValue.innerText = 'Sem numeração';
        roomNumberDropdown.classList.remove('hidden');
        roomNumberDropdown.classList.add('noOptions');
        roomNumberDropdown.classList.add('selectedOption');
        return;
    }

    roomNumberOptions.innerHTML = roomNumbers.map(number => `
        <li class="option" data-value="${number}">${number}</li>
    `).join('');

    roomNumberOptions.querySelectorAll('.option:not(.disabled)').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoomNumber = this.getAttribute('data-value');
            
            // Atualiza as seleções
            manualCurrentSelections.roomNumber = selectedRoomNumber;
            
            // Atualiza a UI
            roomNumberDropdown.classList.add('selectedOption');
            document.getElementById('manualValueRoomNumber').textContent = selectedRoomNumber;
            document.querySelector('#manual-room-number-dropdown .options').classList.remove('show');
            document.querySelector('#manual-room-number-dropdown .selected').classList.add('gradient');
            document.querySelector('#manual-room-number-dropdown .selected').classList.remove('active');
        });
    });
}

// Função que exibe a tabela de alocações manuais
function showManualAllocationsTable() {
    // Ocultar outras tabelas
    document.getElementById('shiftContent').style.display = 'none';
    document.getElementById('teachersTable').style.display = 'none';
    document.getElementById('roomsTable').style.display = 'none';
    
    // Mostrar tabela de alocações manuais
    document.getElementById('manualAllocationsTable').style.display = 'block';
    
    hiddenDefaultOptions();
    document.getElementById('shiftTabs').classList.add('disabled');
    document.getElementById('register-teacher-option').style.display = 'none';
    document.getElementById('register-room-option').style.display = 'none';

    // Carregar dados da tabela
    loadManualAllocationsTable();
}

// Função para ocultar a tabela de alocações manuais
function hideManualAllocationsTable() {
    document.getElementById('manualAllocationsTable').style.display = 'none';
    document.getElementById('shiftContent').style.display = 'block';
    document.getElementById('shiftTabs').classList.remove('disabled');
    
    // Mostra as opções de registro que foram ocultadas
    document.getElementById('register-teacher-option').style.display = 'flex';
    document.getElementById('register-room-option').style.display = 'flex';
    
    // Mostra as opções padrão
    showDefaultOptions();
}

// Função para carregar e exibir dados na tabela de alocações manuais
function loadManualAllocationsTable() {
    const tableBody = document.getElementById('manualAllocationsTableBody');
    const totalSpan = document.getElementById('total-manual-allocations');
    
    if(!tableBody || !totalSpan) return;

    try {
        // Buscar todas alocações manuais do allDateShiftData
        const allDateShiftData = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
        let manualAllocations = [];
        
        console.log(' [DEBUG] Carregando alocações manuais...');
        console.log(' [DEBUG] allDateShiftData:', allDateShiftData);
        
        Object.keys(allDateShiftData).forEach(date => {
            Object.keys(allDateShiftData[date]).forEach(shift => {
                const shiftData = allDateShiftData[date][shift];
                console.log(` [DEBUG] Processando ${date} - ${shift}:`, shiftData);
                
                // Verificar se é um array ou objeto
                if (Array.isArray(shiftData)) {
                    // Se for array, iterar diretamente
                    shiftData.forEach(record => {
                        if(record && record.tipo === 'manual_allocation') {
                            console.log(' [DEBUG] Alocação manual encontrada:', record);
                            manualAllocations.push(record);
                        }
                    });
                } else if (shiftData && typeof shiftData === 'object') {
                    // Se for objeto, iterar pelas chaves
                    Object.keys(shiftData).forEach(recordKey => {
                        const record = shiftData[recordKey];
                        if(record && record.tipo === 'manual_allocation') {
                            console.log(' [DEBUG] Alocação manual encontrada (objeto):', record);
                            manualAllocations.push(record);
                        }
                    });
                }
            });
        });
        
        console.log(' [DEBUG] Total de alocações manuais encontradas:', manualAllocations.length);

        // Ordenar por data e depois por turno
        manualAllocations.sort((a, b) => {
            if(a.dataAlocacao !== b.dataAlocacao) {
                return new Date(a.dataAlocacao) - new Date(b.dataAlocacao);
            }
            const shiftOrder = { 'manhã': 1, 'tarde': 2, 'noite': 3 };
            return (shiftOrder[a.periodo] || 4) - (shiftOrder[b.periodo] || 4);
        });

        totalSpan.textContent = manualAllocations.length;

        if(manualAllocations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted py-4">
                        <i class="bi bi-info-circle me-2"></i>
                        Nenhuma alocação manual encontrada
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = manualAllocations.map(allocation => {
            // Formatar sala completa: "Bloco Sala Número"
            const bloco = allocation.bloco || '';
            const sala = allocation.sala || '';
            const numero = allocation.numero || '';
            
            let salaCompleta;
            if (bloco && sala && numero) {
                salaCompleta = `${bloco} ${sala} ${numero}`;
            } else if (bloco && sala) {
                salaCompleta = `${bloco} ${sala}`;
            } else {
                salaCompleta = sala || '-';
            }
            
            return `
            <tr>
                <td>${formatDate(allocation.dataAlocacao)}</td>
                <td><span class="badge bg-${getShiftColor(allocation.periodo)}">${capitalizeFirst(allocation.periodo)}</span></td>
                <td>${salaCompleta}</td>
                <td><span class="badge bg-secondary">${allocation.bloco || '-'}</span></td>
                <td>${allocation.numero || '-'}</td>
                <td>${allocation.professor || '-'}</td>
                <td>${allocation.curso || '-'}</td>
                <td>${allocation.observacoes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteManualAllocation('${allocation.id}', '${allocation.dataAlocacao}', '${allocation.periodo}')" title="Excluir alocação">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch(error) {
        console.error('Erro ao carregar alocações manuais:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Erro ao carregar alocações manuais
                </td>
            </tr>
        `;
    }
}

// Função para deletar uma alocação manual
function deleteManualAllocation(allocationId, dataAlocacao, periodo) {
    if(!confirm('Tem certeza que deseja excluir esta alocação manual?')) {
        return;
    }

    try {
        // Atualizar a variável global dataByDateAndShift
        dataByDateAndShift = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
        
        console.log(' [DEBUG] Excluindo alocação:', allocationId, 'de', dataAlocacao, periodo);
        console.log(' [DEBUG] Dados antes da exclusão:', dataByDateAndShift[dataAlocacao]?.[periodo]);
        
        if (dataByDateAndShift[dataAlocacao] && dataByDateAndShift[dataAlocacao][periodo]) {
            const shiftData = dataByDateAndShift[dataAlocacao][periodo];
            
            // Verificar se é um array ou objeto
            if (Array.isArray(shiftData)) {
                // Se for array, filtrar diretamente
                dataByDateAndShift[dataAlocacao][periodo] = shiftData.filter(record => record.id !== allocationId);
            } else if (typeof shiftData === 'object') {
                // Se for objeto, iterar e remover pela chave
                Object.keys(shiftData).forEach(key => {
                    if (shiftData[key] && shiftData[key].id === allocationId) {
                        delete shiftData[key];
                    }
                });
            }
            
            console.log(' [DEBUG] Dados após exclusão:', dataByDateAndShift[dataAlocacao][periodo]);
            
            // Salvar na estrutura global e localStorage
            localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
            localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
            
            // Sincronizar com o Firebase
            const updatedShiftData = dataByDateAndShift[dataAlocacao][periodo];
            console.log(' [ALOCAÇÃO MANUAL] Sincronizando exclusão com Firebase...');
            console.log(' [DEBUG] Dados para sincronizar:', updatedShiftData);
            
            if(typeof saveDataToFirebase === 'function') {
                // Converter objeto para array se necessário
                let dataToSync = updatedShiftData;
                if (!Array.isArray(updatedShiftData) && typeof updatedShiftData === 'object') {
                    dataToSync = Object.values(updatedShiftData).filter(item => item != null);
                }
                
                saveDataToFirebase(dataAlocacao, periodo, dataToSync).then(() => {
                    console.log(' [ALOCAÇÃO MANUAL] Exclusão sincronizada com Firebase com sucesso!');
                }).catch(error => {
                    console.error(' [ALOCAÇÃO MANUAL] Erro ao sincronizar exclusão no Firebase:', error);
                    showNotification('Alocação excluída localmente, mas houve erro na sincronização com o servidor.', 'warning');
                });
            } else {
                console.warn(' [ALOCAÇÃO MANUAL] Função saveDataToFirebase não disponível - exclusão apenas local');
            }
            
            // Se for a data atual sendo visualizada, atualizar a tabela principal
            if (dataAlocacao === selectedDate) {
                renderTable();
            }
        }
        
        // Recarregar a tabela de alocações manuais
        loadManualAllocationsTable();
        showNotification('Alocação manual excluída com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao excluir alocação manual:', error);
        showNotification('Erro ao excluir alocação manual.', 'error');
    }
}

function getShiftColor(shift) {
    const colors = {
        'manhã': 'warning',
        'tarde': 'info', 
        'noite': 'dark'
    };
    return colors[shift] || 'secondary';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Função para obter texto dos turnos disponíveis
function getAvailableShiftsText(currentShift) {
    const allShifts = ['manhã', 'tarde', 'noite'];
    const shiftOrder = { 'manhã': 1, 'tarde': 2, 'noite': 3 };
    const currentOrder = shiftOrder[currentShift];
    
    const availableShifts = allShifts.filter(shift => shiftOrder[shift] >= currentOrder);
    
    if (availableShifts.length === 0) {
        return 'nenhum (todos os turnos já passaram)';
    }
    
    return availableShifts.join(', ');
}

// Função que exibe o modal de alocação manual
function openManualAllocationModal() {
    document.getElementById('manualAllocationModal').style.display = 'flex';
    // Inicializar os dropdowns quando o modal abre
    populateManualBlockDropdown();
    setupManualDropdownInteractions();
}

// Função para configurar as interações dos dropdowns do modal manual
function setupManualDropdownInteractions() {
    // Dropdown de blocos
    const blockDropdown = document.querySelector('#manual-block-dropdown .selected');
    const blockOptions = document.querySelector('#manual-block-dropdown .options');
    
    if(blockDropdown && blockOptions) {
        blockDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            blockOptions.classList.toggle('show');
        });
    }
    
    // Dropdown de salas
    const roomDropdown = document.querySelector('#manual-room-dropdown .selected');
    const roomOptions = document.querySelector('#manual-room-dropdown .options');
    
    if(roomDropdown && roomOptions) {
        roomDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            roomOptions.classList.toggle('show');
        });
    }
    
    // Dropdown de números de sala
    const roomNumberDropdown = document.querySelector('#manual-room-number-dropdown .selected');
    const roomNumberOptions = document.querySelector('#manual-room-number-dropdown .options');
    
    if(roomNumberDropdown && roomNumberOptions) {
        roomNumberDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            roomNumberOptions.classList.toggle('show');
        });
    }

    
    
    // Fechar dropdowns quando clicar fora
    document.addEventListener('click', function() {
        document.querySelectorAll('#manualAllocationModal .selected').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('#manualAllocationModal .options').forEach(options => {
            options.classList.remove('show');
        });
    });
}

// Função que oculta e limpa o modal de alocação manual
function closeManualAllocationModal() {
    document.getElementById('manualAllocationModal').style.display = 'none';
    document.getElementById('manualAllocationDate').value = '';
    document.getElementById('manualAllocationShift').value = '';
    
    // Resetar dropdowns
    document.getElementById('manualValueBlock').textContent = 'Selecione o bloco';
    document.getElementById('manualValueRoom').textContent = 'Selecione a sala';
    document.getElementById('manualValueRoomNumber').textContent = 'Selecione o número da sala';
    
    // Ocultar dropdowns dependentes
    document.getElementById('manual-room-dropdown').classList.add('hidden');
    document.getElementById('manual-room-number-dropdown').classList.add('invisible');
    
    // Limpar campos opcionais
    document.getElementById('manualProfessorName').value = '';
    document.getElementById('manualObservations').value = '';
    document.getElementById('manualCourseName').value = '';

    showDefaultOptions();
    document.getElementById('register-teacher-option').style.display = 'flex';
    document.getElementById('register-room-option').style.display = 'flex';
    document.getElementById('shiftTabs').classList.remove('disabled');
    
    // Resetar seleções
    manualCurrentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
}

// Função para o processamento da alocação manual
async function handleManualAllocation() {
    const dataInput = document.getElementById('manualAllocationDate');
    const turnoInput = document.getElementById('manualAllocationShift');
    const professorInput = document.getElementById('manualProfessorName');
    const cursoInput = document.getElementById('manualCourseName');
    const observacoesInput = document.getElementById('manualObservations');

    if(!dataInput || !turnoInput) {
        console.error('Required form elements not found');
        return;
    }

    const dataAlocacao = dataInput.value.trim();
    const turno = turnoInput.value.toLowerCase().trim();
    const sala = manualCurrentSelections.room;
    const bloco = manualCurrentSelections.block;
    const numero = manualCurrentSelections.roomNumber || '';
    const professor = professorInput ? professorInput.value.trim() : '';
    const curso = cursoInput ? cursoInput.value.trim() : '';
    const observacoes = observacoesInput ? observacoesInput.value.trim() : '';

    // Validação dos campos obrigatórios
    if(!dataAlocacao || dataAlocacao === '') {
        showNotification('Data da alocação é obrigatória.', 'warning');
        return;
    }
    
    if(!turno || turno === '') {
        showNotification('Turno é obrigatório.', 'warning');
        return;
    }
    
    if(!bloco || bloco === '') {
        showNotification('Bloco é obrigatório.', 'warning');
        return;
    }
    
    if(!sala || sala === '') {
        showNotification('Sala é obrigatória.', 'warning');
        return;
    }
    
    // Validação da data e turno
    const today = new Date();
    
    // Criar data selecionada de forma mais robusta para evitar problemas de fuso horário
    // O campo de data HTML retorna "YYYY-MM-DD", vamos criar a data localmente
    const dateParts = dataAlocacao.split('-');
    const selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    // Resetar as horas para comparar apenas as datas
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Debug: verificar os valores das datas
    console.log('� [DEBUG] Data string recebida:', dataAlocacao);
    console.log('� [DEBUG] Data de hoje:', today.toLocaleDateString('pt-BR'));
    console.log('� [DEBUG] Data selecionada:', selectedDate.toLocaleDateString('pt-BR'));
    console.log('� [DEBUG] Comparação selectedDate < today:', selectedDate < today);
    
    // Não permitir alocações em datas anteriores à hoje
    if(selectedDate < today) {
        showNotification('Não é possível fazer alocações para datas anteriores à hoje.', 'warning');
        return;
    }
    
    // Se for a data atual, verificar se o turno é válido (atual ou posterior)
    if(selectedDate.getTime() === today.getTime()) {
        const currentShift = getCurrentShiftByTime();
        const shiftOrder = { 'manhã': 1, 'tarde': 2, 'noite': 3 };
        const currentShiftOrder = shiftOrder[currentShift];
        const selectedShiftOrder = shiftOrder[turno];
        
        if(selectedShiftOrder < currentShiftOrder) {
            showNotification(`Para hoje, você só pode alocar para o turno atual (${currentShift}) ou turnos posteriores. Turnos disponíveis: ${getAvailableShiftsText(currentShift)}.`, 'warning');
            return;
        }
    }
    
    // Para datas futuras, qualquer turno é permitido
    
    // Validação do turno
    const turnosValidos = ['manhã', 'tarde', 'noite'];
    if(!turnosValidos.includes(turno)) {
        showNotification('Turno inválido. Selecione Manhã, Tarde ou Noite.', 'warning');
        return;
    }
    
    // Validação do tamanho dos campos
    if(sala && sala.length > 50) {
        showNotification('Nome da sala não pode ter mais de 50 caracteres.', 'warning');
        return;
    }
    
    // Removida validação de 1 caractere para bloco pois agora usa dropdown com dados existentes
    
    if(numero && numero.length > 10) {
        showNotification('Número da sala não pode ter mais de 10 caracteres.', 'warning');
        return;
    }
    
    if(professor && professor.length > 100) {
        showNotification('Nome do professor não pode ter mais de 100 caracteres.', 'warning');
        return;
    }
    
    if(curso && curso.length > 100) {
        showNotification('Nome do curso não pode ter mais de 100 caracteres.', 'warning');
        return;
    }
    
    if(observacoes && observacoes.length > 200) {
        showNotification('Observações não podem ter mais de 200 caracteres.', 'warning');
        return;
    }
    
    // Cria um objeto de alocação manual no mesmo formato dos registros normais
    const manualAllocation = {
        id: generateUniqueRecordId(), // Usar função específica para registros
        
        // Campos principais para compatibilidade com o sistema
        sala: sala,
        professor: professor || 'Alocação Manual',
        curso: curso || 'Alocação Manual',
        disciplina: observacoes || 'Alocação manual de sala',
        turma: '-',
        horaRetirada: null, // Não há horário de retirada ainda - será preenchido quando o professor retirar
        horaDevolucao: null,
        status: 'disponivel', // Status disponível para que o professor possa "retirar" a chave
        
        // Campos adicionais para o formato admin (compatibilidade dupla)
        room: sala,
        professorName: professor || 'Alocação Manual',
        course: curso || 'Alocação Manual',
        subject: observacoes || 'Alocação manual de sala',
        turmaNumber: '-',
        withdrawalTime: null, // Não há horário de retirada ainda
        returnTime: null,
        
        // Campos específicos de alocação manual
        bloco: bloco,
        numero: numero,
        tipo: 'manual_allocation',
        dataAlocacao: dataAlocacao,
        periodo: turno,
        motivo: observacoes || 'Alocação manual de sala',
        observacoes: observacoes || 'Alocação manual de sala',
        dataRegistro: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    console.log(' [DEBUG] Alocação manual criada com ID:', manualAllocation.id, 'para sala:', manualAllocation.sala);
    
    // Integrar com o sistema principal de dados por data/turno
    try {
        // Obter dados existentes por data e turno do localStorage
        try {
            dataByDateAndShift = JSON.parse(localStorage.getItem('allDateShiftData') || '{}');
        } catch (e) {
            console.warn('Erro ao ler allDateShiftData, criando novo objeto:', e);
            dataByDateAndShift = {};
        }
        
        // Garantir que a estrutura da data existe
        if (!dataByDateAndShift[dataAlocacao]) {
            dataByDateAndShift[dataAlocacao] = {};
        }
        
        // IMPORTANTE: Buscar dados do Firebase antes de adicionar a nova alocação
        // Isso garante que não sobrescreveremos alocações existentes que ainda não foram sincronizadas para o localStorage
        console.log(' [ALOCAÇÃO MANUAL] Verificando dados existentes no Firebase...');
        
        // Verificar se já existem dados no localStorage para esta data/turno
        const hasLocalData = dataByDateAndShift[dataAlocacao][turno] && Array.isArray(dataByDateAndShift[dataAlocacao][turno]) && dataByDateAndShift[dataAlocacao][turno].length > 0;
        
        if (hasLocalData) {
            console.log(` [ALOCAÇÃO MANUAL] Dados locais encontrados (${dataByDateAndShift[dataAlocacao][turno].length} registros). Adicionando nova alocação...`);
            // Se já temos dados locais, assumimos que estão sincronizados
            dataByDateAndShift[dataAlocacao][turno].push(manualAllocation);
        } else {
            console.log(' [ALOCAÇÃO MANUAL] Sem dados locais. Buscando dados do Firebase...');
            
            // Tentar buscar dados do Firebase antes de criar um array vazio
            if (typeof loadDataFromFirebase === 'function') {
                try {
                    const firebaseData = await loadDataFromFirebase(dataAlocacao, turno);
                    console.log(` [ALOCAÇÃO MANUAL] Dados do Firebase carregados: ${firebaseData ? firebaseData.length : 0} registros`);
                    
                    // Se o Firebase retornou dados, usar esses dados como base
                    if (firebaseData && Array.isArray(firebaseData) && firebaseData.length > 0) {
                        console.log(` [ALOCAÇÃO MANUAL] Usando ${firebaseData.length} registros existentes do Firebase`);
                        dataByDateAndShift[dataAlocacao][turno] = [...firebaseData];
                        dataByDateAndShift[dataAlocacao][turno].push(manualAllocation);
                    } else {
                        // Firebase não tem dados, criar array com apenas a nova alocação
                        console.log(' [ALOCAÇÃO MANUAL] Firebase sem dados. Criando novo array com a alocação.');
                        dataByDateAndShift[dataAlocacao][turno] = [manualAllocation];
                    }
                } catch (error) {
                    console.warn(' [ALOCAÇÃO MANUAL] Erro ao buscar dados do Firebase:', error);
                    // Em caso de erro, criar array com apenas a nova alocação
                    dataByDateAndShift[dataAlocacao][turno] = [manualAllocation];
                }
            } else {
                // Se a função de carregar do Firebase não está disponível, criar array com a nova alocação
                console.log(' [ALOCAÇÃO MANUAL] loadDataFromFirebase não disponível. Inicializando array com a nova alocação...');
                dataByDateAndShift[dataAlocacao][turno] = [manualAllocation];
            }
        }
        
        // Salvar no localStorage principal
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
        
        console.log(' [ALOCAÇÃO MANUAL] Dados salvos na estrutura principal:');
        console.log('   - Data:', dataAlocacao);
        console.log('   - Turno:', turno);
        console.log('   - Total de registros no turno:', dataByDateAndShift[dataAlocacao][turno].length);
        console.log('   - Alocação adicionada:', manualAllocation);
        
        // Salvar no Firebase se disponível
        if(typeof saveDataToFirebase === 'function') {
            console.log(' [ALOCAÇÃO MANUAL]: Salvando no Firebase...');
            saveDataToFirebase(dataAlocacao, turno, dataByDateAndShift[dataAlocacao][turno]).then(() => {
                console.log(' [ALOCAÇÃO MANUAL]: Dados salvos no Firebase com sucesso!');
            }).catch(error => {
                console.error(' [ALOCAÇÃO MANUAL]: Erro ao salvar no Firebase:', error);
            });
        }
        
        // Disparar evento para atualizar outras interfaces
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
            detail: { 
                shift: turno, 
                data: dataByDateAndShift 
            } 
        }));
        
        closeManualAllocationModal();
        showNotification(`Alocação manual registrada com sucesso para ${formatDate(dataAlocacao)} - ${capitalizeFirst(turno)}!`, 'success');
        
        // Se a alocação foi feita para a data atual sendo visualizada, atualizar a tabela
        if (dataAlocacao === selectedDate) {
            console.log(' [ALOCAÇÃO MANUAL] Atualizando tabela pois a alocação foi feita para a data atual');
            renderTable();
        } else {
            console.log('� [ALOCAÇÃO MANUAL] Alocação feita para data diferente da atual. Visualize a data', dataAlocacao, 'para ver a alocação');
        }
        
        console.log(' Alocação Manual Integrada:', manualAllocation);
        
    } catch (error) {
        console.error('Erro ao salvar alocação manual:', error);
        showNotification('Erro ao salvar alocação manual. Tente novamente.', 'error');
    }
}