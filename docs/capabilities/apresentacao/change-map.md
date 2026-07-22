# Change Map — Apresentação

## FR coverage map (brief → change)

| FR      | Change               | Essential? |
| ------- | -------------------- | ---------- |
| FR-APR1 | `establish-ui-shell` | E          |
| FR-APR2 | `theme-preference`   | I          |

## Changes (ordered)

| #      | Change               | FR      | Effort | Risk | Tier | Deps                       |
| ------ | -------------------- | ------- | ------ | ---- | ---- | -------------------------- |
| APR-01 | `establish-ui-shell` | FR-APR1 | M      | low  | T2   | dados, classificacao       |
| APR-02 | `theme-preference`   | FR-APR2 | M      | high | T2   | APR-01, ADR-0002, ADR-0003 |

> **APR-02 risk=high, tier=T2:** toca superfície compartilhada (tokens de cor) +
> persistência — alto raio de impacto (AGENTS.md), por isso `high`. Não é o núcleo
> crítico de corretude (classificação/chaveamento), por isso T2 e não T3 (§7). Aciona os
> dois follow-ups plantados: helper `prefs` (ADR-0002) + extração dos literais de cor
> para tokens (ADR-0003). Discussão `system` vs. forçar tema fica para a align-phase.

## Execution order / parallelism

```
establish-ui-shell (APR-01) ─► theme-preference (APR-02)
```

## Capability MVP

APR-01 (E). APR-02 é melhoria (I), fora do MVP.
