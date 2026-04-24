# NovaLingo — Monetization

> Canonical commercial truth for launch.
> Last updated: March 2026

## Business Model

NovaLingo launches as an ad-free freemium app with one subscription product family: NovaLingo Plus.

- No paid download
- No rewarded ads
- No interstitial ads
- No consumable IAP
- No cosmetic store at launch
- One entitlement source of truth: verified subscriptions written by backend services

## Free Plan

Free is intentionally useful but bounded.

| Area                    | Free               |
| ----------------------- | ------------------ |
| Worlds                  | First 2 worlds     |
| Daily lesson access     | 3 lessons per day  |
| Child profiles          | 1 child            |
| Parent reports          | Basic summary only |
| Detailed skill evidence | Locked             |
| Premium worlds          | Locked             |
| Entitlement source      | N/A                |
| Ads                     | None               |

These limits are aligned with the current app constants and runtime enforcement:

- `FREE_TIER.DAILY_LESSONS = 3`
- `FREE_TIER.MAX_CHILD_PROFILES = 1`
- premium world gating enforced in Home, World Map, and Lesson flows
- detailed reporting gated in Parent Dashboard

## NovaLingo Plus

Plus is the only paid product line.

| Area                  | NovaLingo Plus                                  |
| --------------------- | ----------------------------------------------- |
| Worlds                | All current and future premium worlds           |
| Daily lesson access   | Unlimited                                       |
| Child profiles        | Up to 5 children                                |
| Parent reports        | Detailed weekly insights                        |
| Skill evidence        | Enabled                                         |
| Purchase verification | Apple signed JWS + Google Play API verification |
| Restore flow          | Supported                                       |
| Ads                   | None                                            |

## Entitlement Rules

Premium access is not granted from the client alone.

1. Purchase happens on device.
2. Backend verifies the transaction with store-specific verification.
3. Backend writes verified subscription state under `users/{uid}/subscriptions/*`.
4. User document premium projection is refreshed from verified subscription state.
5. Client reads the projected entitlement and unlocks Plus features.

Launch rule: `users.isPremium` is a projection, not the source of truth.

## Pricing Direction

Exact local pricing is set in App Store Connect and Google Play Console, but product strategy is:

- Monthly subscription
- Annual subscription
- Annual plan is the primary paywall recommendation
- Trial or intro offer is optional and must be configured per store before launch

## Funnel Events

Subscription funnel telemetry is required for launch analysis.

- `subscription_paywall_viewed`
- `subscription_trial_started`
- `subscription_purchase_completed`
- `subscription_restore_completed`
- `subscription_restore_failed`
- `subscription_status_synced`
- `subscription_billing_issue`
- `subscription_churn`

## What We Do Not Promise

The following are not part of the launch commercial story and should not appear in store copy or investor-style summaries:

- offline premium download access
- rewarded ads for extra lives, XP, or hints
- interstitial monetization
- gem packs or consumable boosts
- RevenueCat as the entitlement authority

If any of these return later, they need a separate product decision and implementation pass.
