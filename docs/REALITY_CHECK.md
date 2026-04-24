# NovaLingo — Reality Check

> Brutal launch-readiness summary focused on monetization integrity, entitlement correctness, and user-facing enforcement.
> Last updated: March 2026

## Bottom Line

NovaLingo is no longer in the dangerous state where the client could grant premium locally and backend verification was optional. The codebase now points in a defensible launch direction: ad-free freemium with a verified subscription entitlement model.

That said, the app is not store-ready until real sandbox purchase scenarios are completed on physical devices.

## What Is Now True

### Commercial truth

- The app is not a paid download.
- The app is not ad-monetized for launch.
- The app is not using consumable IAP for launch.
- The only paid path is NovaLingo Plus subscription.

### Entitlement truth

- Apple notifications are verified via signed JWS validation.
- Google purchases are verified against Google Play APIs.
- Verified subscriptions are written under `users/{uid}/subscriptions/*`.
- `users.isPremium` is treated as a projection, not the authority.

### Runtime enforcement truth

- Premium worlds are blocked for free users.
- Free users are limited to 3 lessons per day.
- Detailed parent reports are blocked for free users.
- Paywall and subscription lifecycle telemetry is now instrumented.

## What Would Still Get You Rejected or Burned at Launch

### 1. No real device purchase matrix yet

Until these are run end-to-end on actual devices, your billing story is still theoretical:

- first purchase
- renewal
- cancellation
- restore
- webhook delay
- device change

### 2. Offline premium access is not a launch-safe promise

There is no credible reason to market offline premium access until entitlement-aware offline packaging and expiry behavior are explicitly implemented and tested.

Current recommendation: do not promise offline premium access in store copy.

### 3. Child-profile premium differentiation still needs a full enforcement sweep

The commercial story says free supports 1 child and Plus supports up to 5. That needs to remain enforced anywhere profile creation or upgrade prompts appear.

### 4. Webhook lag UX still needs operational proof

The code now handles verified entitlement projection correctly, but the actual user experience under delayed webhook propagation must be observed in sandbox on both stores.

## Launch Gate

Do not ship to public store release until all of the following are true:

- both app stores complete sandbox purchase testing on real hardware
- restore flow works after reinstall and after signing in on a second device
- cancellation and billing issue states are reflected in telemetry and user state
- store copy exactly matches enforced free vs Plus behavior
- support notes explain short verification delays without falsely promising instant premium unlock

## Hard Verdict

This is now a credible subscription app architecture.

It is not yet a proven subscription operation.

The remaining risk is not the code structure. The remaining risk is real-world store behavior and whether the promises in the funnel exactly match what the user experiences after paying.
