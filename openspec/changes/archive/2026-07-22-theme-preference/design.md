## Context

App estático, JS puro em IIFE, sem build (ADR-0001). Cores já vivem majoritariamente em
tokens no `:root` de `styles.css`, mas há literais fora dos tokens (gradiente da topbar,
fundo das abas, tooltip, fundos de input — anotados no follow-up `styles.css:2-6`) e
tokens de cor espalhados em blocos `:root` secundários (ex.: `--bline: #c2cdda`). A
persistência de estado do usuário hoje é a chave solta `wc2026_overrides_v1` via
`loadOverrides/saveOverrides`; o comentário `app.js:123-125` planta o helper `prefs` para
quando surgir a 2ª preferência. Funções puras são testadas pelo seam
`typeof module !== "undefined" && module.exports`.

## Goals / Non-Goals

**Goals:**

- Seletor de tema `light | dark | system` na topbar, aplicado via `data-theme` no `<html>`.
- `system` resolvido por `prefers-color-scheme`, reagindo ao vivo enquanto selecionado.
- Preferência persistida em `wc2026_theme_v1` via um helper `prefs` namespaced.
- Tema escuro como bloco de override de tokens; hardcodes extraídos para tokens.
- Sem flash de tema no carregamento.

**Non-Goals:**

- Sincronização entre dispositivos (ADR-0002 — preso ao `localStorage` local).
- Migrar a chave `wc2026_overrides_v1` para dentro do `prefs` neste change (o override
  continua funcional como está; `prefs` é introduzido e usado pela preferência de tema —
  o roteamento dos overrides por `prefs` fica como refino futuro, fora do escopo de FR-APR2).
- Temas além de claro/escuro (ex.: alto contraste).

## Decisions

- **`data-theme` no `<html>`, não no `<body>`.** Aplicável antes do `<body>` existir,
  viabilizando o anti-flash. _(alt.: `<body>` — rejeitado: paint tardio, flash.)_
- **Anti-flash por script inline mínimo no `<head>`.** Um trecho síncrono lê `prefs` e
  seta `data-theme` antes do primeiro paint. É o único código fora do IIFE principal;
  mantém-se pequeno e sem literais de cor. _(alt.: aplicar no `DOMContentLoaded` —
  rejeitado: roda após o paint, causa flash.)_
- **`system` resolvido em JS; `data-theme` guarda sempre o tema *efetivo* (`light|dark`).**
  `resolveTheme(pref, systemPrefersDark)` (puro) resolve `system` (ou valor inválido) via
  `matchMedia("(prefers-color-scheme: dark)")`; o resultado vira `data-theme`. Um
  `MediaQueryList.addEventListener("change", …)` reaplica ao vivo **enquanto** a
  preferência for `system`. _(alt.: resolver no CSS via `@media (prefers-color-scheme)` —
  rejeitado: obrigaria a **duplicar** o bloco de tokens escuros entre a media query e o
  seletor `[data-theme="dark"]` (o CSS puro não compartilha declarações através da
  fronteira da media query), exatamente a divergência que o Risco abaixo quer evitar; e a
  função pura `resolveTheme` ficaria sem uso/cobertura.)_
- **Bloco de override único `:root[data-theme="dark"]`** redefine os tokens; nenhuma regra
  muda (ADR-0003). Como o JS só grava `light`/`dark` no atributo, um só bloco cobre tanto
  o modo escuro explícito quanto o `system`+SO-escuro — **fonte única** dos valores
  escuros, sem duplicação.
- **Helper `prefs` como funções puras exportadas** (`prefs.get(key, default)` /
  `prefs.set(key, value)`), namespaced sob `wc2026_*_v1`, com try/catch degradando ao
  default — testável pelo seam `module.exports`. A resolução do tema efetivo
  (`resolveTheme(pref, systemPrefersDark)`) também é pura e exportada, para teste
  determinístico sem DOM.
- **Extração de hardcodes:** os literais anotados em `styles.css:2-6` e o `--bline`
  secundário viram tokens no `:root` base + seus pares no override escuro.

## Risks / Trade-offs

- **[Flash de tema (FOUC) se o anti-flash falhar]** → script inline síncrono no `<head>`,
  antes de qualquer CSS que dependa do tema; testado manualmente com preferência salva.
- **[Hardcode esquecido fica preso no claro]** → o cenário de spec "Nenhum literal de cor
  fora dos tokens" vira gate de revisão; grep por hex/rgb fora de `:root` na review.
- **[Divergência claro/escuro entre `data-theme="dark"` e a media query]** → mesmos
  overrides reutilizados pelos dois seletores (não duplicar a lista de tokens).
- **[Cobertura]** → `prefs` e `resolveTheme` são puros e cobertos por `node --test`,
  ajudando o piso de cobertura; o wiring de DOM fica fora do teste unitário (aceito).

## Migration Plan

Sem migração de dados: `wc2026_theme_v1` é uma chave nova; ausência → default `system`.
Rollback = reverter o change; nenhuma chave existente é alterada ou removida.

## Open Questions

Nenhuma. A discussão `system` vs. forçar tema (prevista na ADR-0003) resolve-se por
FR-APR2, que exige suportar `system` como um dos três estados.
