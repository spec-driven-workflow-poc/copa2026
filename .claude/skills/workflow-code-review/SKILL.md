---
name: workflow-code-review
description: Use when reviewing a code change locally before opening its PR — the Layer A (local, pre-PR) review of this repo's workflow. Also when asked for an impartial, independent, or pre-PR review of a branch or diff. Read-only — never edits code.
---

# Workflow Code Review (Layer A)

## Overview
**Layer A** of the review process (canonical: `docs/workflow/README.md` §9): an **impartial, read-only** review of a local diff **before its PR opens**, run as **parallel subagents in this session**. It produces a findings report — it does not edit, post, or merge.

**Two non-negotiable rules:**
- **Fresh, impartial subagents.** The review lenses MUST run as subagents that never see the implementer's reasoning — that freshness, not a separate outer session, is what removes the bias. The executor that wrote the code may drive this skill; just never review the diff inline in the implementing context — dispatch the lenses as subagents that receive only the diff + the guideline files.
- **Read-only.** Report findings; never edit or fix. Triaging and fixing happen downstream — out of scope here.

## When to use
Before opening a PR. Scope: the branch's diff against its base (`git diff <base>...HEAD` — merge-base semantics, what the PR will show) plus any uncommitted changes in the worktree (`git diff HEAD`, and `git status` for untracked files). Per-tier applicability is in **Tier → what to run**.

## Procedure

### 1. Scope & summarize
Read the scope: `git diff <base>...HEAD --stat` for committed work, plus `git status` and `git diff HEAD` for uncommitted content. Launch one subagent to read the full diff and return a short **summary + the change's intent**; pass that intent to every later agent.

### 2. Review lenses (parallel subagents)
Run the **applicable** lenses in parallel. Each gets the summary/intent + the relevant guideline files (`AGENTS.md`, nearest `CLAUDE.md`) and returns issues as `{description, reason, file:line}` — reviewing **only the changed lines**.

| Lens | Focus | Apply when |
|---|---|---|
| **invariants** | the Review-enforced invariants in `AGENTS.md` (+ nearest `CLAUDE.md`); quote the exact rule broken | any code/config change |
| **bug-hunter** | significant bugs in the changed lines (no nitpicks, no pre-existing) | any non-cosmetic change |
| **security** | injection, authz, secret/PAN exposure, tenant bypass introduced by the change | any code change |
| **contracts** | type design & invariants, API shape, data modeling | types / API / schema / migrations changed |
| **tests** | coverage + quality of tests for the change | code or test files changed |
| **concurrency** | idempotency/lock correctness, races under at-least-once redelivery | money/event paths · **mandatory at T3** |
| **history** | git blame/history; prior PRs touching these files | high complexity · **T3** |

### 3. Score & filter
A **separate scoring subagent** (one per candidate finding — not the lens that raised it, to avoid self-confirmation) returns two 0–100 scores for each:
- **Confidence** — is it real (not a false positive)? `0` false positive · `25` maybe · `50` verified but minor · `75` verified & important · `100` certain.
- **Impact** — consequence if unfixed: `0–20` cosmetic · `21–40` maintainability · `41–60` edge-case errors/perf · `61–80` breaks features / corrupts data · `81–100` crash / data loss / security / money loss.

Keep an issue only if its **confidence meets the threshold for its impact** (higher impact tolerates less confidence — a possible money/security bug must not be dropped for moderate confidence):

| Impact | Min confidence |
|---|---|
| 81–100 (Critical) | 50 |
| 61–80 (High) | 65 |
| 41–60 (Medium) | 75 |
| 21–40 (Medium-Low) | 85 |
| 0–20 (Low) | 95 |

Anything you cannot conclusively clear is **flagged, never silently dropped** (money-domain fail-safe).

### 4. Report (read-only)
Emit surviving issues grouped by severity (Critical → Low). One entry each:
```
#### 🔴/🟠/🟡/🔵/🟢 [severity] — [brief description]
- File `path/to/file` · Lines L42-L58 · Confidence NN · Impact NN
- Evidence: the code pattern/behavior observed + the consequence if unfixed (cite file:line)
- (Optional) a committable suggestion — only if applying it fully fixes the issue
```
If nothing survives: report `No issues found (checked: invariants · bugs · security · …)`.

This is a **local, pre-PR** review — it never opens or comments on a PR; its findings (severity · `file:line` · why · confidence · impact) are handed to the downstream reconcile step.

## Do NOT flag (false positives)
Pre-existing issues · code that looks buggy but is correct · pedantic nitpicks a senior wouldn't raise · anything a linter / typechecker / compiler catches (assume CI runs them) · general quality (coverage, docs) unless an invariant or `CLAUDE.md` rule requires it · issues silenced via a lint-ignore comment · anything outside the changed lines.

## Tier → what to run
Determine the change's **tier** first (effort × risk — `docs/workflow/README.md` §7 + the risk triggers in `AGENTS.md`):
- **T1** (XS/S, low risk) — review **optional**; stop after the report.
- **T2** (M, or risky S) — review **mandatory** (lenses above); stop after the report.
- **T3** (L/XL, or high-risk core) — review with the **concurrency + history** lenses added and lower noise tolerance. **Also launch the `workflow-adversarial-review` skill, in parallel, in this same session** — an independent adversarial red-team that attacks the change directly (cross-model when a 2nd model is available; it reviews the change, *not* this skill's output). The two reviews run independently, each returning its own findings; both are reconciled downstream.

## Common mistakes
- **Reviewing the diff inline in the implementing context** → biased; dispatch fresh subagents that get only the diff + guidelines.
- **Fixing inline** → this is read-only; output findings, don't edit.
- **Restating the invariants here** → read them from `AGENTS.md` (single source — no drift).
- **Noise** → enforce the confidence×impact thresholds; false positives erode trust.
