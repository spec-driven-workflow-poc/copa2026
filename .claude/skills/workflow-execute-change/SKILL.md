---
name: workflow-execute-change
description: Use when implementing an already-planned capability change, named by its change id (e.g. PC-01) or its goal. Not for authoring or registering requirements — that's requirement-intake.
---

# Execute Change

## Overview
Takes **one** planned change through the `docs/workflow/README.md` §8 cycle — propose → **align** → apply → gates → PR → review, then **archive post-approval, just before merge** (the reviewer sees a still-mutable change; the spec promotion follows the human's approval, never precedes it). You are a *worker* (one change, isolated worktree); the ROADMAP writes you make are your own row's two glyph flips — `todo→doing` (🔲→🟡) at kickoff and `→done` (🟢) in the change PR (Phase 4.2); ownership + rationale in workflow §6, the `doing`-commit recipe in [reference.md](reference.md). **On any unresolved conflict — ambiguous or conflicting canonical sources (brief / ADR / spec) — STOP and escalate; never guess or adjudicate** (money-domain asymmetry — `AGENTS.md` fail-safe). Detail lives one level deep: **[reference.md](reference.md)** (paths, glyphs, schemas, issue convention) · **[pr-template.md](pr-template.md)** (PR body).

## Boundaries (scope of writes)
- ⚖️ **Refine the capability `brief.md` / the `docs/adr/*` this change implements — by the §5.1 tiers, never freely.** A needed edit surfaced mid-change is **categorized, not silent**: *tier 1* (compatible, in-charter, no concurrent dependent) rides in **this** PR as a separate commit under the artifact's review lens, orchestrator-aware; *tier 2* (frozen surface with live dependents) → **STOP**, orchestrator extracts a prerequisite change (§10); *tier 3* (reverses an ADR's central decision, or a brief scope reversal) → **STOP**, route to planning (superseding ADR / planning correction). A tier-1 edit here **MUST NOT** be relied on by any other concurrent change (§5.1 parallelism guardrail). Two artifacts that *conflict* (vs. merely need extending) → **STOP**, planning fix.
- ❌ **Author/edit `change-map.md` / `overview.md`** — cross-change structural, orchestrator/planning-owned. If one is wrong, that's a planning fix, not execution → **STOP** and route to planning.
- ❌ **Hand-edit `openspec/specs/`** — those emerge only via `archive` (Phase 4.3).
- ❌ **Merge** — the human gate owns it (§8/§12).
- ✅ **In the change PR:** the OpenSpec change dir (`openspec/changes/<name>/…`) + code/tests, and your change's `Status` → 🟢 in `docs/ROADMAP.md` (Phase 4.2).
- ✅ **One commit direct on `main`** (human-approved, no branch, no PR): your change's `Status` 🔲→🟡 at the Phase 2→3 bridge — `docs/ROADMAP.md`, single cell. *Rule* → §6; *recipe* → [reference.md](reference.md). You own **both** flips on your **own row** only; every other row/transition is the orchestrator's (cross-change sequencing, deps, milestones — **not** this skill).

## Instructions

**Phase 1 — Pre-flight & readiness.**
1. **Identify**: match one ROADMAP `Changes` row + the capability `change-map.md` (by id/kebab name, or FR scope). No match → **STOP**, route to planning; ambiguous → ask. Record id · capability · tier · deps · E/I/D · status.
2. **Load specs**: capability `brief.md` + `change-map.md`, **every ADR in the deps**, the `overview.md` contracts it touches.
3. **Reconcile the issue** (find it via reference.md): diff its body vs `brief.md` + `change-map.md`. Adds scope or conflicts → **STOP**, ask first.
4. **Validate deps**: each change dep Status **🟢**; each ADR dep **Accepted** — otherwise → **STOP**.
5. Confirm **no open decision** gates a covered FR (deferred in the brief, or a `Proposed/open` ADR it covers) — if one does → **STOP**. Surface any **in-place follow-up anchor** (§12) in a file this change touches — **action it if this change makes it now-actionable, else re-defer**. Then emit a one-screen readiness report.

**Phase 2 — Categorize & plan.** Read `Tier` from `change-map.md` (canonical). Pick ceremony (reference.md): trivial → direct PR · **T1** → `spec-lite` · **T2/T3** → `spec-driven` (+ design). A T3 needing a *new* ADR is an undecided decision → **STOP**, route to planning. Recommend an isolated worktree; a **shared-surface** touch (`core`, state machine, cross-capability contract, gate config) is high-risk → merge before dependents, and discovering *mid-flight* that a **frozen** one must change → **STOP** to the orchestrator, never edit or re-scope it yourself (§10 escape case). Likewise, a needed **`brief`/ADR edit** surfaced mid-change is categorized by the **§5.1 tiers** — ride-along (tier 1), extract (tier 2), or supersede/route-to-planning (tier 3) — and escalated accordingly, never silently edited or silently skipped. Confirm the plan with the user before executing. **Then, before branching, mark the change `doing`:** get explicit human approval, then commit the single ROADMAP cell 🔲→🟡 directly on `main` — no branch, no PR (recipe + red flags → [reference.md](reference.md)).

**Phase 3 — Execute (§8).** On branch `change/<name>` (cut *after* the `doing` flip), **not main**. Per step, confirm then delegate:
1. **Propose** — `openspec-propose` with the **tier's schema** (reference.md — a non-default schema is set at change-creation, not by `openspec-propose`). Spec delta covers **exactly** the change-map FR rows (or traces to the ADR(s) it realizes for no-FR scaffolding); untraceable → **STOP**. Delta folders (`openspec/changes/<name>/specs/<spec-id>/`) are named by **behavior-scoped spec-id** (glossary rule: one capability ⇒ many spec-ids — match the folder name of an existing `openspec/specs/<spec-id>/` when modifying that behavior, mint a new kebab-case id for new behavior; **never the capability name**). **Reuse-vs-mint is a real decision, not a default:** survey existing spec-ids first; when the homing is *not obvious* — the behavior plausibly belongs to an existing spec-id, or spans two — don't mint a fresh id for convenience: carry the call to **Align (step 2)** explicitly and confirm it with the human. Finish validation-green.
2. **Align — STOP (every tier).** Present the generated artifacts (`proposal` · spec delta · `design` where the tier's schema has one (reference.md — not in `spec-lite`/T1) · `tasks`) to the human and **wait for explicit alignment before committing them or invoking `openspec-apply-change`** — never chain propose→apply (workflow §8 step 2; OpenSpec's *generate → align → implement*). Iterate the artifacts until aligned; this alignment **is** the tier's proposal/design approval (§7). Validation-green is not alignment — the green CLI never substitutes for the human's OK.
3. **Apply** — `openspec-apply-change`: **test first (TDD)**, then code. Plan reveals as wrong → **STOP**, route to planning.
4. **Gates** — `AGENTS.md` gate set green locally before the PR. Don't poll CI.

**Phase 4 — Review, PR, state, rate.**
1. Run the pre-PR review; don't open the PR until the human gate clears.
2. Open a PR: Conventional-Commit title; body + issue link from **[pr-template.md](pr-template.md)**. **In the same PR, flip this change's ROADMAP `Status` → 🟢** in `docs/ROADMAP.md` (it lands atomically on merge). This is the *only* ROADMAP row you touch; the `todo→doing` flip was already committed to `main` in Phase 2, and all other cross-change state stays with the orchestrator (§6).
3. **Archive — post-approval, pre-merge.** The run **STOPs** at "PR open, awaiting approval" — do **not** archive first (review still changes specs; approval is the "delta is final" signal). On approval, before invoking `openspec-archive-change`:
   - **Sync with the canonical `main` first.** Update the branch, then re-check the delta against the now-current `openspec/specs/` corpus: a sibling change merged since the delta was written may have promoted behavior that affects it — the same spec-id (**even when the rebase is textually clean**) or a related one. An affected delta is residual drift (below); never archive over a stale canonical view.
   - **Backstop-check the delta.** Since review fixes may have shifted behavior after the delta was written and archive promotes it **verbatim**, verify the spec delta (`openspec/changes/<name>/specs/`) and `tasks.md` still reflect the shipped code. This is a lightweight backstop — a quick residual delta-vs-code sanity check confirming the fix-time reconciliation left nothing behind, **not** the full re-derivation (primary reconciliation already happened at fix time in `workflow-receiving-code-reviews`) nor merely a structural `openspec validate --strict` run (§12, Spec-drift guardrail).
   - **Residual drift found → STOP.** Reconcile it into the delta, then re-present that delta edit to the human for fresh approval before archiving — the approval just given covered the delta *as it stood*, and the archive push must stay a **promotion-only** diff (folding unreviewed delta edits into it would ship spec content under the rubber-stamp re-approval; [reference.md](reference.md)).
   - **Delta clean → archive.** Only with the delta clean — verified drift-free, or re-approved after reconciliation — run `openspec-archive-change` **on the branch** and push (promotes the delta into `openspec/specs/`, moves the change to `archive/`); the **human merges**, never you (§8/§12).

   Re-entry after approval resumes here, not at Phase 1. Branch-protection re-approval + concurrent-spec handling → [reference.md](reference.md).
4. Ask the user to **rate 1–5**; offer to save notable feedback to memory.

## Examples
- `workflow-execute-change PC-01` → matches the `platform-core` change row by id.
- `workflow-execute-change "add plan-catalog price lookup"` → matches by FR scope in `plancatalog/change-map.md`.
