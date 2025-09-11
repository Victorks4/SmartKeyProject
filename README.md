## SmartKeyProject

Aplicação web estática para gestão e controle de chaves com páginas para professores e administradores, integrada ao Firebase. O projeto é simples de rodar localmente e pode ser publicado facilmente na Vercel.

### Funcionalidades
- **Painel do Professor**: interface para uso diário dos docentes (`teacherPanel.html`).
- **Painel Administrativo**: gerenciamento e visão geral para administradores (`paineladm.html`).
- **Integração Firebase**: configuração via `firebase-config.js` (ou `firebase-config-secure.js`).
- **Assets públicos**: imagens e ícones em `public/`.

### Estrutura do projeto
```text
SmartKeyProject/
  index.html
  teacherPanel.html
  teacherPanel.js
  teacherPanel.css
  paineladm.html
  paineladm.js
  paineladm.min.js
  paineladm.css
  firebase-config.js
  firebase-config-secure.js
  public/
    ... (imagens e ícones)
  vercel.json
  README-*.md (documentações auxiliares)
```

### Pré-requisitos
- Navegador moderno (Chrome/Edge/Firefox).
- Conta e projeto no Firebase (ver seção Configuração).
- Opcional para servidor local: Node.js (para usar um servidor estático simples) ou extensão Live Server do VS Code.

### Configuração (Firebase)
1. Crie um projeto no Firebase.
2. Ative os serviços necessários (conforme sua implementação). Consulte `README-FIREBASE.md` para detalhes do setup recomendado neste projeto.
3. Obtenha as credenciais Web do Firebase (apiKey, authDomain, etc.).
4. Atualize o arquivo `firebase-config.js` com suas credenciais.
   - Alternativamente, use `firebase-config-secure.js` e técnicas de injeção segura de variáveis no ambiente de produção (ver seção Segurança e `README-FIREBASE.md`).

### Executando localmente
Você pode simplesmente abrir os arquivos `.html` no navegador, porém alguns recursos (como imports ou chamadas ao Firebase) funcionam melhor com um servidor local.

Opção A — VS Code Live Server:
- Abra a pasta do projeto no VS Code.
- Clique em "Go Live" e acesse `http://localhost:5500/` (ou porta configurada).

Opção B — Servidor estático via Node:
```bash
npx http-server . -p 3000
# depois acesse http://localhost:3000/
```

Abra as páginas conforme sua necessidade:
- `index.html` (página inicial/demonstrativa)
- `teacherPanel.html` (painel do professor)
- `paineladm.html` (painel administrativo)

### Deploy (Vercel)
O repositório já inclui `vercel.json` para deploy estático.

Passos rápidos:
1. Instale a CLI: `npm i -g vercel`
2. Faça login: `vercel login`
3. Na raiz do projeto, rode: `vercel` e siga as instruções (projeto estático).
4. Para atualizações, use: `vercel --prod`.

Configure variáveis de ambiente/segredos no projeto da Vercel caso use `firebase-config-secure.js`.

### Segurança
- Evite commitar credenciais sensíveis. Prefira variáveis de ambiente nos ambientes de produção.
- Se optar por `firebase-config-secure.js`, mantenha os segredos fora do repositório e injete-os no build/deploy (ver Vercel Env Vars e `README-FIREBASE.md`).

### Documentação complementar
- `README-FIREBASE.md`: orientações específicas do Firebase.
- `README-SINCRONIZACAO.md` e `README-SINCRONIZACAO-EDICOES.md`: fluxo de sincronização/edições.
- `README-PROFESSORES.md`: instruções voltadas aos docentes.
- `README-VERCEL-DEPLOY.md`: detalhes adicionais de deploy na Vercel.
- `README-ENCODING-CSV.md` e `README-conversao.md`: utilidades e notas auxiliares.

### Contribuição
Contribuições são bem-vindas! Abra uma issue descrevendo sua ideia/erro ou envie um Pull Request com uma descrição clara das mudanças propostas.

### Licença
Defina a licença conforme a política da sua organização. Se não houver uma escolha específica, considere licenças abertas como MIT ou Apache 2.0.

### Créditos
Projeto mantido pela equipe do SENAI/SmartKey. Imagens e marcas registradas pertencem aos seus respectivos proprietários.


