# UX Spec — Nova ile Konuş (Conversation Screen Redesign)

> Authored by ux-designer via `/ux-design`. Reviewed via `/ux-review` (must be APPROVED before build).
> Stack: React 19 + Capacitor (see `.claude/docs/technical-preferences.md`). Mobile-first, touch + mouse/keyboard.

## 1. Purpose & Player Need

The screen lets the child hold a spoken (or typed) English conversation with Nova, the mascot,
inside a themed scenario. The child hears Nova speak, replies by voice or text, and earns a scored
result. The redesign replaces the current hero-avatar layout — which overflows small phones and
blocks scrolling entirely — with a chat-first layout: a compact Nova header, a full-height scrollable
message thread, and a bottom-docked input bar that is always visible and reachable.

## 2. Player Context on Arrival

The child arrives voluntarily (home shortcut, world map node, or topics screen) or mid-lesson via the
lesson pipeline. They are curious/playful, possibly mid-streak. Reading ability is low: Turkish
subtitles, icons, and audio carry the meaning; English text is short. The child may be holding the
phone one-handed; the mic button must sit in easy thumb reach at the bottom.

## 3. Navigation Position

Standalone route `/conversation` (lazy, `ProtectedRoute`) in `src/app/Router.tsx`, hosted by
`ConversationScreen`. The same `ConversationActivity` component is also rendered inside the lesson
pipeline (`LessonScreen`). The activity must fill whatever flex column its host provides.

| From                             | Trigger                    | To                     |
| -------------------------------- | -------------------------- | ---------------------- |
| Home / World map / Topics screen | "Nova ile Konuş" tap       | `/conversation`        |
| `/conversation` (tap-to-start)   | "Başla" tap (audio unlock) | active conversation    |
| Active conversation              | scenario completes         | `/conversation/result` |
| Active conversation              | ✕ close (host header)      | `/home`                |
| Lesson pipeline                  | conversation activity turn | next lesson activity   |

## 4. Layout Specification

Information hierarchy: (1) what Nova just said, (2) how I reply (mic/text), (3) conversation
history, (4) progress/meta. Three zones in a flex column filling the host:

- **Zone A — Compact header (`shrink-0`)**: 64px Nova avatar with mood ring (keeps existing
  mood animations, scaled down), scenario title (TR) + progress dots, speech-rate pill (0.6x/0.8x/1x),
  translation toggle 🇹🇷. Fixed height ≤ 88px, never grows.
- **Zone B — Chat thread (`flex-1 min-h-0 overflow-y-auto overscroll-contain`)**: the ONLY flexible
  region. Nova bubbles left (small avatar), child bubbles right (child's avatar emoji). Each Nova
  bubble: EN text, TR line (visible when translation toggle on), 🔊 replay. The newest Nova bubble is
  highlighted while TTS speaks (speaking indicator inside the bubble — replaces the old subtitle
  card). Nova "thinking" renders as a typing-indicator bubble. **Hints and support messages render as
  tinted chat bubbles** (amber = hint, rose = support/error) instead of stacked banners, so the dock
  height never changes. Auto-scroll to bottom on new bubble; if the user has scrolled up, do not
  snap down until the next bubble arrives.
- **Zone C — Input dock (`shrink-0`, `safe-area-bottom`)**: single row — free-text input (flex-1,
  44px min height), mic button 56px, hint 💡 button 44px. Send ➤ button appears inside the row when
  text is non-empty. Listening state lives in the dock: mic pulses red + one-line caption
  ("Dinliyorum…") above the row (fixed 20px slot, reserved so height stays constant). Fixed height
  ≤ 124px including caption slot.

Scroll contract (fixes the bug): A + C are fixed and together ≤ 212px + safe areas on any phone;
B takes the remainder and scrolls. Nothing else is `shrink-0`-stacked, so no combination of
hints/support/keyboard can push content past the viewport.

Visual tone: scenario-themed vibrant gradient background derived from the scenario theme
(e.g. nature → emerald/sky, food → orange/amber; fallback indigo/violet). Bubbles and the dock sit
on white/near-white cards so text contrast never depends on the gradient. Chunky rounded corners
(`rounded-3xl`), celebrate = confetti burst over the thread + Nova ring flash.

```
375 × 812, portrait
┌─────────────────────────────────┐
│ (host header: ✕  title  spacer) │
│┌───────────────────────────────┐│
││ (🦉64) Piknik Günü  ●●○○  0.8x ││  A ≤88px
│└───────────────────────────────┘│
│  ~~~~ themed gradient bg ~~~~   │
│ ┌────────────────────────┐      │
│ │🦉 What's your favorite │      │  B flex-1
│ │   fruit?  ▂▃▅ (speaking)│     │  scrolls
│ │   En sevdiğin meyve ne? │     │
│ │   🔊                    │     │
│ └────────────────────────┘      │
│      ┌───────────────────────┐  │
│      │ I like apples!    🧒 │  │
│      └───────────────────────┘  │
│ ┌────────────────────────┐      │
│ │💡 Şunu dene: "I like…" │      │  hint-as-bubble
│ └────────────────────────┘      │
│  (Dinliyorum… caption slot)     │
│┌───────────────────────────────┐│
││ [ Yaz veya konuş… ] (➤) 🎤 💡 ││  C ≤124px
│└───────────────────────────────┘│
│         (safe-area-bottom)      │
└─────────────────────────────────┘
```

Keyboard open: the dock sticks above the keyboard (WKWebView resizes the viewport; `h-dvh` host +
flex column means B shrinks, C stays visible). Chat remains scrollable while typing.

## 5. States & Variants

- **Tap-to-start overlay** (standalone host only): unchanged behavior, restyled to the vibrant tone.
- **Loading**: Nova typing-indicator bubble in an otherwise empty thread.
- **Intro card**: scenario summary as a centered card over the thread for 2.5s (existing timing).
- **Listening**: mic pulses, caption in dock, Nova header ring amber.
- **Thinking (LLM eval)**: typing-indicator bubble + header ring purple.
- **Wrong/no-speech**: rose support bubble + Nova sad ring; mic auto-restarts (existing logic).
- **No STT (native WebView)**: mic button hidden; text input takes full row — text-first is the
  documented fallback (see interaction-patterns "Speak-and-check").
- **Offline / LLM unavailable**: local matcher continues to work; support bubble explains retry.
- **Empty thread**: never user-visible (start node always adds a bubble; loading covers the gap).

## 6. Interaction Map

| Element            | Action             | Input                     | Feedback                                                      | Outcome                          |
| ------------------ | ------------------ | ------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Mic button         | start/stop listen  | tap / Enter+Space         | pulse + caption + aria-live "Dinliyorum"                      | STT session start/abort          |
| Text input         | type reply         | keyboard                  | send ➤ appears                                                | `handleFreeInput(text)`          |
| Send ➤             | submit typed reply | tap / Enter               | child bubble appears                                          | match → advance / support bubble |
| 💡 hint            | reveal hint        | tap / keyboard            | amber hint bubble + translation on                            | hint counted in scoring          |
| 🔊 on Nova bubble  | replay line        | tap / keyboard            | speaking indicator on that bubble                             | TTS replay at current rate       |
| 0.8x pill (header) | cycle speech rate  | tap / keyboard            | pill label updates                                            | next TTS uses new rate           |
| 🇹🇷 toggle (header) | show/hide TR lines | tap / keyboard            | TR lines animate in/out on all bubbles                        | preference kept for session      |
| Thread             | scroll history     | touch drag / wheel/arrows | natural scroll, no snap while reading                         | —                                |
| Correct answer     | —                  | —                         | green ✓ bubble edge + confetti + haptic + Nova celebrate ring | advance to next node             |
| Wrong answer       | —                  | —                         | rose bubble + ✗ + Nova sad + retry stays available            | mic restarts, never dead-ends    |

## 7. Events Fired

Unchanged from current implementation: `trackConversationStarted`, `trackConversationTurnCompleted`,
`trackConversationHintShown`, `trackConversationCompleted` (analyticsService); store writes via
`conversationStore` (`startSession`/`completeSession`) in the standalone host. No new events.

## 8. Transitions & Animations

- Bubble entry: spring rise (existing). Typing indicator: 3-dot bounce.
- Speaking indicator: bars animate inside the newest Nova bubble while TTS active.
- Celebrate: confetti particles over Zone B + header ring flash (≤1.2s).
- Header mood ring: color/pulse per mood (speaking indigo, listening amber, thinking purple, sad rose).
- Reduced motion: handled globally by `MotionConfig reducedMotion="user"`; no per-element guards needed.

## 9. Data Requirements

- `ConversationActivityData` (props, from registry scenario) — read-only; no schema change.
- `useChildStore.activeChild` for avatar emoji; `conversationStore` for session lifecycle (host).
- TTS/STT via `speechService` (Web Speech API; STT absent in native WebView → text fallback).
- Open-ended eval via `openEndedConversationService` (Gemini backend, existing).
- No new Firestore reads/writes.

## 10. Accessibility

Tier: WCAG 2.1 AA (kids-adapted, `design/ux/accessibility-requirements.md`).

- Touch targets ≥44px (mic 56px, hint 44px, replay hit-area padded to 44px).
- Mic state announced via `aria-live="polite"` region ("Dinliyorum", "Anlamadım, tekrar dene").
- Correct/wrong never color-only: ✓/✗ icons + Nova mood + haptic accompany color.
- Text sits on white/near-white bubble cards, never raw gradient — contrast ≥4.5:1 for body text.
- Audio-visual parity: every TTS line exists as visible bubble text; every support/hint spoken line
  has its bubble.
- Keyboard: input → send → mic → hint → header controls in DOM order; thread scrollable via keys.
- Screen-reader names in Turkish ("Mikrofon", "İpucu", "Tekrar dinle", "Çeviriyi göster/gizle").

## 11. Localization

Uses `useTranslation('lesson')`, keys under `activities.*` in
`src/i18n/locales/{tr,en}/lesson.json` (both languages, synced). New keys needed:
`conversationTypingIndicator` (a11y label), `conversationSpeaking` (a11y label). Turkish strings are
short (dock caption ≤ 24 chars). No plurals. Existing keys reused for all other strings.

## 12. Acceptance Criteria (5+ testable pass/fail)

- [ ] On a 375×667 viewport with a hint bubble AND a support bubble present, the input dock (text
      input + mic) is fully visible and tappable — nothing is clipped by `overflow-hidden`.
- [ ] The chat thread scrolls with touch on iOS WKWebView; new bubbles auto-scroll to bottom; if the
      user scrolled up, the view does not snap down until the next bubble arrives.
- [ ] With STT unavailable (native WebView), the mic button is hidden and the text path completes a
      full scenario end-to-end.
- [ ] The same component renders correctly standalone (`/conversation`) and inside the lesson
      pipeline (fills host flex column, no fixed viewport units inside the activity).
- [ ] Correct and wrong feedback each present icon + color + Nova mood (color-independence), and a
      wrong answer always leaves a retry path (mic restarts or text input active).
- [ ] All quality gates pass: `pnpm type-check`, `pnpm lint`, `pnpm test`,
      `pnpm validate:conversation-registry`.

## 13. Open Questions

- Theme→gradient mapping: derive from `scenarioTheme` string with a small lookup + fallback; exact
  palette to be set by art direction (Phase 2).
- Should the intro card be skippable by tap (currently fixed 2.5s)? Recommended yes, deferred to
  implementation as a low-risk enhancement.
