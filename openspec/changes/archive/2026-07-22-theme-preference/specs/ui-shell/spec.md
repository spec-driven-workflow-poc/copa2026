## ADDED Requirements

### Requirement: Seletor de tema light/dark/system

O sistema SHALL oferecer um controle na casca de UI que permita ao usuário escolher
entre três temas: claro (`light`), escuro (`dark`) e seguir o sistema (`system`). O
tema escolhido SHALL ser aplicado via atributo `data-theme` no elemento raiz. Quando
`system`, o tema efetivo SHALL ser resolvido por `prefers-color-scheme` e SHALL reagir
ao vivo a mudanças da preferência do SO enquanto `system` estiver selecionado. O tema
SHALL ser aplicado antes do primeiro paint, sem flash do tema padrão. _(ADR-0003)_

#### Scenario: Selecionar tema escuro

- **WHEN** o usuário escolhe "escuro" no seletor
- **THEN** o elemento raiz recebe `data-theme="dark"` e as cores refletem o tema escuro

#### Scenario: Sistema resolve para o tema do SO

- **WHEN** o usuário escolhe "sistema" e o SO está em modo escuro
- **THEN** o tema efetivo é escuro (resolvido via `prefers-color-scheme`)

#### Scenario: Mudança do SO reflete ao vivo em modo sistema

- **WHEN** o tema é `system` e o SO alterna de escuro para claro
- **THEN** o tema efetivo passa a claro sem reload da página

#### Scenario: Tema aplicado antes do primeiro paint

- **WHEN** a página carrega com uma preferência de tema salva
- **THEN** o `data-theme` é aplicado antes do primeiro paint, sem flash do tema padrão

## MODIFIED Requirements

### Requirement: Cores de tema por tokens no :root

O sistema SHALL definir todas as cores de tema como custom properties (tokens) no
`:root` de `styles.css`. Novas regras MUST NOT introduzir literais de cor fora dos
tokens; um tema é aplicado **exclusivamente** como override de tokens. O tema escuro
SHALL existir como um bloco de override sob `:root[data-theme="dark"]`, sem novos
literais de cor em regras. Os literais hardcoded que existiam fora do `:root`
(gradiente da topbar, fundo das abas, tooltip, fundos de input) SHALL estar extraídos
para tokens. _(ADR-0003)_

#### Scenario: Tokens de cor base definidos no :root

- **WHEN** `styles.css` é carregado
- **THEN** os tokens de cor base (ex.: `--bg`, `--ink`) estão definidos no `:root`

#### Scenario: Follow-up de extração de hardcodes registrado

- **WHEN** o tema escuro está ativo
- **THEN** os elementos antes hardcoded (gradiente da topbar, fundo das abas,
  tooltip, fundos de input) seguem o tema via tokens — não ficam presos no claro
  (o follow-up de extração está concluído)

#### Scenario: Tema escuro é um override de tokens

- **WHEN** `data-theme="dark"` está no elemento raiz
- **THEN** as cores derivam do bloco `:root[data-theme="dark"]` e nenhuma regra usa
  literal de cor para obter o tema escuro

#### Scenario: Nenhum literal de cor fora dos tokens

- **WHEN** `styles.css` é inspecionado
- **THEN** não há literais de cor (hex/rgb/hsl) em regras fora dos blocos `:root` que
  definem os tokens
