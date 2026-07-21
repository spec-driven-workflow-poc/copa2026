---
name: workflow-receiving-code-reviews
description: Use after a change has been reviewed — when reconciling and acting on the workflow's review findings (the local pre-PR review, the T3 adversarial red-team, and/or the in-PR bot(s)' comments) before the human gate. Runs locally in the worktree.
---

# Workflow: Receiving Code Reviews

## Overview
The **reconcile + auto-fix** role of the review process (canonical: `docs/workflow/README.md` §9), played by the **local executor** in the worktree. Once a review batch lands, it gathers that batch's findings, **evaluates each on technical merit**, applies the confirmed fixes, re-runs the gates, and surfaces the unresolved — then presents the resolutions for human approval and, once approved, pushes the fixes and answers the reviews on the PR.

**Findings are suggestions to evaluate, not orders to follow.** Verify before implementing; neither blindly apply nor blindly dismiss. The reviewers here are mostly automated (your own review subagents, the red-team, the in-PR bot(s)) — treat them like an external reviewer: useful, fallible, and to be checked against the actual code.

**No performative agreement.** Never "you're absolutely right", "great catch", or thanks — state the fix, or the reasoned pushback. The code shows you heard it.

**Money-domain fail-safe (this repo):** this role carries implementation context (it fixes), so its triage is **not** impartial — the guard is the fail-safe: anything **not conclusively resolved is blocked and escalated to the human**, never waved through as a false positive.

## When to use
Invoked **per review batch** — typically at two moments, each reconciling only the findings in front of it:
- **Pre-PR (local):** the findings returned by the local reviews — `workflow-code-review` (Layer A, T2+) and, at T3, `workflow-adversarial-review`. Resolve/escalate these **before the PR opens**.
- **In-PR:** the in-PR bot(s)' comments (read via `gh`/GitHub), after the PR is open.

There is **no combined bot↔local pass** — local findings are already resolved by the time the PR opens, so the in-PR run only handles the bot(s)' comments. Any tier; in-PR-bot-only (e.g. a T1 change) is valid.

## Steps

### 1. Gather
Collect the findings for **this** invocation. Pre-PR: the findings **returned** by the local reviews — `workflow-code-review` and, at T3, `workflow-adversarial-review` (launched in parallel in the executor session, per `workflow-code-review`'s tier rule) — each an **independent** report arriving as the **subagent return value, not a file**; if a required review hasn't run yet, run it now — **never re-run one that already returned findings**. In-PR: the bot(s)' comments — **inline** line-anchored review comments come from `gh api repos/{owner}/{repo}/pulls/{n}/comments` (⚠️ `gh pr view --comments` shows only top-level PR comments, **not** inline ones); pair it with `gh pr view --comments` and `gh api .../pulls/{n}/reviews` for the top-level review bodies.

### 2. Dedup
Merge findings pointing at the same `file:line` / issue across sources. Sources score in different shapes (the local review carries confidence×impact, the red-team severity+confidence) — **don't compare the numbers across sources**; decide each on technical merit in step 3.

### 3. Evaluate each — verify, don't react
For each finding, decide on technical merit **against the actual code**, not on the reviewer's confidence:
- Does it actually break something? Is there a reason for the current implementation? Did the reviewer have full context? Is it correct for this stack / these ADRs?
- **Push back** — mark **false positive with evidence** — when the finding is wrong; don't apply it just because it was flagged. If it conflicts with an Accepted ADR or an architectural decision, stop and raise that, don't silently "fix" it.

| Verdict | Action |
|---|---|
| Conclusively real | fix it (step 4) |
| Conclusively false positive (with evidence) | drop, noting why |
| **Not conclusively resolved** | **block + escalate to human** — never dismiss |

### 4. Apply fixes — ordered, one at a time
**Justify before editing — even the conclusive ones.** Before applying each fix, state in the conversation: the finding, why the verdict is what it is (the evidence from step 3), and what the edit will change. The human must be able to accept or reject the edit from that explanation alone — a fix applied without a stated reason is invisible at the gate. When your fix **diverges from the reviewer's suggested one** (same finding, different remedy), say so explicitly and justify the direction — that choice is a design decision the human may want to override.

Fix in order: **blocking** (security · money · data integrity · breaks) → **simple** (typos, imports) → **complex** (logic, refactor). Keep each edit scoped to its finding; don't batch unrelated fixes.

**Spec-relevant fixes carry their delta.** If a confirmed fix changes behavior that the change's OpenSpec spec delta (`openspec/changes/<name>/specs/`) describes or should describe:
- **Update the delta with the fix.** Updating that delta — and `tasks.md` if the fix invalidates a task — is **part of the same scoped fix**: it gets its own step-4 justification and lands with that fix, so the human approves an already-reconciled delta at the §8 gate (which reviews code + the still-mutable delta). Archive later promotes the delta verbatim, so a stale one ships wrong as-built behavior *(canonical objective: `docs/workflow/README.md` §12, Spec-drift guardrail)*.
- **Conditioned, not blanket.** Most fixes (typos, imports, non-behavioral refactors) touch no delta — this applies only on spec-relevant behavior change.
- **Only this change's own open delta.** A fix whose correctness would instead require editing a **consolidated** spec (`openspec/specs/…`, already promoted from a prior change) is beyond this change's scope → **STOP and escalate as drift** — never hand-edit canonical (that behavior belongs to a *different*, already-archived change; the proper route is a new OpenSpec change whose delta carries a `## MODIFIED Requirements` section — the human's call).

### 5. Re-run the gates
Re-run the verification gates (`AGENTS.md`) — they must be **green** before the change advances. A fix can break another gate; never skip this.

### 6. Request the human gate — on the resolutions
Present the batch's outcome for human approval **before anything leaves the worktree**: fixes applied (each with its stated justification) · false positives (with evidence) · the **escalated/unresolved set**, explicitly. What the human approves here is **the resolutions of this batch** — for a **pre-PR** batch that unblocks opening the PR; for an **in-PR** batch it unblocks pushing the fix commits and replying to the comments (step 7). *(The PR approve/merge is the process's gate — §8 —, not this skill's; this role never self-approves anything.)*

### 7. Push + reply on GitHub — after the resolutions are approved
Once the human approves the resolutions: push the fix commits to the PR branch and answer each in-PR review comment — reply to a thread with `gh api repos/{owner}/{repo}/pulls/{n}/comments/{comment_id}/replies -X POST -f body='…'` (`gh` has no native reply command; posting to the base `.../pulls/{n}/comments` endpoint with an `in_reply_to` field works too) — what was fixed (with the commit), or the reasoned pushback with its evidence. **Never before the approval** — a reply asserts a resolution, and only the human confirms one. In-PR batches only (local pre-PR findings have no PR comment to answer). Same no-performative-agreement rule; sign each reply with the Claude authorship footer.

## Common mistakes
- **Performative agreement** ("you're absolutely right", thanks) → just state the fix, or the reasoned pushback.
- **Blindly applying a finding** → verify against the code first; any reviewer (human or model) can be wrong.
- **Applying a fix without stating the justification first** → even conclusive fixes get a one-line why before the edit; silent fixes can't be judged at the gate.
- **Dismissing a finding as a false positive without conclusive evidence** → violates the fail-safe; escalate instead.
- **Batching fixes without re-checking** → one finding at a time, keep edits scoped.
- **Fixing, then advancing without re-running the gates** → a fix can break another gate.
- **Self-approving the resolutions** → the human approves them (step 6) — and, downstream, the merge (§8).
- **Pushing fixes or replying on the PR before the resolutions are approved** → the reply asserts a resolution the human hasn't confirmed; step 7 only after step 6.
