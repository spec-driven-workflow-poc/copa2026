# state-persistence Specification

## Purpose
TBD - created by archiving change persist-score-overrides. Update Purpose after archive.
## Requirements
### Requirement: Persistência de overrides somente em localStorage

O sistema SHALL persistir placares editados manualmente (overrides) exclusivamente
em `localStorage`, sob uma chave versionada e namespaced no formato `wc2026_*_v1`
(atualmente `wc2026_overrides_v1`). O sistema MUST NOT usar cookies nem qualquer
persistência em servidor para estado do usuário. _(ADR-0002)_

#### Scenario: Override gravado sobrevive a reload

- **WHEN** o usuário edita o placar de um jogo e recarrega a página
- **THEN** o placar editado é lido de `localStorage` na chave `wc2026_overrides_v1`
  e permanece aplicado

#### Scenario: Nenhum cookie é usado para persistência

- **WHEN** o app persiste ou lê o estado do usuário
- **THEN** nenhuma leitura ou escrita ocorre via `document.cookie`

#### Scenario: Falha de leitura degrada com segurança

- **WHEN** o conteúdo em `localStorage` está ausente ou corrompido (JSON inválido)
- **THEN** o app assume um conjunto de overrides vazio sem lançar erro

### Requirement: Precedência da edição manual sobre a API

Uma edição manual SHALL ter precedência sobre o resultado automático da API: um
refresh da openfootball MUST NOT sobrescrever um jogo com override. O usuário SHALL
poder reverter um override ao valor automático. _(ADR-0004)_

#### Scenario: Refresh da API não sobrescreve override

- **WHEN** existe um override para um jogo e a API é recarregada
- **THEN** o placar exibido para esse jogo permanece o valor editado manualmente

#### Scenario: Reverter restaura o valor automático

- **WHEN** o usuário reverte um jogo com override
- **THEN** o override é removido de `localStorage` e o jogo volta a seguir a API

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

