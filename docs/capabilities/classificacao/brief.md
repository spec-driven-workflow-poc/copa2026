# Capability Brief — Classificação

**Capability:** classificacao · **Status:** Consolidated

## Why

Calcula tabelas dos grupos, ranqueia terceiros colocados e monta o chaveamento do
mata-mata. Alto risco de corretude (resultados errados enganam o usuário).

## Consolidated requirements

### Functional (FR)

- **FR-CLA1 (E):** Tabela por grupo com PTS, J, V, E, D, GP, GC, SG; ordenação e destaque
  de classificados. _(regra em `sortRows`)_
- **FR-CLA2 (E):** Ranquear os 8 melhores terceiros colocados e alocá-los no chaveamento
  (posição estimada, marcada `≈`).
- **FR-CLA3 (E):** Montar o chaveamento (R32→final), preenchido conforme os resultados,
  incluindo pênaltis/prorrogação.

### Non-functional (NFR)

- **NFR-CLA1:** Cálculo determinístico e testável (funções puras exportadas).

## Non-goals (v1)

- Posição oficial exata dos terceiros (é estimativa).

## Capability dependencies

- dados (jogos + overrides).
