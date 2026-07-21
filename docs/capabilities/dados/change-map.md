# Change Map — Dados

## FR coverage map (brief → change)

| FR      | Change                    | Essential? |
| ------- | ------------------------- | ---------- |
| FR-DAT1 | `data-ingestion`          | E          |
| FR-DAT2 | `persist-score-overrides` | E          |
| FR-DAT3 | `timezone-display`        | E          |

## Changes (ordered)

| #      | Change                    | FR      | Effort | Risk   | Tier | Deps   |
| ------ | ------------------------- | ------- | ------ | ------ | ---- | ------ |
| DAT-01 | `data-ingestion`          | FR-DAT1 | M      | medium | T2   | —      |
| DAT-02 | `persist-score-overrides` | FR-DAT2 | S      | medium | T2   | DAT-01 |
| DAT-03 | `timezone-display`        | FR-DAT3 | S      | low    | T1   | DAT-01 |

## Execution order / parallelism

```
DAT-01 (data-ingestion) ─┬─► DAT-02 (persist-score-overrides)
                         └─► DAT-03 (timezone-display)
```

## Capability MVP

DAT-01, DAT-02, DAT-03 (todos E).
