# Change Map — Apresentação

## FR coverage map (brief → change)

| FR      | Change               | Essential? |
| ------- | -------------------- | ---------- |
| FR-APR1 | `establish-ui-shell` | E          |
| FR-APR2 | `dark-mode`          | I          |

## Changes (ordered)

| #      | Change               | FR      | Effort | Risk | Tier | Deps                       |
| ------ | -------------------- | ------- | ------ | ---- | ---- | -------------------------- |
| APR-01 | `establish-ui-shell` | FR-APR1 | M      | low  | T2   | dados, classificacao       |
| APR-02 | `dark-mode`          | FR-APR2 | S      | low  | T1   | APR-01, ADR-0002, ADR-0003 |

> **APR-02 `dark-mode`** consome dois follow-ups plantados por mudanças arquivadas:
> (1) o helper de `prefs` namespaced (plantado por `persist-score-overrides`, ADR-0002) e
> (2) a extração de cores hardcoded para tokens (plantado por `establish-ui-shell`, ADR-0003).
>
> **Por que T1 (não T2), apesar de tocar tokens de cor:** a _extração_ dos literais para
> tokens (o refactor de superfície compartilhada, de fato arriscado) já foi antecipada como
> dívida pelos follow-ups de `establish-ui-shell`/`persist-score-overrides`. A própria
> `dark-mode` acrescenta apenas uma **camada de override** (`:root[data-theme="dark"]`) sobre
> tokens já existentes — raio de impacto contido, incremento opcional (I), sem `design.md`.
> Executa via **spec-lite** (proposal + specs + tasks). O `design.md` mostrado durante a espera
> do `apply` (§8) vem de uma mudança **T2 já arquivada** (`establish-ui-shell`), não desta.

## Execution order / parallelism

```
establish-ui-shell (APR-01) ─► dark-mode (APR-02) [+ ADR-0002, ADR-0003]
```

## Capability MVP

APR-01 (E). APR-02 é incremento (I) — a mudança demonstrada ao vivo.
