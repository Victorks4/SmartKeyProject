# Conversão do Painel Administrativo React para HTML/CSS/JavaScript com Bootstrap

Este projeto contém a versão convertida do componente React Painel Administrativo para HTML, CSS e JavaScript puro, agora com **Bootstrap 5** para uma interface moderna e responsiva.

## 🚀 Novidades na Versão Bootstrap

✅ **Interface Moderna com Bootstrap 5**
- Design responsivo e profissional
- Componentes Bootstrap nativos (cards, navbar, tabelas)
- Sistema de grid responsivo
- Ícones Bootstrap integrados

✅ **Melhorias Visuais**
- Navbar profissional com logo SENAI
- Cards de estatísticas com animações
- Tabelas responsivas com hover effects
- Botões estilizados e consistentes
- Notificações toast elegantes

✅ **Correções de Erros Visuais**
- Layout responsivo corrigido
- Alinhamento de elementos aprimorado
- Espaçamentos consistentes
- Tipografia melhorada

## Arquivos Convertidos

### 1. `paineladm.html`
- **Estrutura HTML** completa com Bootstrap 5
- **Navbar** profissional com logo SENAI/SenaiKey
- **Header** com título e descrição
- **Cards de estatísticas** (renderizados via JavaScript)
- **Tabela principal** responsiva para exibir registros
- **Botões de ação** estilizados no cabeçalho da tabela

### 2. `paineladm.css`
- **Estilos CSS customizados** que complementam o Bootstrap
- **Animações** para cards de estatísticas
- **Estilos específicos** para badges de status
- **Customizações** para botões de ação
- **Media queries** para responsividade

### 3. `paineladm.js`
- **Funcionalidade JavaScript** otimizada para Bootstrap
- **Renderização dinâmica** dos cards de estatísticas
- **Sistema de notificações** com Bootstrap alerts
- **Gerenciamento de estado** para botões de ação
- **Integração** com ícones Bootstrap

## Como Usar

1. **Abra o arquivo principal**: `paineladm.html` no seu navegador
2. **Veja a demonstração**: Use `demo-bootstrap.html` para comparar antes/depois
3. **Verifique as imagens**: Use `exemplo-imagens.html` para referenciar corretamente
4. **Personalize**: Edite `paineladm.css` para ajustar estilos customizados
5. **Adicione funcionalidades**: Modifique `paineladm.js` para novas interações

## Funcionalidades Implementadas

✅ **Cards de Estatísticas Dinâmicos**
- Total de Registros
- Em uso
- Devolvidas

✅ **Tabela de Registros Interativa**
- Dados mock realistas com números de turma
- Status badges coloridos
- Botões de ação inteligentes
- Hover effects responsivos
- Coluna de número da turma (até 5 dígitos)

✅ **Botões de Ação Inteligentes**
- **Retirar**: Aparece quando a chave está disponível (status: retirada ou devolvida)
- **Devolver**: Aparece quando a chave está em uso (status: em_uso)
- Padrão visual consistente com cores diferentes
- Ícones Bootstrap apropriados para cada ação

✅ **Interface Responsiva com Bootstrap**
- Layout adaptável para todos os dispositivos
- Grid system responsivo
- Componentes Bootstrap nativos
- Animações e transições suaves

✅ **Sistema de Notificações**
- Alertas toast elegantes
- Diferentes tipos (success, info, warning)
- Auto-dismiss após 5 segundos
- Posicionamento fixo no canto superior direito

## Diferenças da Versão Original

### React → HTML/CSS/JavaScript + Bootstrap
- **Estado**: `useState` → Variáveis JavaScript + re-renderização manual
- **Componentes**: JSX → HTML estático + JavaScript para renderização
- **Estilos**: Tailwind CSS → Bootstrap 5 + CSS customizado
- **Ícones**: Lucide React → Bootstrap Icons
- **Reatividade**: Re-renderização automática → Re-renderização manual

### Vantagens da Conversão para Bootstrap
- **Framework robusto** e testado
- **Componentes prontos** para uso
- **Sistema de grid** responsivo nativo
- **Documentação extensa** e comunidade ativa
- **Compatibilidade** com todos os navegadores modernos

## Estrutura de Dados

O sistema agora inclui números de turma de até 5 dígitos:

```javascript
const mockData = [
    {
        id: "1",
        professorName: "Prof. Moises Lima",
        room: "Laboratório 07 - Desenvolvimento Web",
        time: "13:00 - 17:00",
        subject: "Desenvolvimento Web",
        course: "Desenvolvimento de Sistemas",
        turmaNumber: "2024A",        // Número da turma (até 5 dígitos)
        status: "em_uso",            // "em_uso" | "devolvida" | "retirada"
        withdrawalTime: "13:10",
        returnTime: "21:20",         // opcional
        requiresLogin: true
    }
    // ... mais registros
];
```

### Formato dos Números de Turma
- **Formato**: Alfanumérico (letras + números)
- **Exemplos**: "2024A", "2024B", "2024C", "2024D", "2024E"
- **Máximo**: 5 caracteres
- **Exibição**: Badge azul destacado na tabela

### Cards de Estatísticas
O sistema agora exibe **3 cards principais**:
- **Total de Registros**: Número total de chaves no sistema
- **Em uso**: Chaves atualmente retiradas por professores
- **Devolvidas**: Chaves que foram devolvidas

## Estrutura do Projeto Limpo

```
SmartKeyProject/
├── paineladm.html          # Página principal com Bootstrap
├── paineladm.css           # Estilos customizados complementares
├── paineladm.js            # Lógica JavaScript otimizada
├── exemplo-imagens.html    # Exemplo de uso das imagens
├── README-conversao.md     # Documentação da conversão
├── public/
│   ├── senailogo.png       # Logo SENAI
│   ├── chave-unscreen.gif  # Chave animada
│   └── placeholder.svg     # Imagem placeholder
└── .git/                   # Controle de versão
```

## Dependências Externas

- **Bootstrap 5.3.2** (CSS e JS via CDN)
- **Bootstrap Icons 1.11.1** (via CDN)

## Personalização

### Cores e Temas
Edite as variáveis CSS em `:root` no arquivo `paineladm.css`:

```css
:root {
    --bs-primary: #0d6efd;
    --bs-success: #198754;
    --bs-warning: #ffc107;
    --bs-danger: #dc3545;
    --bs-info: #0dcaf0;
}
```

### Estilos Customizados
- **Cards de estatísticas**: Modifique `.stats-card` e classes relacionadas
- **Botões de ação**: Ajuste `.action-btn` e suas variantes
- **Badges de status**: Personalize `.status-badge` e suas classes
- **Animações**: Configure `@keyframes fadeInUp` e delays

## Compatibilidade

- ✅ **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- ✅ **Dispositivos móveis** (responsivo com Bootstrap)
- ✅ **Sem dependências locais** (Bootstrap via CDN)
- ✅ **Imagens locais** na pasta `public/` funcionando corretamente
- ✅ **Projeto limpo** sem arquivos desnecessários
- ✅ **Interface profissional** com Bootstrap 5

## Próximos Passos

Para expandir a funcionalidade, considere:

1. **Persistência de dados** com localStorage ou backend
2. **Filtros e busca** na tabela com Bootstrap
3. **Formulários modais** para adicionar/editar registros
4. **Tema escuro/claro** toggle
5. **Validação** de dados com Bootstrap validation
6. **Paginização** da tabela
7. **Exportação** de dados (PDF, Excel)
