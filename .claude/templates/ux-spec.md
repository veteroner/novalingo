# UX Spec — [Feature / Screen Name]

> Authored by ux-designer via `/ux-design`. Reviewed via `/ux-review` (must be APPROVED before build).
> Stack: React 19 + Capacitor (see `.claude/docs/technical-preferences.md`). Mobile-first, touch + mouse/keyboard.

## 1. Purpose & Player Need

What does this screen let the child (or parent) do, and why? One paragraph.

## 2. Player Context on Arrival

Emotional state, what they just did, whether they arrived voluntarily, reading-ability assumptions.

## 3. Navigation Position

Where it sits in `src/app/Router.tsx`. Entry points (from where) and exit points (to where) as a table.

| From | Trigger | To  |
| ---- | ------- | --- |
|      |         |     |

## 4. Layout Specification

Information hierarchy → zones → components → ASCII wireframe (mobile portrait). Reference shared
components in `src/components/*` to reuse.

```
[ ASCII wireframe here ]
```

## 5. States & Variants

Empty, loading, error, locked/premium-locked, offline. Plus web vs. native differences if any.

## 6. Interaction Map

For each interactive element: Action → input (touch + keyboard) → feedback (visual/audio/haptic) → outcome.

| Element | Action | Input | Feedback | Outcome |
| ------- | ------ | ----- | -------- | ------- |

## 7. Events Fired

Analytics + state changes per action (which `analyticsService` events, which store action / mutation).

## 8. Transitions & Animations

Screen entry/exit and state-change motion (framer-motion). Note reduced-motion fallback for each.

## 9. Data Requirements

Source (Firestore collection / store / query hook), read vs. write, real-time needs, null/empty handling.

## 10. Accessibility

Touch + keyboard operability, focus order, contrast, color-independence, motion alternative, audio-visual
parity, screen-reader names (Turkish). Reference `design/ux/accessibility-requirements.md` tier.

## 11. Localization

UI language Turkish. Text-length constraints, plural/format concerns, which i18n pattern this screen uses.

## 12. Acceptance Criteria (5+ testable pass/fail)

- [ ]
- [ ]
- [ ]
- [ ]
- [ ]

## 13. Open Questions

Unresolved dependencies, content gaps, decisions deferred.
