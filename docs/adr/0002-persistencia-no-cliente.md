# ADR-0002 — Persistência de estado no cliente

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** FR-DAT (overrides), FR-APR (tema)

## Context

O app não tem backend. Estado do usuário — placares editados manualmente (já existente,
`app.js:loadOverrides/saveOverrides`) e, futuramente, preferências como tema — precisa
sobreviver a reloads. Sem uma decisão única, cada feature escolheria seu mecanismo
(cookie, `localStorage`, querystring), gerando divergência (_spec drift_) e comportamento
inconsistente entre sessões.

## Decision

Todo estado do usuário persiste **exclusivamente em `localStorage`**, sob chaves
**versionadas e namespaced** com o prefixo `wc2026_` e sufixo de versão (`_v1`)
— ex.: `wc2026_overrides_v1`, `wc2026_theme_v1`. **Nunca** cookies, **nunca** servidor.
Quando uma **segunda** preferência de usuário for adicionada, introduzir um pequeno
helper de preferências (`prefs`) que centralize leitura/escrita namespaced, em vez de
espalhar chaves soltas. _(Este é o gatilho do follow-up plantado por `persist-score-overrides`.)_

## Alternatives considered

- Cookies — rejeitado: enviados a cada request (irrelevante aqui), limite de tamanho,
  semântica de expiração desnecessária, pior DX para estado puramente de UI.
- Querystring/URL — rejeitado para estado persistente: some ao navegar; ok apenas para
  parâmetros efêmeros de admin (`?date`).
- Backend/sync — fora de escopo (ADR-0001, sem servidor).

## Consequences

- (+) Um único eixo de persistência; fácil de auditar e versionar (migração por bump de sufixo).
- (+) Torna decidível por referência a esta ADR a persistência de qualquer preferência de
  usuário futura (ex.: tema): cookie é rejeitado aqui.
- (−) Estado preso ao navegador/dispositivo (aceitável — é acompanhamento pessoal).

## Traceability

FR-DAT2 (overrides persistentes); e qualquer preferência de usuário futura persistida (ex.: tema).
