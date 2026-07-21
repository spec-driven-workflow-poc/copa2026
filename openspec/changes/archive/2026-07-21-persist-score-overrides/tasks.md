## 1. Breadcrumb no código

- [x] 1.1 Inserir a nota de follow-up do helper `prefs` namespaced em `app.js`,
      imediatamente após a função `saveOverrides` (ADR-0002)

## 2. Teste-guarda

- [x] 2.1 Criar `test/persistence.test.js` afirmando a chave `wc2026_overrides_v1`
      (padrão da ADR-0002)
- [x] 2.2 No mesmo teste, afirmar ausência de `document.cookie` em `app.js` (ADR-0002)

## 3. Gates

- [x] 3.1 Rodar `make check` e confirmar verde (prettier + eslint + node --test +
      cobertura ≥ 20%)
- [x] 3.2 Rodar `npx openspec validate persist-score-overrides --strict`
