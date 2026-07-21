# Execute Change — PR body template

Used at Phase 4.2. Fill in and open as a PR. **Render the Invariants + Gates sections fresh from `AGENTS.md`** (its `Review-enforced invariants` + `Verification gates` sections) — never a frozen copy, so the reviewer checklist can't drift from the canonical list.

```
## Change
`<change-name>` (<ID>) · capability `<cap>` · tier <T?> · priority <E|I|D>
Closes #<issue>

## What
<1–3 lines: the behavior delivered (from proposal.md)>

## OpenSpec
- Ceremony: proposal · spec delta · [design if T2/T3] · tasks
- Spec delta: openspec/changes/<name>/specs/…
- openspec validate --strict: ✅
- Archive: delta promoted to openspec/specs/<spec-id>/ post-approval, pre-merge (added to this PR after the gate, before the human merges)

## Invariants upheld — check only those this change touches; reviewers verify
<render one checkbox per bullet from AGENTS.md §Review-enforced invariants — do NOT hardcode the list>

## Gates (green locally before PR — §8)
<render the gate set from AGENTS.md §Verification gates>

## Deps verified
<dep changes 🟢 · ADRs Accepted>

## ROADMAP
- `docs/ROADMAP.md`: this change's `Status` → 🟢 (takes effect on merge)
```
