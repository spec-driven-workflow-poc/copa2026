## Why

O app já entrega a casca de UI — topbar fixa, abas de fase, faixa de próximos
jogos, tooltips de coluna e layout responsivo — mas esse comportamento nunca foi
registrado como contrato. Documentá-lo agora (a) fixa o spec-id `ui-shell` como
base da apresentação e (b) planta o gatilho da extração de cores hardcoded para
tokens que o `dark-mode` (APR-02) consumirá ao introduzir o tema escuro. _(ADR-0003)_

## What Changes

- Registrar o contrato da casca de UI já existente em `index.html`/`styles.css`
  (topbar fixa, abas Grupos/Mata-mata, faixa de próximos jogos, tooltips, layout
  responsivo), sem alterar comportamento.
- Toda cor de tema flui por custom properties (tokens) no `:root`; o app abre por
  `file://` sem build. _(ADR-0001, ADR-0003)_
- Plantar, em `styles.css`, a nota de follow-up que lista os literais de cor
  hardcoded fora dos tokens (gradiente da topbar, fundo das abas, tooltip, fundos
  de input) a serem extraídos para tokens quando o tema escuro for introduzido.
- Nenhuma mudança de comportamento em runtime — apenas contrato + teste-guarda +
  breadcrumb. Não há **BREAKING**.

## Capabilities

### New Capabilities

- `ui-shell`: contrato da casca de apresentação — topbar fixa, abas de fase, faixa
  de próximos jogos, tooltips, layout responsivo; cores de tema por tokens no
  `:root`; portabilidade `file://` sem build.

### Modified Capabilities

<!-- Nenhuma — nenhum spec-id existente tem requisitos alterados. -->

## Impact

- **Código:** `styles.css` (nota de follow-up acima de `:root`; sem mudança de regra).
- **Testes:** `test/theming.test.js` (guarda a existência dos tokens de cor no `:root`).
- **Specs:** cria `openspec/specs/ui-shell/spec.md` ao arquivar.
- **ADRs:** consome ADR-0001 (sem build), ADR-0003 (tema/tokens de cor).
- **Runtime:** nenhum — comportamento inalterado.
