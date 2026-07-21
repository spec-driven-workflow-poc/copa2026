## 1. Breadcrumb no código

- [x] 1.1 Inserir a nota de follow-up da extração de cores hardcoded para tokens em
      `styles.css`, imediatamente acima de `:root {` (ADR-0003)

## 2. Teste-guarda

- [x] 2.1 Criar `test/theming.test.js` afirmando que `styles.css` define os tokens
      de cor base (`--bg`, `--ink`) no `:root` (ADR-0003)

## 3. Gates

- [x] 3.1 Rodar `make check` e confirmar verde (prettier + eslint + node --test +
      cobertura ≥ 20%)
- [x] 3.2 Rodar `npx openspec validate establish-ui-shell --strict`
