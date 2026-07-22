# ROADMAP — Copa2026

**Role:** rollup dos change-maps; deps entre capabilities; milestones. **Único escritor =
orquestrador**, exceto o worker que dona a própria linha (§2.1/§6).

## Capabilities

| Capability    | Brief                                        | Change-map                                             | Status |
| ------------- | -------------------------------------------- | ------------------------------------------------------ | ------ |
| dados         | [brief](capabilities/dados/brief.md)         | [change-map](capabilities/dados/change-map.md)         | 🟡     |
| classificacao | [brief](capabilities/classificacao/brief.md) | [change-map](capabilities/classificacao/change-map.md) | 🔲     |
| apresentacao  | [brief](capabilities/apresentacao/brief.md)  | [change-map](capabilities/apresentacao/change-map.md)  | 🟡     |

## Foundational dependencies (ADRs — Phase 0)

| ADR                                         | Decision                               | Blocks                       | Status   |
| ------------------------------------------- | -------------------------------------- | ---------------------------- | -------- |
| [0001](adr/0001-arquitetura-sem-build.md)   | Sem build (JS puro)                    | gates, todas as capabilities | Accepted |
| [0002](adr/0002-persistencia-no-cliente.md) | Persistência no cliente (localStorage) | DAT-02                       | Accepted |
| [0003](adr/0003-tema-e-tokens-de-cor.md)    | Tema e tokens de cor                   | APR-01                       | Accepted |
| [0004](adr/0004-fonte-de-dados-e-fuso.md)   | Fonte de dados e fuso                  | DAT-01, DAT-02, DAT-03       | Accepted |

## Changes (rollup dos change-maps)

| Change                             | Capability    | Tier | Deps                           | E/I/D | Status |
| ---------------------------------- | ------------- | ---- | ------------------------------ | ----- | ------ |
| `data-ingestion` (DAT-01)          | dados         | T2   | ADR-0004                       | E     | 🔲     |
| `persist-score-overrides` (DAT-02) | dados         | T2   | DAT-01, ADR-0002, ADR-0004     | E     | 🟢     |
| `timezone-display` (DAT-03)        | dados         | T1   | DAT-01, ADR-0004               | E     | 🔲     |
| `standings-table` (CLA-01)         | classificacao | T3   | DAT-01/02                      | E     | 🔲     |
| `thirds-ranking` (CLA-02)          | classificacao | T3   | CLA-01                         | E     | 🔲     |
| `knockout-bracket` (CLA-03)        | classificacao | T3   | CLA-01, CLA-02                 | E     | 🔲     |
| `establish-ui-shell` (APR-01)      | apresentacao  | T2   | dados, classificacao, ADR-0003 | E     | 🟢     |
| `theme-preference` (APR-02)        | apresentacao  | T2   | APR-01, ADR-0002, ADR-0003     | I     | 🟢     |

> `persist-score-overrides` e `establish-ui-shell` documentam comportamento **já existente**
> no app e foram arquivados para (a) bootstrapar `openspec/specs/` e (b) plantar dois
> follow-ups (o helper de `prefs` namespaced; a extração de cores hardcoded para tokens) que
> uma futura preferência de usuário irá acionar.

## Critical path

```
ADR-0001..0004 ─► DAT-01 ─► DAT-02 ─► CLA-01 ─► CLA-02 ─► CLA-03 ─► APR-01 ─► APR-02 (theme-preference)
```

## Milestones

- **M0 — Foundations:** ADR-0001..0004 Accepted; gates verdes.
- **M1 — App existente documentado:** DAT-02 + APR-01 arquivados (specs emergentes).
- **M2 — Demo:** o ciclo do workflow executado ao vivo sobre `theme-preference` (APR-02) —
  do `requirement-intake` (planejamento) ao `archive` (spec emergente).
