"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for admin utility functions.
 */
const vitest_1 = require("vitest");
const admin_1 = require("../utils/admin");
(0, vitest_1.describe)('xpForLevel', () => {
    (0, vitest_1.it)('returns 0 for level 1', () => {
        (0, vitest_1.expect)((0, admin_1.xpForLevel)(1)).toBe(0);
    });
    (0, vitest_1.it)('returns 100 for level 2', () => {
        (0, vitest_1.expect)((0, admin_1.xpForLevel)(2)).toBe(100);
    });
    (0, vitest_1.it)('returns 175 for level 3', () => {
        (0, vitest_1.expect)((0, admin_1.xpForLevel)(3)).toBe(175);
    });
    (0, vitest_1.it)('increases monotonically', () => {
        let prev = 0;
        for (let level = 2; level <= 20; level++) {
            const xp = (0, admin_1.xpForLevel)(level);
            (0, vitest_1.expect)(xp).toBeGreaterThan(prev);
            prev = xp;
        }
    });
    (0, vitest_1.it)('returns 0 for level 0', () => {
        (0, vitest_1.expect)((0, admin_1.xpForLevel)(0)).toBe(0);
    });
});
(0, vitest_1.describe)('getTodayTR', () => {
    (0, vitest_1.it)('returns YYYY-MM-DD format', () => {
        const result = (0, admin_1.getTodayTR)();
        (0, vitest_1.expect)(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    (0, vitest_1.it)('returns a valid date', () => {
        const result = (0, admin_1.getTodayTR)();
        const date = new Date(result);
        (0, vitest_1.expect)(date.getTime()).not.toBeNaN();
    });
});
(0, vitest_1.describe)('requireAuth', () => {
    (0, vitest_1.it)('returns uid when authenticated', () => {
        const uid = (0, admin_1.requireAuth)({ auth: { uid: 'user123' } });
        (0, vitest_1.expect)(uid).toBe('user123');
    });
    (0, vitest_1.it)('throws on missing auth', () => {
        (0, vitest_1.expect)(() => (0, admin_1.requireAuth)({})).toThrow('Authentication required');
    });
    (0, vitest_1.it)('throws on null auth', () => {
        (0, vitest_1.expect)(() => (0, admin_1.requireAuth)({ auth: undefined })).toThrow('Authentication required');
    });
    (0, vitest_1.it)('throws on missing uid', () => {
        (0, vitest_1.expect)(() => (0, admin_1.requireAuth)({ auth: { uid: '' } })).toThrow('Authentication required');
    });
});
//# sourceMappingURL=admin.test.js.map