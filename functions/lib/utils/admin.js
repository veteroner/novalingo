"use strict";
/**
 * Shared admin SDK initialization and utility helpers
 * for all Cloud Functions.
 */
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
exports.callableOpts = exports.REGION = exports.arrayRemove = exports.arrayUnion = exports.increment = exports.serverTimestamp = exports.messaging = exports.storage = exports.auth = exports.db = void 0;
exports.requireAuth = requireAuth;
exports.requireChildOwnership = requireChildOwnership;
exports.xpForLevel = xpForLevel;
exports.getTodayTR = getTodayTR;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
// Initialize once
if (!admin.apps.length) {
    admin.initializeApp();
}
exports.db = (0, firestore_1.getFirestore)();
exports.auth = admin.auth();
exports.storage = admin.storage();
exports.messaging = admin.messaging();
/** Firestore server timestamp */
exports.serverTimestamp = firestore_1.FieldValue.serverTimestamp;
exports.increment = firestore_1.FieldValue.increment;
exports.arrayUnion = firestore_1.FieldValue.arrayUnion;
exports.arrayRemove = firestore_1.FieldValue.arrayRemove;
/** Default region for all functions */
exports.REGION = 'europe-west1';
/** Shared options for onCall callables — disables AppCheck in emulator */
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
exports.callableOpts = { region: exports.REGION, enforceAppCheck: !isEmulator };
/** Verify that the caller is authenticated */
function requireAuth(context) {
    if (!context.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required');
    }
    return context.auth.uid;
}
/** Verify caller owns the child profile */
async function requireChildOwnership(uid, childId) {
    const childDoc = await exports.db.doc(`children/${childId}`).get();
    if (!childDoc.exists) {
        throw new https_1.HttpsError('not-found', 'Child profile not found');
    }
    const data = childDoc.data();
    if (data?.parentUid !== uid) {
        throw new https_1.HttpsError('permission-denied', 'Not authorized to access this child profile');
    }
    return childDoc;
}
/** Calculate XP required for a given level (Fibonacci-like growth) */
function xpForLevel(level) {
    if (level <= 1)
        return 0;
    if (level === 2)
        return 100;
    let prev = 100;
    let curr = 150;
    for (let i = 3; i <= level; i++) {
        const next = Math.floor(prev + curr * 0.5);
        prev = curr;
        curr = next;
    }
    return curr;
}
/** Get today's date string in YYYY-MM-DD format (UTC+3 for Turkey) */
function getTodayTR() {
    const now = new Date();
    const turkeyOffset = 3 * 60 * 60 * 1000;
    const turkeyTime = new Date(now.getTime() + turkeyOffset);
    return turkeyTime.toISOString().split('T')[0];
}
//# sourceMappingURL=admin.js.map