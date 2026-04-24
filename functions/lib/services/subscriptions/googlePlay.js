"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleSubscriptionPurchase = verifyGoogleSubscriptionPurchase;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const GOOGLE_PLAY_PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME ?? 'com.novalingo.app';
function mapGoogleState(state) {
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
async function getAccessToken() {
    const credential = admin.app().options.credential;
    const token = await credential?.getAccessToken?.();
    if (!token?.access_token) {
        throw new https_1.HttpsError('failed-precondition', 'Google Play verification is unavailable because the Functions credential has no access token provider.');
    }
    return token.access_token;
}
async function verifyGoogleSubscriptionPurchase(params) {
    const accessToken = await getAccessToken();
    const endpoint = new URL(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(GOOGLE_PLAY_PACKAGE_NAME)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(params.purchaseToken)}`);
    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
        },
    });
    if (!response.ok) {
        throw new https_1.HttpsError('permission-denied', `Google Play purchase verification failed with HTTP ${response.status}`);
    }
    const body = (await response.json());
    const lineItem = body.lineItems?.find((item) => item.productId === params.productId);
    if (!lineItem) {
        throw new https_1.HttpsError('permission-denied', 'Google Play response did not include the expected product');
    }
    const state = mapGoogleState(body.subscriptionState);
    const expiresAt = lineItem.expiryTime ? new Date(lineItem.expiryTime) : null;
    const isEntitlementActive = state === 'active' || state === 'trial' || state === 'grace';
    return {
        state,
        isEntitlementActive,
        expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
        autoRenewEnabled: lineItem.autoRenewingPlan?.autoRenewEnabled ?? null,
        obfuscatedExternalAccountId: body.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? undefined,
        raw: body,
    };
}
//# sourceMappingURL=googlePlay.js.map