---
name: requirement-intake
description: Use when adding/registering requirement(s) to the project — either a free-text description ("add requirement", "new requirement", "the system must/should ...") OR a file with a list of requirements (kickoff mode, e.g., requirements.md). Planning only; does not implement code or run openspec propose/apply/archive (that's execution).
---

# Requirement Intake

## Overview
Turns requirement(s) into the **planning layer** of the workflow (see `docs/workflow/README.md`; templates in `docs/workflow/templates/`). The **agent decides** routing and decomposition, recording its reasoning; the **human gate is the PR review** — not mid-run interruptions. Planning, never execution.

**Output language:** write all generated artifacts in **the project's documentation language as declared in `AGENTS.md`** (for copa2026: **pt-BR**), **regardless of the input language** — keep domain terms verbatim (e.g., `grupo`, `mata-mata`, `pênaltis`) and define them in the glossary. The input may be in another language; consolidate it into the project's documentation language.

**Two modes (detect from the input):**
- **Single** — input is **one** requirement description → one updated planning pack, one draft PR.
- **Batch / kickoff** — input is a **file with a list of requirements** (e.g., `requirements.md`) → derive the **whole** capability cut + foundational ADRs at once, **no gates**, and **leave it to the user** to open/segment the PRs (typically per capability).

## Boundaries (do NOT)
- ❌ Implement code. ❌ Run `openspec-propose|apply-change|archive-change` or touch `openspec/` (that's execution, Phase 3). ❌ Merge.
- ✅ Output (single) = updated planning pack (brief + change-map + ROADMAP + overview + ADR stub if needed) as a **draft PR**.
- In **batch mode**, **do not open a PR** — write the artifacts to the working tree (organized per capability) and suggest the segmentation; the **user** opens/segments the PRs.

## Context & paths
- Capabilities: `docs/capabilities/<cap>/{brief,change-map}.md` · ADRs: `docs/adr/NNNN-title.md` · ROADMAP: `docs/ROADMAP.md` · Map: `docs/architecture/overview.md` (the "ADR index" = the ADR-by-theme table in that file).
- **In-flight planning counts.** Before deciding bootstrap-vs-duplicate, also check the working tree (`git status`) and `plan/*` branches/PRs — not just what's committed. Unmerged artifacts are real planning in progress.

## Single mode — steps (input: a free-text requirement)

### 1. Load context
Read: all `docs/capabilities/*/brief.md` **and `change-map.md`**, `docs/architecture/overview.md` (capabilities + contracts + ADR table), the `docs/adr/` index, and **scan in-flight planning** (`git status` + `plan/*` branches). Map the requirement to the **canonical id in the project's requirements document** (e.g., a feature description → its `RF-NNN`) — that id is the dedup key, not a synthetic FR.

### 2. Classify + detect duplicate
Restate the requirement crisply; list the domain nouns. **Duplicate** = an equivalent FR/change already exists (by canonical RF id or by scope), **committed OR in-flight**. If so → **STOP and warn** (format below); don't duplicate, don't open a PR.

### 3. Routing (agent decides + reasoning in the PR)
Pick **one** destination by bounded-context cohesion (not by document section heading):
- **Existing capability** → add FR(s) to its `brief.md`.
- **New capability** → a new planning pack (its own domain/data/contract).
- **ADR** → when it's a cross-cutting decision, not a feature (e.g., idempotency, event contract, cross-cutting data pattern).

Decide autonomously when confident and **record in the PR**: chosen destination + alternatives considered + why. Use `AskUserQuestion` only when genuinely ambiguous (don't guess scope).

### 4. Risk + ADR scan
- **Risk `high`** if it touches a high-blast-radius operation (security, data integrity, cross-tenant isolation, idempotency/concurrency) — per the risk triggers in `AGENTS.md`; sets the tier (§7 of the workflow doc).
- If it requires a new cross-cutting decision → create an **ADR stub** (`docs/adr/NNNN-title.md`, status `Draft`) and mark the dependent changes blocked on it. **NNNN** = highest number across committed **and** in-flight ADRs (working tree/branches), +1.

### 5. Decomposition (agent decides + reasoning in the PR)
Derive the change(s): `name` (kebab-case), `FR(s)`, `effort` (XS..XL), `risk`, `tier` (T1/T2/T3), `deps` (intra + cross-capability). Grain = a PR-sized unit (cohesive requirements → one change with several `### Requirement:`; XL → several). Record the rationale in the PR; `AskUserQuestion` only if ambiguous.

### 6. Write artifacts
Where applicable, **filling from the templates in `docs/workflow/templates/`**: `brief.md` (+FR/NFR), `change-map.md` (+changes and FR coverage), `ROADMAP.md` (rollup + cross-capability deps), `docs/architecture/overview.md` (**only** if a new capability or a new inter-capability contract), `docs/adr/NNNN-*.md` (stub if §4).

### 7. Open a draft PR
Branch `plan/<slug>`, commit, **draft PR** (no merge). The PR body **must make the reasoning explicit** (routing + alternatives; decomposition + risk/ADR) — this keeps the review informed and the intervention rate measurable.

## Batch mode (kickoff) — steps (input: a file with a list of requirements)

**Autonomous, no gates.** Derives the full planning in one pass; review happens in the PRs the **user** opens afterward. Reuses the same risk (single §4) and grain (single §5) rules, and **fills all artifacts from the templates in `docs/workflow/templates/`**.

**B1. Parse.** Read the file and split into individual requirements (by section / `RF-NNN` id); capture priority (E/I/D) when present. Check existing planning (committed + in-flight) to avoid duplicates.

**B2. Cut capabilities.** Group the requirements into bounded contexts by **domain/data/contract cohesion — not by the file's section headings**. You can (and should) create cross-cutting capabilities that aren't sections (e.g., a `platform-core`). **Document the cut + alternatives** in the summary — it will be reviewed in the PRs.

**B3. Foundational ADRs.** Identify the cross-cutting decisions implied by the whole set (e.g., data patterns, idempotency, event contracts). Create **stubs** (`docs/adr/NNNN-*.md`, Draft) and mark the dependent changes.

**B4. Per capability.** Write `brief.md` (consolidates its FRs/NFRs) + `change-map.md` (decomposes into ordered changes: effort×risk→tier, deps, FR coverage). Apply risk (§4) and grain (§5).

**B5. Integrative layer.** Write `docs/architecture/overview.md` (capabilities + responsibilities + inter-capability contracts + ADR index) and `docs/ROADMAP.md` (rollup of the change-maps + cross-capability deps + critical path + milestones).

**B6. Hand off for segmentation (do NOT open a PR).** Leave the artifacts in the working tree, organized per capability. Deliver a **summary + suggested PR segmentation** — typically **one PR per capability** + **one foundations PR** (ADRs + overview + ROADMAP) — for the user to open/review by groups.

## If it's a duplicate: stop and warn
Don't edit anything. Report: the requirement (restated) + RF id, **which artifact already covers it** (path), its **status** (committed / in-flight / merged), and the recommendation (review the existing one, don't re-run intake).

## Output (final summary)
- **Single:** requirement + RF id · destination (existing/new capability/ADR) · changes added (tier+deps) · ADRs flagged · files touched + draft PR branch · next step ("after merge, `openspec-propose <change>` in dependency order").
- **Batch:** capability cut (+ rationale/alternatives) · foundational ADRs · per capability: number of changes + tiers · **suggested PR segmentation** · files written (uncommitted).

## Templates
The canonical skeletons for each artifact live in **`docs/workflow/templates/`** — **read and fill** the one for the artifact instead of inventing the shape (single source; avoids drift):

| Artifact | Template |
|---|---|
| brief | `docs/workflow/templates/brief.md` |
| change-map | `docs/workflow/templates/change-map.md` |
| ADR | `docs/workflow/templates/adr.md` |
| overview (map) | `docs/workflow/templates/overview.md` |
| ROADMAP | `docs/workflow/templates/roadmap.md` |

The line shapes (FR entry in the brief, change row in the change-map) are already in those files — don't redefine them here.

## Guardrails / red flags
- **You're about to cross the boundary if** you're about to write code, run `openspec-*`, or merge → **STOP**: that's execution, not intake.
- Decide when confident; ask only when genuinely ambiguous. **Explicit reasoning in the PR body.**
- **Artifacts are written in English** (per `AGENTS.md`), even when the input is in another language; domain terms verbatim.
- Dedup by **canonical RF id**, across committed **and** in-flight — never duplicate.
- High-blast-radius operations ⇒ high risk by default (per `AGENTS.md`; don't downgrade without justification).
- Structural ROADMAP updates go **in this PR**; execution-state transitions are out of scope here (owned during execution per §6).
- **Revisit trigger:** if PR review frequently corrects routing/decomposition, reintroduce human gates (decide in a retro).
