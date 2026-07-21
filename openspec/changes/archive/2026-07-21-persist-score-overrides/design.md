## Context

O app é uma página estática sem backend (ADR-0001). O estado do usuário existente —
placares editados manualmente — já é persistido em `localStorage` por
`loadOverrides`/`saveOverrides`/`setOverride`/`clearOverride` em `app.js`, sob a chave
`wc2026_overrides_v1`. Este change **documenta** esse comportamento como contrato
(`state-persistence`) e prepara a evolução da persistência sem alterar runtime.

## Goals / Non-Goals

**Goals:**

- Registrar o contrato de persistência de overrides (chave versionada/namespaced,
  somente `localStorage`, precedência do override, reversão).
- Plantar o breadcrumb do helper `prefs` namespaced (ADR-0002), a ser acionado quando
  uma 2ª preferência de usuário (ex.: tema) for adicionada.
- Adicionar um teste-guarda que falhe se a chave fugir do padrão `wc2026_*_v1` ou se
  `document.cookie` for introduzido.

**Non-Goals:**

- Introduzir o helper `prefs` agora (é trabalho do `dark-mode`/APR-02).
- Migrar a chave, mudar o formato serializado, ou alterar qualquer comportamento.
- Sincronização entre dispositivos / backend (fora de escopo por ADR-0001/0002).

## Decisions

- **Documentar antes de refatorar.** As chaves soltas (`STORAGE_KEY`) permanecem como
  estão; o helper `prefs` só se justifica com a 2ª preferência. Introduzi-lo agora seria
  abstração especulativa. _Alternativa rejeitada:_ criar `prefs` já neste change —
  aumenta raio de impacto sem consumidor real.
- **Breadcrumb como comentário no ponto de mudança.** A nota de follow-up vai
  imediatamente após `saveOverrides`, onde o próximo autor de persistência tocará —
  maximiza a chance de ser vista. _Alternativa rejeitada:_ só no `design.md` — some do
  fluxo de quem edita o código.
- **Teste guarda o invariante via leitura de fonte.** O teste lê `app.js` e casa o
  padrão da chave / ausência de cookie, em vez de exercitar `localStorage` (indisponível
  no `node --test`). Barato e alinhado ao seam sem-build (ADR-0001).

## Risks / Trade-offs

- [Teste baseado em regex sobre a fonte pode passar por engano se o código for
  reescruturado] → o escopo do teste é estreito (padrão de chave + `document.cookie`);
  o contrato completo vive no spec `state-persistence`, checado na review.
- [Breadcrumb pode envelhecer se ignorado] → referenciado explicitamente pelo change
  `dark-mode` (APR-02) no change-map de `apresentacao`, que o aciona.
