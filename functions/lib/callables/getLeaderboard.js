"use strict";
/**
 * getLeaderboard
 *
 * Returns weekly leaderboard for a specific league tier.
 * Paginated, with current user's rank highlighted.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
exports.getLeaderboard = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId, tier = 'bronze', limit = 20 } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    // Get current week identifier
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86_400_000 + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    // Query leaderboard
    const leaderboardRef = admin_1.db
        .collection(`leaderboards/${weekId}/entries`)
        .where('tier', '==', tier)
        .orderBy('weeklyXP', 'desc')
        .limit(Math.min(limit, 50));
    const snapshot = await leaderboardRef.get();
    const entries = snapshot.docs.map((doc, index) => ({
        childId: doc.id,
        name: doc.data().name,
        avatarId: doc.data().avatarId,
        level: doc.data().level,
        weeklyXP: doc.data().weeklyXP,
        rank: index + 1,
        isCurrentUser: doc.id === childId,
    }));
    // Find current user's rank if not in top results
    const currentUserEntry = entries.find((e) => e.isCurrentUser);
    return {
        weekId,
        tier,
        entries,
        currentUserRank: currentUserEntry?.rank ?? null,
        promotionSlots: 3,
        relegationSlots: 3,
    };
});
//# sourceMappingURL=getLeaderboard.js.map