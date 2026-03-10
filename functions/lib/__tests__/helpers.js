"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockHttpsError = void 0;
exports.createMockDocRef = createMockDocRef;
exports.createMockCollectionRef = createMockCollectionRef;
exports.makeRequest = makeRequest;
/**
 * Shared mock helpers for callable function tests.
 * Mocks onCall to pass through the handler, and provides
 * chainable Firestore mock utilities.
 */
const vitest_1 = require("vitest");
// ─── HttpsError mock ────────────────────────────────
class MockHttpsError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'HttpsError';
    }
}
exports.MockHttpsError = MockHttpsError;
// ─── Firestore document mock ────────────────────────
function createMockDocRef(data = null) {
    const exists = data !== null;
    const snapshot = {
        exists,
        data: () => data,
        id: 'mock-doc-id',
        ref: {},
    };
    const ref = {
        get: vitest_1.vi.fn().mockResolvedValue(snapshot),
        set: vitest_1.vi.fn().mockResolvedValue(undefined),
        update: vitest_1.vi.fn().mockResolvedValue(undefined),
        delete: vitest_1.vi.fn().mockResolvedValue(undefined),
        collection: vitest_1.vi.fn(),
    };
    // Make ref self-referential for snapshot.ref
    snapshot.ref = ref;
    return { ref, snapshot };
}
// ─── Firestore collection mock ──────────────────────
function createMockCollectionRef(docs = []) {
    const snapshotDocs = docs.map((d) => {
        const docRef = {
            id: d.id,
            ref: {
                delete: vitest_1.vi.fn().mockResolvedValue(undefined),
                collection: vitest_1.vi.fn().mockReturnValue({
                    limit: vitest_1.vi.fn().mockReturnValue({
                        get: vitest_1.vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
                    }),
                }),
            },
            data: () => d.data,
            exists: true,
        };
        return docRef;
    });
    return {
        get: vitest_1.vi.fn().mockResolvedValue({
            empty: docs.length === 0,
            docs: snapshotDocs,
            size: docs.length,
        }),
        count: vitest_1.vi.fn().mockReturnValue({
            get: vitest_1.vi.fn().mockResolvedValue({ data: () => ({ count: docs.length }) }),
        }),
        limit: vitest_1.vi.fn().mockReturnValue({
            get: vitest_1.vi.fn().mockResolvedValue({
                empty: docs.length === 0,
                docs: snapshotDocs,
                size: docs.length,
            }),
        }),
        doc: vitest_1.vi.fn().mockReturnValue(createMockDocRef(null).ref),
        where: vitest_1.vi.fn().mockReturnThis(),
    };
}
// ─── Request builder ────────────────────────────────
function makeRequest(uid, data) {
    return { auth: { uid }, data };
}
//# sourceMappingURL=helpers.js.map