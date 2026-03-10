"use strict";
/**
 * Simple health check endpoint.
 * Returns service status and timestamp.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
exports.healthCheck = (0, https_1.onRequest)({ region: admin_1.REGION }, async (_req, res) => {
    let firestoreOk = false;
    try {
        // Quick Firestore connectivity test
        await admin_1.db.doc('_health/ping').get();
        firestoreOk = true;
    }
    catch {
        firestoreOk = false;
    }
    const status = firestoreOk ? 'ok' : 'degraded';
    const code = firestoreOk ? 200 : 503;
    res.status(code).json({
        status,
        timestamp: Date.now(),
        services: {
            firestore: firestoreOk ? 'ok' : 'error',
        },
    });
});
//# sourceMappingURL=healthCheck.js.map