# NovaLingo — Deployment

> Deployment notes for staging, production, TTS hosting, and subscription verification readiness.
> Last updated: March 2026

## Environment Model

| Environment | Firebase Project  | Purpose                                          |
| ----------- | ----------------- | ------------------------------------------------ |
| Local       | Emulator suite    | Development and safe iteration                   |
| Staging     | `novalingo-b0c92` | Internal QA, sandbox billing, device smoke tests |
| Production  | `novalingo-app`   | Live release                                     |

Current TTS staging origin:

- `https://novalingo-b0c92-tts.web.app`

## Frontend Environment Variables

```bash
VITE_APP_ENV=staging|production
VITE_BUNDLE_TTS_AUDIO=false
VITE_TTS_AUDIO_BASE_URL=https://novalingo-b0c92-tts.web.app
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_SENTRY_DSN=...
```

Launch note: ad SDK and RevenueCat keys are not part of the canonical launch setup.

## Functions and Subscription Verification Config

Subscription verification requires store-aware backend configuration.

### Google Play

- Firebase Admin credential capable of `getAccessToken()`
- Android Publisher API access for the service account
- package name aligned with production app id, default fallback: `com.novalingo.app`

### Apple

- App Store Server Notifications configured to hit the production endpoint
- signed payload verification enabled in backend
- Apple certificate chain validation intact

## TTS Distribution

Native builds should not bundle the large pre-recorded TTS library.

- keep `VITE_BUNDLE_TTS_AUDIO=false` for native staging and production builds
- serve pre-recorded TTS from Firebase Hosting
- validate that native builds request audio from the configured TTS origin instead of shipping assets in the binary

Relevant commands:

```bash
pnpm run tts:prepare
pnpm run firebase:deploy:tts:staging
pnpm run firebase:deploy:tts:prod
pnpm run build:staging
pnpm run cap:build:android:staging
pnpm run cap:build:ios:staging
pnpm run smoke:cap:staging
pnpm run android:device:staging
```

## Release Validation

### Code validation

```bash
pnpm run type-check
pnpm run test
cd functions && npm run build
```

### Required billing validation before public release

Run these on real iOS and Android devices against staging or sandbox configuration:

1. First subscription purchase
2. Renewal event
3. Cancellation and post-cancel state
4. Restore purchases after reinstall
5. Webhook delay handling
6. Sign in on another device and recover entitlement

Public launch is blocked until all six scenarios pass.

## Store Operations Notes

- Review notes must mention that subscription unlock can wait for backend verification.
- Support team should have a restore-purchases troubleshooting script.
- Store listing copy must match actual free limits: 2 worlds, 3 lessons/day, 1 child profile.
- Store listing copy must match actual Plus benefits: all worlds, unlimited lessons, up to 5 child profiles, detailed reports.

## Recommended Deployment Order

1. Deploy hosting and functions to staging.
2. Run staging web smoke and native device smoke.
3. Run full sandbox purchase matrix on staging-connected builds.
4. Fix entitlement or webhook timing issues before production.
5. Deploy production hosting and functions.
6. Submit store builds only after the verified purchase matrix is green.
