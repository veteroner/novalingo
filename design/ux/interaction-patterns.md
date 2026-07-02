# Interaction Pattern Library — NovaLingo

> Reusable interaction patterns. **Reuse before reinventing.** When `ui-programmer` creates a genuinely
> new pattern, add it here before marking work done. `/ux-design patterns` maintains this file.
> Seeded from the existing codebase — verify against source when in doubt.

## Pattern Catalog

- **Primary action button** — main forward action on a screen.
- **Locked / premium-locked tile** — gated content that routes to paywall.
- **Modal confirmation** — destructive/consequential choices via the global modal.
- **Reward reveal** — XP / level-up / collectible celebration.
- **Nova companion message** — mascot feedback with mood.
- **Activity feedback (correct/wrong)** — answer judgment in learning activities.
- **Auto-advance with countdown** — hands-free progression for young children.
- **Speak-and-check (with manual fallback)** — pronunciation input.
- **Chat thread with docked input** — scrollable dialogue + fixed bottom input bar.

## Patterns

### Primary action button

- **Category:** action · **Used in:** most screens (`Button` atom)
- **Spec:** `Button variant="primary"`, large size, full width on mobile, ≥44px height. Emoji prefix
  optional for kid legibility. Single primary per view.
- **When not to use:** secondary/tertiary actions → `variant="secondary"` / `"ghost"`.

### Locked / premium-locked tile

- **Category:** navigation/gating · **Used in:** World cards (Home), Lesson cards (World Map), conversation node
- **Spec:** dimmed (`opacity-60`) + 🔒 icon (never opacity alone — color-independence). Tap shows a toast
  ("Premium Dünya") then routes to `/subscription`. Free daily-limit reuse routes the same way.
- **Reference:** `HomeScreen.tsx`, `WorldMapScreen.tsx`, `premiumAccess.ts`.

### Modal confirmation

- **Category:** dialog · **Used in:** streak-freeze spend, sign-out, etc. (`GlobalModalRenderer`)
- **Spec:** open via `openModal('confirmation', { title, message, confirmText, cancelText, onConfirm })`.
  Focus trap; cancel is always available; destructive uses `tone: 'danger'`.

### Reward reveal

- **Category:** feedback/celebration · **Used in:** Lesson Result, level-up, collectible grant
- **Spec:** framer-motion spring entrance; badge/emoji + label + rarity. **Must** have a reduced-motion
  fallback (instant, no spring). Reference: `LessonResultScreen.tsx`, modal renderer.

### Nova companion message

- **Category:** feedback/affect · **Used in:** results, activities, encouragement (`NovaCompanion`)
- **Spec:** `<NovaCompanion mood=... message=... />`. Mood maps to expression; message is short Turkish.
  Pair any spoken line (TTS) with the visible message (audio-visual parity).

### Activity feedback (correct/wrong)

- **Category:** feedback · **Used in:** all 16 learning activities
- **Spec:** correct = green + ✓ + positive SFX + Nova happy; wrong = amber/red + ✗ + retry affordance.
  Color is never the only signal (icon + Nova mood reinforce). Wrong never dead-ends — always a retry.

### Auto-advance with countdown

- **Category:** flow · **Used in:** Lesson Result → next lesson/world
- **Spec:** show "N saniye sonra otomatik devam edecek"; a visible primary button lets the child go now.
  Guard so it never fires on terminal/blocked screens (boss defeat, missing data).
- **Reference:** `LessonResultScreen.tsx`.

### Speak-and-check (with manual fallback)

- **Category:** input · **Used in:** `SpeakItActivity`, `ConversationActivity`
- **Spec:** request mic → listen → evaluate (Web Speech API on web). **If unsupported (native WebView),
  fall back** to a manual "Söyledim ✓" path so the child is never blocked. (Real native STT is a known gap.)
- **Reference:** `SpeakItActivity.tsx`. See CLAUDE.md "Konuşma Tanıma (STT)".

### Chat thread with docked input

- **Category:** layout/input · **Used in:** `ConversationActivity` (Nova ile Konuş)
- **Spec:** three-zone flex column — compact fixed header (≤88px), chat thread as the ONLY
  `flex-1 min-h-0 overflow-y-auto overscroll-contain` region, and a fixed bottom dock
  (`shrink-0`, `safe-area-bottom`) holding text input + mic + hint with a constant-height status
  slot (`aria-live`). Hints/support render as tinted bubbles INSIDE the thread, never as banners
  that grow the dock. Auto-scroll to bottom on new bubble only (no snap while user reads history).
- **When not to use:** screens without an ongoing message stream; single-question activities keep
  their existing layouts.
- **Reference:** `ConversationActivity.tsx`, UX spec `design/ux/conversation-screen-redesign.md`.

## Gaps & Patterns Needed

- Real pronunciation feedback (phoneme-level) pattern — currently only string similarity.
- Skeleton/loading pattern standardization across query-backed screens.

> Reduced motion is now handled globally (`MotionConfig reducedMotion="user"` + a
> `prefers-reduced-motion` CSS block), so individual screens no longer need their own guard.

## Open Questions

- Should locked tiles preview content (peek) before the paywall, or stay fully blocked?
