# Copa2026 Workflow Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `copa2026` fork into a self-contained demo repo that runs Paymon's agentic workflow end-to-end live, staging the `dark-mode` change so the audience sees a frozen decision (ADR) persist across a brief, an in-place follow-up, the live change, and the archived spec.

**Architecture:** Transplant Paymon's _portable_ workflow layer (workflow README + templates + skills + OpenSpec init) verbatim, then author a **scaled, honest** project layer for copa2026 (4 ADRs, 3 capabilities, a mini-ROADMAP, real JS gates). Bootstrap two foundational changes through the workflow to document existing behavior and plant two follow-up breadcrumbs. Then build `dark-mode` **once, fully, ahead of the presentation** by running it through the workflow (`workflow-execute-change`) on its own worktree branch — **the session history of that run _is_ the demo**, replayed live to walk the audience through propose → align → apply → review → archive. `main` is at the pre-change state _during_ the run so it's authentic; once the session history is captured, the completed change is **merged** so the repo reflects its true final end state. See **Direction update (2026-07-22)** below for the decisions that supersede the original "prebuild a reference branch + dry-run rehearsal" framing.

**Tech Stack:** Vanilla HTML/CSS/JS (no build, IIFE in `app.js` with a `module.exports` test seam). Node 26 (`node --test` + `--experimental-test-coverage`; CI pins 26 — see Task 4), Prettier, ESLint (flat config), Make, GitHub Actions. OpenSpec CLI 1.6.0 (via `npx openspec`). `gh` 2.96 + remote `spec-driven-workflow-poc/copa2026`.

## Global Constraints

- **Artifact language: Portuguese (pt-BR).** Every generated workflow artifact (`AGENTS.md`, ADRs, briefs, change-maps, ROADMAP, overview, glossary, OpenSpec proposals/specs) is authored in Portuguese. Domain terms kept verbatim: `grupo`, `mata-mata`, `chaveamento`, `terceiro colocado`, `pênaltis`, `prorrogação`. The app UI stays pt-BR (unchanged).
- **Portable layer copied verbatim, never rewritten:** `docs/workflow/README.md` and `docs/workflow/templates/*` are copied unchanged from Paymon. The OpenSpec skills (`openspec-*`) are copied unchanged. Only `AGENTS.md`, the workflow skills' _gate references_, and the project artifacts are copa2026-specific.
- **No build step (ADR-0001).** The app must keep running by opening `index.html` via `file://`. No bundler, no transpile. `app.js` stays an IIFE; its `module.exports` block stays guarded (`typeof module !== "undefined"`) so tests can import pure functions without breaking the browser.
- **Client-persistence invariant (ADR-0002).** All user state persists **only** in `localStorage` under a versioned, namespaced key. Never cookies, never a server.
- **Theming invariant (ADR-0003).** All colors flow through CSS custom properties (design tokens). No new hardcoded color literals in rules; a theme is `light | dark | system`.
- **Manual-edit invariant (ADR-0004).** Manually edited scores are never overwritten by an API refresh; the API is authoritative only for non-edited matches. Displayed times are GMT-3 (America/São_Paulo).
- **OpenSpec spec-ids are behavior-scoped**, kebab-case (e.g. `state-persistence`, `color-theme`, `standings-table`) — **never** a copa2026 capability name.
- **Gates are non-negotiable and must be green locally before any PR opens:** `make check` = `prettier --check` + `eslint` + `node --test` + coverage floor. No faking output.

---

## Direction update (2026-07-22, post-discussion)

> This section is **canonical** where it conflicts with the original task text below. It
> was added after a `discussion`-skill session that found the staging **already built** and
> reframed the final beat. Tasks 1–12 below are a faithful record of how the current repo
> state was produced; **Tasks 13–14 are superseded** as noted here.

**Current repo state (verified):** Tasks 1–12 are **done and committed**. `main` sits at the
clean pre-change point — no `data-theme` / theme code in `app.js`, `styles.css`, `index.html`;
`dark-mode` (APR-02) is reserved `🔲` in the ROADMAP; both follow-up breadcrumbs are planted
(`app.js` `prefs` note, `styles.css` color-token note). The repo is therefore **already** in the
"greenfielded-via-workflow, dark-mode is the natural next change" state the demo needs. **No
re-staging work remains.**

**The demo _is_ the session history of building `dark-mode` through the workflow.** Ahead of the
presentation, `dark-mode` is built **once, fully** by running `workflow-execute-change dark-mode`
end-to-end. The resulting Claude Code **session history** — pre-flight → propose → align → apply →
review → archive — is what gets shown live, beat by beat.

**Two demo deliverables come out of this** (the `dark-mode` feature itself is _not_ one of them —
merging it afterward is repo hygiene, not a deliverable; see Decision 1):

1. The **session history** of the workflow run (the Claude Code transcript, shown on screen).
2. A written **demo narration transcript** — the presenter's spoken script that walks that session
   history beat by beat ("first we run `workflow-execute-change`, and here's what it produced… notice
   the agent pushed back citing ADR-0002…"), tying each beat back to the presentation's concepts.
   Authored in Task 15 Step 4 as `docs/superpowers/demo-script.md`.

**Decisions settled in the discussion:**

1. **Start clean `🔲`, then merge to reflect the end state.** The run starts from clean `main` (🔲)
   so the session history is authentic, and executes on its own worktree branch. **Once the session
   history is captured and the narration transcript written, the completed change is merged to
   `main`** so the repo reflects its true final end state (dark-mode implemented, `color-theme` spec
   archived, APR-02 → `🟢`). The feature is still _not_ a demo deliverable — merging is repo hygiene,
   the honest final outcome of a completed change; the **artifacts remain the session history and the
   narration transcript**, which persist independently of git state, and git history preserves the
   pre-change commit for a future re-run. (Supersedes the original "rehearse then discard" framing
   _and_ the earlier "keep `main` clean / feature disposable" note.)
2. **Implement `dark-mode` fresh from scratch — no reference, no fallback.** The agent genuinely
   implements, guided only by the ADRs and the planted breadcrumbs; that emergent guidance _is_ the
   point the presentation argues. **The old `prebuilt/dark-mode` branch has been deleted** (local +
   remote): it was built _outside_ the workflow, so its session history is not demo-usable, and a
   fresh capture is repeatable and off-stage, so no safety net is needed. **Task 13 is obsolete.**
   (Supersedes Task 13 in full and Task 15 Step 2.5.)
3. **Align beat — kept and human-driven.** During the run the presenter proposes a cookie /
   "toggle forces theme, ignore the OS"; the agent must push back citing **ADR-0002**
   (localStorage, not cookie) and **ADR-0003** (`system` is first-class), landing on
   `localStorage` + `light|dark|system`. This is the strongest "frozen decisions persist" beat.

**What still needs doing:** only **Task 15 as revised below** — the full workflow build of
`dark-mode`, captured as the demo session history. **Task 13 is obsolete** (branch deleted) and
**Task 14 (plausible-B) stays optional and skipped** (branch `plausible-b/dark-mode` never created).

---

## File Structure

**Transplanted verbatim from Paymon (`~/workspace/Paymon`):**

- `docs/workflow/README.md` — the process doc (reusable across repos; copied unchanged).
- `docs/workflow/templates/{brief,change-map,adr,roadmap,overview}.md` — artifact templates.
- `.claude/skills/{openspec-explore,openspec-propose,openspec-apply-change,openspec-archive-change,requirement-intake,workflow-code-review,workflow-adversarial-review,workflow-receiving-code-reviews,workflow-execute-change}/` — the workflow skills. Only gate-command references inside them are adapted (Task 2.x).
- `openspec/` — created fresh by `openspec init`; `spec-lite` schema added; `config.yaml` rewritten for copa2026 spec-id guidance.

**Authored for copa2026 (Portuguese):**

- `AGENTS.md` — constitution: stack, invariants, gates, tier rules, doc map.
- `docs/glossary.md` — domain vocabulary + OpenSpec term disambiguation.
- `docs/adr/0001-arquitetura-sem-build.md`, `0002-persistencia-no-cliente.md`, `0003-tema-e-tokens-de-cor.md`, `0004-fonte-de-dados-e-fuso.md`.
- `docs/architecture/overview.md` — conceptual map (links only).
- `docs/capabilities/dados/{brief,change-map}.md`, `docs/capabilities/classificacao/{brief,change-map}.md`, `docs/capabilities/apresentacao/{brief,change-map}.md`.
- `docs/ROADMAP.md` — cross-capability dashboard.

**Tooling (new):**

- `package.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `Makefile`, `.github/workflows/gates.yml`.
- `test/` — `node --test` specs.

**App files touched by the demo change (`dark-mode`):** `index.html`, `styles.css`, `app.js`.

**Capability / change / ADR IDs (fixed — later tasks depend on these exact strings):**

- Capabilities: `dados`, `classificacao`, `apresentacao`.
- Change codes: `DAT-*` (dados), `CLA-*` (classificacao), `APR-*` (apresentacao).
- Foundational archived changes (document existing code, plant breadcrumbs): `persist-score-overrides` (DAT-02), `establish-ui-shell` (APR-01).
- Live demo change: `dark-mode` (APR-02).
- Spec-ids used: `state-persistence`, `standings-table`, `knockout-bracket`, `data-ingestion`, `ui-shell`, `color-theme`.

---

## Task 1: Transplant the portable workflow layer (docs + templates)

**Files:**

- Create: `docs/workflow/README.md`, `docs/workflow/templates/{brief,change-map,adr,roadmap,overview}.md` (copied from Paymon)

**Interfaces:**

- Produces: the process doc + templates every later task references. `README.md` is copied byte-for-byte (portability claim in the talk depends on it being unchanged).

- [ ] **Step 1: Copy the workflow folder verbatim**

```bash
cd ~/projects/copa2026
mkdir -p docs/workflow/templates
cp ~/workspace/Paymon/docs/workflow/README.md docs/workflow/README.md
cp ~/workspace/Paymon/docs/workflow/templates/*.md docs/workflow/templates/
```

- [ ] **Step 2: Verify the copy is byte-identical**

Run: `diff -r ~/workspace/Paymon/docs/workflow docs/workflow`
Expected: no output (identical). This is the evidence for the "reusable across repos" claim.

- [ ] **Step 3: Commit**

```bash
git checkout -b feat/workflow-demo-scaffold
git add docs/workflow
git commit -m "chore: transplant portable workflow doc + templates from Paymon"
```

---

## Task 2: Transplant the workflow skills and adapt gate references

**Files:**

- Create: `.claude/skills/{openspec-explore,openspec-propose,openspec-apply-change,openspec-archive-change,requirement-intake,workflow-code-review,workflow-adversarial-review,workflow-receiving-code-reviews,workflow-execute-change}/`
- Modify: any skill line that hardcodes Go gate commands (see Step 3)

**Interfaces:**

- Consumes: nothing.
- Produces: the skills invoked live (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `workflow-execute-change`, `workflow-code-review`). These key off `AGENTS.md`'s gate set — Task 8 makes that JS.

- [ ] **Step 1: Copy all workflow skills verbatim**

```bash
cd ~/projects/copa2026
mkdir -p .claude/skills
cp -R ~/workspace/Paymon/.claude/skills/openspec-explore \
      ~/workspace/Paymon/.claude/skills/openspec-propose \
      ~/workspace/Paymon/.claude/skills/openspec-apply-change \
      ~/workspace/Paymon/.claude/skills/openspec-archive-change \
      ~/workspace/Paymon/.claude/skills/requirement-intake \
      ~/workspace/Paymon/.claude/skills/workflow-code-review \
      ~/workspace/Paymon/.claude/skills/workflow-adversarial-review \
      ~/workspace/Paymon/.claude/skills/workflow-receiving-code-reviews \
      ~/workspace/Paymon/.claude/skills/workflow-execute-change \
      .claude/skills/
```

- [ ] **Step 2: Find every Go-specific gate/stack reference in the copied skills**

Run: `grep -rniE "go test|golangci|gofmt|goimports|go vet|goroutine|-race|\bgo\b" .claude/skills/`
Expected: matches only inside `workflow-execute-change/` and `workflow-code-review/` (the OpenSpec skills are stack-agnostic). Record each hit.

- [ ] **Step 3: Adapt gate references to be stack-neutral (point at AGENTS.md, not Go)**

For each hit from Step 2, replace concrete Go commands with a pointer to the constitution. The skills must say "run the `AGENTS.md` gate set (`make check`)" rather than naming `go test`. Example edit pattern — in `workflow-execute-change/SKILL.md` Phase 3 step 4, the text already reads "`AGENTS.md` gate set green locally"; leave prose that already delegates to `AGENTS.md` untouched. Only replace _Go-command examples_ (e.g. a literal `go test -race ./...`) with `make check`. If `workflow-code-review/` names Go tools in an example, change the example to: `make check` (Prettier + ESLint + node --test + coverage).

Verification after editing:
Run: `grep -rniE "go test|golangci|gofmt|goimports|-race" .claude/skills/`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills
git commit -m "chore: transplant workflow skills; retarget gate refs to make check"
```

---

## Task 3: Initialize OpenSpec + the T1 spec-lite schema

**Files:**

- Create: `openspec/` (via CLI), `openspec/config.yaml` (rewritten), `openspec/schemas/spec-lite/*` (via CLI)

**Interfaces:**

- Produces: a working `openspec` install so `openspec new change`, `openspec validate --strict`, `openspec archive` run. `spec-lite` (proposal+specs+tasks, no design) backs T1 changes.

- [ ] **Step 1: Initialize OpenSpec for Claude**

```bash
cd ~/projects/copa2026
npx openspec init --tools claude
```

Expected: creates `openspec/` with `changes/`, `specs/`, `config.yaml`.

- [ ] **Step 2: Create the T1 lite schema**

```bash
npx openspec schema init spec-lite --artifacts proposal,specs,tasks --no-default
```

Expected: `openspec/schemas/spec-lite/` created. Verify: `npx openspec schema list` shows `spec-driven` (default) and `spec-lite`.

- [ ] **Step 3: Rewrite `openspec/config.yaml` for copa2026 spec-id guidance (Portuguese)**

Replace the file contents with:

```yaml
schema: spec-driven

# Mostrado à IA ao criar artefatos (proposal/specs/design/tasks).
context: |
  "Capability" do copa2026 (docs/capabilities/<cap>/: dados, classificacao,
  apresentacao) NÃO é uma capability do OpenSpec. Os spec-ids em
  openspec/specs/ são contratos por COMPORTAMENTO, kebab-case (ex.:
  state-persistence, color-theme, standings-table): uma capability do
  copa2026 acumula VÁRIOS spec-ids. Regra de nomenclatura: docs/glossary.md.

rules:
  proposal:
    - >-
      A seção Capabilities da proposal nomeia capabilities do OpenSpec, i.e.
      spec-ids: liste contratos de comportamento kebab-case, nunca o nome de
      uma capability do copa2026 (dados, classificacao, apresentacao). Reutilize
      um openspec/specs/<spec-id>/ existente quando o comportamento dele muda;
      crie um id novo para comportamento novo.
  specs:
    - >-
      Uma pasta por spec-id de comportamento; nunca agrupe deltas sob o nome de
      uma capability do copa2026.
```

- [ ] **Step 4: Verify + commit**

Run: `npx openspec validate --strict` (no changes yet → should report nothing to validate, exit 0) and `npx openspec schema list`.
Expected: both succeed; `spec-lite` listed.

```bash
git add openspec .gitignore
git commit -m "chore: openspec init + spec-lite schema + copa2026 spec-id guidance"
```

---

## Task 4: Stand up real JS gates (package.json, Prettier, ESLint, Make, CI)

**Files:**

- Create: `package.json`, `.prettierrc.json`, `.prettierignore`, `eslint.config.js`, `Makefile`, `.github/workflows/gates.yml`

**Interfaces:**

- Produces: `make check` — the single gate command every change runs and `AGENTS.md` names. Consumed by `workflow-execute-change` Phase 3 step 4 and the CI backstop.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "copa2026",
  "version": "1.0.0",
  "private": true,
  "description": "Acompanhamento da Copa do Mundo 2026 (HTML/CSS/JS puro).",
  "scripts": {
    "format:check": "prettier --check \"**/*.{js,css,html,json,md}\"",
    "format:write": "prettier --write \"**/*.{js,css,html,json,md}\"",
    "lint": "eslint .",
    "test": "node --test --experimental-test-coverage --test-coverage-include='app.js' --test-coverage-lines=20 \"test/**/*.test.js\"",
    "check": "npm run format:check && npm run lint && npm run test"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

Note on the coverage floor: the existing `app.js` has many untested pure functions; measured line coverage with the seed test is **23.20%**, so **20%** is the honest reachable floor for the demo (raised implicitly for `dark-mode`'s own module, which is fully tested). Do not set a floor the repo can't currently meet — a red gate at rehearsal is worse than an honest number. **Units:** `--test-coverage-lines` takes a **percentage (0–100)** on Node 26, not a fraction — `20` means 20%, `0.55` would mean 0.55% (silently non-enforcing).

Note on the test glob: the positional is `"test/**/*.test.js"`, not a bare `test/` directory. On Node ≥23 (this repo runs Node 26) `node --test <dir>` treats the positional as a module to load and errors; the explicit glob works on both Node 22 and 26.

- [ ] **Step 2: Create `.prettierrc.json` and `.prettierignore`**

`.prettierrc.json`:

```json
{ "printWidth": 100, "singleQuote": false, "trailingComma": "none" }
```

`.prettierignore`:

```
openspec/
docs/workflow/
countries.js
```

(We exclude `countries.js` — generated data — and the transplanted verbatim folders so a reformat never diffs the portable layer.)

- [ ] **Step 3: Create `eslint.config.js` (flat config, browser + node globals)**

```js
"use strict";
module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["openspec/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        ResizeObserver: "readonly",
        module: "writable",
        COUNTRIES: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  }
];
```

- [ ] **Step 4: Create `Makefile`**

```makefile
.PHONY: check format lint test install
install:
	npm install
check:
	npm run check
format:
	npm run format:write
lint:
	npm run lint
test:
	npm run test
```

- [ ] **Step 5: Create `.github/workflows/gates.yml` (CI backstop)**

```yaml
name: gates
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "26"
      - run: npm install
      - run: make check
```

- [ ] **Step 6: Install deps and confirm the gate runs (it will fail until Task 5 adds a test)**

Run: `npm install && npm run format:write && npm run lint`
Expected: install succeeds; `lint` passes (warnings ok, no errors). `npm test` will fail with "no test files" — resolved in Task 5. Do not commit a red `make check`.

- [ ] **Step 7: Commit tooling (without the failing test gate yet)**

```bash
git add package.json package-lock.json .prettierrc.json .prettierignore eslint.config.js Makefile .github/workflows/gates.yml
git commit -m "chore: add JS gates (prettier, eslint, node --test, make check, CI)"
```

---

## Task 5: Seed a first test so `make check` is green end-to-end

This proves the gate is real before any workflow ceremony. It tests an existing pure function (`sortRows`) already exported by `app.js`.

**Files:**

- Create: `test/standings.test.js`

**Interfaces:**

- Consumes: `require("../app.js")` → `{ sortRows }` (already exported, `app.js:646` block).
- Produces: a green `make check`.

- [ ] **Step 1: Write a failing test (function not yet imported)**

`test/standings.test.js`:

```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const app = require("../app.js");

test("sortRows ordena por PTS, depois SG, depois GP", () => {
  const a = { PTS: 6, SG: 2, GP: 4 };
  const b = { PTS: 3, SG: 5, GP: 9 };
  assert.ok(app.sortRows(a, b) < 0, "mais pontos vem primeiro");
});

test("sortRows desempata por saldo de gols quando PTS empatam", () => {
  const a = { PTS: 3, SG: 4, GP: 5 };
  const b = { PTS: 3, SG: 1, GP: 9 };
  assert.ok(app.sortRows(a, b) < 0, "maior SG vem primeiro");
});
```

- [ ] **Step 2: Run it to confirm the harness works**

Run: `npm test`
Expected: 2 tests pass; a coverage table prints; the 20% line floor is met (measured 23.20%). If the floor fails, adjust it down to the honest current number and record it (done: 55% → 20%, and the flag value corrected from the fractional `0.55` to the percentage `20`).

- [ ] **Step 3: Confirm full gate green**

Run: `make check`
Expected: format check passes, lint passes, tests pass. This is the first fully-green gate.

- [ ] **Step 4: Commit**

```bash
git add test/standings.test.js
git commit -m "test: seed standings sort test; make check green end-to-end"
```

---

## Task 6: Author the glossary

**Files:**

- Create: `docs/glossary.md`

**Interfaces:**

- Produces: canonical domain terms + the `capability` disambiguation that `openspec/config.yaml` and every artifact reference.

- [ ] **Step 1: Write `docs/glossary.md` (Portuguese)**

```markdown
# Glossário — Copa2026

> Vocabulário de domínio para os specs do copa2026 (convenção de idioma em
> [workflow/README.md](workflow/README.md)). Termos de domínio mantidos verbatim.

| Termo                        | Definição                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Grupo**                    | Um dos 12 grupos da fase de grupos (A–L), com 4 seleções cada.                                               |
| **Classificação**            | Tabela ordenada de um grupo por PTS, SG, GP (regra em `app.js:sortRows`).                                    |
| **Terceiro colocado**        | 3º de cada grupo; os 8 melhores avançam ao mata-mata (posição no chaveamento é estimativa, marcada com `≈`). |
| **Mata-mata / Chaveamento**  | Fase eliminatória (R32→final) com o bracket de dois lados.                                                   |
| **Pênaltis**                 | Disputa que decide o vencedor em empate no mata-mata.                                                        |
| **Override (edição manual)** | Placar digitado pelo usuário; salvo em localStorage, nunca sobrescrito pela API (ADR-0004).                  |
| **Preferência de usuário**   | Estado do usuário persistido no cliente (ex.: tema); regido pela ADR-0002.                                   |
| **Tema**                     | Aparência visual `claro                                                                                      | escuro | sistema` (ADR-0003). |
| **Token de cor**             | Custom property CSS que carrega uma cor; base do tema (ADR-0003).                                            |

## Termos que colidem com o OpenSpec

**Regra — `capability`:** "capability" sem qualificação = o conceito do **copa2026**
(`docs/capabilities/<cap>/`: dados, classificacao, apresentacao). Para o conceito do
OpenSpec, escreva **"spec"/"spec-id"** (contrato de comportamento kebab-case). Um
copa2026 capability acumula vários spec-ids.
```

- [ ] **Step 2: Commit**

```bash
git add docs/glossary.md
git commit -m "docs: add copa2026 glossary"
```

---

## Task 7: Author the four foundational ADRs (Phase 0)

ADR numbering follows the template rule (highest committed/in-flight +1). All four are `Accepted` before fanout (Principle 5). **ADR-0002 and ADR-0003 are the persistence-chain stars — author them in full.**

**Files:**

- Create: `docs/adr/0001-arquitetura-sem-build.md`, `0002-persistencia-no-cliente.md`, `0003-tema-e-tokens-de-cor.md`, `0004-fonte-de-dados-e-fuso.md`

**Interfaces:**

- Produces: the decisions that `AGENTS.md` invariants cite and that the `dark-mode` change must honor. ADR-0002 is cited during the live align-phase disagreement; ADR-0003 during `apply`.

- [ ] **Step 1: Write `docs/adr/0001-arquitetura-sem-build.md`**

```markdown
# ADR-0001 — Arquitetura sem build (HTML/CSS/JS puro)

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** NFR-APR (portabilidade)

## Context

A página precisa abrir por duplo clique (`file://`), sem servidor nem instalação.
Uma etapa de build (bundler/transpiler) quebraria esse uso e adicionaria ferramentas
que o público não precisa ver para entender o app.

## Decision

Sem etapa de build. `app.js` é uma IIFE única; funções puras são exportadas via um
bloco `module.exports` **guardado** por `typeof module !== "undefined"`, para que os
testes (`node --test`) importem sem afetar o navegador. Estilos em `styles.css`, dados
estáticos em `countries.js`.

## Alternatives considered

- Bundler (Vite/esbuild) — rejeitado: quebra o `file://`, peso desnecessário.
- Framework (React) — rejeitado: reescrita total, contrário ao propósito do demo.

## Consequences

- (+) Portável, inspecionável, zero setup para rodar.
- (−) Sem módulos ES; organização por convenção dentro da IIFE.
- Downstream: gates são JS puros (Prettier/ESLint/node --test); afeta todas as capabilities.

## Traceability

NFR de portabilidade (abrir via `file://`); base para os gates de `AGENTS.md`.
```

- [ ] **Step 2: Write `docs/adr/0002-persistencia-no-cliente.md` (chain star — full)**

```markdown
# ADR-0002 — Persistência de estado no cliente

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** FR-DAT (overrides), FR-APR (tema)

## Context

O app não tem backend. Estado do usuário — placares editados manualmente (já existente,
`app.js:loadOverrides/saveOverrides`) e, futuramente, preferências como tema — precisa
sobreviver a reloads. Sem uma decisão única, cada feature escolheria seu mecanismo
(cookie, `localStorage`, querystring), gerando divergência (_spec drift_) e comportamento
inconsistente entre sessões.

## Decision

Todo estado do usuário persiste **exclusivamente em `localStorage`**, sob chaves
**versionadas e namespaced** com o prefixo `wc2026_` e sufixo de versão (`_v1`)
— ex.: `wc2026_overrides_v1`, `wc2026_theme_v1`. **Nunca** cookies, **nunca** servidor.
Quando uma **segunda** preferência de usuário for adicionada, introduzir um pequeno
helper de preferências (`prefs`) que centralize leitura/escrita namespaced, em vez de
espalhar chaves soltas. _(Este é o gatilho do follow-up plantado por `persist-score-overrides`.)_

## Alternatives considered

- Cookies — rejeitado: enviados a cada request (irrelevante aqui), limite de tamanho,
  semântica de expiração desnecessária, pior DX para estado puramente de UI.
- Querystring/URL — rejeitado para estado persistente: some ao navegar; ok apenas para
  parâmetros efêmeros de admin (`?date`).
- Backend/sync — fora de escopo (ADR-0001, sem servidor).

## Consequences

- (+) Um único eixo de persistência; fácil de auditar e versionar (migração por bump de sufixo).
- (+) Torna a _align-phase_ do `dark-mode` decidível por referência a esta ADR (cookie é rejeitado aqui).
- (−) Estado preso ao navegador/dispositivo (aceitável — é acompanhamento pessoal).

## Traceability

FR-DAT2 (overrides persistentes), FR-APR2 (preferência de tema persistente).
```

- [ ] **Step 3: Write `docs/adr/0003-tema-e-tokens-de-cor.md` (chain star — full)**

```markdown
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
- (+) `align-phase` do `dark-mode` pode discutir `system` vs. forçar tema por esta ADR.
- (−) Exige a dívida de extrair os hardcodes (endereçada pelo follow-up + `dark-mode`).

## Traceability

FR-APR1 (alternar tema), FR-APR2 (persistir tema — via ADR-0002).
```

- [ ] **Step 4: Write `docs/adr/0004-fonte-de-dados-e-fuso.md`**

```markdown
# ADR-0004 — Fonte de dados e fuso horário

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** FR-DAT

## Context

Resultados vêm da API pública openfootball; o usuário pode editar placares. Sem uma regra
de precedência, um refresh sobrescreveria edições manuais. Horários da API estão em UTC.

## Decision

openfootball é a fonte automática (`DATA_URL` em `app.js`). **Edições manuais têm
precedência e nunca são sobrescritas** por refresh; a API só decide jogos não-editados.
Todos os horários são exibidos em **GMT-3 (America/São_Paulo)** (`toGmt3`).

## Alternatives considered

- API sempre vence — rejeitado: destrói simulações do usuário.
- Fuso do navegador — rejeitado: público-alvo é Brasil; consistência de tela.

## Consequences

- (+) Simulação segura; comportamento previsível offline (overrides sobrevivem a falha da API).
- (−) Edição obsoleta persiste até o usuário reverter (aceitável; há botão ↺ reverter).

## Traceability

FR-DAT1 (ingestão), FR-DAT2 (overrides), FR-DAT3 (exibição em GMT-3).
```

- [ ] **Step 5: Commit**

```bash
git add docs/adr
git commit -m "docs: add foundational ADRs 0001-0004 (Accepted)"
```

---

## Task 8: Author `AGENTS.md` (constitution)

**Files:**

- Create: `AGENTS.md`

**Interfaces:**

- Consumes: the ADRs (Task 7), the gates (Task 4), the workflow README (Task 1).
- Produces: the invariants list + gate set that `workflow-code-review`, `workflow-adversarial-review`, and `workflow-execute-change` check against. This is what makes the transplanted skills work for JS.

- [ ] **Step 1: Write `AGENTS.md` (Portuguese, router + invariants)**

```markdown
# Copa2026 — Contexto do Agente

**Copa2026** é uma página estática (HTML/CSS/JS puro, sem build) para acompanhar a Copa
do Mundo 2026: tabelas dos grupos, mata-mata, próximos jogos, resultados automáticos
(openfootball) e edição manual de placares.

Este arquivo é um **roteador + lista de invariantes**, não um spec. **Leia a ADR / brief
relevante antes de tocar um módulo.** Três camadas alimentam o agente aqui:

- **Camada 1 — Processo** (reutilizável): o workflow, tiers, gates, OpenSpec, planning
  packs → [docs/workflow/README.md](docs/workflow/README.md).
- **Camada 2 — Stack/ferramentas** (copa2026): Node para testes, ESLint/Prettier, sem build.
- **Camada 3 — Domínio + invariantes** (copa2026; este arquivo como roteador): as ADRs.

> **Autoridade:** para processo/tiers/gates, [workflow/README.md](docs/workflow/README.md)
> é canônico. Para um invariante, a **ADR citada** é canônica. Fontes canônicas em
> conflito → **pare e escale ao humano**.

## Disciplina de trabalho

- **Os artefatos canônicos decidem — não adivinhe.** brief + change-map + ADRs + specs
  (emergentes) são a fonte da verdade. Silêncio ou ambiguidade → **pare, pergunte, espere**.

## Mapa de arquitetura

- Mapa de capabilities + contratos → [docs/architecture/overview.md](docs/architecture/overview.md).
- Persistência de estado → **ADR-0002**. Tema/tokens → **ADR-0003**. Fonte/fuso → **ADR-0004**.
  Sem build → **ADR-0001**.

## Stack (copa2026)

| Concern      | Decisão                                        | Fonte    |
| ------------ | ---------------------------------------------- | -------- |
| Linguagem    | JS puro (ES2021), IIFE, sem build              | ADR-0001 |
| Testes       | `node --test` + `--experimental-test-coverage` | ADR-0001 |
| Lint/format  | ESLint (flat config) + Prettier                | Camada 2 |
| Persistência | `localStorage`, chave `wc2026_*_v1`            | ADR-0002 |
| Cores        | custom properties (tokens) + `data-theme`      | ADR-0003 |
| Dados        | openfootball (`DATA_URL`); fuso GMT-3          | ADR-0004 |

## Invariantes verificados na review (NÃO-NEGOCIÁVEIS)

Um revisor (humano ou modelo) **deve** checá-los em toda mudança no caminho relevante.
**Fail-safe:** violação possível não resolvida conclusivamente → **bloqueia e escala**.

- **Estado do usuário só em `localStorage`**, chave versionada e namespaced (`wc2026_*_v1`);
  nunca cookie, nunca servidor. _(ADR-0002)_
- **Toda cor via token (custom property);** nenhum literal de cor novo em regras; tema é
  override de tokens sob `data-theme`. _(ADR-0003)_
- **Edições manuais nunca são sobrescritas** por refresh da API. _(ADR-0004)_
- **Horários exibidos em GMT-3.** _(ADR-0004)_
- **Sem build;** `module.exports` permanece guardado por `typeof module`. _(ADR-0001)_

> "Alto" risco = alto raio de impacto: toca persistência, o cálculo de classificação/
> chaveamento (corretude dos resultados), ou uma superfície compartilhada (tokens de cor,
> config de gate) — independente do tamanho.

## Gates de verificação (não-negociáveis, CI + local)

Conjunto de gates por workflow §8 (instanciação JS) — rodam via `make check`:

- **`prettier --check`** — formatação.
- **`eslint`** — análise estática (sem `no-undef`; `no-unused-vars` como warn).
- **`node --test`** — testes das funções puras (via o seam `module.exports`).
- **Cobertura ≥ 20% de linhas** em `app.js` (piso honesto do estado atual — 23.20% medido; código novo
  testável — ex.: `dark-mode` — deve vir bem coberto).

**Local primeiro; CI é backstop.** Verde local **antes** de abrir o PR. Não faça poll de CI.

## Processo de review (copa2026)

Segue a arquitetura multi-modelo de [workflow §9](docs/workflow/README.md): **`workflow-code-review`**
(Layer A local, obrigatório T2+) · in-PR bot (Layer B, ≥1 provedor distinto) · **`workflow-adversarial-review`**
(T3) · **`workflow-receiving-code-reviews`** (reconciliar → corrigir → re-rodar gates).

## Mapa de docs (leia antes de implementar)

| Doc                                                                       | Uso                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| [docs/workflow/README.md](docs/workflow/README.md)                        | Processo, tiers, gates, OpenSpec, planning packs       |
| [docs/architecture/overview.md](docs/architecture/overview.md)            | Mapa de capabilities + contratos + índice de ADRs      |
| [docs/glossary.md](docs/glossary.md)                                      | Vocabulário de domínio + desambiguação capability/spec |
| [docs/ROADMAP.md](docs/ROADMAP.md)                                        | Rollup de mudanças, deps, caminho crítico, status      |
| [docs/adr/*.md](docs/adr/)                                                | Decisões transversais (fonte dos invariantes)          |
| [docs/capabilities/&lt;cap&gt;/{brief,change-map}.md](docs/capabilities/) | Requisitos + mudanças da capability                    |
```

- [ ] **Step 2: Format + commit**

Run: `npx prettier --write AGENTS.md && make check`
Expected: green.

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md constitution (invariants + JS gates)"
```

---

## Task 9: Author the three capability planning packs (briefs + change-maps)

Use the `docs/workflow/templates/` as structure. Keep them scaled but real. **The `apresentacao` change-map is where `dark-mode` (APR-02) lives and where the follow-up story converges.**

**Files:**

- Create: `docs/capabilities/dados/{brief,change-map}.md`, `docs/capabilities/classificacao/{brief,change-map}.md`, `docs/capabilities/apresentacao/{brief,change-map}.md`

**Interfaces:**

- Produces: FR rows and change rows referenced by the ROADMAP (Task 10), the foundational changes (Tasks 11-12), and the live change (Task 13). Fixed change IDs: `DAT-01 data-ingestion`, `DAT-02 persist-score-overrides`, `DAT-03 timezone-display`; `CLA-01 standings-table`, `CLA-02 thirds-ranking`, `CLA-03 knockout-bracket`; `APR-01 establish-ui-shell`, `APR-02 dark-mode`.

- [ ] **Step 1: `docs/capabilities/dados/brief.md`**

```markdown
# Capability Brief — Dados

**Capability:** dados · **Status:** Consolidated

## Why

Traz e persiste os dados de jogos: ingestão da API openfootball, edição manual de placares
(sobrepõe a API) e conversão de fuso. Base para classificação e apresentação.

## Consolidated requirements

### Functional (FR)

- **FR-DAT1 (E):** Buscar jogos da openfootball a cada reload e no botão ↻; recalcular tudo.
- **FR-DAT2 (E):** Editar placar manualmente; persistir em `localStorage`; nunca sobrescrito
  pela API; reverter ao valor automático. _(ADR-0002, ADR-0004)_
- **FR-DAT3 (E):** Exibir data/hora dos jogos em GMT-3. _(ADR-0004)_

### Non-functional (NFR)

- **NFR-DAT1:** Funciona offline com os overrides salvos se a API falhar.

## Non-goals (v1)

- Backend/sincronização entre dispositivos.

## Capability dependencies

- Nenhuma (base). Consumida por classificacao e apresentacao.
```

- [ ] **Step 2: `docs/capabilities/dados/change-map.md`**

```markdown
# Change Map — Dados

## FR coverage map (brief → change)

| FR      | Change                    | Essential? |
| ------- | ------------------------- | ---------- |
| FR-DAT1 | `data-ingestion`          | E          |
| FR-DAT2 | `persist-score-overrides` | E          |
| FR-DAT3 | `timezone-display`        | E          |

## Changes (ordered)

| #      | Change                    | FR      | Effort | Risk   | Tier | Deps   |
| ------ | ------------------------- | ------- | ------ | ------ | ---- | ------ |
| DAT-01 | `data-ingestion`          | FR-DAT1 | M      | medium | T2   | —      |
| DAT-02 | `persist-score-overrides` | FR-DAT2 | S      | medium | T2   | DAT-01 |
| DAT-03 | `timezone-display`        | FR-DAT3 | S      | low    | T1   | DAT-01 |

## Execution order / parallelism
```

DAT-01 (data-ingestion) ─┬─► DAT-02 (persist-score-overrides)
└─► DAT-03 (timezone-display)

```

## Capability MVP
DAT-01, DAT-02, DAT-03 (todos E).
```

- [ ] **Step 3: `docs/capabilities/classificacao/brief.md`**

```markdown
# Capability Brief — Classificação

**Capability:** classificacao · **Status:** Consolidated

## Why

Calcula tabelas dos grupos, ranqueia terceiros colocados e monta o chaveamento do
mata-mata. Alto risco de corretude (resultados errados enganam o usuário).

## Consolidated requirements

### Functional (FR)

- **FR-CLA1 (E):** Tabela por grupo com PTS, J, V, E, D, GP, GC, SG; ordenação e destaque
  de classificados. _(regra em `sortRows`)_
- **FR-CLA2 (E):** Ranquear os 8 melhores terceiros colocados e alocá-los no chaveamento
  (posição estimada, marcada `≈`).
- **FR-CLA3 (E):** Montar o chaveamento (R32→final), preenchido conforme os resultados,
  incluindo pênaltis/prorrogação.

### Non-functional (NFR)

- **NFR-CLA1:** Cálculo determinístico e testável (funções puras exportadas).

## Non-goals (v1)

- Posição oficial exata dos terceiros (é estimativa).

## Capability dependencies

- dados (jogos + overrides).
```

- [ ] **Step 4: `docs/capabilities/classificacao/change-map.md`**

```markdown
# Change Map — Classificação

## FR coverage map (brief → change)

| FR      | Change             | Essential? |
| ------- | ------------------ | ---------- |
| FR-CLA1 | `standings-table`  | E          |
| FR-CLA2 | `thirds-ranking`   | E          |
| FR-CLA3 | `knockout-bracket` | E          |

## Changes (ordered)

| #      | Change             | FR      | Effort | Risk | Tier | Deps              |
| ------ | ------------------ | ------- | ------ | ---- | ---- | ----------------- |
| CLA-01 | `standings-table`  | FR-CLA1 | M      | high | T3   | dados (DAT-01/02) |
| CLA-02 | `thirds-ranking`   | FR-CLA2 | M      | high | T3   | CLA-01            |
| CLA-03 | `knockout-bracket` | FR-CLA3 | L      | high | T3   | CLA-01, CLA-02    |

## Execution order / parallelism
```

CLA-01 (standings-table) ─► CLA-02 (thirds-ranking) ─► CLA-03 (knockout-bracket)

```

## Capability MVP
CLA-01, CLA-02, CLA-03 (todos E).
```

- [ ] **Step 5: `docs/capabilities/apresentacao/brief.md`** (hosts the demo change)

```markdown
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
```

- [ ] **Step 6: `docs/capabilities/apresentacao/change-map.md`**

```markdown
# Change Map — Apresentação

## FR coverage map (brief → change)

| FR      | Change               | Essential? |
| ------- | -------------------- | ---------- |
| FR-APR1 | `establish-ui-shell` | E          |
| FR-APR2 | `dark-mode`          | I          |

## Changes (ordered)

| #      | Change               | FR      | Effort | Risk | Tier | Deps                       |
| ------ | -------------------- | ------- | ------ | ---- | ---- | -------------------------- |
| APR-01 | `establish-ui-shell` | FR-APR1 | M      | low  | T2   | dados, classificacao       |
| APR-02 | `dark-mode`          | FR-APR2 | S      | low  | T1   | APR-01, ADR-0002, ADR-0003 |

> **APR-02 `dark-mode`** consome dois follow-ups plantados por mudanças arquivadas:
> (1) o helper de `prefs` namespaced (plantado por `persist-score-overrides`, ADR-0002) e
> (2) a extração de cores hardcoded para tokens (plantado por `establish-ui-shell`, ADR-0003).
>
> **Por que T1 (não T2), apesar de tocar tokens de cor:** a _extração_ dos literais para
> tokens (o refactor de superfície compartilhada, de fato arriscado) já foi antecipada como
> dívida pelos follow-ups de `establish-ui-shell`/`persist-score-overrides`. A própria
> `dark-mode` acrescenta apenas uma **camada de override** (`:root[data-theme="dark"]`) sobre
> tokens já existentes — raio de impacto contido, incremento opcional (I), sem `design.md`.
> Executa via **spec-lite** (proposal + specs + tasks). O `design.md` mostrado durante a espera
> do `apply` (§8) vem de uma mudança **T2 já arquivada** (`establish-ui-shell`), não desta.

## Execution order / parallelism
```

establish-ui-shell (APR-01) ─► dark-mode (APR-02) [+ ADR-0002, ADR-0003]

```

## Capability MVP
APR-01 (E). APR-02 é incremento (I) — a mudança demonstrada ao vivo.
```

- [ ] **Step 7: Format + commit**

Run: `npx prettier --write "docs/capabilities/**/*.md" && make check`
Expected: green.

```bash
git add docs/capabilities
git commit -m "docs: add planning packs (dados, classificacao, apresentacao)"
```

---

## Task 10: Author the ROADMAP and the conceptual overview

**Files:**

- Create: `docs/ROADMAP.md`, `docs/architecture/overview.md`

**Interfaces:**

- Consumes: all briefs/change-maps/ADRs.
- Produces: the dashboard the orchestrator reads live; `dark-mode` (APR-02) appears as `🔲 todo` (reserved for the live run). The two foundational changes show `🟢 done` after Tasks 11-12.

- [ ] **Step 1: Write `docs/ROADMAP.md`** (from the template; `dark-mode` reserved as 🔲)

```markdown
# ROADMAP — Copa2026

**Role:** rollup dos change-maps; deps entre capabilities; milestones. **Único escritor =
orquestrador**, exceto o worker que dona a própria linha (§2.1/§6).

## Capabilities

| Capability    | Brief                                        | Change-map                                             | Status |
| ------------- | -------------------------------------------- | ------------------------------------------------------ | ------ |
| dados         | [brief](capabilities/dados/brief.md)         | [change-map](capabilities/dados/change-map.md)         | 🟡     |
| classificacao | [brief](capabilities/classificacao/brief.md) | [change-map](capabilities/classificacao/change-map.md) | 🔲     |
| apresentacao  | [brief](capabilities/apresentacao/brief.md)  | [change-map](capabilities/apresentacao/change-map.md)  | 🟡     |

## Foundational dependencies (ADRs — Phase 0)

| ADR                                         | Decision                               | Blocks                       | Status   |
| ------------------------------------------- | -------------------------------------- | ---------------------------- | -------- |
| [0001](adr/0001-arquitetura-sem-build.md)   | Sem build (JS puro)                    | gates, todas as capabilities | Accepted |
| [0002](adr/0002-persistencia-no-cliente.md) | Persistência no cliente (localStorage) | DAT-02, APR-02               | Accepted |
| [0003](adr/0003-tema-e-tokens-de-cor.md)    | Tema e tokens de cor                   | APR-01, APR-02               | Accepted |
| [0004](adr/0004-fonte-de-dados-e-fuso.md)   | Fonte de dados e fuso                  | DAT-01, DAT-02, DAT-03       | Accepted |

## Changes (rollup dos change-maps)

| Change                             | Capability    | Tier | Deps                           | E/I/D | Status |
| ---------------------------------- | ------------- | ---- | ------------------------------ | ----- | ------ |
| `data-ingestion` (DAT-01)          | dados         | T2   | ADR-0004                       | E     | 🔲     |
| `persist-score-overrides` (DAT-02) | dados         | T2   | DAT-01, ADR-0002, ADR-0004     | E     | 🟢     |
| `timezone-display` (DAT-03)        | dados         | T1   | DAT-01, ADR-0004               | E     | 🔲     |
| `standings-table` (CLA-01)         | classificacao | T3   | DAT-01/02                      | E     | 🔲     |
| `thirds-ranking` (CLA-02)          | classificacao | T3   | CLA-01                         | E     | 🔲     |
| `knockout-bracket` (CLA-03)        | classificacao | T3   | CLA-01, CLA-02                 | E     | 🔲     |
| `establish-ui-shell` (APR-01)      | apresentacao  | T2   | dados, classificacao, ADR-0003 | E     | 🟢     |
| `dark-mode` (APR-02)               | apresentacao  | T1   | APR-01, ADR-0002, ADR-0003     | I     | 🔲     |

> `persist-score-overrides` e `establish-ui-shell` documentam comportamento **já existente**
> no app e foram arquivados para (a) bootstrapar `openspec/specs/` e (b) plantar os follow-ups
> que `dark-mode` consome. `dark-mode` (🔲) é a mudança reservada para a **demo ao vivo**.

## Critical path
```

ADR-0001..0004 ─► DAT-01 ─► DAT-02 ─► CLA-01 ─► CLA-02 ─► CLA-03 ─► APR-01 ─► APR-02 (dark-mode, ao vivo)

```

## Milestones
- **M0 — Foundations:** ADR-0001..0004 Accepted; gates verdes.
- **M1 — App existente documentado:** DAT-02 + APR-01 arquivados (specs emergentes).
- **M2 — Demo:** APR-02 `dark-mode` executado ao vivo pelo workflow.
```

- [ ] **Step 2: Write `docs/architecture/overview.md`** (links only)

```markdown
# Conceptual Map — Copa2026

> Visão **estrutural**; sem status, sem ordem de build. Só **liga** ADRs + briefs + contratos.

## Capabilities & responsibilities

| Capability    | Responsibility (uma linha)               | Brief                                           |
| ------------- | ---------------------------------------- | ----------------------------------------------- |
| dados         | Ingestão openfootball + overrides + fuso | [brief](../capabilities/dados/brief.md)         |
| classificacao | Tabelas, terceiros, chaveamento          | [brief](../capabilities/classificacao/brief.md) |
| apresentacao  | Casca de UI + tema                       | [brief](../capabilities/apresentacao/brief.md)  |

## Runtime / data flow
```

openfootball ─► dados (matches + overrides) ─► classificacao (standings/bracket) ─► apresentacao (render + tema)

```

## Contracts / interfaces between capabilities
| Contract | Producer | Consumer | Defined in |
|---|---|---|---|
| `STATE.matches` + overrides | dados | classificacao | dados/brief |
| `STATE.standings` / bracket | classificacao | apresentacao | classificacao/brief |
| tokens de cor / `data-theme` | apresentacao | (todas as telas) | ADR-0003 |

## ADR index by theme (navigation)
| Theme | ADR |
|---|---|
| Build/portabilidade | 0001 |
| Persistência | 0002 |
| Tema/cores | 0003 |
| Dados/fuso | 0004 |
```

- [ ] **Step 3: Format + commit**

Run: `npx prettier --write docs/ROADMAP.md docs/architecture/overview.md && make check`

```bash
git add docs/ROADMAP.md docs/architecture/overview.md
git commit -m "docs: add ROADMAP + conceptual overview"
```

- [ ] **Step 4: Fast-forward the scaffold branch onto main**

The scaffold (Tasks 1-10) is the change-agnostic foundation. Land it so the two foundational changes and the demo run start from a clean `main`. `main` is a strict ancestor of `feat/workflow-demo-scaffold` (the scaffold commits are built directly on `main`'s tip, with no diverging commits on `main`), so fast-forward it — this keeps a **linear history** with no merge commit. A rebase is unnecessary here: there is nothing to replay, since the branch is already based on `main`'s tip.

```bash
git checkout main && git merge --ff-only feat/workflow-demo-scaffold
```

---

## Task 11: Bootstrap `persist-score-overrides` (DAT-02) — archive + plant persistence follow-up

Document the **existing** localStorage override behavior as an OpenSpec change, run it through propose→apply→archive, and plant the persistence follow-up note in `app.js`. This produces (a) the `state-persistence` spec-id and (b) the breadcrumb `dark-mode` consumes, and (c) archival material (proposal/design/tasks) referenceable as the "already completed" gap-fill in the demo.

**Files:**

- Create (via workflow): `openspec/changes/persist-score-overrides/{proposal,design,tasks}.md` + `specs/state-persistence/spec.md`
- Modify: `app.js` (add the follow-up note near `saveOverrides`), `test/persistence.test.js`
- Archive → `openspec/specs/state-persistence/spec.md`

**Interfaces:**

- Produces: `openspec/specs/state-persistence/spec.md`; the in-place follow-up anchor in `app.js`.

- [ ] **Step 1: Create the change on a worktree branch, using the `openspec-propose` skill (T2 → spec-driven)**

Invoke the `openspec-propose` skill with change name `persist-score-overrides`. It runs `npx openspec new change persist-score-overrides`, then generates `proposal.md`, `design.md`, `tasks.md`. Author the spec delta under spec-id **`state-persistence`** (behavior-scoped, not `dados`). The proposal documents existing behavior: overrides stored at `wc2026_overrides_v1`, never overwritten by API, revertible.

- [ ] **Step 2: Add the persistence follow-up note to `app.js`** (the breadcrumb)

Edit `app.js`, immediately after the `saveOverrides` function (currently `app.js:117-121`), insert:

```js
// FOLLOW-UP (ADR-0002): quando uma 2ª preferência de usuário for persistida
// (ex.: tema), promover estas chaves soltas para um helper `prefs` namespaced
// — leitura/escrita centralizadas sob o prefixo wc2026_*_v1. Ver o design.md do
// change `persist-score-overrides`. Acionar quando este arquivo for tocado por
// uma feature que persista preferência nova.
```

- [ ] **Step 3: Write a test for the persistence behavior (TDD)**

`test/persistence.test.js`:

```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert");

test("chave de overrides é versionada e namespaced (wc2026_*_v1)", () => {
  const src = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "..", "app.js"),
    "utf8"
  );
  assert.match(
    src,
    /STORAGE_KEY\s*=\s*"wc2026_overrides_v1"/,
    "chave deve seguir o padrão da ADR-0002"
  );
  assert.doesNotMatch(src, /document\.cookie/, "persistência não usa cookie (ADR-0002)");
});
```

- [ ] **Step 4: Run gates**

Run: `make check`
Expected: green (the new test passes; the comment doesn't change behavior).

- [ ] **Step 5: Align, then archive via the workflow skills**

Present the proposal/spec-delta/tasks for the align checkpoint (self-approve for the bootstrap). Then invoke `openspec-archive-change` for `persist-score-overrides`: `npx openspec archive persist-score-overrides` promotes the delta to `openspec/specs/state-persistence/spec.md` and moves the change to `openspec/changes/archive/`.

- [ ] **Step 6: Flip ROADMAP + commit**

`persist-score-overrides` is already `🟢` in the ROADMAP (Task 10). Verify `npx openspec validate --strict` passes.

```bash
git add app.js test/persistence.test.js openspec
git commit -m "feat(dados): document persist-score-overrides; archive state-persistence spec; plant prefs follow-up"
```

---

## Task 12: Bootstrap `establish-ui-shell` (APR-01) — archive + plant color-token follow-up

Same pattern for the existing UI shell: archive a `ui-shell` spec-id and plant the **color-token** follow-up in `styles.css` that `dark-mode` consumes.

**Files:**

- Create (via workflow): `openspec/changes/establish-ui-shell/{proposal,design,tasks}.md` + `specs/ui-shell/spec.md`
- Modify: `styles.css` (add the follow-up note above `:root`)
- Archive → `openspec/specs/ui-shell/spec.md`

**Interfaces:**

- Produces: `openspec/specs/ui-shell/spec.md`; the color-token follow-up anchor in `styles.css`.

- [ ] **Step 1: Create the change via `openspec-propose` (T2)**

Invoke `openspec-propose` with name `establish-ui-shell`; spec-id **`ui-shell`**. Proposal documents the existing shell: fixed topbar, phase tabs, upcoming strip, tooltips, responsive layout.

- [ ] **Step 2: Plant the color-token follow-up in `styles.css`**

Edit `styles.css`, insert immediately above the opening `:root {` (line 2) a comment block:

```css
/* FOLLOW-UP (ADR-0003): há cores hardcoded fora dos tokens do :root — gradiente
   da topbar (#ffffff/#f4f7fb), fundo das abas (#e3e9f1), tooltip (#1f2a36),
   fundos de input (#fff). Ao introduzir o tema escuro, extrair estes literais
   para custom properties (tokens) para que o override de tema os alcance.
   Acionar no change `dark-mode` (APR-02). Ver design.md de `establish-ui-shell`. */
```

- [ ] **Step 3: Write a test guarding the token discipline (TDD)**

`test/theming.test.js`:

```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

test("styles.css define tokens de cor no :root", () => {
  assert.match(css, /--bg:/, "token --bg deve existir");
  assert.match(css, /--ink:/, "token --ink deve existir");
});
```

- [ ] **Step 4: Gates + align + archive**

Run: `make check` (green). Align (self-approve). Invoke `openspec-archive-change` for `establish-ui-shell` → promotes `openspec/specs/ui-shell/spec.md`.

- [ ] **Step 5: Commit**

Run: `npx openspec validate --strict`

```bash
git add styles.css test/theming.test.js openspec
git commit -m "feat(apresentacao): document establish-ui-shell; archive ui-shell spec; plant color-token follow-up"
```

---

## Task 13: ~~Pre-build the `dark-mode` reference branch~~ — OBSOLETE / REMOVED

> **Obsolete (Direction update, 2026-07-22).** This task built a `prebuilt/dark-mode` branch as a
> code reference. Per Decision 2 the demo build is **fresh** with **no reference branch and no
> fallback**, so the branch has been **deleted** (local + remote). The follow-up actions this task
> performed (introduce the `prefs` helper, tokenize the hardcoded colors) are instead done **inside
> the fresh workflow build** (Task 15). The original steps are retained below **only as a historical
> record** of what was built and removed — do not execute them.

Build `dark-mode` **once**, fully and correctly, on a dedicated branch. It **actions both follow-ups**: introduces the `prefs` helper (ADR-0002) and extracts the hardcoded colors into tokens (ADR-0003).

**Files (on branch `prebuilt/dark-mode`):**

- Modify: `index.html` (pre-paint script + toggle button), `styles.css` (tokenize hardcodes + `[data-theme="dark"]` overrides), `app.js` (`prefs` helper + theme module + `resolveTheme` export)
- Create: `test/theme.test.js`

**Interfaces:**

- Consumes: `require("../app.js")` → `resolveTheme(pref, prefersDark)`.
- Produces: `resolveTheme(pref, prefersDark) -> "light" | "dark"` (pure), and a green `make check` with high coverage on the new code.

- [ ] **Step 1: Create the branch from current main**

```bash
git checkout main && git checkout -b prebuilt/dark-mode
```

- [ ] **Step 2: Write the failing test for `resolveTheme` (TDD)**

`test/theme.test.js`:

```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const app = require("../app.js");

test("resolveTheme: 'light'/'dark' são explícitos", () => {
  assert.equal(app.resolveTheme("light", true), "light");
  assert.equal(app.resolveTheme("dark", false), "dark");
});
test("resolveTheme: 'system' segue o prefers-color-scheme", () => {
  assert.equal(app.resolveTheme("system", true), "dark");
  assert.equal(app.resolveTheme("system", false), "light");
});
test("resolveTheme: valor inválido cai em 'light'", () => {
  assert.equal(app.resolveTheme("xpto", false), "light");
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `node --test test/theme.test.js`
Expected: FAIL — `app.resolveTheme is not a function`.

- [ ] **Step 4: Implement the theme module + `prefs` helper in `app.js`**

Inside the IIFE, after the overrides section (after `clearOverride`, ~line 129), add:

```js
/* ----------------------------- preferências --------------------------- */
// Helper namespaced acionado pelo follow-up de persist-score-overrides (ADR-0002).
var PREFS_PREFIX = "wc2026_";
function prefGet(key, fallback) {
  try {
    var v = localStorage.getItem(PREFS_PREFIX + key + "_v1");
    return v == null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function prefSet(key, value) {
  try {
    localStorage.setItem(PREFS_PREFIX + key + "_v1", value);
  } catch (e) {
    /* ignore */
  }
}

/* -------------------------------- tema -------------------------------- */
function resolveTheme(pref, prefersDark) {
  if (pref === "light" || pref === "dark") return pref;
  if (pref === "system") return prefersDark ? "dark" : "light";
  return "light";
}
function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;
}
function applyTheme(pref) {
  document.documentElement.setAttribute("data-theme", resolveTheme(pref, prefersDark()));
}
var THEME_ORDER = ["light", "dark", "system"];
function cycleTheme() {
  var cur = prefGet("theme", "system");
  var next = THEME_ORDER[(THEME_ORDER.indexOf(cur) + 1) % THEME_ORDER.length];
  prefSet("theme", next);
  applyTheme(next);
  var btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = next === "dark" ? "🌙" : next === "light" ? "☀️" : "🌗";
}
function initTheme() {
  applyTheme(prefGet("theme", "system"));
  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", cycleTheme);
    var cur = prefGet("theme", "system");
    btn.textContent = cur === "dark" ? "🌙" : cur === "light" ? "☀️" : "🌗";
  }
}
```

In `init()` (after `setupFixedHeader();`), add: `initTheme();`

In the `module.exports` block, add `resolveTheme: resolveTheme,` to the exported object.

- [ ] **Step 5: Add the pre-paint script + toggle button to `index.html`**

In `<head>`, after the stylesheet `<link>`, add an inline pre-paint script (prevents flash-of-light-mode — the correct behavior plausible-B will miss):

```html
<script>
  (function () {
    try {
      var p = localStorage.getItem("wc2026_theme_v1") || "system";
      var dark =
        p === "dark" ||
        (p === "system" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    } catch (e) {}
  })();
</script>
```

In the `.refresh-area` div (before `#refresh`), add:

```html
<button
  id="theme-toggle"
  class="refresh-btn"
  type="button"
  title="Alternar tema (claro/escuro/sistema)"
>
  🌗
</button>
```

- [ ] **Step 6: Tokenize hardcoded colors + add dark overrides in `styles.css`** (actions the color-token follow-up)

Add to `:root` (after `--radius`): the previously hardcoded literals as tokens:

```css
--topbar-grad-a: #ffffff;
--topbar-grad-b: #f4f7fb;
--pill-bg: #e3e9f1;
--tooltip-bg: #1f2a36;
--input-bg: #ffffff;
```

Replace the literals in the rules with these tokens (`.topbar` gradient → `var(--topbar-grad-a)`/`var(--topbar-grad-b)`; `.phase-tabs` background → `var(--pill-bg)`; `.info .tip` background + `::after` border-top-color → `var(--tooltip-bg)`; `.score-in`/`.pen-in`/`.refresh-btn`/`.foot` `#fff` backgrounds → `var(--input-bg)`/`var(--card)`).
Then add the dark theme block after `:root`:

```css
:root[data-theme="dark"] {
  --bg: #0f1620;
  --card: #16202b;
  --ink: #e6edf3;
  --muted: #9aa7b4;
  --line: #2b3947;
  --accent: #2fa36b;
  --accent-2: #4a9fe0;
  --gold: #d9a520;
  --edited: #ff7a45;
  --edited-bg: #2a1b12;
  --qual: #2fa36b;
  --third: #d9a520;
  --out: #e5484d;
  --topbar-grad-a: #16202b;
  --topbar-grad-b: #0f1620;
  --pill-bg: #1c2836;
  --tooltip-bg: #0b1219;
  --input-bg: #0f1620;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 7: Run gates**

Run: `make check`
Expected: green; `test/theme.test.js` passes; coverage on new code high. Manually open `index.html` and click the toggle to confirm the visual (light→dark→system) and no flash on reload.

- [ ] **Step 8: Capture archival material (Layer A report + simulated bot comments)**

Run the local review: invoke `workflow-code-review` on the diff (T1 → 1 review, per the change-map). Save its findings report to `docs/superpowers/demo-archive/dark-mode-layer-a.md`. Write a short `docs/superpowers/demo-archive/dark-mode-bot-comments.md` with 2-3 realistic in-PR bot comments (e.g. "consider `prefers-color-scheme` change listener while 'system' is active", "toggle has no `aria-pressed`"). These are the gap-fill the artifact's demo references.

- [ ] **Step 9: Commit the reference branch**

```bash
git add -A
git commit -m "feat(apresentacao): dark-mode reference implementation (prebuilt safety net)"
```

---

## Task 14 (OPTIONAL — not in the §8 demo flow): Pre-build the "plausible-but-broken B" branch

> **Scope note:** the presentation's Section 8 demo is a single happy path (9 steps) and does
> **not** include showing plausible-B live. This branch is an **optional safety-net / backup beat**
> that materializes the _conceptual_ "plausible-but-wrong code" + "correlated blind spots" points
> from Sections 1, 6b, and 9 — pull it in only if you choose to demonstrate a review catching an
> invariant violation. Skip it and the core demo is unaffected.

A dark-mode implementation that compiles, looks plausible, and passes a shallow test but violates two invariants — the review/adversarial pass is what catches it. This is the "plausible-but-broken code" + "correlated blind spots" demo beat.

**Files (on branch `plausible-b/dark-mode`, from main):**

- Modify: `index.html`, `styles.css`, `app.js`
- Create: `test/theme.test.js` (shallow — passes despite the bugs)

**Interfaces:**

- Produces: a branch whose bugs map to named invariants: **(a)** persists theme in a **cookie** (violates ADR-0002), **(b)** hardcodes dark colors on some elements instead of tokens so the tooltip/topbar/inputs stay light — unreadable contrast (violates ADR-0003 + ignores the color-token follow-up), **(c)** no pre-paint script → flash-of-light-mode on reload.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b plausible-b/dark-mode
```

- [ ] **Step 2: Implement the broken version in `app.js`**

Add a theme module that persists via cookie and hardcodes the dark palette:

```js
function getThemeCookie() {
  var m = document.cookie.match(/(?:^|;\s*)wc2026_theme=([^;]+)/);
  return m ? m[1] : "light";
}
function setThemeCookie(v) {
  document.cookie = "wc2026_theme=" + v;
} // VIOLA ADR-0002
function toggleTheme() {
  var next = getThemeCookie() === "dark" ? "light" : "dark"; // sem 'system'
  setThemeCookie(next);
  document.documentElement.setAttribute("data-theme", next);
}
```

Wire `toggleTheme` to the button in `init()`. Do **not** read the cookie on load (so it won't restore on reload — subtle persistence bug). Do not export a pure `resolveTheme`.

- [ ] **Step 3: `styles.css` — hardcode dark colors on a subset (leave tooltip/topbar/inputs light)**

Add `:root[data-theme="dark"]` overriding only `--bg`, `--card`, `--ink` — leaving the topbar gradient `#ffffff`, tooltip `#1f2a36` (unreadable on dark), phase-tabs `#e3e9f1`, and input `#fff` **untokenized and light**. This reproduces the broken contrast.

- [ ] **Step 4: Shallow test that passes anyway**

`test/theme.test.js`:

```js
"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
test("toggle define data-theme (raso — não pega os bugs)", () => {
  // Teste superficial: só verifica que a string 'dark' aparece no código.
  const src = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "..", "app.js"),
    "utf8"
  );
  assert.match(src, /data-theme/);
});
```

- [ ] **Step 5: Confirm gates pass (the point: gates alone don't catch design/invariant bugs)**

Run: `make check`
Expected: green — demonstrating that **format+lint+shallow tests pass while invariants are violated**. (If ESLint flags `no-undef` on `document.cookie`, it's already a global; keep it green.) Manually open `index.html` in dark mode to see the broken contrast for the reveal.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(apresentacao): plausible-but-broken dark-mode (demo B branch)"
git checkout main
```

---

## Task 15: Build the demo — full workflow run of `dark-mode`, captured as session history

**Goal of this task — and of the whole demo: highlight each process step and the outcome of each
one.** Run the **real** cycle end-to-end from clean `main` using `workflow-execute-change dark-mode`,
**fresh from scratch** (no reference implementation, no fallback), so every workflow step and its
concrete outcome is captured. The two things that matter as **demo deliverables** are the **session
history** (the on-screen record of the run) and the **demo narration transcript** (Step 4) — _not_
the feature itself. `main` starts at the clean pre-change state so the run is authentic; **after** the
history is captured and the transcript written, the completed change is **merged to `main`** (Step 5)
so the repo reflects its true final end state.

**Files:** the run creates a fresh `dark-mode` implementation (`app.js`, `styles.css`, `index.html`,
`test/theme.test.js`) on a worktree branch, later merged to `main` (Step 5), along with `docs/ROADMAP.md`
(APR-02 → `🟢`) and the archived `openspec/specs/color-theme/` spec. The task's own authored file is
`docs/superpowers/demo-script.md` (Step 4).

**Interfaces:**

- Consumes: everything above. `main` must have `dark-mode` (APR-02) as `🔲` in the ROADMAP and no
  dark-mode code **at the start of the run**.
- Produces: **two demo artifacts** — (1) the **session history** of the run (shown on screen), and
  (2) the **demo narration transcript** `docs/superpowers/demo-script.md` (the authored deliverable).
  Plus the repo's advance to its final end state (dark-mode merged to `main`, `color-theme` archived,
  APR-02 → `🟢`) — repo hygiene, not a demo deliverable.

- [ ] **Step 1: Confirm the clean starting state**

Run:

```bash
git checkout main
grep -n "dark-mode" docs/ROADMAP.md          # APR-02 row present, Status 🔲
grep -c "data-theme" app.js styles.css index.html   # expect 0 in all three
make check                                    # green
```

Expected: `dark-mode` reserved as todo; zero dark-mode code on main; gates green.

- [ ] **Step 2: Run the live cycle via `workflow-execute-change` (fresh)**

Invoke `workflow-execute-change dark-mode`. Let the skill drive — the session history it generates
is the demo. The beats to expect:

1. Pre-flight: matches APR-02 row; deps `APR-01 🟢`, `ADR-0002/0003 Accepted`; surfaces **both follow-up anchors** (app.js prefs, styles.css tokens).
2. Mark `doing` (🔲→🟡) on the worktree branch — single ROADMAP cell (never lands on `main`).
3. Worktree + `openspec-propose dark-mode` (**T1 spec-lite — no `design.md`**; spec-id `color-theme`). Narration: tier is read from the change-map (APR-02 = T1), "the agent doesn't choose the ceremony."
4. **Align — human-driven disagreement:** the presenter proposes cookie / "toggle forces theme, ignore OS". The agent must push back citing **ADR-0002** (localStorage, not cookie) and **ADR-0003** (`system` is a first-class value). Land on localStorage + `light|dark|system`.
5. `openspec-apply-change` — **implement fresh (TDD), guided only by the ADRs + planted breadcrumbs**, not by any reference branch. Fill the apply wait with the archived `establish-ui-shell` `design.md` (`openspec/changes/archive/establish-ui-shell/design.md`) — demonstrates a `design.md` from a **T2** change without `dark-mode` (T1) needing one, exactly as the presentation's Tier Note prescribes.
6. `make check` green; `workflow-code-review` (Layer A).
7. Reveal: open `index.html`, toggle to dark on the projector.
8. Archive `color-theme` → `openspec/specs/color-theme/spec.md` (on the worktree branch).

- [ ] **Step 3: Confirm the session history captured every step and its outcome**

The session history is the raw material the demo replays, so verify it end-to-end: every §8 step
present **with its outcome legible** — the proposal produced, the align pushback citing
ADR-0002/0003, the fresh implementation + green gates, the review findings, the reveal, the archived
`color-theme` spec. A capture is repeatable and off-stage — if any step or outcome reads unclearly,
**re-run the cycle** rather than patch it.

- [ ] **Step 4: Write the demo narration transcript (the deliverable)**

Author `docs/superpowers/demo-script.md` — the presenter's spoken script for the live demo, walking
the session history **step by step, each step paired with its outcome**. For every §8 step (pre-flight
→ mark doing → propose → align → apply → review → reveal → archive) write:

- **Cue** — which part of the session history to show on screen.
- **Say** — the narration: what the step _is_, why the workflow does it, and **the concrete outcome**
  visible in the history — tying each back to the presentation's concepts (frozen decisions/ADRs,
  tier-read-from-change-map, the align pushback on ADR-0002/0003, spec-lite vs. `design.md`, gates as
  a floor not a proof).

This script plus the session history _are_ the demo; the `dark-mode` feature is not.

- [ ] **Step 5: Merge the completed change so the repo reflects the final end state**

The session history is already captured (immutable), so now advance the repo to the truthful end
state — the honest final outcome of a completed change. Land the worktree branch on `main`:

```bash
git checkout main
git merge --no-ff <dark-mode-worktree-branch>   # fresh implementation + archived color-theme spec
git add docs/superpowers/demo-script.md          # the narration transcript deliverable
git commit -m "docs: dark-mode demo narration transcript"
make check                                       # green on main
git worktree remove <path>                        # tidy up the worktree
```

Expected: `main` now carries the `dark-mode` implementation, `openspec/specs/color-theme/spec.md`
archived, `docs/ROADMAP.md` APR-02 flipped `🔲 → 🟢`, and the narration transcript. The repo reads as
a finished, coherent end state; git history still preserves the pre-change commit for anyone who wants
to re-run the demo.

---

## Self-Review

> Reconciled with the 2026-07-22 Direction update: the demo's goal is to **highlight each process
> step and its outcome**; the deliverables are the **session history** + the **demo narration
> transcript**, never the `dark-mode` feature.

**1. Spec coverage (against the artifact's Live-Demo §8 + Prep checklist):**

- "build app-demo using own workflow; bootstrap with AGENTS.md, planning pack, mini-ROADMAP, gates" → Tasks 4-12. ✅
- "keep `dark-mode` reserved" → ROADMAP row 🔲 (Task 10) at the start of the run; merged to 🟢 (Task 15 Step 5) afterward so the repo reflects the end state. ✅
- Demo steps 1-9 (system context, tier from change-map, worktree, propose, **align with intentional disagreement**, apply, gates+review, reveal, archive) → captured live in Task 15, each step paired with its outcome in the narration transcript (Task 15 Step 5). ✅
- "use the session history as the demo reference" → Task 15 Steps 2-3 (session history) + Step 5 (spoken script over it). ✅
- Headline goal — **frozen decisions persist across ADRs, briefs, follow-ups** — shown live via the align pushback (ADR-0002/0003) over the chain ADR-0002/0003 → FR-APR2 → two planted follow-ups → `dark-mode` → archived `color-theme` spec. ✅

**2. Superseded scope (kept as historical record, not executed):** Task 13 (prebuilt reference branch — deleted, local + remote) and Task 14 (plausible-B — optional, never created). Layer B in-PR bot stays out of scope (no live CI bot wired) — a known limitation to state if asked.

**3. Placeholder scan:** the ADRs, AGENTS.md, the follow-up notes, and the planning packs are concrete. The one artifact authored during the live run itself — `docs/superpowers/demo-script.md` (Task 15 Step 4) — is produced from the actual session history, not pre-written here. No "TBD"/"add appropriate X" remain.

**4. Type/name consistency:** Fixed IDs used consistently — capabilities `dados`/`classificacao`/`apresentacao`; changes `DAT-01..03`/`CLA-01..03`/`APR-01..02`; spec-ids `state-persistence`/`ui-shell`/`color-theme`; storage keys `wc2026_*_v1`; `make check` referenced identically across Tasks 4, 8, 11-15.

**Known limitations (call out before the talk):**

- Coverage floor is an honest 20% (existing untested `app.js` measures 23.20%), not Paymon's 80%. Say so if asked.
- Layer B (in-PR bot) is simulated via saved comments, not a live PR-Agent/Gemini run, unless CI + an API key are wired (out of scope here).
- Only 4 ADRs / 3 capabilities / 8 changes vs. Paymon's 11/7/57 — deliberate scaling for a demo.
