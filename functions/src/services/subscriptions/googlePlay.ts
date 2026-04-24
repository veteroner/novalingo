import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

const GOOGLE_PLAY_PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME ?? 'com.novalingo.app';

interface GoogleLineItem {
  productId?: string;
  expiryTime?: string;
  autoRenewingPlan?: {
    autoRenewEnabled?: boolean;
  };
}

interface GoogleExternalAccountIdentifiers {
  obfuscatedExternalAccountId?: string;
}

interface GoogleSubscriptionResponse {
  subscriptionState?: string;
  lineItems?: GoogleLineItem[];
  externalAccountIdentifiers?: GoogleExternalAccountIdentifiers;
}

export interface GoogleVerificationResult {
  state:
    | 'active'
    | 'trial'
    | 'grace'
    | 'billing_issue'
    | 'canceled'
    | 'expired'
    | 'paused'
    | 'pending'
    | 'unknown';
  isEntitlementActive: boolean;
  expiresAt: Date | null;
  autoRenewEnabled: boolean | null;
  obfuscatedExternalAccountId?: string;
  raw: GoogleSubscriptionResponse;
}

function mapGoogleState(state: string | undefined): GoogleVerificationResult['state'] {
  switch (state) {
    case 'SUBSCRIPTION_STATE_ACTIVE':
      return 'active';
    case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
      return 'grace';
    case 'SUBSCRIPTION_STATE_ON_HOLD':
      return 'billing_issue';
    case 'SUBSCRIPTION_STATE_CANCELED':
      return 'canceled';
    case 'SUBSCRIPTION_STATE_EXPIRED':
      return 'expired';
    case 'SUBSCRIPTION_STATE_PENDING':
      return 'pending';
    case 'SUBSCRIPTION_STATE_PAUSED':
      return 'paused';
    default:
      return 'unknown';
  }
}

async function getAccessToken(): Promise<string> {
  const credential = admin.app().options.credential as
    | { getAccessToken?: () => Promise<{ access_token?: string }> }
    | undefined;

  const token = await credential?.getAccessToken?.();
  if (!token?.access_token) {
    throw new HttpsError(
      'failed-precondition',
      'Google Play verification is unavailable because the Functions credential has no access token provider.',
    );
  }
  return token.access_token;
}

export async function verifyGoogleSubscriptionPurchase(params: {
  purchaseToken: string;
  productId: string;
}): Promise<GoogleVerificationResult> {
  const accessToken = await getAccessToken();
  const endpoint = new URL(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
      GOOGLE_PLAY_PACKAGE_NAME,
    )}/purchases/subscriptionsv2/tokens/${encodeURIComponent(params.purchaseToken)}`,
  );

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new HttpsError(
      'permission-denied',
      `Google Play purchase verification failed with HTTP ${response.status}`,
    );
  }

  const body = (await response.json()) as GoogleSubscriptionResponse;
  const lineItem = body.lineItems?.find((item) => item.productId === params.productId);
  if (!lineItem) {
    throw new HttpsError(
      'permission-denied',
      'Google Play response did not include the expected product',
    );
  }

  const state = mapGoogleState(body.subscriptionState);
  const expiresAt = lineItem.expiryTime ? new Date(lineItem.expiryTime) : null;
  const isEntitlementActive = state === 'active' || state === 'trial' || state === 'grace';

  return {
    state,
    isEntitlementActive,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    autoRenewEnabled: lineItem.autoRenewingPlan?.autoRenewEnabled ?? null,
    obfuscatedExternalAccountId:
      body.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? undefined,
    raw: body,
  };
}
