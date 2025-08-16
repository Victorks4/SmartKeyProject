# Conversão do Dashboard React para HTML/CSS/JavaScript

Este projeto contém a versão convertida do componente React Dashboard para HTML, CSS e JavaScript puro.

## Arquivos Convertidos

### 1. `dashboard.html`
- **Estrutura HTML** completa do dashboard
- **Header** com título e descrição (inclui GIF animado da chave)
- **Cards de estatísticas** (renderizados via JavaScript)
- **Tabela principal** para exibir os registros de chaves
- **Ícones Lucide** integrados via CDN

### 2. `dashboard.css`
- **Estilos CSS** convertidos do Tailwind CSS
- **Sistema de design** com variáveis CSS personalizadas
- **Layout responsivo** com grid e flexbox
- **Componentes estilizados** (cards, tabelas, badges, botões)
- **Media queries** para dispositivos móveis

### 3. `dashboard.js`
- **Funcionalidade JavaScript** convertida do React
- **Dados mock** equivalentes ao mockData original
- **Renderização dinâmica** dos cards de estatísticas
- **Renderização da tabela** com dados
- **Funções de interação** (retirada/devolução de chaves)
- **Integração com ícones Lucide**

## Como Usar

1. **Abra o arquivo `dashboard.html`** em um navegador web
2. **Certifique-se de que todos os arquivos** estão na mesma pasta
3. **Verifique a conexão com internet** para carregar os ícones Lucide
4. **As imagens estão na pasta `public/`** e são referenciadas corretamente

## Funcionalidades Implementadas

✅ **Cards de Estatísticas**
- Total de registros
- Chaves em uso
- Chaves devolvidas
- Chaves retiradas

✅ **Tabela de Registros**
- Lista de professores e salas
- Status das chaves com badges coloridos
- Horários de retirada e devolução
- Botões de ação para retirar chaves

✅ **Interatividade**
- Botões funcionais para retirar chaves
- Atualização automática das estatísticas
- Validação de status das chaves

✅ **Design Responsivo**
- Layout adaptável para diferentes tamanhos de tela
- Grid responsivo para os cards de estatísticas
- Tabela com scroll horizontal em dispositivos móveis

## Diferenças da Versão Original

### React → HTML/CSS/JavaScript
- **Estado**: `useState` → Variáveis JavaScript + re-renderização manual
- **Componentes**: JSX → HTML estático + JavaScript para renderização
- **Estilos**: Tailwind CSS → CSS puro com variáveis CSS
- **Ícones**: Lucide React → Lucide JavaScript via CDN
- **Reatividade**: Re-renderização automática → Re-renderização manual

### Vantagens da Conversão
- **Sem dependências** de frameworks
- **Execução direta** no navegador
- **Fácil de modificar** e personalizar
- **Compatibilidade** com qualquer servidor web

### Limitações
- **Re-renderização manual** necessária para mudanças de estado
- **Menos otimizado** que o React para atualizações frequentes
- **Gerenciamento de estado** mais manual

## Estrutura de Dados

```javascript
const mockData = [
    {
        id: "1",
        professorName: "Prof. Moises Lima",
        room: "Laboratório 07 - Desenvolvimento Web",
        time: "13:00 - 17:00",
        subject: "Desenvolvimento Web",
        course: "Desenvolvimento de Sistemas",
        status: "em_uso", // "em_uso" | "devolvida" | "retirada"
        withdrawalTime: "13:10",
        returnTime: "21:20", // opcional
        requiresLogin: true
    }
    // ... mais registros
];
```

## Personalização

### Cores
Edite as variáveis CSS em `:root` no arquivo `dashboard.css`:

```css
:root {
    --primary: 210 98% 42%;
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
    /* ... outras cores */
}
```

### Dados
Modifique o array `mockData` no arquivo `dashboard.js` para adicionar, remover ou alterar registros.

### Estilos
Personalize os estilos editando as classes CSS no arquivo `dashboard.css`.

## Compatibilidade

- ✅ **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- ✅ **Dispositivos móveis** (responsivo)
- ✅ **Sem dependências externas** (exceto ícones Lucide via CDN)
- ✅ **Imagens locais** na pasta `public/` funcionando corretamente

## Próximos Passos

Para expandir a funcionalidade, considere:

1. **Persistência de dados** com localStorage ou backend
2. **Filtros e busca** na tabela
3. **Formulários** para adicionar novos registros
4. **Notificações** mais elegantes que alerts
5. **Validação** de dados de entrada
6. **Tema escuro/claro** toggle
