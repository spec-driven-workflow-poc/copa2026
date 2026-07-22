# Copa do Mundo 2026 — Acompanhamento

Página simples (HTML/CSS/JS puro, sem build) para acompanhar os jogos da Copa de 2026.

---

## 🧪 Propósito experimental deste repositório

> **Leia isto primeiro se você chegou pelo _"Roteiro — Workflow Agêntico"_.** A documentação
> de _uso_ do app começa em [Como usar](#como-usar), mais abaixo.

**Este repositório não existe pela página da Copa — ele existe para _demonstrar um workflow_.**
É o **app-vitrine ao vivo** do processo de desenvolvimento agêntico apresentado no roteiro: o
mesmo workflow que está em teste de campo no **Paymon** (serviço de pagamentos, domínio de custo
assimétrico), mas aqui aplicado a um app **visível e sem backend invisível** — para que a plateia
veja o ciclo inteiro acontecer (`contexto → escolha da mudança → propose → align → apply → gates →
reveal`) sem depender de mudanças opacas de servidor.

Em uma frase: **a página é o pretexto; o artefato real é o `docs/`.**

### Por que não "vibecoding" nem specs ad-hoc

_Vibecoding_ (`prompt → código → descobre depois`) e specs ad-hoc (`propose` solto, sem nada acima
dizendo "esta é a capability inteira") falham de formas **recorrentes e previsíveis**. Este workflow
é a tentativa de sistematizar exatamente essas falhas. O contraste, falha a falha:

| #   | Falha de agêntica não-estruturada                                                                              | Vibecoding / specs ad-hoc              | Este workflow                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | **Requisitos inventados** — o agente preenche specs incompletas com inferências plausíveis mas não autorizadas | Deduz o que faltou e segue             | `brief.md` fixa os FRs **antes** do código; o que não está no brief não é inventado   |
| 2   | **Perda de contexto** — a conversa reseta e as decisões evaporam entre sessões                                 | Vive na memória do chat                | ADRs + briefs + specs persistem a decisão em disco, fora da sessão                    |
| 3   | **Drift de documentação** — o mesmo fato em vários lugares diverge com o tempo                                 | Cópias divergem silenciosamente        | Fonte única por eixo; `archive` promove a spec _as-built_ automaticamente             |
| 4   | **Fontes em conflito** — o agente escolhe calado entre documentos contraditórios                               | Escolhe uma e segue                    | Autoridade hierárquica (ADR → brief → spec) + **fail-safe: pare e escale**            |
| 5   | **Não-determinismo** — a mesma tarefa gera decisões de arquitetura diferentes                                  | Depende do humor do modelo             | Decisões transversais **congeladas em ADR** antes de qualquer paralelismo             |
| 6   | **Código plausível-mas-quebrado** — compila e passa em teste raso, falha na borda                              | "Passou o teste feliz, tá pronto"      | Gates não-negociáveis (lint + testes + cobertura) + review antes do merge             |
| 7   | **Paralelismo descoordenado** — agentes concorrentes editam arquivos compartilhados                            | Conflito de merge (ou pior, sem sinal) | Um change por worktree isolado; superfícies compartilhadas congeladas antes do fanout |
| 8   | **Pontos-cegos correlacionados** — o modelo que escreveu o bug não o enxerga                                   | Um modelo revisa a si mesmo            | Review multi-modelo (≥2 provedores) + red-team adversarial no tier crítico            |

### Onde ver cada força — neste repo, clicável

Nada acima é adjetivo: cada mecanismo já está materializado em arquivos deste repositório.

- **Requisitos fixados (nº 1):** os briefs por capability —
  [`dados`](docs/capabilities/dados/brief.md) ·
  [`classificacao`](docs/capabilities/classificacao/brief.md) ·
  [`apresentacao`](docs/capabilities/apresentacao/brief.md).
- **Decisões persistidas + fonte única (nº 2, 3, 5):** os
  [ADRs](docs/adr/) (build, persistência, tema/cores, dados/fuso) e a
  [spec emergente](openspec/specs/) promovida via `archive`.
- **Autoridade + fail-safe (nº 4):** o roteador de invariantes em [`AGENTS.md`](AGENTS.md)
  ("fontes canônicas em conflito → pare e escale").
- **Decomposição planejada, não `propose` solto (nº 1, 7):** os change-maps
  ([exemplo](docs/capabilities/apresentacao/change-map.md)) e o
  [ROADMAP](docs/ROADMAP.md) com tier × risco × deps × prioridade.
- **Gates + review (nº 6, 8):** [`make check`](Makefile) (prettier + eslint + `node --test` +
  piso de cobertura) e a arquitetura de review multi-modelo em
  [`docs/workflow/README.md` §9](docs/workflow/README.md).
- **O ciclo ao vivo (nº 7):** a mudança `dark-mode` (APR-02) está **reservada para a demo ao vivo**;
  o branch `prebuilt/dark-mode` é a **rede de segurança** pré-construída. Veja o
  [ROADMAP](docs/ROADMAP.md) → _Milestones → M2 — Demo_.

> **Nota — "🔲" no ROADMAP não quer dizer "não construído".** O app já está inteiro no código
> (`app.js`, `styles.css`, …); este repo **deriva specs de comportamento já existente**. Como as
> specs são **emergentes** (só nascem quando um change é arquivado via `archive`), no
> [ROADMAP](docs/ROADMAP.md) 🔲 significa _"comportamento já no código, spec ainda não promovida"_
> e 🟢 _"change arquivado → spec emergiu"_ — **não** "feature faltando". Só `dark-mode` (APR-02) é
> código **genuinamente novo**, escrito ao vivo na demo. Por isso `openspec/specs/` traz **2 de 8**
> changes: é o _ledger_ dos arquivados, não uma pasta a preencher de antemão.

### Fontes canônicas (a mecânica mora aqui)

Esta seção **prioriza a clareza da apresentação** e, por isso, resume de propósito conceitos que têm
lar canônico em outro lugar (um _drift_ consciente e aceito, restrito a este repo experimental). Para
a mecânica completa — tiers, gates, lifecycle, OpenSpec, planning packs — a fonte da verdade é:

- [docs/workflow/README.md](docs/workflow/README.md) — o processo completo (canônico).
- [docs/architecture/overview.md](docs/architecture/overview.md) — mapa de capabilities e contratos.
- [docs/ROADMAP.md](docs/ROADMAP.md) — dashboard de mudanças, deps e caminho crítico.
- [AGENTS.md](AGENTS.md) — a "constituição": invariantes, gates e roteamento.

---

## Como usar

Abra o `index.html` no navegador (duplo clique). Não precisa instalar nada nem rodar servidor.

> O navegador precisa de internet para buscar os resultados e as bandeiras.
> Funciona em Chrome/Edge/Firefox abrindo direto do arquivo (`file://`).

## O que faz

- **Fase de grupos / Fase eliminatória**: por padrão mostra os grupos enquanto eles estão
  ativos e passa automaticamente para o mata-mata quando o último jogo de grupo é finalizado.
  Use as abas no topo para alternar a qualquer momento.
- **Tabelas dos 12 grupos** com PTS, J, V, E, D, GP, GC, SG. Passe o mouse no ícone **ⓘ**
  de cada coluna para ver a explicação. Classificados (1º/2º) e o 3º colocado ficam destacados.
- **Resultados automáticos**: a cada recarregamento (reload) a página consulta a API
  (openfootball) e recalcula tudo. Há também o botão **↻ Atualizar**.
- **Edição manual**: dá para digitar/alterar qualquer placar (e pênaltis no mata-mata) para
  simular ou corrigir. Jogos editados ficam **marcados em laranja**, salvos no navegador e
  **nunca são sobrescritos** pela API. Use **↺ reverter** para voltar ao valor automático.
- **Próximos jogos** em destaque no topo, com dia e horário em **GMT-3 (Brasília)**.
- **Chaveamento clássico** do mata-mata com as linhas convergindo, preenchido conforme os
  resultados saem (incluindo os 8 melhores terceiros colocados*).

\* A posição exata de cada melhor 3º colocado no chaveamento é uma **estimativa** (marcada com `≈`):
a tabela oficial da FIFA pode alocar os mesmos times em posições diferentes.

## Arquivos

| Arquivo        | Função                                                |
| -------------- | ----------------------------------------------------- |
| `index.html`   | Estrutura da página                                   |
| `styles.css`   | Visual, tooltips, tabelas e o chaveamento             |
| `countries.js` | Nomes dos 48 países em português + código da bandeira |
| `app.js`       | Busca na API, classificação, fuso, edição e mata-mata |

## Fonte de dados

[openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) — JSON público,
sem chave de API. Os resultados são atualizados pela comunidade por commits, então podem ter
algum atraso em relação ao tempo real. Bandeiras: [flagcdn.com](https://flagcdn.com).
