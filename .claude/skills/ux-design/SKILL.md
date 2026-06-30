---
name: ux-design
description: Author a NovaLingo UX spec for a screen, flow, or the interaction-pattern library — guided, section-by-section, with explicit approval before each write. React + Capacitor, mobile-first, accessibility-first. Calls no other skills.
argument-hint: '[screen/flow name | patterns]'
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion
model: sonnet
---

Author a UX spec collaboratively. **Never auto-generate a full spec and present it as done** — work
section by section, each via: Context → Questions → Options → Decision → Draft → Approval → Write.

## Phase 1 — Mode & arguments

- `patterns` → maintain `design/ux/interaction-patterns.md`.
- otherwise → a screen/flow spec at `design/ux/[kebab-name].md`.

## Phase 2 — Gather context (read before asking)

Read, and summarize what you found:

- `.claude/docs/technical-preferences.md` (stack, platform, input, accessibility tier)
- `design/ux/interaction-patterns.md` (reuse, don't reinvent)
- `design/ux/accessibility-requirements.md` (committed tier)
- The relevant area under `src/features/<area>/{screens,components}` and shared `src/components/*`
- `src/app/Router.tsx` for navigation position
- Any related `docs/*.md` (e.g. FEATURE*SPEC, GAMIFICATION, NOVA_ILE_KONUS*\*) that touches this feature

If `design/ux/interaction-patterns.md` is missing, surface it and offer: (a) run `/ux-design patterns`
first, or (b) proceed and document every pattern as new. Do not invent patterns from the name alone.

Present a short brief: what the child is doing, what they need, constraints, relevant existing patterns.

## Phase 3 — Skeleton

Create the output file from `.claude/templates/ux-spec.md` with empty section headers, then fill incrementally.

## Phase 4 — Section-by-section authoring

For each section of the template: give context, ask focused questions (`AskUserQuestion` for decisions),
present 2–4 options with rationale + a recommendation, draft, get approval, then write that section.
Defer aesthetics to art-director and implementation to ui-programmer. Surface conflicts (e.g. GDD/docs vs.
space, or accessibility vs. layout) rather than guessing.

## Phase 5 — Cross-reference check

Before handoff verify: every relevant `docs/` requirement is represented; all interaction patterns are
named (new ones flagged for the library); entry/exit align with `Router.tsx` and related specs; the
committed accessibility tier is addressed; every data-dependent element has an empty/loading/error state.

## Phase 6 — Handoff

Recommend `/ux-review design/ux/[name].md` before any implementation. Offer: review now, design another
screen, update the pattern library, or stop.

## Output

A complete `design/ux/[name].md` with 5+ testable acceptance criteria, written only with approval.
