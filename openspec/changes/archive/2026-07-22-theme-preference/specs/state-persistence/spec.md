## ADDED Requirements

### Requirement: Preferência de tema persistida em localStorage

O sistema SHALL persistir a preferência de tema do usuário exclusivamente em
`localStorage`, sob a chave versionada e namespaced `wc2026_theme_v1`, através de um
helper `prefs` que centraliza leitura/escrita namespaced sob o prefixo `wc2026_*_v1`.
O sistema MUST NOT usar cookies nem persistência em servidor para essa preferência.
Uma leitura ausente ou inválida SHALL degradar com segurança para o padrão `system`.
_(ADR-0002)_

#### Scenario: Preferência de tema sobrevive a reload

- **WHEN** o usuário escolhe um tema e recarrega a página
- **THEN** a preferência é lida de `localStorage` na chave `wc2026_theme_v1` (via `prefs`)
  e reaplicada

#### Scenario: Padrão seguro sem preferência salva

- **WHEN** não existe `wc2026_theme_v1` (primeira visita) ou seu valor é inválido
- **THEN** o app assume o tema `system` sem lançar erro

#### Scenario: Nenhum cookie para a preferência de tema

- **WHEN** o app persiste ou lê a preferência de tema
- **THEN** nenhuma leitura ou escrita ocorre via `document.cookie`
