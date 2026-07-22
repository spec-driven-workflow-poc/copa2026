## Why

A página só tem o tema claro; não há como o usuário alternar para escuro ou seguir o
sistema, nem a página lembra qualquer preferência. As decisões transversais já estão
tomadas — ADR-0003 (tokens + `data-theme` `light|dark|system`) e ADR-0002 (persistência
em `localStorage` + helper `prefs` quando surgir a 2ª preferência) — plantadas justamente
para FR-APR2. Esta mudança as realiza.

## What Changes

- **Seletor de tema** na casca de UI (topbar): três estados — claro (`light`), escuro
  (`dark`) e seguir o sistema (`system`).
- **Aplicação por `data-theme`** no elemento raiz. `system` resolve via
  `prefers-color-scheme` e **reage ao vivo** a mudanças do SO (sem reload) enquanto o
  usuário estiver em `system`.
- **Persistência da escolha** em `localStorage` na chave `wc2026_theme_v1`; relida e
  reaplicada na próxima visita (antes do primeiro paint, para evitar flash de tema).
- **Helper `prefs`** namespaced (leitura/escrita centralizadas sob `wc2026_*_v1`) —
  gatilho da 2ª preferência de usuário (ADR-0002); a preferência de tema passa por ele.
- **Extração dos literais de cor hardcoded** de `styles.css` para tokens no `:root`
  (gradiente da topbar, fundo das abas, tooltip, fundos de input) e um bloco de override
  `:root[data-theme="dark"]` — nenhuma regra ganha novo literal de cor (ADR-0003).

## Capabilities

### New Capabilities

<!-- Nenhuma capability (spec-id) nova: o comportamento se encaixa em contratos existentes. -->

### Modified Capabilities

- `ui-shell`: o requisito "Cores de tema por tokens no :root" passa de *preparação*
  (tokens definidos + follow-up de extração registrado) para *tema selecionável* —
  adiciona o seletor `light|dark|system`, a aplicação por `data-theme`, a resolução de
  `system` via `prefers-color-scheme` (com reação ao vivo), o bloco de override escuro e
  conclui a extração dos hardcodes.
- `state-persistence`: o requisito de persistência em `localStorage` passa a cobrir a
  **preferência de tema** (`wc2026_theme_v1`), lida/escrita pelo helper `prefs`
  namespaced — mantendo o invariante "estado do usuário só em `localStorage`,
  versionado/namespaced".

## Impact

- **Código:** `styles.css` (tokens novos + bloco `[data-theme="dark"]` + remoção dos
  hardcodes), `app.js` (helper `prefs`, init de tema pré-paint, wiring do seletor,
  listener de `prefers-color-scheme`), `index.html` (controle do seletor na topbar).
- **Testes:** funções puras do `prefs` (via o seam `module.exports`) + resolução de tema.
- **Invariantes tocados:** cor via token (ADR-0003); estado só em `localStorage`
  namespaced (ADR-0002). Sem build (ADR-0001). Edições manuais / fuso — não tocados.
- **Deps:** APR-01 (🟢), ADR-0002 (Accepted), ADR-0003 (Accepted).
