# ADR-0003 — Tema e tokens de cor

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** FR-APR (tema)

## Context

As cores hoje vivem em custom properties no `:root` de `styles.css`, mas há literais
hardcoded fora do `:root` (ex.: gradiente da topbar `#ffffff/#f4f7fb`, fundo das abas
`#e3e9f1`, tooltip `#1f2a36`, fundos de input `#fff`). Introduzir tema escuro exige uma
base de cor consistente; hardcodes fora de tokens ficam presos no claro e quebram o escuro.

## Decision

Toda cor flui por **custom properties (tokens)** definidas no `:root`. Um tema é
selecionado por `data-theme` no elemento raiz, com valores **`light | dark | system`**;
`system` resolve via `prefers-color-scheme`. O tema escuro é **apenas** um override de
tokens sob `:root[data-theme="dark"]` — nenhuma regra ganha novo literal de cor. Cores
hardcoded remanescentes devem ser extraídas para tokens quando o tema for implementado.
_(Gatilho do follow-up plantado por `establish-ui-shell`.)_

## Alternatives considered

- Classe `.dark` + regras duplicadas por seletor — rejeitado: duplica CSS, diverge fácil.
- Inverter cores via `filter: invert()` — rejeitado: quebra bandeiras, sombras e badges.

## Consequences

- (+) Um tema novo = um bloco de overrides de token; regras não mudam.
- (+) A _align-phase_ de um futuro change de tema pode discutir `system` vs. forçar tema por esta ADR.
- (−) Exige a dívida de extrair os hardcodes (endereçada pelo follow-up + o futuro change de tema).

## Traceability

Requisito de tema futuro (alternar + persistir a preferência — persistência via ADR-0002).
