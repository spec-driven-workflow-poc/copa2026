# Capability Brief — Apresentação

**Capability:** apresentacao · **Status:** Consolidated

## Why

A casca de UI: layout, abas de fase, próximos jogos, tooltips e responsividade —
tudo o que o usuário vê e por onde navega.

## Consolidated requirements

### Functional (FR)

- **FR-APR1 (E):** Casca da página — topbar fixa, abas Grupos/Mata-mata, próximos jogos,
  tooltips das colunas, layout responsivo.
- **FR-APR2 (I):** Seletor de tema — alternar entre claro (`light`), escuro (`dark`) e
  seguir o sistema (`system`, resolvido via `prefers-color-scheme`); aplicado por
  `data-theme` no elemento raiz (ADR-0003). A preferência **persiste entre visitas** em
  `localStorage` (chave `wc2026_theme_v1`, via helper `prefs`) (ADR-0002).

### Non-functional (NFR)

- **NFR-APR1:** Portável — abre por `file://`, sem build (ADR-0001).

## Non-goals (v1)

- Preferência de tema **não sincroniza entre dispositivos/navegadores** — presa ao
  `localStorage` local (consequência aceita da ADR-0002).

## Capability dependencies

- dados + classificacao (renderiza o que elas produzem).
- Persistência de preferências via ADR-0002 (helper `prefs`); tokens de cor / `data-theme`
  via ADR-0003.
