# Accessibility Requirements — NovaLingo

**Committed tier: WCAG 2.1 Level AA, adapted for a children's app.**

NovaLingo's users are Turkish-speaking children (~5–11) on touch devices, plus parents in the
parent/subscription area. Read alongside `.claude/docs/technical-preferences.md`.

## Must-haves (release-blocking)

1. **Touch + keyboard operable.** Every interactive element is reachable and activatable by touch
   (≥44×44px target) and by keyboard. Logical, visible focus order. (SC 2.1.1, 2.4.3, 2.4.7)
2. **Contrast.** ≥4.5:1 for normal text, ≥3:1 for large text and meaningful UI/graphics. (SC 1.4.3, 1.4.11)
3. **Never color alone.** Correct/wrong/locked/active states are also shown by icon, shape, or text. (SC 1.4.1)
4. **Audio–visual parity.** Every audio cue (TTS prompt, SFX, Nova speech) has a visible equivalent so
   a deaf child can complete every activity. Speaking activities offer a non-speaking fallback path.
5. **Reduced motion.** All animation is skippable and respects `prefers-reduced-motion`; no content
   flashes >3×/sec. (SC 2.3.1, 2.3.3)
6. **Semantics.** Use real `<button>`/`<a>` or correct `role` + accessible name (in Turkish).
   Decorative emoji are hidden from assistive tech; meaningful emoji have a text alternative. (SC 1.1.1, 4.1.2)

## Should-haves (target, not yet implemented — tracked as roadmap)

- Dyslexia-friendly font option.
- Adjustable TTS playback speed exposed in UI (engine already supports rates).
- Color-blind-safe palette review for the world/lesson status colors.
- Respect OS dynamic type / larger text settings end-to-end.

## Known gaps (audit findings to close)

- Most screens hardcode Turkish strings (3/42 use `useTranslation`) — limits future locale/AT support.
- Speaking activity (`SpeakItActivity`) falls back to a manual "Söyledim ✓" on native (no real check).

## Closed

- ✅ **Reduced motion (SC 2.3.3)** — global support added: `<MotionConfig reducedMotion="user">` in
  `AppProviders.tsx` covers all 57 framer-motion files; a `@media (prefers-reduced-motion: reduce)`
  block in `src/styles/globals.css` covers CSS animations/transitions.

> Update this file when the committed tier or the gap list changes. `/ux-review` validates specs
> against this document.
