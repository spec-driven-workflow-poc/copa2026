## 1. Funções puras (TDD — teste primeiro)

- [x] 1.1 Escrever testes (`node --test`) para `prefs.get/set`: chave namespaced `wc2026_*_v1`, round-trip, e degradação segura ao default quando ausente/JSON inválido
- [x] 1.2 Escrever testes para `resolveTheme(pref, systemPrefersDark)`: `light`→light, `dark`→dark, `system`→segue `systemPrefersDark`, valor inválido→`system`
- [x] 1.3 Implementar `prefs` (leitura/escrita namespaced com try/catch) e `resolveTheme`; exportá-los no seam `module.exports` (guardado por `typeof module`)
- [x] 1.4 Rodar os testes até verde

## 2. Tokens de cor e tema escuro (CSS)

- [x] 2.1 Extrair os literais hardcoded fora dos tokens (gradiente da topbar, fundo das abas, tooltip, fundos de input) e o `--bline` secundário para tokens no `:root` base
- [x] 2.2 Adicionar o bloco de override `:root[data-theme="dark"]` redefinindo os tokens (fonte única dos valores escuros)
- [x] 2.3 Cobrir o modo `system` sem duplicar tokens: o tema efetivo é resolvido em JS (`resolveTheme` + `matchMedia`) e gravado em `data-theme`, então o único bloco `:root[data-theme="dark"]` serve tanto `dark` explícito quanto `system`+SO-escuro (ver design.md)
- [x] 2.4 Verificar: nenhuma regra fora dos blocos `:root` contém literal de cor (grep hex/rgb/hsl)
- [x] 2.5 Atualizar/remover o comentário de follow-up em `styles.css:2-6` (extração concluída)

## 3. Seletor e aplicação do tema

- [x] 3.1 Adicionar o controle do seletor (`light | dark | system`) na topbar (`index.html`)
- [x] 3.2 Script inline mínimo no `<head>`: ler `prefs` e setar `data-theme` no `<html>` antes do primeiro paint (anti-flash), sem literais de cor
- [x] 3.3 Wiring no `app.js`: ao mudar o seletor, gravar em `prefs` e aplicar `data-theme`; refletir a preferência atual no controle
- [x] 3.4 Em `system`, registrar `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", …)` para reagir ao vivo; remover/ignorar o listener quando `light`/`dark`
- [x] 3.5 Atualizar o comentário `app.js:123-125` (helper `prefs` introduzido — 2ª preferência)

## 4. Gates e verificação

- [x] 4.1 `prettier --check` e `eslint` verdes
- [x] 4.2 `node --test` verde; cobertura de linhas ≥ 20% em `app.js`
- [ ] 4.3 Verificação manual: alternar os três estados; recarregar (persistência, sem flash); alternar o tema do SO em modo `system` (reação ao vivo)
- [x] 4.4 `openspec validate --strict` verde
