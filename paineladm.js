// Variáveis globais
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

// let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
let teacherModalActive = false;
// let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD 
let selectedDate = "2025-08-31";
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
    
    console.log('📁 Iniciando importação de arquivo:', file.name);
    
    // Mostrar modal de seleção de turno
    selectedFileForImport = file;
    
    const modalElement = document.getElementById('shiftSelectionModal');
    if (!modalElement) {
        console.error('❌ Modal shiftSelectionModal não encontrado!');
        return;
    }
    
    // Verificar se já existe uma instância do modal e destruí-la
    const existingModal = bootstrap.Modal.getInstance(modalElement);
    if (existingModal) {
        console.log('🔄 Removendo instância anterior do modal');
        existingModal.dispose();
    }
    
    // Criar nova instância e mostrar
    console.log('✨ Criando nova instância do modal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    console.log('📱 Modal exibido');
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
                            console.warn('⚠️ Registro sem disciplina:', item);
                        } else {
                            console.log('✅ Disciplina encontrada:', { subject: item.subject, disciplina: item.disciplina });
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
                    console.log('🔥 Salvando dados importados no Firebase...');
                    saveDataToFirebase(selectedDate, selectedShift, sortedData).then(() => {
                        console.log('✅ Dados importados salvos no Firebase com sucesso!');
                    }).catch(error => {
                        console.error('❌ Erro ao salvar dados importados no Firebase:', error);
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
                    console.log('📊 Detectadas células mescladas:', firstSheet['!merges']);
                    
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
                            console.log(`🔗 Propagando valor "${firstCellValue}" da célula mesclada ${firstCellRef}`);
                            
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
                            console.log(`❌ Linha ${dataRows.indexOf(row) + 1} filtrada (sem conteúdo):`, row);
                        } else if (hasContent && dataRows.indexOf(row) < 5) {
                            console.log(`✅ Linha ${dataRows.indexOf(row) + 1} aprovada:`, row);
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
                console.log('🔍 ANÁLISE DETALHADA DA ESTRUTURA:');
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
                console.log('📋 Processando dados para preencher campos de células mescladas...');
                for (let i = 1; i < mappedData.length; i++) {
                    const currentRow = mappedData[i];
                    const previousRow = mappedData[i - 1];
                    
                    // Para cada campo, se estiver vazio, tentar usar o valor da linha anterior
                    Object.keys(currentRow).forEach(key => {
                        if (key !== '_rowIndex' && (!currentRow[key] || currentRow[key] === '')) {
                            if (previousRow[key] && previousRow[key] !== '') {
                                currentRow[key] = previousRow[key];
                                if (i < 3) console.log(`🔗 Preenchendo campo vazio "${key}" com valor "${previousRow[key]}" da linha anterior`);
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
                                console.log(`🔍 [Registro ${index + 1}] Procurando coluna para padrões: ${patterns.join(', ')}`);
                                console.log(`🔍 [Registro ${index + 1}] Excluir padrões: ${excludePatterns.join(', ')}`);
                                console.log(`🔍 [Registro ${index + 1}] Objeto disponível:`, obj);
                                console.log(`🔍 [Registro ${index + 1}] Chaves disponíveis:`, Object.keys(obj));
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
                                        if (index === 0) console.log(`  ❌ Excluindo coluna "${key}" (contém: ${excludePatterns.join(', ')})`);
                                        continue;
                                    }
                                    
                                    // Busca exata primeiro
                                    if (keyUpper === patternUpper) {
                                        const value = obj[key];
                                        if (value && String(value).trim() !== '') {
                                            if (index === 0) console.log(`  ✅ Encontrado por correspondência exata: "${key}" = "${value}"`);
                                            return String(value).trim();
                                        }
                                    }
                                    
                                    // Busca por inclusão
                                    if (keyUpper.includes(patternUpper)) {
                                        const value = obj[key];
                                        if (value && String(value).trim() !== '') {
                                            if (index === 0) console.log(`  ✅ Encontrado por inclusão: "${key}" = "${value}"`);
                                            return String(value).trim();
                                        }
                                    }
                                }
                            }
                            if (index === 0) console.log(`  ❌ Nenhuma coluna encontrada para: ${patterns.join(', ')}`);
                            
                            // Debug extra: se for sala e não encontrou nada, mostrar todas as colunas
                            if (index === 0 && patterns.includes('SALA')) {
                                console.log('🚨 SALA NÃO ENCONTRADA! Analisando todas as colunas disponíveis:');
                                Object.keys(obj).forEach((key, idx) => {
                                    const value = obj[key];
                                    const hasContent = value && String(value).trim() !== '';
                                    console.log(`  ${idx}: "${key}" = "${value}" ${hasContent ? '✅' : '❌'}`);
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
                            console.log(`🎯 VALORES ENCONTRADOS ${index + 1}:`, {
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
                                console.log('🔍 Procurando disciplina manualmente - TODAS as colunas disponíveis:');
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
                                            if (index === 0) console.log(`📍 Disciplina encontrada por eliminação na coluna "${key}": "${disciplinaFinal}"`);
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
                                                if (index === 0) console.log(`📍 Disciplina encontrada por tentativa na coluna "${key}": "${disciplinaFinal}"`);
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
                                console.log('🔍 Debug disciplina vazia - verificando todas as colunas:');
                                Object.keys(obj).forEach((key, idx) => {
                                    const keyUpper = key.toUpperCase();
                                    const isDisciplinaCol = keyUpper.includes('DISCIPLINA') || keyUpper.includes('MATERIA') || keyUpper.includes('MATÉRIA');
                                    console.log(`  Coluna ${idx} "${key}": "${obj[key]}" ${isDisciplinaCol ? '← POSSÍVEL DISCIPLINA' : ''}`);
                                });
                            } else if (disciplinaFinal === professor) {
                                console.warn('⚠️ Disciplina igual ao professor:', {
                                    disciplina: disciplinaFinal,
                                    professor: professor
                                });
                            } else if (disciplinaFinal === curso) {
                                console.warn('⚠️ Disciplina igual ao curso:', {
                                    disciplina: disciplinaFinal,
                                    curso: curso
                                });
                            } else {
                                console.log('✅ Disciplina válida encontrada:', disciplinaFinal);
                            }
                        }

                        // Debug: mostrar todos os valores de sala para entender o problema
                        if (index < 5) {
                            console.log(`🔍 Debug Sala ${index + 1}:`, {
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
                            if (index < 5) console.log(`❌ Registro ${index + 1} rejeitado por sala inválida: "${sala}" (string: "${salaStr}")`);
                            return null;
                        }

                        if (index < 5) console.log(`✅ Registro ${index + 1} aprovado com sala: "${sala}" (string: "${salaStr}")`);

                        // Validar disciplina: evitar confusão com curso, professor, etc.
                        if (disciplinaFinal) {
                            // Se disciplina for igual ao curso, procurar a verdadeira disciplina
                            if (disciplinaFinal === curso) {
                                console.warn(`⚠️ Disciplina "${disciplinaFinal}" é igual ao curso, procurando disciplina real...`);
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
                                            console.log(`🔧 Disciplina corrigida: "${disciplinaFinal}" (encontrada na coluna "${key}")`);
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            // Se ainda for igual ao professor, procurar alternativa
                            if (disciplinaFinal === professor) {
                                console.warn(`⚠️ Disciplina "${disciplinaFinal}" é igual ao professor, procurando disciplina real...`);
                                disciplinaFinal = '';
                                
                                for (let key in obj) {
                                    const value = obj[key];
                                    if (value && String(value).trim() !== '' && 
                                        value !== professor && value !== sala && value !== curso && value !== turma) {
                                        const valorTrim = String(value).trim();
                                        // Verificar se parece com disciplina (não é número, não é sala)
                                        if (!valorTrim.match(/^(SALA|A\d+|B\d+|C\d+|\d+)$/i) && valorTrim.length > 2) {
                                            disciplinaFinal = valorTrim;
                                            console.log(`🔧 Disciplina corrigida: "${disciplinaFinal}" (encontrada na coluna "${key}")`);
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

                console.log(`📊 RESUMO DO PROCESSAMENTO:`);
                console.log(`- Linhas brutas após cabeçalho: ${dataRows.length}`);
                console.log(`- Linhas válidas mapeadas: ${mappedData.length}`);
                console.log(`- Registros formatados: ${formattedData.length}`);
                console.log(`- Registros rejeitados: ${mappedData.length - formattedData.length}`);
                
                if (formattedData.length === 0) {
                    console.error('🚨 ERRO: Nenhum registro válido encontrado!');
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
    
    console.log('📊 [ADMIN] updateTable executada - tabela renderizada');
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

// Função para carregar dados salvos
function loadSavedData() {
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
            console.log('🎯 Botão de confirmar importação clicado');
            
            const checkedInput = document.querySelector('input[name="importShift"]:checked');
            if (!checkedInput) {
                console.warn('⚠️ Nenhum turno selecionado');
                return;
            }
            
            const selectedShift = checkedInput.value;
            console.log('📅 Turno selecionado:', selectedShift);
            
            const modalElement = document.getElementById('shiftSelectionModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    console.log('🚪 Fechando modal');
                    modal.hide();
                }
            }
            
            if (selectedFileForImport) {
                console.log('📁 Processando arquivo:', selectedFileForImport.name);
                await processFileImport(selectedFileForImport, selectedShift);
                selectedFileForImport = null;
                
                // Limpar o input de arquivo para permitir nova importação
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = '';
                    console.log('🧹 Input de arquivo limpo');
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

// Cadastrar novos professores
// Função para abrir o modal de cadastro de professor
function openRegisterTeacherModal() {
    document.getElementById('registerTeacherModal').style.display = 'flex';
}

function closeRegisterTeacherModal() {
    document.getElementById('registerTeacherModal').style.display = 'none';
    // limpar os campos
    document.getElementById('tpFast').value = '';
    document.getElementById('tpFullName').value = '';
}

// Faz o que for digitado no campo de fast ser convertido para UPPERCASE automáticamente
const inputFast = document.getElementById("tpFast");

if (inputFast) {
    inputFast.addEventListener("input", () => {
        inputFast.value = inputFast.value.toUpperCase();
    });
}

// Função para salvar novo professor
function saveNewTeacher() {
    const name = document.getElementById('tpFullName').value.trim();
    const fast = document.getElementById('tpFast').value.trim();

    if(!name || !fast) {
        showNotification('Preencha todos os campos obrigatórios!', 'warning');
        return;
    }

    // Verifica se o professor já existe no mapeamento
    const currentMapping = JSON.parse(localStorage.getItem('docentesCodprof') || '{}');

    if(currentMapping[name]) {
        showNotification(`O professor "${name}" já está cadastrado no sistema.`, 'warning');
        return;
    }

    // Verifica se o FAST já está sendo usado por outro professor
    for(const [existingName, existingFast] of Object.entries(currentMapping)) {
        if(existingFast === fast.toUpperCase()) {
            showNotification(`O FATS <strong>"${fast}"</strong> já está sendo usado pelo professor: <strong>${existingName}</strong>.`, 'warning');
            return;
        }
    }

    // Adiciona o professor APENAS ao mapeamento docentesCodprof (não na tabela)
    try {
        if(typeof window.addNewProfessorToTeacherPanel !== 'function') {
            const success = window.addNewProfessorToTeacherPanel(name, fast);
            if(success) {
                showMensageConfirmationModal(name, fast);
            } else {
                showNotification('Erro ao cadastrar professor. Verifique se os dados estão corretos.', 'warning');
                return;
            }
        } else {
            // Se a função não estiver disponível, adiciona diretamente ao localStorage
            showMensageConfirmationModal();
        }
    } catch (error) {
        showNotification('Erro ao cadastrar professor. Tente novamente.', 'danger');
        return;
    }

    // Limpar campos e fechar modal
    closeRegisterTeacherModal();
}

function initializeAll() {
    // Inicializar mapeamento de professores se não existir
    if (!localStorage.getItem('docentesCodprof')) {
        console.log('📝 Inicializando mapeamento docentesCodprof no localStorage...');
        localStorage.setItem('docentesCodprof', JSON.stringify({}));
    }
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

    console.log('📊 Dados capturados para sincronização:', {
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
        console.log(`🔄 Atualizando registro ${recordId} com:`, updatedFields);
        
        // Encontrar e atualizar o registro nos dados por data e turno
        let recordFound = false;
        
        for(const date in dataByDateAndShift) {
            for(const shift in dataByDateAndShift[date]) {
                const records = dataByDateAndShift[date][shift];
                
                console.log(`🔍 Verificando ${date}/${shift}:`, {
                    recordsType: typeof records,
                    isArray: Array.isArray(records),
                    records: records
                });
                
                // Verificar se records é um array
                if (!Array.isArray(records)) {
                    console.warn(`⚠️ records não é um array em ${date}/${shift}:`, records);
                    continue;
                }
                
                const recordIndex = records.findIndex(record => record && record.id === recordId);
                
                if (recordIndex !== -1) {
                    // Atualizar o registro com os novos dados
                    Object.assign(records[recordIndex], updatedFields);
                    
                    // Adicionar timestamp de última edição
                    records[recordIndex].lastEdited = new Date().toISOString();
                    records[recordIndex].editedBy = 'admin';
                    
                    console.log(`✅ Registro atualizado:`, records[recordIndex]);
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
                        console.log('🔍 [ADMIN] Edição de registro - Dados antes de enviar ao Firebase:');
                        console.log('🔍 [ADMIN] - date:', date);
                        console.log('🔍 [ADMIN] - shift:', shift);
                        console.log('🔍 [ADMIN] - records length:', records.length);
                        
                        // Validar se há dados para salvar
                        if (records && Array.isArray(records) && records.length > 0) {
                            saveDataToFirebase(date, shift, records)
                                .then(() => {
                                    console.log(`✅ [ADMIN] Dados sincronizados no Firebase para ${date}/${shift}`);
                                })
                                .catch(error => {
                                    console.error('❌ [ADMIN] Erro ao sincronizar no Firebase:', error);
                                });
                        } else {
                            console.warn('⚠️ [ADMIN] Dados vazios ou inválidos - não sincronizando no Firebase');
                            console.warn('⚠️ [ADMIN] - records:', records);
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
            console.log('🔍 Tentando encontrar na estrutura legacy allShiftData...');
            
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
                                
                                console.log(`✅ Registro atualizado na estrutura legacy:`, shiftRecords[recordIndex]);
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
                    console.error('❌ Erro ao processar allShiftData:', error);
                }
            }
        }
        
        if (!recordFound) {
            console.warn(`⚠️ Registro com ID ${recordId} não encontrado em nenhuma estrutura`);
        }
        
        return recordFound;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dados compartilhados:', error);
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
                    console.log('🔍 [ADMIN] Exclusão de registro - Dados antes de enviar ao Firebase:');
                    console.log('🔍 [ADMIN] - date:', date);
                    console.log('🔍 [ADMIN] - shift:', shift);
                    console.log('🔍 [ADMIN] - records length:', records.length);
                    
                    // Validar se há dados para salvar
                    if (records && Array.isArray(records) && records.length > 0) {
                        saveDataToFirebase(date, shift, records).catch(error => {
                            console.error('❌ [ADMIN] Erro ao sincronizar exclusão no Firebase:', error);
                        });
                    } else {
                        console.warn('⚠️ [ADMIN] Dados vazios ou inválidos - não sincronizando exclusão no Firebase');
                        console.warn('⚠️ [ADMIN] - records:', records);
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

// Formatação de data (AAAA-MM-DD <para> DD/MM/AAAA)
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Constants and Configuration
const STORAGE_KEYS = {
    TEACHERS: "docentesCodprof"
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
    const room = record.room || record.sala || '-';
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
    const newFats = fatsInput.value.trim();
    const originalName = nameInput.getAttribute('data-original');

    // Valida as entradas
    if(!newName) {
        alert('Nome do professor não pode estar vazio.');
        nameInput.focus();
        return false;
    }

    if(!newFats) {
        alert('FATS não pode estar vazio.');
        fatsInput.focus();
        return false;
    }

    // Valida se o nome inserido já existe
    if(newName !== originalName && teacherManagerState.teachers[newName]) {
        alert('Já existe um professor com este nome.');
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
        alert('Erro ao salvar professor. Tente novamente!');
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

// Função para exibir a tabela de professores
function showTeacherTable() {
    const tableContainer = document.getElementById('teachersTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'block';
    tableContainer.classList.remove('d-none');

    document.getElementById('shiftContent').style.display = 'none';
    document.getElementById('showTeacherBtn').style.display = 'none';
    document.getElementById('import-files-btn').style.display = 'none';
    document.getElementById('register-room-option').style.display = 'none';
    document.getElementById('show-data-dropdown').style.display = 'none';
    document.getElementById('goBackToKeysTable').style.display = 'flex';
    document.getElementById('dateSelector').classList.add('disabled');
    document.getElementById('shiftTabs').classList.add('disabled');

    teacherManagerState.isActive = true;
}

// Função para ocultar a tabela de professores
function hideTeacherTable() {
    const tableContainer = document.getElementById('teachersTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'none';
    tableContainer.classList.add('d-none');
    
    document.getElementById('shiftContent').style.display = 'block';
    document.getElementById('showTeacherBtn').style.display = 'block';
    document.getElementById('import-files-btn').style.display = 'block';
    document.getElementById('register-room-option').style.display = 'flex';
    document.getElementById('show-data-dropdown').style.display = 'flex';
    document.getElementById('goBackToKeysTable').style.display = 'none';
    document.getElementById('dateSelector').classList.remove('disabled');
    document.getElementById('shiftTabs').classList.remove('disabled');
    
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
    return data ? JSON.parse(data) : {};
}

// Generate unique ID for new room
function generateRoomId() {
    const rooms = getRooms();
    const maxId = rooms.length > 0 ? Math.max(...rooms.map(room => room.id)) : 0;
    return maxId + 1;
}

// Cria a linha da sala no modo padrão de exibição
function createRoomRow(room) {
    return `
        <tr data-room-id="${room.id}">
            <td class="room-sala">${room.sala}</td>
            <td class="room-bloco">
                <p class="bg-secondary-subtle m-0" style="width: fit-content; padding: 1px 12px; border-radius: 6px">
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

    const roomExists = registredRooms.some(room => 
        room.sala.toLowerCase().trim() === sala.toLowerCase() &&
        room.bloco.toLowerCase().trim() === bloco.toLowerCase() &&
        room.numero.toLowerCase().trim() === (numero || '').toLowerCase()
    );
    
    if(roomExists) {
        showNotification('Essa sala já foi cadastrada.', 'warning');
        return;
    }
    
    // Cria um objeto da nova sala
    const newRoom = {
        id: generateRoomId(),
        sala: sala,
        bloco: bloco,
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
                    value="${room.numero || '-'}" 
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

// Vou otimizar!!!
// Função para exibir a tabela de salas
function showRoomsTable() {
    const tableContainer = document.getElementById('roomsTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'block';
    tableContainer.classList.remove('d-none');


    document.getElementById('shiftContent').style.display = 'none';
    document.getElementById('showTeacherBtn').style.display = 'none';
    document.getElementById('import-files-btn').style.display = 'none';
    document.getElementById('register-teacher-option').style.display = 'none';
    document.getElementById('show-data-dropdown').style.display = 'none';
    document.getElementById('goBackToKeysTable').style.display = 'flex';
    document.getElementById('dateSelector').classList.add('disabled');
    document.getElementById('shiftTabs').classList.add('disabled');

    teacherManagerState.isActive = true;
}

// Função para ocultar a tabela de salas
function hideRoomsTable() {
    const tableContainer = document.getElementById('roomsTable');

    if(!tableContainer) return;

    tableContainer.style.display = 'none';
    tableContainer.classList.add('d-none');
    
    document.getElementById('shiftContent').style.display = 'block';
    document.getElementById('showTeacherBtn').style.display = 'block';
    document.getElementById('import-files-btn').style.display = 'block';
    document.getElementById('register-teacher-option').style.display = 'flex';
    document.getElementById('show-data-dropdown').style.display = 'flex';
    document.getElementById('goBackToKeysTable').style.display = 'none';
    document.getElementById('dateSelector').classList.remove('disabled');
    document.getElementById('shiftTabs').classList.remove('disabled');
    
    teacherManagerState.isActive = false;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    updateTeacherTable();
    loadRoomsTable();
});

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
        // DEBUG: Verificar dados antes de enviar ao Firebase
        console.log('🔍 [ADMIN] Ação de chave - Dados antes de enviar ao Firebase:');
        console.log('🔍 [ADMIN] - selectedDate:', selectedDate);
        console.log('🔍 [ADMIN] - activeShift:', activeShift);
        console.log('🔍 [ADMIN] - currentData length:', currentData.length);
        
        // Validar se há dados para salvar
        if (currentData && Array.isArray(currentData) && currentData.length > 0) {
            saveDataToFirebase(selectedDate, activeShift, currentData).then(() => {
                console.log('✅ [ADMIN] Dados salvos no Firebase após ação de chave no painel administrativo');
            }).catch(error => {
                console.error('❌ [ADMIN] Erro ao salvar no Firebase:', error);
            });
        } else {
            console.warn('⚠️ [ADMIN] Dados vazios ou inválidos - não salvando no Firebase após ação de chave');
            console.warn('⚠️ [ADMIN] - currentData:', currentData);
        }
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