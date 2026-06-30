---
name: novalingo-ui
description: Orchestrate a NovaLingo UI feature through the full pipeline — UX spec → visual design → implementation → accessibility/i18n review → polish — with user approval at each phase. Adapts the team-ui game-studio pipeline to React 19 + Capacitor (no engine, no gamepad). Calls /ux-design and /ux-review.
argument-hint: '[UI feature description] [--review full|lean|solo]'
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, Task, AskUserQuestion
model: sonnet
---

Orchestrate the UI pipeline for NovaLingo (React 19 + Vite + TypeScript + Tailwind + Capacitor).
At every phase transition, write the analysis in conversation, then use `AskUserQuestion` to capture
the decision. The user approves before each phase. Read `.claude/docs/technical-preferences.md` first.

> This is the team-ui pipeline adapted for a web/mobile app: **no game engine** (skip engine-UI steps),
> **no gamepad** (touch + mouse/keyboard), no GDD — use `docs/*.md`, `src/features/*`, and `Router.tsx`.

## Phase 0 — Review mode

Resolve mode from `--review`, else `production/review-mode.txt`, else default **lean**.

- `full` — run all review agents. `lean` — run the core gate (ux-review + accessibility) only.
- `solo` — no sub-agent spawning; you run every phase inline yourself.
  State the resolved mode and respect it throughout. (Spawning sub-agents is billable — honor `solo`.)

## Team (sub-agents, spawned via Task)

- `ux-designer` — flows, wireframes, IA, accessibility-first design
- `ui-programmer` — React/Tailwind implementation, state wiring, quality gates
- `art-director` — visual treatment, brand consistency, asset manifest
- `accessibility-specialist` — WCAG 2.1 AA (kids-adapted) audit
  Provide full context in every Task prompt. Run independent agents (Phase 4) in parallel. In `solo`
  mode, do their work inline instead of spawning.

## Pipeline

### Phase 1a — Context

Read: relevant `docs/*.md`, `design/ux/interaction-patterns.md`, `design/ux/accessibility-requirements.md`,
the target `src/features/<area>`, and `src/app/Router.tsx`. If the pattern library is missing, offer to
run `/ux-design patterns` first. Summarize a brief.

### Phase 1b — UX spec

Invoke `/ux-design [feature]` (or delegate to `ux-designer`) → `design/ux/[feature].md` from the template.

### Phase 1c — UX review (GATE)

Invoke `/ux-review design/ux/[feature].md`. **Do not proceed until APPROVED.** If NEEDS REVISION, the
author fixes and re-runs; the user may consciously accept the risk via `AskUserQuestion`.

### Phase 2 — Visual design

Delegate to `art-director`: visual treatment from brand tokens + asset manifest; verify contrast and
color-independence; consistency with existing screens. (Skip director gate in lean/solo per Phase 0.)

### Phase 3 — Implementation

Delegate to `ui-programmer`: build per the UX + visual specs; reuse patterns; both input methods;
i18n per the file's existing pattern; accessibility per the committed tier; components never mutate
state directly. New patterns get added to `interaction-patterns.md`. **Must leave all quality gates green.**

### Phase 4 — Review (parallel)

- `ux-designer`: implementation matches flows/wireframes; keyboard-only nav works.
- `art-director`: visual consistency; small-phone ↔ tablet; safe areas.
- `accessibility-specialist`: audit vs. committed tier; blockers are release-blocking.
  All streams report before Phase 5. (In lean: ux-review gate + accessibility. In solo: do inline.)

### Phase 5 — Polish

Address feedback; confirm animations skippable + `prefers-reduced-motion`; UI sounds via the audio
event system (no direct calls); test small/large screens + safe areas; confirm `interaction-patterns.md`
is updated. Then run the gates one final time:

```bash
pnpm type-check && pnpm lint && pnpm test && pnpm validate:conversation-registry
```

## Error recovery

If a spawned agent is BLOCKED: surface "[Agent]: BLOCKED — [reason]" immediately, check whether
dependent phases need its output, offer (skip & note gap / retry narrower / stop & resolve) via
`AskUserQuestion`, and always produce a partial report. Never discard completed work.

## Quick reference

- `/ux-design` — author a spec from scratch
- `/ux-review` — validate a spec before build
- `/novalingo-ui [feature]` — this full pipeline
- `/code-review` — run on the implementation before closing

## Output

Summary report: UX spec status, review verdict, visual status, implementation status, accessibility
result, input coverage, pattern-library update status, quality-gate results, outstanding issues.
Verdict: **COMPLETE** (delivered through the full pipeline) or **BLOCKED** (with the halting phase).
