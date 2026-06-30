# Technical Preferences — NovaLingo

> The UI pipeline skills (`/novalingo-ui`, `/ux-design`, `/ux-review`) read this file once per
> session to learn the stack, platform targets, input methods, and accessibility tier. Keep it current.

## Stack

- **Framework:** React 19 + TypeScript (strict) + Vite
- **Native shell:** Capacitor 6 (iOS / Android) — the web build runs inside WKWebView (iOS) / System WebView (Android)
- **State:** Zustand stores (`src/stores/*`) for client state; TanStack Query (`src/hooks/queries/*`) for server state
- **Backend:** Firebase (Auth, Firestore, Functions) + Netlify Functions (Gemini LLM evaluator)
- **Styling:** Tailwind CSS v4 (utility-first). Brand tokens use the `nova-*` color family (e.g. `text-nova-blue`).
- **Animation:** framer-motion
- **Icons:** `@phosphor-icons/react` — always use the `*Icon` exports (e.g. `GiftIcon`), never the deprecated bare names
- **i18n:** react-i18next (`src/i18n/locales/{en,tr}`)
- **Audio:** howler + Web Audio synth (`src/services/audio`), TTS via `speechService`
- **Engine:** NONE. This is a web/Capacitor app, not a Unity/Unreal/Godot game. Skip any "engine UI specialist" step.

## Platform Targets & Input

- **Primary:** Mobile portrait (Capacitor iOS/Android), touch input.
- **Secondary:** Web (desktop + mobile browser), mouse + keyboard.
- **Gamepad:** NOT supported. Ignore gamepad steps from the upstream game-studio framework.
- **Safe areas:** Honor notches/home-indicator via the existing `safe-area-top` / `safe-area-bottom` utilities.
- **Responsiveness:** Single-column, mobile-first. Constrain content with `max-w-sm` / `max-w-md` as the existing screens do.

## Audience

- **Users:** Turkish-speaking children (~5–11). Caregivers (parents) for the parent/subscription area.
- **UI language:** Turkish (the child's native language). Taught language: English.
- **Reading level:** Low. Prefer icons + short words + audio over dense text.

## Accessibility Tier

- **Committed tier:** WCAG 2.1 **AA**, adapted for a children's app — see `design/ux/accessibility-requirements.md`.

## Conventions (must follow)

- Feature code lives under `src/features/<area>/{screens,components,data,services}`; shared UI under
  `src/components/{atoms,molecules,organisms,templates}` (atomic design).
- Screens read state through hooks; they do NOT mutate Firestore or stores directly — go through
  store actions (Zustand) or TanStack Query mutations.
- UI text: follow the existing pattern in the file you are editing (most screens hardcode Turkish; new
  shared text should prefer `useTranslation`). Never invent a third pattern.
- Path aliases: `@/`, `@components`, `@features`, `@services`, `@stores`, `@hooks`, `@utils`, `@types`, `@assets`, `@config`, `@i18n`.

## Quality Gates (every UI change must pass before done)

```bash
pnpm type-check       # 0 errors
pnpm lint             # --max-warnings 0
pnpm test             # vitest run, all green
pnpm validate:conversation-registry
```
