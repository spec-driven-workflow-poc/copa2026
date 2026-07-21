# Conceptual Map — Copa2026

> Visão **estrutural**; sem status, sem ordem de build. Só **liga** ADRs + briefs + contratos.

## Capabilities & responsibilities

| Capability    | Responsibility (uma linha)               | Brief                                           |
| ------------- | ---------------------------------------- | ----------------------------------------------- |
| dados         | Ingestão openfootball + overrides + fuso | [brief](../capabilities/dados/brief.md)         |
| classificacao | Tabelas, terceiros, chaveamento          | [brief](../capabilities/classificacao/brief.md) |
| apresentacao  | Casca de UI + tema                       | [brief](../capabilities/apresentacao/brief.md)  |

## Runtime / data flow

```
openfootball ─► dados (matches + overrides) ─► classificacao (standings/bracket) ─► apresentacao (render + tema)
```

## Contracts / interfaces between capabilities

| Contract                     | Producer      | Consumer         | Defined in          |
| ---------------------------- | ------------- | ---------------- | ------------------- |
| `STATE.matches` + overrides  | dados         | classificacao    | dados/brief         |
| `STATE.standings` / bracket  | classificacao | apresentacao     | classificacao/brief |
| tokens de cor / `data-theme` | apresentacao  | (todas as telas) | ADR-0003            |

## ADR index by theme (navigation)

| Theme               | ADR  |
| ------------------- | ---- |
| Build/portabilidade | 0001 |
| Persistência        | 0002 |
| Tema/cores          | 0003 |
| Dados/fuso          | 0004 |
