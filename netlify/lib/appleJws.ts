/**
 * Apple imzalı JWS (StoreKit / App Store Server API) doğrulaması.
 *
 * `functions/src/services/subscriptions/appleJws.ts` ile aynı mantık; Spark
 * planında Cloud Functions çalışmadığı için Netlify fonksiyonlarına taşındı.
 * Sertifika zinciri x5c başlığından alınır ve Apple Root CA G3 parmak izine
 * sabitlenir — API anahtarı gerektirmez.
 */

import { createPublicKey, verify, X509Certificate } from 'crypto';

const APPLE_ROOT_FINGERPRINTS = new Set([
  '63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179',
]);

export class AppleJwsError extends Error {}

interface AppleJwsHeader {
  alg?: string;
  x5c?: string[];
}

function decodeBase64Url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

function parseSegment<T>(segment: string, label: string): T {
  try {
    return JSON.parse(decodeBase64Url(segment).toString('utf8')) as T;
  } catch {
    throw new AppleJwsError(`Invalid Apple JWS ${label}`);
  }
}

function ensureValidAt(cert: X509Certificate, now: Date): void {
  const validFrom = new Date(cert.validFrom);
  const validTo = new Date(cert.validTo);
  if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validTo.getTime())) {
    throw new AppleJwsError('Apple certificate validity window is invalid');
  }
  if (now < validFrom || now > validTo) {
    throw new AppleJwsError('Apple certificate is outside its validity window');
  }
}

function joseSignatureToDer(signature: Buffer): Buffer {
  const half = signature.length / 2;
  if (!Number.isInteger(half) || half <= 0) {
    throw new AppleJwsError('Invalid Apple JWS signature size');
  }

  const trim = (input: Buffer) => {
    let index = 0;
    while (index < input.length - 1 && input[index] === 0) index++;
    let value = input.subarray(index);
    if ((value[0] & 0x80) !== 0) {
      value = Buffer.concat([Buffer.from([0]), value]);
    }
    return value;
  };

  const r = trim(signature.subarray(0, half));
  const s = trim(signature.subarray(half));
  const totalLength = 2 + r.length + 2 + s.length;

  return Buffer.concat([
    Buffer.from([0x30, totalLength, 0x02, r.length]),
    r,
    Buffer.from([0x02, s.length]),
    s,
  ]);
}

function verifyCertificateChain(certs: X509Certificate[], now: Date): void {
  if (certs.length < 3) {
    throw new AppleJwsError('Apple JWS certificate chain is incomplete');
  }

  const [leaf, intermediate, root] = certs;

  ensureValidAt(leaf, now);
  ensureValidAt(intermediate, now);
  ensureValidAt(root, now);

  if (!leaf.checkIssued(intermediate) || !leaf.verify(intermediate.publicKey)) {
    throw new AppleJwsError('Apple leaf certificate verification failed');
  }
  if (!intermediate.checkIssued(root) || !intermediate.verify(root.publicKey)) {
    throw new AppleJwsError('Apple intermediate certificate verification failed');
  }

  const fingerprint = root.fingerprint256.replace(/:/g, '').toUpperCase();
  if (!APPLE_ROOT_FINGERPRINTS.has(fingerprint)) {
    throw new AppleJwsError('Apple root certificate fingerprint mismatch');
  }
}

/** Apple JWS'ini doğrular ve yükü döndürür; geçersizse `AppleJwsError` fırlatır. */
export function verifyAppleSignedJws<T>(signedJws: string): T {
  const segments = signedJws.split('.');
  if (segments.length !== 3) {
    throw new AppleJwsError('Invalid Apple signed payload');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const header = parseSegment<AppleJwsHeader>(encodedHeader, 'header');
  if (header.alg !== 'ES256') {
    throw new AppleJwsError('Unsupported Apple JWS algorithm');
  }
  if (!Array.isArray(header.x5c) || header.x5c.length < 3) {
    throw new AppleJwsError('Apple JWS is missing certificate chain data');
  }

  const certs = header.x5c.map((value) => new X509Certificate(Buffer.from(value, 'base64')));
  verifyCertificateChain(certs, new Date());

  const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`, 'utf8');
  const signature = joseSignatureToDer(decodeBase64Url(encodedSignature));
  const publicKey = createPublicKey(certs[0].publicKey);
  if (!verify('sha256', signingInput, publicKey, signature)) {
    throw new AppleJwsError('Apple JWS signature verification failed');
  }

  return parseSegment<T>(encodedPayload, 'payload');
}
