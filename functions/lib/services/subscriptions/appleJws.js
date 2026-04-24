"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAppleSignedJws = verifyAppleSignedJws;
const crypto_1 = require("crypto");
const https_1 = require("firebase-functions/v2/https");
const APPLE_ROOT_FINGERPRINTS = new Set([
    '63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179',
]);
function decodeBase64Url(input) {
    return Buffer.from(input, 'base64url');
}
function parseSegment(segment, label) {
    try {
        return JSON.parse(decodeBase64Url(segment).toString('utf8'));
    }
    catch {
        throw new https_1.HttpsError('invalid-argument', `Invalid Apple JWS ${label}`);
    }
}
function ensureValidAt(cert, now) {
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);
    if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validTo.getTime())) {
        throw new https_1.HttpsError('invalid-argument', 'Apple certificate validity window is invalid');
    }
    if (now < validFrom || now > validTo) {
        throw new https_1.HttpsError('permission-denied', 'Apple certificate is outside its validity window');
    }
}
function joseSignatureToDer(signature) {
    const half = signature.length / 2;
    if (!Number.isInteger(half) || half <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid Apple JWS signature size');
    }
    const trim = (input) => {
        let index = 0;
        while (index < input.length - 1 && input[index] === 0)
            index++;
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
function verifyCertificateChain(certs, now) {
    if (certs.length < 3) {
        throw new https_1.HttpsError('permission-denied', 'Apple JWS certificate chain is incomplete');
    }
    const [leaf, intermediate, root] = certs;
    ensureValidAt(leaf, now);
    ensureValidAt(intermediate, now);
    ensureValidAt(root, now);
    if (!leaf.checkIssued(intermediate) || !leaf.verify(intermediate.publicKey)) {
        throw new https_1.HttpsError('permission-denied', 'Apple leaf certificate verification failed');
    }
    if (!intermediate.checkIssued(root) || !intermediate.verify(root.publicKey)) {
        throw new https_1.HttpsError('permission-denied', 'Apple intermediate certificate verification failed');
    }
    const fingerprint = root.fingerprint256.replace(/:/g, '').toUpperCase();
    if (!APPLE_ROOT_FINGERPRINTS.has(fingerprint)) {
        throw new https_1.HttpsError('permission-denied', 'Apple root certificate fingerprint mismatch');
    }
}
function verifyAppleSignedJws(signedJws) {
    const segments = signedJws.split('.');
    if (segments.length !== 3) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid Apple signed payload');
    }
    const [encodedHeader, encodedPayload, encodedSignature] = segments;
    const header = parseSegment(encodedHeader, 'header');
    if (header.alg !== 'ES256') {
        throw new https_1.HttpsError('permission-denied', 'Unsupported Apple JWS algorithm');
    }
    if (!Array.isArray(header.x5c) || header.x5c.length < 3) {
        throw new https_1.HttpsError('permission-denied', 'Apple JWS is missing certificate chain data');
    }
    const certs = header.x5c.map((value) => new crypto_1.X509Certificate(Buffer.from(value, 'base64')));
    const now = new Date();
    verifyCertificateChain(certs, now);
    const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`, 'utf8');
    const signature = joseSignatureToDer(decodeBase64Url(encodedSignature));
    const publicKey = (0, crypto_1.createPublicKey)(certs[0].publicKey);
    const isValidSignature = (0, crypto_1.verify)('sha256', signingInput, publicKey, signature);
    if (!isValidSignature) {
        throw new https_1.HttpsError('permission-denied', 'Apple JWS signature verification failed');
    }
    return parseSegment(encodedPayload, 'payload');
}
//# sourceMappingURL=appleJws.js.map