/**
 * App Store Server API istemcisi.
 *
 * cordova-plugin-purchase iOS'ta StoreKit 1 kullanır ve imzalı işlem (JWS)
 * vermez; yalnızca `transactionId`. Abonelik durumu bu kimlikle Apple'dan
 * sorgulanır ve dönen imzalı veri `verifyAppleSignedJws` ile doğrulanır.
 *
 * Gerekli ortam değişkenleri (App Store Connect → Users and Access →
 * Integrations → In-App Purchase anahtarı):
 *   APPLE_IAP_KEY_ID, APPLE_IAP_ISSUER_ID, APPLE_IAP_PRIVATE_KEY (.p8 içeriği)
 */

import { createPrivateKey, sign } from 'crypto';

export const APPLE_BUNDLE_ID = process.env.APPLE_BUNDLE_ID?.trim() || 'com.novalingo.app';

const PRODUCTION_HOST = 'https://api.storekit.itunes.apple.com';
const SANDBOX_HOST = 'https://api.storekit-sandbox.itunes.apple.com';

export class AppStoreApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function createApiToken(): string {
  const keyId = process.env.APPLE_IAP_KEY_ID?.trim();
  const issuerId = process.env.APPLE_IAP_ISSUER_ID?.trim();
  const privateKeyPem = process.env.APPLE_IAP_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  if (!keyId || !issuerId || !privateKeyPem) {
    throw new AppStoreApiError('App Store Server API credentials are not configured', 500);
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: 'ES256', kid: keyId, typ: 'JWT' });
  const payload = base64UrlJson({
    iss: issuerId,
    iat: now,
    exp: now + 300,
    aud: 'appstoreconnect-v1',
    bid: APPLE_BUNDLE_ID,
  });
  const signingInput = `${header}.${payload}`;
  const signature = sign('sha256', Buffer.from(signingInput), {
    key: createPrivateKey(privateKeyPem),
    dsaEncoding: 'ieee-p1363',
  }).toString('base64url');
  return `${signingInput}.${signature}`;
}

export interface SubscriptionStatusResponse {
  environment?: string;
  bundleId?: string;
  data?: Array<{
    subscriptionGroupIdentifier?: string;
    lastTransactions?: Array<{
      originalTransactionId?: string;
      /** 1 aktif, 2 süresi doldu, 3 ödeme yeniden deneniyor, 4 ek süre, 5 iptal edildi */
      status?: number;
      signedTransactionInfo?: string;
      signedRenewalInfo?: string;
    }>;
  }>;
}

async function getFrom(host: string, path: string): Promise<Response> {
  return fetch(`${host}${path}`, {
    headers: { Authorization: `Bearer ${createApiToken()}` },
  });
}

/**
 * Bir işlemin ait olduğu aboneliklerin güncel durumu. Apple'ın önerdiği gibi
 * önce üretim ortamı denenir; işlem bulunamazsa (TestFlight / sandbox) sandbox.
 */
export async function getAllSubscriptionStatuses(
  transactionId: string,
): Promise<SubscriptionStatusResponse> {
  const path = `/inApps/v1/subscriptions/${encodeURIComponent(transactionId)}`;
  let response = await getFrom(PRODUCTION_HOST, path);
  if (response.status === 404 || response.status === 400) {
    response = await getFrom(SANDBOX_HOST, path);
  }
  if (!response.ok) {
    throw new AppStoreApiError(
      `App Store Server API responded ${response.status}`,
      response.status === 404 ? 404 : 502,
    );
  }
  return (await response.json()) as SubscriptionStatusResponse;
}
