---
name: workflow-adversarial-review
description: Use when pressure-testing a high-risk (T3) change before merge — when asked to "challenge this", "stress-test", "red-team", or "find reasons this shouldn't ship", or when a money path, concurrency/idempotency, tenant isolation, secrets, or the canonical state machine is touched. Read-only — produces findings.
---

# Workflow Adversarial Review (T3 red-team)

## Overview
The **T3 escalation** of the review process (canonical: `docs/workflow/README.md` §9). An **adversarial red-team**: instead of reviewing for correctness, a skeptic **attacks the change** — trying to construct the failure.

Two separable parts:
- **The method (mandatory at T3)** — the skeptical stance, attack surface, output contract, and grounding below. It runs on **any model**, including the executor's own, in fresh independent subagents.
- **Cross-model (recommended, optional)** — routing a skeptic to a model of **comparable capability from a different provider** adds uncorrelated blind spots. The value is *provider diversity*, not a cheaper pass — **never downgrade to a weaker tier** for this review. Do it when such a model is available; never block T3 on every dev having two.

It reviews the **change itself, independently** — it does **not** consume Layer A's findings. **Local, pre-PR**: read-only, it never posts to the PR; it produces findings (severity · `file:line` · why · confidence) handed to the downstream reconcile step.

## When to use
**T3 only** (L/XL, or high blast-radius per §7 / the risk triggers in `AGENTS.md`). Overkill at T1/T2.

## How to run
Launch the red-team as **independent skeptic subagent(s)** in fresh contexts (no implementation bias), driven by the prompt below. Give them the change scope and constraints, **not your conclusions** (anchoring weakens the attack).

**Pick the skeptic's model by capability first, then provider diversity** — in this order:
1. **Comparable capability, different provider** (e.g. Codex/GPT, Gemini) — best: full capability *and* uncorrelated blind spots. Run it read-only (Codex CLI / `codex` MCP: `cwd` = repo root, `sandbox: read-only`, `approval-policy: never`).
2. **The same top-tier model** the dev uses (e.g. the executor's own Opus) — acceptable fallback: full capability, but correlated blind spots.
3. ❌ **Never a weaker tier** (e.g. a smaller model when the dev runs the top one) — loses capability *and* stays correlated.

## The red-team prompt
**Operating stance** — default to skepticism. Assume the change can fail in subtle, high-cost, or user-visible ways until evidence says otherwise. Give **no credit** for good intent, partial fixes, or likely follow-up work.

**Attack surface** — prioritize expensive, dangerous, or hard-to-detect failures; attack each **Review-enforced invariant in `AGENTS.md`**:
- **tenant isolation** — a path/query that runs without `client_id` scoping
- **money correctness** — rounding/float/currency-mismatch that loses or misattributes value
- **idempotency & locks** — a retry, at-least-once redelivery, or interleaving that double-charges or duplicates
- **state machine** — an accepted transition that ADR-0008 forbids
- **secrets / PAN** — a credential or PAN that could be logged or persisted
- **data loss / corruption / irreversible state**; rollback & migration hazards
- **empty-state, null, timeout, degraded-dependency** behavior; ordering / stale-state assumptions

**Output contract** — per finding: severity (critical/high/medium/low) · `file:line` · what can go wrong · why this path is vulnerable · likely impact · a concrete fix · confidence (0–100). Summary = a terse **ship / no-ship** verdict, not a neutral recap. Report only material findings — no style feedback.

**Grounding** — every finding must be defensible from the repo. Do not invent code paths, attack chains, or runtime behavior. Mark inferences explicitly and keep confidence honest. Prefer one strong finding over several weak ones.

## After the red-team
Critically evaluate each finding — the skeptic can be wrong; not all warrant action. Pass the material, defensible findings on (read-only — do not fix here). If nothing material was found, say so plainly rather than padding.

## Common mistakes
- **Skipping the red-team when no 2nd model is available** → run it same-model; the adversarial *method* is the mandatory part, cross-model is the bonus.
- **Downgrading to a weaker/cheaper model for the adversary** → worst of both: correlated blind spots *and* less capability. Use a comparable tier — ideally a different provider, else the same top model.
- **Sharing your conclusions in the prompt** → anchors the skeptic; give scope + constraints, let it form its own view.
- **Accepting findings uncritically** → the skeptic can be wrong; verify each against the code before acting.
- **Letting it invent attack chains** → enforce the grounding rules: defensible-from-repo only.
