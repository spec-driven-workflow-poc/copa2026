## ADDED Requirements

### Requirement: Casca de UI responsiva e portável

O sistema SHALL apresentar uma casca de UI com topbar fixa, abas de fase
(Grupos/Mata-mata), faixa de próximos jogos e tooltips de coluna, em layout
responsivo. A página SHALL abrir por `file://` sem etapa de build. _(ADR-0001)_

#### Scenario: Topbar permanece fixa ao rolar

- **WHEN** o usuário rola a página
- **THEN** a topbar permanece fixa no topo da viewport

#### Scenario: Alternar entre abas de fase

- **WHEN** o usuário seleciona a aba Grupos ou Mata-mata
- **THEN** o conteúdo correspondente à fase é exibido e a outra fase é ocultada

#### Scenario: Página abre sem build

- **WHEN** `index.html` é aberto diretamente por `file://`
- **THEN** a casca de UI renderiza sem servidor, bundler ou etapa de transpile

### Requirement: Cores de tema por tokens no :root

O sistema SHALL definir as cores de tema como custom properties (tokens) no
`:root` de `styles.css`. Novas regras MUST NOT introduzir literais de cor fora dos
tokens; um tema é aplicado como override de tokens. Os literais hardcoded
remanescentes SHALL ser extraídos para tokens quando o tema escuro for introduzido.
_(ADR-0003)_

#### Scenario: Tokens de cor base definidos no :root

- **WHEN** `styles.css` é carregado
- **THEN** os tokens de cor base (ex.: `--bg`, `--ink`) estão definidos no `:root`

#### Scenario: Follow-up de extração de hardcodes registrado

- **WHEN** um autor for introduzir o tema escuro (`dark-mode`/APR-02)
- **THEN** a nota de follow-up em `styles.css` lista os literais hardcoded a extrair
  para tokens (gradiente da topbar, fundo das abas, tooltip, fundos de input)
