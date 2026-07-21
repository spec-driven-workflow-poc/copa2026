# ADR-0004 — Fonte de dados e fuso horário

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** FR-DAT

## Context

Resultados vêm da API pública openfootball; o usuário pode editar placares. Sem uma regra
de precedência, um refresh sobrescreveria edições manuais. Horários da API estão em UTC.

## Decision

openfootball é a fonte automática (`DATA_URL` em `app.js`). **Edições manuais têm
precedência e nunca são sobrescritas** por refresh; a API só decide jogos não-editados.
Todos os horários são exibidos em **GMT-3 (America/São_Paulo)** (`toGmt3`).

## Alternatives considered

- API sempre vence — rejeitado: destrói simulações do usuário.
- Fuso do navegador — rejeitado: público-alvo é Brasil; consistência de tela.

## Consequences

- (+) Simulação segura; comportamento previsível offline (overrides sobrevivem a falha da API).
- (−) Edição obsoleta persiste até o usuário reverter (aceitável; há botão ↺ reverter).

## Traceability

FR-DAT1 (ingestão), FR-DAT2 (overrides), FR-DAT3 (exibição em GMT-3).
