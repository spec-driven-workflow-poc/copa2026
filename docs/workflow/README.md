# Agentic Development Workflow

**Status:** Living convention (evolves via PR)
**Scope:** Workflow and conventions for largely agentic development. **Reusable across repos** — domain and stack specifics live in `AGENTS.md` and the project's artifacts, not here.
**Note:** Tool and layer choices were validated by a **real, executed bake-off** (BMAD vs OpenSpec) — see §13. Reusable templates in Appendix §15.

---

## 1. Context & goals

The project starts from an input requirements document (e.g., `requirements.md`) — treated as a **draft**, not a final definition; it is **consolidated** into capability briefs (§3), which are the formal home of the requirements.

Premises that shape the workflow:

- **Human-heavy planning, fully agentic implementation.** Humans lead planning (requirements consolidation, cross-cutting decisions, decomposition); light touch on execution (gates and merge).
- **Reliability via automated gates + multi-model review** (≥2 distinct providers; §9) with fixes applied by the agents themselves.
- **Ceremony scales with risk**, not just effort — sensitive domains/operations (money, security, data integrity) raise the tier.
- **Coordinated parallelism** between humans+agents, via a task graph with effort and dependencies.
- **Portable standard.** Thin, standardizable layers across repos, not a bespoke model — the doc + skill + templates are reusable in another repo.

### Principles

1. **Structured starting point** — no task starts ad hoc; every execution proceeds from a planned decomposition (§3).
2. **Spec before code** — requirements become specified behavior before implementation.
3. **Proportional ceremony** — heavy process only where the coordination benefit justifies the overhead (`effort × risk`).
4. **Single source per axis** — each fact lives in exactly one place, to avoid *spec drift*.
5. **Foundations before fanout** — cross-cutting decisions frozen in ADRs before parallelism.
6. **Non-negotiable green gates** — no code advances without passing the automated gates.
7. **Uncorrelated blind spots** — review by different models catches distinct classes of bugs.
8. **Unified lifecycle** — ADR, planning pack, and change are born as draft PRs, go through human+agent review, and the **merge consolidates** (→ `done`/`Accepted`) — see §2.1.

**Language convention.** All artifacts the workflow **produces** (briefs, change-maps, ADRs, OpenSpec specs/changes, ROADMAP, overview, `AGENTS.md`) are authored in the **project's documentation language — English by default, set in `AGENTS.md`**, regardless of the input language. Keep domain terms verbatim (e.g., `boleto`, `PIX`) and define them in a glossary; input documents may be in another language and are translated during consolidation.

---

## 2. Artifact hierarchy

Layers with **disjoint roles**, plus the "constitution":

```
docs/requirements.md           # INPUT draft (throwaway; consolidated into briefs)
docs/adr/                      # cross-cutting DECISIONS (one per architectural decision)
docs/capabilities/<cap>/
  ├── brief.md                 # consolidated REQUIREMENTS for the capability (home of the requirements)
  └── change-map.md            # DECOMPOSITION: ordered changes + effort×risk + deps + FR→change
docs/architecture/overview.md  # conceptual MAP — links ADRs + briefs + inter-capability interfaces (navigation, non-canonical)
docs/ROADMAP.md                # cross-capability DASHBOARD (aggregates the change-maps; critical path)
openspec/changes/              # in-flight DELTAS (proposal + specs + design + tasks)
openspec/specs/                # living BEHAVIOR per behavior-scoped spec-id — finer than a capability (emergent, via archive)
AGENTS.md                      # CONSTITUTION — conventions, gates, invariants, commands
```

Flow:
`requirements.md → (capability brief + ADRs) → change-map → openspec-propose per change → apply → archive → openspec/specs (emergent)`.

**Two altitudes that must not blur** (validated in the bake-off, §13):
- **`brief.md` = consolidated requirements** (the "what", product altitude, stable, human). This is where a BMAD-style PRD would shine — we adopt the *structure*, not the tool (§3).
- **`openspec/specs` = as-built behavior** (engineering altitude, emergent from archived changes).

| Artifact | Question it answers | Owner | Frequency |
|---|---|---|---|
| `requirements.md` | Initial draft of what exists in the current systems | Human | Throwaway |
| `docs/adr/*` | Why we chose X and not Y (cross-cutting)? | Human + agent | Mutable; supersede on reversal (§5.1) |
| `docs/architecture/overview.md` | How does the system fit together (map of decisions + capabilities + interfaces)? | Agent (derived) + human | On each new brief/ADR |
| `capabilities/<cap>/brief.md` | What must this capability do (consolidated)? | Human + agent | Per capability |
| `capabilities/<cap>/change-map.md` | Which changes compose it, in what order? | Human + agent | Per capability |
| `docs/ROADMAP.md` | Global view: what's left, parallelism, critical path | Orchestrator | Continuous |
| `openspec/changes/*` | What's being proposed/implemented right now? | Agent | Per change |
| `openspec/specs/*` | How does the as-built system behave today (per spec-id)? | Agent (via archive) | On each archive |
| `AGENTS.md` | How does the agent work in this repo? | Human | Rarely |

### 2.1 Unified lifecycle (draft → review → merge)

ADR, planning pack (brief + change-map), and OpenSpec change share **one cycle**: born as a **draft PR** → **human+agent review** → **merge** promotes to the artifact's terminal status (brief → `Consolidated`; ADR → `Accepted`; change / ROADMAP item → `done`). Same pipeline; the **review lens differs per artifact**:

- **ADR** → decision quality (alternatives, consequences, conflicts with other ADRs, traceability).
- **brief / change-map** → requirements completeness and decomposition soundness.
- **change** → correctness + tests + invariants + gates (§8).

**ADR and capability cross-trigger** (not strictly either/or): a brief can *surface* an ADR when it hits an open cross-cutting decision. ADRs come **first** (Phase 0) because they constrain capabilities.

**ROADMAP update — structural vs. state:** *structural* changes (new capability/ADR/changes, cross-capability deps) go in the very PR that establishes the capability/ADR — reviewed and atomic. *State* transitions are the **orchestrator's continuous job** outside any PR (avoids write races between parallel workers — §6), with **two exceptions**: a change's own `todo→doing` and `→done` transitions are **worker-owned, on its own row** (mechanism and the concurrency trade-off in §6). All **cross-change** state stays with the orchestrator.

### 2.2 Conceptual map (`docs/architecture/overview.md`)

A navigable, holistic view of the system — the "how it all fits together" that's missing when the spec is emergent and fragmented per capability. **It's a map, not a parallel spec:** it **links** (doesn't rewrite) the canonical artifacts — ADRs (decisions), capability briefs (the what), and the **interfaces between capabilities** (e.g., one capability emits an event another consumes). Anti-drift rule: no behavior or decision is *defined* here — only pointed to, avoiding a dual-layer spec (hand-authored + emergent).

**Map ≠ ROADMAP.** The map is the **structural** view ("how the pieces connect") — **no status, no build order**; the ROADMAP (§6) is the **execution** view (changes, status, critical path, milestones). Map contents: one-line responsibility per capability, the **table of contracts/interfaces between capabilities** (its unique value), an ADR index by theme (navigation), and a **runtime/data-flow** diagram (who consumes what — not implementation order). Being just links + structure, it's largely **agent-generatable/updatable** on each new brief/ADR (structural update, in the PR — §2.1).

---

## 3. Structured starting point — the per-capability *planning pack*

**Problem it solves:** OpenSpec is bottom-up — each `openspec-propose` is an island, with nothing above the change saying "this is the whole capability, and these are all the changes that compose it." Proposing change by change is ad hoc. The *planning pack* is the missing **decomposition layer** — the good structure of BMAD (consolidation + epic→stories + traceability) **without the framework's weight**.

Before any `propose`, each capability (bounded context) gets a **planning pack**:

1. **`brief.md` — capability brief (PRD-lite).** Consolidates the capability's requirements: the why + a lean set of FRs/NFRs + non-goals. It is the formal home of the requirements for that capability. *Not* a giant product PRD; just enough to pin the "what". **Status** is a single current value mirroring the ADR lifecycle (§5.1): `Draft` (being authored, before review) → `Proposed` (opened for review) → `Consolidated` (merged; the consolidated requirements are binding). A new brief starts as `Draft`; the **merge promotes `Proposed → Consolidated`**. This is the artifact's authoring status — distinct from the capability's *execution* status in the ROADMAP (`todo→doing→done`, §6).
2. **`change-map.md` — decomposition.** The **ordered list of OpenSpec changes** that compose the capability, each with `effort×risk`, dependencies, and an **FR coverage map** (brief FR → change). Large capabilities group changes into sub-epics. This is the capability's slice that feeds the ROADMAP.

**How it removes ad hoc:** you don't "run propose freely." You run `openspec-propose <name>` **taking it from the change-map, in dependency order**. The change-map is the starting point; `propose` becomes execution of a planned item.

**How it's produced (decision):** by a **lightweight in-house skill + templates** (not BMAD). The skill drives the brief consolidation and the change-map decomposition, with short templates versioned in the team's repo template — portable and standardizable across repos, without installing BMAD per repo. It borrows from external sources only the *shape* (FR coverage map, ordered epic→changes with no forward dependencies).

> Authoring the planning pack is **human-heavy and facilitated** (human+agent co-authoring) — this is the "robust planning" moment. Downstream execution (OpenSpec) is autonomous.

**Reusable templates** for each artifact are in the **Appendix (§15)**. A complete worked example can be (re)generated anytime by running the `requirement-intake` skill on a requirement.

---

## 4. OpenSpec as the execution layer

Chosen tool: **OpenSpec** (`@fission-ai/openspec`, MIT). Criteria: model-agnostic (Claude and Codex), "fluid not rigid", mature, **thin and standardizable** (a few commands + a validating CLI). Rejected: BMAD as a framework (overkill — §13), Spec-Kit (more ceremony; we borrow only the *constitution* concept → `AGENTS.md`), Kiro (lock-in), Tessl (regenerative, risky for critical domains).

**Convention:** specs are defined **exclusively as OpenSpec defines them** — no parallel `docs/specs/`.

Per-change flow (each change-map item):
1. `openspec-propose <change>` → creates `openspec/changes/<change>/` with `proposal.md`, `specs/`, `design.md`, `tasks.md` (templates come from the CLI; `openspec validate --strict` confirms).
2. `openspec-apply-change` → implements the tasks (cycle §8).
3. `openspec-archive-change` → archives and **promotes the deltas into `openspec/specs/`** (living truth).

**Specs are emergent, not hand-written.** `openspec/specs/<spec-id>/` is the **accumulation of archived deltas**. **Spec-ids are behavior-scoped** — OpenSpec's default granularity (e.g. `money`, `transport-edge`), **not** Paymon capabilities: one capability accretes **many** spec-ids, and a change's delta targets the spec-id(s) whose behavior it touches (naming rule: [glossary](../glossary.md)). Keeping spec-ids fine-grained also keeps parallel changes from colliding on one spec file at archive time — a *textual*-conflict win only: two in-flight changes can still specify contradictory behavior across different specs (or auto-merge cleanly into one) with **no git signal**, so behavior-level coordination between concurrent changes stays an orchestrator concern (§10), invisible to any per-change diff review. The planned "what" lives in `brief.md`; the "as-built" emerges here.

**Central link — change-map item ≈ OpenSpec change.** The execution unit is the change; a change-map item becomes one `openspec-propose` (XL items may become several). Greenfield bootstrapping: capabilities with shared internals start with a foundational `establish-<cap>` change (package skeleton + core interfaces) before feature changes.

---

## 5. Cross-cutting decisions (ADRs) — Phase 0

ADRs in `docs/adr/NNNN-title.md`. They are **shared dependencies of almost everything** — decided and settled **before** parallelism. Not strictly either/or with capabilities: a brief can *trigger* an ADR when it hits an open cross-cutting decision (§2.1).

### 5.1 Lifecycle & authoring

ADRs go through the **same agentic rigor as implementation** (draft PR + review) — they are **T3 by nature** (mandatory human gate).

**Status:** the field holds a **single current value** from the lifecycle below (not the whole sequence — a new ADR starts as `Draft`):

- **Draft** — being authored, **before** it is opened for review (local/WIP); not yet binding.
- **Proposed** — opened for review; the decision is on the table and review iterations are expected (they are themselves proposed changes), awaiting the human merge gate. *(Independent of GitHub's draft-PR flag — a PR opened for review is `Proposed` even if still marked draft on GitHub.)*
- **Accepted** — merged; binding. The **PR merge promotes `Proposed → Accepted`**.
- **Deprecated** — no longer recommended, with no direct replacement.
- **Superseded** — replaced by a newer ADR (link it); kept for history.

**ADRs are mutable, not append-only.** An ADR is edited in place (via PR, same review gate) to refine, clarify, extend or correct its decision as understanding evolves — git history is the audit trail. A **new** ADR that **supersedes** (and archives) the prior one is created **only when a change reverses that ADR's central design decision** — never for elaborations or compatible adjustments. *Example:* clarifying how secrets are scoped → edit ADR-0007; deciding secrets no longer come from a vault at all → new ADR superseding ADR-0007.

**ADRs stay high-level; specifics live in the changes.** An ADR fixes the central decision and its constraints — the "what/why" at a high, semantic altitude. The concrete concepts and mechanics are established in the **changes** that implement it, and a change may **expand or narrow** the ADR's context (e.g., a state model defined semantically in the ADR, with its physical representation — fields/columns — decided in the change). This keeps ADRs stable and small while detail accretes downstream.

**Editing a planning artifact mid-change — the tiers.** Discovery *during* a change routinely reveals that its ADR (or the capability `brief`, whose lifecycle mirrors this one — §3) needs an edit. The rule is **not** "changes only implement, never edit" — the "expand or narrow the context" clause above already contradicts that. Categorize the needed edit by **blast radius**, and let the tier — not a blanket ban — decide where it lands:

- **Tier 1 — rides in the change's PR.** A **compatible** refine/clarify/extend, **within the change's charter** (the artifact already delegated this detail to the change), on an artifact **no concurrent change currently depends on** → edit it **in place, in the change's own PR**, as a **separate commit reviewed under the artifact's review lens** (§2.1: ADR → decision dimensions; brief → requirements completeness) and with **orchestrator awareness**. This is the ordinary case the clause above anticipates.
- **Tier 2 — extract a prerequisite change.** The edit touches a **frozen shared surface that concurrent or downstream changes already depend on** → do **not** edit in-flight: this is the §10 escape case. **STOP**; the orchestrator extracts the edit into its own prerequisite change and re-sequences dependents behind it.
- **Tier 3 — separate, always (ADR-only).** The edit **reverses the ADR's central decision** → a new **superseding** ADR in its own PR, never a ride-along (per the supersede rule above). Briefs have no supersede: a brief whose scope is *reversed* (not merely extended) is a **planning correction**, routed to planning.

**Parallelism guardrail.** A tier-1 edit riding in a change PR is **unmerged and still mutable** until that PR merges — so it **MUST NOT be referenced or relied upon by any other concurrent change**. Only **merged** artifact text (ADR `Accepted`, brief `Consolidated`) is a shared dependency others may build on (Principle 5, *foundations-before-fanout*). The **isolated worktrees** of §10 enforce this mechanically: a concurrent worker sees only `main` plus its own branch, so another change's unmerged tier-1 edit is simply absent — a worker that needs it finds it missing from `main`, which forces the escalation. If a second in-flight change needs the clarified text, that need **promotes the edit to tier 2**: extract it, and sequence the dependents behind it. This is what keeps a PR-scoped artifact edit from silently becoming a cross-change dependency before it is merged (`Accepted`/`Consolidated`).

**Authoring (co-authoring):** human frames (decision, context, constraints) → agent drafts real alternatives with trade-offs + consequences → draft PR.

**Agentic review (decision dimensions):** were real alternatives considered? consequences explicit? conflicts with another ADR? traceable to the requirement? implementable in the project's stack? Different models question different premises → coordinator triages → human approves → merge → `Accepted`.

**Foundational ADRs** depend on the domain/stack and are decided in Phase 0. *Example (payments):* money representation · multi-tenant isolation · gateway abstraction · idempotency/locking · event processing · secrets and multi-environment · package layout.

### 5.2 Invariants

Some cross-cutting decisions establish **invariants** — hard constraints that must hold across *every* change, not only the one that introduced them. They are the standing safety net in a sensitive domain: data integrity, security, tenant isolation, idempotency/concurrency. *Example (payments):* `client_id` on every query · money as integers · never store the PAN · secrets only from the vault · idempotent event handlers · per-entity lock.

- **Objective.** Make high-blast-radius regressions hard by default. Unlike a per-change requirement, an invariant is a property the *whole system* must preserve, so it is checked continuously, not designed once.
- **Where they're declared.** The ADR that makes a cross-cutting decision states the invariant it creates (e.g., a multi-tenant-isolation ADR → `client_id` on every query). The ADR states the **constraint**, never the mechanism.
- **Where they're consolidated.** Every invariant is gathered into a single **invariants list in `AGENTS.md`** (the constitution, §2) — the canonical checklist, independent of any one ADR. This is the list reviewers (human/agentic) and gates check against.
- **How they're enforced.** By construction wherever possible (the preferred mechanism — e.g., a tenant-bound query wrapper, an idempotency middleware), with review verifying the `AGENTS.md` list on every change. The enforcement mechanism is an **implementation decision**, fixed with the stack — not by the ADR.

---

## 6. ROADMAP / task graph

`docs/ROADMAP.md` is the **cross-capability dashboard** aggregating the change-maps (§3) into a global view: critical path, what parallelizes, milestones. **State maintenance is agentic**, done by an **orchestrator** (single writer):

- **Worker agents** (one change in an isolated worktree) treat ROADMAP/change-map as **read-only**, with **two exceptions, both on their own row only**: (1) the `todo→doing` transition — recorded when work starts, *before* the change PR exists, so it lands **outside** that PR; and (2) the `→done` transition — folded **inside the change PR** (§2.1), taking effect on merge. Workers touch no other row or transition; concurrent workers may contend on the ROADMAP file — accepted trade-off. *How each transition is committed (and the safeguard for the out-of-PR one) is the executor skill's instantiation — `workflow-execute-change`.*
- **Orchestrator** (one agent, single serialized writer) manages the **cross-change** state: dependency resolution, assigning the next eligible change, `→review`, milestones/critical-path. The per-row `todo→doing` and `→done` transitions are authored by the worker on its own row (above).
- **Human** enters at planning and re-prioritization — not routine state maintenance.

Each item carries: stable `id` (e.g., `CAP-01`), **effort** `XS|S|M|L|XL`, **risk** `low|medium|high` (high = high blast-radius — §7), derived **tier** (§7), **priority** `E|I|D` (below), **deps**, **status**. Items with no pending deps among themselves run in parallel (§10).

**Priority `E|I|D` — scope & sequencing, orthogonal to tier** (tier = effort×risk = *how much ceremony*; priority = *whether/when to build*):

- **E — Essential:** part of the MVP / transactional core; the product's core purpose isn't met without it.
- **I — Important:** clear value, but not required for the MVP; delivered as **increments** after the core.
- **D — Desirable:** nice-to-have / lowest priority, often gated on unconfirmed demand or an open decision.

Milestones group by priority: **M1 = all E** (MVP), **M2 = I**, **M3 = D** + open decisions. The same `E|I|D` marks each FR in a brief and each change in a change-map.

> Scale: single-orchestrator is the default (simple, auditable). If parallelism grows and it becomes a bottleneck, move state out of markdown (issues/queue) and treat the ROADMAP as a derived view.

---

## 7. Ceremony tiers (effort × risk)

"High" risk = high blast-radius: touches security, data integrity, cross-tenant isolation, or idempotency/concurrency (regardless of size). The exact risk triggers are defined in the project's `AGENTS.md`.

| Tier | Criteria | OpenSpec ceremony | Review | Human gate |
|---|---|---|---|---|
| **T1 — light** | XS/S **and** low risk | proposal + spec delta + tasks (**no `design`**) | ≥1 independent lens — automated in-PR review (§9) | approves merge |
| **T2 — standard** | M, **or** S with medium/high risk | **+ `design`** | **multi-model** — local + in-PR, 2 providers (§9) | approves design + merge |
| **T3 — critical** | L/XL, **or** high risk in the system's critical core | + `design` + ADR if a new decision | multi-model + adversarial review (red-team) | approves proposal + design + merge |
| *(trivial, no behavior)* | rename, typo, dependency bump | **outside OpenSpec — direct PR** | per PR | approves merge |

> **Human-gate timing.** The tier's proposal/design approvals happen at the §8 **alignment checkpoint** — after `propose`, **before implementation** — not at the PR; the PR gate covers the merge (and, per tier, re-confirms what changed since). The checkpoint itself runs at **every** tier, T1 included (it's OpenSpec's own *generate → align → implement* flow): what the tier scales is the *formal approval scope* in the column above, not whether the human aligns on the artifacts before code is written.

**How OpenSpec ceremony scales (verified via the CLI):**
- **Schema per tier.** Default `spec-driven` (`proposal→specs→design→tasks`) for T2/T3; a project-local **`spec-lite`** (`proposal→specs→tasks`, no `design`) for T1, via `openspec new change <name> --schema spec-lite`. Custom schemas are OpenSpec's documented way to tailor ceremony, so T1's lighter flow is first-class, not a bypass. (A dedicated schema, not just skipping `design`: in `spec-driven`, `tasks` depends on `design`, so skipping it leaves `status` incomplete and fights the auto-sequencing skills — `spec-lite` keeps the no-design graph consistent.) The default stays `spec-driven`; only T1 opts in.
- **`design` is optional** — a `spec-lite` change (**proposal + spec delta + tasks**) passes `openspec validate --strict` and is apply-ready. In `spec-driven`, `design` enters only when it applies (cross-cutting, new dependency, non-obvious technical decision).
- **OpenSpec floor = proposal + spec delta + tasks** — the spec delta is the point (promoted into `openspec/specs` on archive). Below that (no behavior to specify), use a **direct PR**, outside OpenSpec.
- Beyond artifact count, **content depth** scales (a 2-line proposal, 1 scenario, a short tasks list).

---

## 8. Per-task execution cycle

Each change, in its isolated worktree:

0. **Mark `doing`** — record this change's `todo→doing` transition on the ROADMAP before work begins (how: `workflow-execute-change`; §6).
1. **Change** — `openspec-propose` (depth per tier), from the change-map item.
2. **Align (every tier)** — present the generated artifacts (proposal · spec delta · `design` where the tier has one · tasks) to the human and **wait for explicit alignment before implementing**. This is OpenSpec's natural flow — *generate → align → implement* — never `propose` chained straight into `apply`; iterate the artifacts until aligned. It is also where the tier's proposal/design approvals land (§7: T2 design, T3 proposal + design) — pre-implementation, not at the PR; the PR gate (step 7) then covers the code plus whatever the spec delta became during review.
3. **TDD** — test first, then implementation.
4. **Automated gates** — pass 100%.
5. **Review** — **local, pre-PR** (in the worktree, no GitHub writes): Layer A + adversarial per tier; then, after the PR opens, the **in-PR bot** (Layer B). (§9)
6. **Reconcile + auto-fix** — evaluate the findings from every layer (verify, don't react), apply confirmed fixes, re-run the gates. Local findings can be reconciled **before** the PR opens (a local quality gate); the in-PR bot's comments after. (§9)
7. **Human gate** — approve the PR (scope per tier, §7): code + the still-mutable spec delta. Approval is the "specs OK" signal that unlocks archiving — not the merge yet.
8. **Archive → merge** — on approval, `openspec-archive-change` on the branch promotes the delta into `openspec/specs/` and is pushed; then merge (code + promoted spec land together). **Archiving requires a fresh sync with `main` first:** update the branch and re-check the delta against the now-current canonical specs — a sibling change merged meanwhile may have promoted behavior that affects this delta (same spec-id or a related one), **even with no git conflict** (a clean rebase is not a pass); a needed adaptation is residual drift → reconcile + fresh approval. Archive is **post-approval, pre-merge** — never before approval (review still changes specs), never a detached post-merge step. A push after approval may re-trigger review under branch protection → a mechanical re-approval of the promotion-only diff.

**PR opens Open, not Draft.** By the time the change PR opens (gates green, local review done) it's dev-complete and review-ready — so it opens as a normal **Open** PR, never a GitHub Draft (the flag is lifecycle-orthogonal — §5.1).

### Verification gates — non-negotiable (CI + local)
The set is **stack-specific (defined in `AGENTS.md`)** and must cover: **formatting**, **static analysis/lint**, **tests with race/concurrency detection**, **coverage** (per-project target), and **test layers** unit / integration / live (never in CI), with external dependencies faked deterministically.

*Example (Go):* `gofmt`/`goimports` · `go vet` · `golangci-lint` · `go test -race ./...` · coverage ≥80% · no goroutine leaks.

> Race detection only sees what the tests exercise — a weak suite is blind. Covering concurrent paths is a priority.

---

## 9. Multi-model review architecture

Different models' blind spots are uncorrelated — cross-checking findings lowers the undetected-bug rate. Review is **two layers**, and the **number of independent lenses scales with the tier** (§7). The architecture below is provider-agnostic; a concrete **suggested instantiation** (current org tooling) follows it, which a repo may confirm or override in its `AGENTS.md`.

- **Layer A — local, pre-PR:** before opening the PR, the change is reviewed locally (e.g., a self-contained multi-agent review skill) at a depth that scales with the tier. **Its review lenses MUST run as fresh, impartial subagents — contexts that never see the implementer's own reasoning** — so the review is unbiased even though the executor that wrote the code drives it; that subagent freshness, not a separate outer session, is what removes the implementation bias (an impartial pass). **Mandatory at T2+.** Same provider as the author, so even fresh it's a *within-provider* impartial pass; the *cross-provider* independent lens is Layer B.
- **Layer B — in the PR (automated):** **at least one** in-PR bot from a provider **distinct from the executor's** reviews every PR and posts findings as comments — **one or more providers; the concrete set is the repo's choice (`AGENTS.md`)**. It is the always-on **cross-provider** independent lens (a different provider from the executor), so it is present from T1. Each bot runs at a **single, consistent depth on every PR** (the bot fires automatically and doesn't know the change's tier) — **per-tier escalation comes from *adding layers*** (Layer A at T2, adversarial at T3) **and the local review's effort, not from varying the bot's depth**.

**Per-tier escalation (lenses):**
- **T1** — Layer B only: **at least one** independent, cross-provider in-PR review, then human merge.
- **T2** — Layer A (mandatory) + Layer B: **≥2** providers cross-check before merge.
- **T3** — the above **+ adversarial review (red-team)**: a skeptic independently **attacks the change** — a concurrency/redelivery failure, a tenant-scoping bypass, an invalid state transition, etc. — going after each domain invariant rather than reviewing for bugs. The break-it **method is the mandatory part**; running it on a **comparable-capability model from a different provider** is recommended when available (uncorrelated blind spots — *never a weaker tier*) but **not required** — T3 never blocks on two models per dev. It reviews the change directly, not Layer A's output. Read-only finding-generator. *(Verifying the findings themselves — refute-to-confirm — is the coordinator's triage job, not this step.)*

**Coordination + auto-fix — *receiving the reviews*:** the **local executor agent** (the coordinator role) reconciles the reviews (in the worktree, on the same seat) — a role, not a hosted service. The local reviews run as **fresh subagents that return their findings to it** (no file handoff); the bot's comments are read via `gh`. It runs **per review batch** — local findings pre-PR, the bot's comments after the PR opens, not one combined pass — and for each batch dedups/triages (real bug vs false positive), applies confirmed fixes, and re-runs the gates. Unlike Layer A, the coordinator *does* carry implementation context (it has to fix), so triage is **not** impartial — the **fail-safe is the guard**: any finding not conclusively resolved is **blocked and escalated to the human**, never waved through as a false positive (the money-domain cost is asymmetric — cf. the `AGENTS.md` invariants fail-safe). The **human gives final approval** at the gate scope the tier sets (§7).

> Cross-review pays off only with **≥2 distinct providers** — the executor's provider for Layer A and a *different* one for Layer B. Layer B may itself run **more than one** distinct-provider bot; beyond the first, the extras are optional redundancy (uncorrelated blind spots), not a second required pillar — so the process mandates only the minimum (≥1 distinct from the executor) and leaves the rest to the repo.

### Suggested instantiation (current org tooling)

A **recommendation, not a lock-in** — grounded in the accounts the org has today (Claude Team seats + an org OpenAI API key); revisit as tooling changes, and a repo may override in its `AGENTS.md`. Each skill-backed role is **invoked via its skill** (read the skill for the procedure); Layer B is an external bot, not a skill.

| Layer / role | Invoke (skill) | Tool · account | Mutates code? | Key rule · cost |
|---|---|---|---|---|
| **Layer A** — local, pre-PR · T2+ | **`workflow-code-review`** | Claude Code subagents (self-contained) · Claude Team seat | No — findings | fresh, impartial subagent lenses (no implementer context); multi-agent lenses + confidence×impact thresholds; ≈ $0 marginal (session usage) |
| **Layer B** — in-PR · every PR | *(none — external bot)* | **≥1 provider distinct from the executor** — baseline **PR-Agent** ([`The-PR-Agent/pr-agent`](https://github.com/The-PR-Agent/pr-agent)) · org **OpenAI API key**; a repo may add another (e.g. Gemini) | No — comments | distinct provider(s); single fixed depth per bot (`.pr_agent.toml`); token-metered, cents–low-$/PR |
| **T3 adversarial** | **`workflow-adversarial-review`** | skeptic subagents; **Codex** (CLI / `codex` MCP, read-only) when a 2nd model is available | No — findings | adversarial red-team of the change; cross-model optional; T3 only |
| **Receiving reviews** — any tier | **`workflow-receiving-code-reviews`** | Claude Code executor · `gh`/GitHub | **Yes — applies fixes** | evaluate findings (verify, don't react) under the fail-safe; fix; re-run gates before the human gate |

> CI wiring of the bot (the workflow file + the API-key secret) is Layer-2 config — the API key itself is org-provided.

### Running a review — walkthrough

The **executor** (the worktree session that implemented the change) drives this once implementation + local gates are green, **before opening the PR** (it's steps 5–6 of the §8 cycle — the executor self-initiates it; a human can drive the same steps):

1. **Determine the tier** (§7 / the change-map item).
2. **Layer A** — invoke `workflow-code-review` (mandatory at **T2+**): its lenses run as **fresh, impartial subagents** (they get the diff + `AGENTS.md`, not your implementation reasoning) and it **returns** a findings report. At **T3**, that skill's tier rule directs you to also launch `workflow-adversarial-review` **in parallel, in this same executor session** (red-team; a comparable-tier skeptic on a *different* provider if one is available, else same top model) — it **returns** its own independent findings.
3. **Reconcile (pre-PR)** — run `workflow-receiving-code-reviews` over the returned findings: triage each (verify / false-positive-with-evidence / **unresolved → block + escalate** under the fail-safe), apply confirmed fixes **in the executor's session**, re-run the gates.
4. **Open the PR** — now clean of the local findings.
5. **In-PR** — the bot (Layer B) comments; run `workflow-receiving-code-reviews` **again** over the bot's comments only (the local findings are already resolved — no bot↔local re-merge); fix, re-run gates.
6. **Human gate** (scope per tier, §7) → **archive** (post-approval: `openspec-archive-change` on the branch, pushed) → merge — approval unlocks the promotion, which lands with the merge (§8).

The reviews are **read-only fresh subagents that return findings to the executor** (no file handoff); only the executor (the receiving step) edits. Anything not conclusively resolved is **blocked and escalated**, never opened into a PR as "probably fine".

---

## 10. Parallelism & isolation

- **Git worktrees** — each change/agent in an isolated copy (own branch + PR). In Claude Code, `isolation: worktree`.
- **File-level coordination:** shared interfaces merged **before** parallel implementations; shared files have an owner; the orchestrator respects the graph (pending deps wait). Practical ceiling: one human sustains review of ~3 concurrent agents.
- **Late-discovered shared-surface need (the escape case).** The rules above assume shared surfaces are settled up front (Principle 5). When a worker instead discovers *mid-execution* that a **frozen shared surface** (`core`, canonical state machine, cross-capability contract, gate config) must change, it **STOPs and escalates** — it does **not** edit the frozen surface in-flight, and it does **not** author the fix itself (cross-change sequencing and planning artifacts are orchestrator-owned — §6). The orchestrator's resolution is normally to **extract the update into its own prerequisite change** and re-sequence the graph so dependents wait on it (dynamic *foundations-before-fanout*); if the surface was under-scoped at freeze, the fix is a planning correction instead. Either way the collision is dissolved by re-serializing, never by two workers editing the surface in parallel.

---

## 11. Greenfield phases

| Phase | Focus | Who |
|---|---|---|
| **0 — Foundations** | `AGENTS.md` + invariants, cross-cutting ADRs (§5), project scaffolding, CI with gates, `openspec init`, the planning-pack skill | Human-heavy |
| **1 — Planning packs** | per capability: `brief.md` (consolidation) + `change-map.md` (decomposition) — the structured starting point (§3) | Human + agent (facilitated) |
| **2 — Global ROADMAP** | aggregate the change-maps into the dashboard; critical path and parallelism | Orchestrator + human |
| **3 — Parallel implementation** | agentic execution per change (cycle §8); accretes into `openspec/specs` | Agentic, human at the gates |

MVP = the essential requirements from the project's requirements document.

---

## 12. Guardrails against anti-patterns

- **Ad hoc / "loose propose"** → planning pack required before proposing (§3).
- **Spec drift** → single source (OpenSpec); `archive` promotes deltas; ADRs edited in place and superseded only on reversal (§5.1); brief (intent) vs specs (as-built) at distinct altitudes. Since `archive` promotes a delta **verbatim**, any review-driven correction (local review or in-PR bot) that changes spec-relevant behavior must be reconciled back into that change's delta (and `tasks.md`) **before** archive, so the promoted spec is truly as-built — enforced at fix time by `workflow-receiving-code-reviews` and as a pre-archive check by `workflow-execute-change`.
- **Orphaned follow-ups / backlogs** → a *non-actionable* follow-up surfaced by a change is anchored **in-place at the file it will later act on** (config/build/code) as a **self-contained prose note** — carrying enough rationale to act on when that file is next touched, and citing the change's `design.md` where it has one (`mv`'d to archive on completion) — **not** parked in a standalone register (a write-only graveyard). The in-place note itself — not a machine-readable tag or index — is what keeps it traceable; it resurfaces when the file is next touched.
- **Context rot** → small changes isolated in worktrees; one task = one session; lean `AGENTS.md`; prune on every edit.
- **Over-bureaucracy** → tiers; T1 nearly ceremony-free; the planning pack is PRD-*lite*, not a product PRD.
- **Over-autonomy in a sensitive domain** → human gate on every merge; an **artifact-alignment checkpoint before implementation on every change** (§8 step 2 — never `propose` chained into `apply`); T3 with human gate at proposal+design+merge; an **invariants list** in `AGENTS.md` (§5.2), enforced by construction and verified at review.

---

## 13. Recorded decision: BMAD vs OpenSpec (executed bake-off)

We ran both tools **for real** (installed, not emulated), planning the same requirement — numbers below.

| | BMAD (full chain) | OpenSpec |
|---|---|---|
| Output | PRD + architecture + epics/stories = **2,851 words**, 3 docs | 1 validated change = **1,516 words** |
| Workflows | **3 interactive skills** (human facilitation) | **1 autonomous command** + `validate --strict` |
| Footprint | 44 skills + `_bmad` runtime | a few commands + skills |

**Conclusion:** full BMAD is **overkill** and not very portable; OpenSpec alone **lacks a structured starting point**. Decision: **OpenSpec for execution + a lightweight in-house planning pack up front** (§3), borrowing from BMAD the *structure* of consolidation/decomposition, not the tool. Facilitated BMAD = good for "human in command"; autonomous OpenSpec = good for "agentic execution" — we use each at the altitude where it won.

---

## 14. Next steps (implementation — after approval)

1. `AGENTS.md` (stack conventions, gates, **invariants** (§5.2), OpenSpec commands, tier rules).
2. `openspec init` in the repo.
3. **Planning-pack skill + templates** (`brief.md` + `change-map.md`).
4. Initial ADRs (§5).
5. Project scaffolding + CI with the gates and test layers (§8).
6. `docs/ROADMAP.md` (dashboard) + first planning pack (pilot capability).
7. Automated in-PR review bot(s) — ≥1 provider distinct from the executor, wired in CI (the decided Layer B, §9).

> Plan via the `writing-plans` skill before executing.

---

## 15. Templates & bootstrap

Copy-paste templates for each artifact live in [`templates/`](templates/) — the reusable kernel, no examples needed. The `requirement-intake` skill fills them in.

| Artifact | Template |
|---|---|
| Capability brief | [`templates/brief.md`](templates/brief.md) |
| Change map | [`templates/change-map.md`](templates/change-map.md) |
| ADR | [`templates/adr.md`](templates/adr.md) |
| Conceptual map | [`templates/overview.md`](templates/overview.md) |
| ROADMAP | [`templates/roadmap.md`](templates/roadmap.md) |

### Bootstrapping a new repo (reproduction checklist)
1. Copy the `docs/workflow/` folder (this README + `templates/`) + the workflow skills: `requirement-intake` and the review set (`workflow-code-review`, `workflow-adversarial-review`, `workflow-receiving-code-reviews` — the §9 instantiation; adjust per the repo's tooling).
2. `openspec init --tools claude`.
3. Create the T1 lite schema: `openspec schema init spec-lite --artifacts proposal,specs,tasks --no-default` (§7).
4. Write `AGENTS.md`: stack conventions + **invariants** (§5.2) + commands + tier rules (§7).
5. Foundational ADRs (Phase 0 — §5).
6. Per requirement, run `requirement-intake` → planning packs (Phase 1); aggregate into the ROADMAP (Phase 2); execute via OpenSpec per change (Phase 3, §8).
