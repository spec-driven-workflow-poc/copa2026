# Workflow Execute Change — reference

Lookup detail for the `workflow-execute-change` skill. Load when a phase needs it.

## Planning pack & where each fact is canonical
- ROADMAP `Changes` table = source of truth for **status** (the worker flips its own row's two glyphs — 🔲→🟡 via a direct-to-`main` commit at kickoff, and → 🟢 in the change PR at Phase 4.2; the orchestrator owns every *cross-change* transition, §6); otherwise it's a **rollup**. **Tier and deps are canonical in the capability `change-map.md`.** ADR readiness = the ROADMAP `Foundational dependencies` table.
- Paths: `docs/capabilities/<cap>/{brief,change-map}.md` · ADRs `docs/adr/NNNN-*.md` · contracts `docs/architecture/overview.md` · glossary `docs/glossary.md`.

## Status glyphs (ROADMAP)
`🟢` = done · `🟡` = doing · `🔲` = todo.

## `todo→doing` commit (Phase 2 → 3 bridge)
The worker's own `todo→doing` (🔲→🟡) flip is a **single commit made directly on `main` — no branch, no PR** — the one direct-to-`main` commit for this change; the code branch `change/<name>` is cut *after* it. (Rule + trade-off: workflow §6.)

**Why direct, not a PR:** `doing` must be visible *before* the change PR exists (that PR is born at Phase 4), so it can't ride in it; a standalone glyph-PR is ceremony that also reintroduces §6 write contention. The **human-approval gate replaces PR review** for this one-cell edit.

Recipe — all four required:
1. **Approve first.** Show the human the exact one-cell diff; get explicit approval **before** `git commit` *and* before `git push`. No approval → **STOP**. (Still required now that the procedure is written — approval is the control standing in for the absent PR review.)
2. **Surgical.** Stage exactly one file (`docs/ROADMAP.md`), change exactly one cell (this change's `Status`, 🔲→🟡). Never `git add .`; leave any other working-tree edits out.
3. **Direct on the *canonical* `main`.** Commit on `main` and push it to the **canonical shared repo the ROADMAP board is read from — never a personal fork**. If you have multiple remotes and aren't sure which is canonical, run `git remote -v` and **confirm with the human before pushing**. Push — and, if rejected, pull/rebase — against that canonical remote *explicitly*. Do **not** `git switch -c` / `checkout -b`, and do **not** open a PR for this flip.
4. **Message** — Conventional Commits, subject only: `docs(roadmap): mark <ID> doing (🔲→🟡)`.

**Red flag — STOP:** about to create a branch or open a PR for the glyph flip? That's the "not `main` / always-PR" habit misfiring — this flip is the *one* direct-to-`main` commit; branch only *after* it, for the code.

**Wrong remote — STOP:** pushing the flip to a personal fork instead of the canonical remote leaves the shared board stale (the flip must land where everyone reads the ROADMAP). Re-push to the canonical remote. This is the fork-workflow trap the bare word "`main`" hides.

**Push rejected?** Protected `main` → **STOP** and escalate (the direct route may be unavailable). Non-fast-forward (a concurrent worker pushed) → pull/rebase the one-cell change *from the canonical remote* and retry; never force.

## Archive — post-approval, pre-merge (Phase 4.3)
`openspec-archive-change` runs **on the branch after the human approves the PR**, and is pushed — promoting the delta into `openspec/specs/<spec-id>/` (and moving the change to `openspec/changes/archive/`); the **human then merges** (the worker never merges). Archive is deliberately **after** approval, not before: approval is the signal the spec delta is final, and review routinely changes specs — archiving earlier would freeze a still-changing/unreviewed spec. It is **not** a post-merge step and **not** batched — it's the last pre-merge act on this one change. (Rule: workflow §8.)
- **Resumable step.** The skill's active run ends at "PR open, awaiting approval"; the archive is a distinct, **approval-triggered** resumption on the same branch. Re-entering `workflow-execute-change` after approval continues at this step (detect: PR open + approved) — it does **not** restart from Phase 1. Same wait-then-resume shape as the in-PR bot reconciliation (§9), not a separate invocation to remember.
- **Approval dismissed by the post-approval push?** Under branch protection ("dismiss stale approvals"), pushing the archive commit can drop the approval. The archive diff is a **mechanical promotion** — it only reflects the already-reviewed delta from `changes/<name>/specs/` into `openspec/specs/` — so re-approval is a rubber-stamp of a promotion-only diff, then merge. **This rubber-stamp framing holds only for a genuinely promotion-only diff**: if the pre-archive backstop (Phase 4.3) reconciled residual drift into the delta, that edit gets its own fresh human approval *before* the archive push — never folded into the promotion commit for a mechanical re-approval.
- **Concurrent same-`spec-id` change:** if another in-flight change promotes into the same `openspec/specs/<spec-id>/spec.md`, expect a merge conflict on that file — pull/rebase and re-run the sync. A **non-trivial spec merge is blocked + escalated** (fail-safe), never force-resolved. Distinct `spec-id`s don't collide **textually** — which is exactly why the Phase 4.3 pre-archive sync is mandatory even without a conflict: a **clean** rebase (non-adjacent edits to the same spec, or a sibling's new/changed spec) surfaces nothing from git, so the delta is re-checked **semantically** against the updated canonical corpus before promoting.

## OpenSpec schemas (`core` profile)
- `spec-driven` — default (T2/T3): proposal + specs + tasks + **design**.
- `spec-lite` — T1: proposal + specs + tasks, **no `design`** (workflow §7).
- The `openspec-propose` / `openspec-apply-change` / `openspec-archive-change` skills own the CLI — invoke those; don't re-implement them. **Schema exception:** `openspec-propose` scaffolds with `openspec new change <name>` and never sets `--schema`, so a **non-default** schema (T1 → `spec-lite`) must be created first — `openspec new change <name> --schema spec-lite` — then `openspec-propose` finds the existing change and **continues** it (generating the artifacts). T2/T3 use the default; no extra step.

## GitHub issue (Phase 1.3)
- Convention: title `[Paymon] <ID> — <name>`, label `cap/<cap>`.
- Find & inspect: `gh issue list --search "<id>"` → `gh issue view <n> --json title,body,labels`.
