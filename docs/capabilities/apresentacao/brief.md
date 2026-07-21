# Capability Brief — Apresentação

**Capability:** apresentacao · **Status:** Consolidated

## Why

A casca de UI: layout, abas de fase, próximos jogos, tooltips, responsividade e o **tema**
(claro/escuro). Onde as preferências visuais do usuário são persistidas.

## Consolidated requirements

### Functional (FR)

- **FR-APR1 (E):** Casca da página — topbar fixa, abas Grupos/Mata-mata, próximos jogos,
  tooltips das colunas, layout responsivo.
- **FR-APR2 (I):** Alternar tema **claro/escuro/sistema**; preferência **persistida**
  (`localStorage`, ADR-0002); tema é override de tokens de cor (ADR-0003). _(mudança demo)_

### Non-functional (NFR)

- **NFR-APR1:** Portável — abre por `file://`, sem build (ADR-0001).
- **NFR-APR2:** Sem regressão de contraste/legibilidade ao trocar de tema.

## Non-goals (v1)

- Temas customizados pelo usuário além de claro/escuro/sistema.

## Capability dependencies

- dados + classificacao (renderiza o que elas produzem).
