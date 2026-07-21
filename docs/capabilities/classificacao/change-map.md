# Change Map — Classificação

## FR coverage map (brief → change)

| FR      | Change             | Essential? |
| ------- | ------------------ | ---------- |
| FR-CLA1 | `standings-table`  | E          |
| FR-CLA2 | `thirds-ranking`   | E          |
| FR-CLA3 | `knockout-bracket` | E          |

## Changes (ordered)

| #      | Change             | FR      | Effort | Risk | Tier | Deps              |
| ------ | ------------------ | ------- | ------ | ---- | ---- | ----------------- |
| CLA-01 | `standings-table`  | FR-CLA1 | M      | high | T3   | dados (DAT-01/02) |
| CLA-02 | `thirds-ranking`   | FR-CLA2 | M      | high | T3   | CLA-01            |
| CLA-03 | `knockout-bracket` | FR-CLA3 | L      | high | T3   | CLA-01, CLA-02    |

## Execution order / parallelism

```
CLA-01 (standings-table) ─► CLA-02 (thirds-ranking) ─► CLA-03 (knockout-bracket)
```

## Capability MVP

CLA-01, CLA-02, CLA-03 (todos E).
