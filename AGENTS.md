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
