---
name: ux-review
description: Validate a NovaLingo UX spec before implementation — completeness, accessibility-tier compliance, pattern consistency, data/empty-state coverage, localization, and testable acceptance criteria. Read-only quality gate; never auto-fixes. Returns APPROVED / NEEDS REVISION / MAJOR REVISION.
argument-hint: '[path to spec | all | patterns]'
user-invocable: true
allowed-tools: Read, Glob, Grep, AskUserQuestion
model: sonnet
---

Validate a UX spec as a quality gate. **Read-only — never edit the spec.** Report findings; the author fixes.

## Phase 1 — Target

- a path → review that file · `all` → every file in `design/ux/` · `patterns` → `interaction-patterns.md`.

## Phase 2 — Load cross-reference context

Read `.claude/docs/technical-preferences.md`, `design/ux/accessibility-requirements.md`,
`design/ux/interaction-patterns.md`, `src/app/Router.tsx`, and any relevant `docs/*.md`.

## Phase 3 — Checklist (UX spec)

- **Sections present & filled:** all 13 template sections; no placeholders.
- **Player need clear;** player context realistic for a young child.
- **States complete:** empty, loading, error, locked/premium-locked, offline.
- **Input coverage:** touch AND mouse/keyboard for every interactive element (no gamepad expected).
- **Data architecture:** source named; read/write correct; null/empty handled; server-authority respected
  for entitlements.
- **Accessibility:** meets every must-have in `accessibility-requirements.md` (touch+keyboard, contrast,
  color-independence, reduced-motion, audio-visual parity, semantics). Flag each miss with its WCAG SC.
- **Pattern consistency:** reuses named patterns; new patterns explicitly flagged for the library.
- **Localization:** Turkish UI; text-length and i18n pattern noted.
- **Acceptance criteria:** ≥5, each testable pass/fail.
- **Docs alignment:** matches relevant `docs/` requirements; conflicts surfaced.

For `patterns`: catalog matches the detailed entries; each pattern has spec + when/when-not + reference.

## Phase 4 — Verdict

Deliver findings classified **Blocking** vs **Advisory**, then one verdict:

- **APPROVED** — ready to implement.
- **NEEDS REVISION** — listed gaps must be fixed; re-review after.
- **MAJOR REVISION NEEDED** — fundamental rework.

If the user wants to proceed despite NEEDS REVISION, present the specific blocking concerns via
`AskUserQuestion` first so it is a conscious decision.

## Output

Structured findings + verdict + next steps. No file edits.
