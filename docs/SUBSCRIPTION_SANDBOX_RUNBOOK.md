# NovaLingo — Subscription Sandbox Runbook

> Required before public App Store or Play rollout.
> Last updated: March 2026

## Goal

Prove that verified entitlement works correctly across both stores under real device conditions.

## Preconditions

- staging build installed on a physical iPhone and Android device
- staging or production-equivalent Functions deployed
- Apple sandbox tester account ready
- Google Play license tester account ready
- Firebase Analytics DebugView available
- access to Firestore console for entitlement inspection

## Canonical Pass Criteria

A scenario passes only if all three are true:

1. store transaction succeeds or fails exactly as expected
2. backend verified entitlement state matches the scenario
3. client UI reflects the verified state without local-only premium leakage

## Scenarios

### 1. First purchase

- start as a free user
- confirm premium world is locked
- buy NovaLingo Plus
- verify backend writes subscription record under `users/{uid}/subscriptions/*`
- verify `users.isPremium` projection becomes true
- verify premium world and detailed reports unlock
- verify `subscription_purchase_completed` and `subscription_status_synced`

### 2. Renewal

- use sandbox timing for auto-renewal
- wait for renewal cycle
- verify entitlement remains active after renewal
- verify no duplicate or conflicting subscription state is written

### 3. Cancellation

- cancel the subscription in sandbox account settings
- verify state transition is eventually reflected in backend projection
- verify telemetry captures billing issue or churn when applicable
- verify premium access behavior matches actual post-cancel entitlement window

### 4. Restore purchases

- reinstall the app or clear local session
- sign back in with the same account
- use Restore Purchases
- verify premium is restored only after verified backend sync
- verify no instant local-only unlock occurs before verification

### 5. Webhook delay

- simulate or observe delayed notification arrival
- verify client messaging explains pending verification
- verify entitlement becomes active once backend verification completes
- verify support flow is not forced to manually patch user state

### 6. Device change

- buy on device A
- sign in on device B with the same parent account
- verify device B receives premium state from backend projection
- verify restore path is available if store sync is required

## Evidence to Capture

For each scenario record:

- platform and device model
- app build version
- test account used
- timestamp of purchase action
- timestamp of backend entitlement write
- timestamp of UI unlock
- screenshots of paywall, purchase result, and unlocked state
- Analytics DebugView event names observed

## Failure Rules

Block launch if any of these occur:

- premium unlocks before backend verification
- restore fails on one platform
- cancellation state never appears in backend projection
- second device does not recover entitlement
- store copy promises behavior not seen in testing

## Sign-off

Public release requires one completed pass sheet for iOS and one for Android with all six scenarios marked pass.
