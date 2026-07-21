## Context

O app é uma página estática sem backend nem build (ADR-0001), aberta por `file://`.
A casca de UI existente — topbar fixa, abas de fase, faixa de próximos jogos,
tooltips e layout responsivo — já vive em `index.html`/`styles.css`. As cores de
tema já são majoritariamente custom properties no `:root`, mas há literais
hardcoded fora dos tokens (gradiente da topbar, fundo das abas, tooltip, fundos de
input). Este change **documenta** a casca como contrato (`ui-shell`) e prepara a
introdução do tema escuro sem alterar runtime.

## Goals / Non-Goals

**Goals:**

- Registrar o contrato da casca de UI (topbar fixa, abas, próximos jogos, tooltips,
  responsividade) e a disciplina de cor por tokens no `:root`.
- Plantar o breadcrumb da extração de literais hardcoded para tokens (ADR-0003), a
  ser acionado quando o tema escuro (`dark-mode`/APR-02) for introduzido.
- Adicionar um teste-guarda que falhe se os tokens de cor base sumirem do `:root`.

**Non-Goals:**

- Extrair os literais hardcoded para tokens agora (é trabalho do `dark-mode`/APR-02).
- Introduzir o tema escuro ou o seletor de tema (APR-02).
- Redesenhar layout, abas ou tooltips — apenas documentar o que já existe.

## Decisions

- **Documentar antes de refatorar.** Os literais hardcoded permanecem como estão; a
  extração para tokens só se justifica com o consumidor real (tema escuro).
  Extraí-los agora seria refactor de superfície compartilhada sem uso. _Alternativa
  rejeitada:_ tokenizar já neste change — aumenta raio de impacto sem consumidor.
- **Breadcrumb como comentário no ponto de mudança.** A nota de follow-up vai
  imediatamente acima de `:root`, onde o próximo autor de tema tocará — maximiza a
  chance de ser vista. _Alternativa rejeitada:_ só no `design.md` — some do fluxo de
  quem edita o CSS.
- **Teste guarda o invariante via leitura de fonte.** O teste lê `styles.css` e casa
  a presença dos tokens base (`--bg`, `--ink`), em vez de renderizar o DOM
  (indisponível no `node --test`). Barato e alinhado ao seam sem-build (ADR-0001).

## Risks / Trade-offs

- [Teste baseado em regex sobre a fonte é estreito] → guarda só a existência dos
  tokens base; o contrato completo vive no spec `ui-shell`, checado na review.
- [Breadcrumb pode envelhecer se ignorado] → referenciado explicitamente pelo change
  `dark-mode` (APR-02) no change-map de `apresentacao`, que o aciona.
