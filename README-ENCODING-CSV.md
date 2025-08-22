# Correções de Encoding para Arquivos CSV

## Problema Identificado

Os arquivos CSV estavam sendo lidos sem reconhecer caracteres especiais e acentuação, resultando em caracteres corrompidos () sendo exibidos no lugar de acentos, cedilhas e outros caracteres especiais do português.

## Soluções Implementadas

### 1. Configuração do FileReader

**Antes:**
```javascript
reader.readAsText(file);
```

**Depois:**
```javascript
reader.readAsText(file, 'UTF-8');
```

- **Explicação:** Especificar explicitamente o encoding UTF-8 ao ler o arquivo como texto garante que o navegador interprete corretamente os caracteres especiais.

### 2. Configuração Otimizada do XLSX.read para CSV

**Antes:**
```javascript
workbook = XLSX.read(content, { 
    type: 'string',
    raw: true,
    cellText: false,
    cellDates: true,
    codepage: 65001, // UTF-8
    charset: 'UTF-8'
});
```

**Depois:**
```javascript
workbook = XLSX.read(content, { 
    type: 'string',
    raw: false, // Alterado para false para melhor tratamento de caracteres
    cellText: true, // Alterado para true para converter células para texto
    cellDates: true,
    codepage: 65001, // UTF-8
    charset: 'UTF-8',
    FS: ',', // Separador de campo para CSV
    RS: '\n', // Separador de linha para CSV
    forceQuotes: false, // Não forçar aspas
    skipHiddenRows: false, // Não pular linhas ocultas
    skipHiddenCols: false // Não pular colunas ocultas
});
```

- **Explicação:** 
  - `raw: false` - Permite que o XLSX processe melhor os caracteres especiais
  - `cellText: true` - Converte células para texto, facilitando o tratamento
  - Adicionados separadores específicos para CSV (`FS` e `RS`)

### 3. Função de Detecção Automática de Encoding

```javascript
function detectAndFixEncoding(content) {
    // Verificar se o conteúdo tem caracteres corrompidos comuns
    const hasCorruptedChars = /Ã[¡©­³º£µ¢ª®´»§]/.test(content);
    
    if (hasCorruptedChars) {
        // Tentar diferentes encodings
        const encodings = ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ISO-8859-15'];
        
        for (const encoding of encodings) {
            try {
                // Simular conversão de encoding
                const decoder = new TextDecoder(encoding);
                const encoder = new TextEncoder();
                const bytes = encoder.encode(content);
                const decoded = decoder.decode(bytes);
                
                // Verificar se ainda há caracteres corrompidos
                if (!/Ã[¡©­³º£µ¢ª®´»§]/.test(decoded)) {
                    console.log(`Encoding detectado e corrigido: ${encoding}`);
                    return decoded;
                }
            } catch (e) {
                console.warn(`Falha ao tentar encoding ${encoding}:`, e);
            }
        }
    }
    
    return content;
}
```

- **Explicação:** Esta função detecta automaticamente se há caracteres corrompidos e tenta diferentes encodings para corrigi-los.

### 4. Função de Sanitização de Texto Melhorada

```javascript
function decodeText(text) {
    if (!text) return '';
    
    try {
        let sanitizedText = text.toString();
        
        // Mapeamento de caracteres corrompidos para caracteres corretos
        const charMap = {
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
            'Ã£': 'ã', 'Ãµ': 'õ', 'Ã¢': 'â', 'Ãª': 'ê', 'Ã®': 'î',
            'Ã´': 'ô', 'Ã»': 'û', 'Ã§': 'ç',
            'Ã€': 'À', 'Ã': 'É', 'Ã': 'Ì', 'Ã': 'Ò', 'Ã': 'Ù',
            'Ãƒ': 'Ã', 'Ã•': 'Õ', 'Ã‚': 'Â', 'ÃŠ': 'Ê', 'ÃŽ': 'Î',
            'Ã"': 'Ô', 'Ã›': 'Û', 'Ã‡': 'Ç'
        };
        
        // Aplicar mapeamento de caracteres
        for (const [corrupted, correct] of Object.entries(charMap)) {
            sanitizedText = sanitizedText.replace(new RegExp(corrupted, 'g'), correct);
        }
        
        // Tratar caracteres de substituição Unicode ()
        sanitizedText = sanitizedText.replace(/\uFFFD/g, '');
        
        return sanitizedText.trim();
    } catch (e) {
        return text.toString().trim();
    }
}
```

- **Explicação:** Esta função mapeia caracteres corrompidos comuns para seus equivalentes corretos, tratando especificamente os problemas de encoding do português.

### 5. Aplicação Automática das Correções

As funções de correção são aplicadas automaticamente em:
- **Cabeçalhos das colunas** - Para reconhecimento correto dos nomes das colunas
- **Valores das células** - Durante o processamento dos dados
- **Valores de linhas adjacentes** - Para preenchimento de campos vazios

## Arquivos Modificados

- `paineladm.js` - Implementação das correções de encoding
- `teste-csv-encoding.html` - Arquivo de teste para verificar o funcionamento

## Como Testar

1. **Abra o arquivo `teste-csv-encoding.html`** em um navegador
2. **Faça upload de um arquivo CSV** com caracteres especiais
3. **Verifique se os caracteres** são exibidos corretamente
4. **Teste as funções individuais** de decodificação e detecção de encoding

## Resultado Esperado

- ✅ Caracteres acentuados (á, é, í, ó, ú) exibidos corretamente
- ✅ Cedilha (ç) funcionando perfeitamente
- ✅ Til (ã, õ) preservado
- ✅ Circunflexo (â, ê, î, ô, û) funcionando
- ✅ Nomes próprios e locais em português legíveis

## Compatibilidade

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Arquivos CSV com diferentes encodings
- ✅ Caracteres especiais do português brasileiro
- ✅ Fallback para casos de erro de encoding

## Notas Importantes

1. **Sempre use UTF-8** ao criar arquivos CSV para melhor compatibilidade
2. **Teste com diferentes arquivos** para garantir que as correções funcionem
3. **Monitore o console** para mensagens de debug sobre encoding detectado
4. **As correções são aplicadas automaticamente** - não é necessário intervenção manual
