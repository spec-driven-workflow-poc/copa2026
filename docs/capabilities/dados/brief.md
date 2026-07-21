# Capability Brief — Dados

**Capability:** dados · **Status:** Consolidated

## Why

Traz e persiste os dados de jogos: ingestão da API openfootball, edição manual de placares
(sobrepõe a API) e conversão de fuso. Base para classificação e apresentação.

## Consolidated requirements

### Functional (FR)

- **FR-DAT1 (E):** Buscar jogos da openfootball a cada reload e no botão ↻; recalcular tudo.
- **FR-DAT2 (E):** Editar placar manualmente; persistir em `localStorage`; nunca sobrescrito
  pela API; reverter ao valor automático. _(ADR-0002, ADR-0004)_
- **FR-DAT3 (E):** Exibir data/hora dos jogos em GMT-3. _(ADR-0004)_

### Non-functional (NFR)

- **NFR-DAT1:** Funciona offline com os overrides salvos se a API falhar.

## Non-goals (v1)

- Backend/sincronização entre dispositivos.

## Capability dependencies

- Nenhuma (base). Consumida por classificacao e apresentacao.
