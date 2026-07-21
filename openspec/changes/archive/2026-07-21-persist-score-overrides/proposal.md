## Why

O app já persiste placares editados manualmente em `localStorage`, mas esse
comportamento nunca foi registrado como contrato. Documentá-lo agora (a) fixa o
spec-id `state-persistence` como base de todo estado do usuário no cliente e
(b) planta o gatilho do helper `prefs` namespaced que o `dark-mode` (APR-02)
consumirá ao adicionar a segunda preferência de usuário. _(ADR-0002)_

## What Changes

- Registrar o contrato de persistência de overrides já existente em `app.js`
  (`loadOverrides`/`saveOverrides`/`setOverride`/`clearOverride`), sem alterar
  comportamento.
- Overrides são gravados exclusivamente em `localStorage` sob a chave versionada e
  namespaced `wc2026_overrides_v1`; nunca cookie, nunca servidor. _(ADR-0002)_
- Edições manuais têm precedência e nunca são sobrescritas por um refresh da API;
  são revertíveis ao valor automático. _(ADR-0004)_
- Plantar, em `app.js`, a nota de follow-up do helper `prefs` namespaced acionada
  quando uma 2ª preferência de usuário (ex.: tema) for persistida.
- Nenhuma mudança de comportamento em runtime — apenas contrato + teste-guarda +
  breadcrumb. Não há **BREAKING**.

## Capabilities

### New Capabilities

- `state-persistence`: contrato de persistência de estado do usuário no cliente —
  chave versionada e namespaced (`wc2026_*_v1`), somente `localStorage`, precedência
  da edição manual sobre a API, reversão ao valor automático.

### Modified Capabilities

<!-- Nenhuma — nenhum spec-id existente tem requisitos alterados. -->

## Impact

- **Código:** `app.js` (nota de follow-up após `saveOverrides`; sem mudança de lógica).
- **Testes:** `test/persistence.test.js` (guarda o padrão de chave da ADR-0002 e a
  ausência de `document.cookie`).
- **Specs:** cria `openspec/specs/state-persistence/spec.md` ao arquivar.
- **ADRs:** consome ADR-0002 (persistência) e ADR-0004 (precedência do override).
- **Runtime:** nenhum — comportamento inalterado.
