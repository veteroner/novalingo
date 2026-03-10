"use strict";
/**
 * claimQuestReward
 *
 * Validates quest completion, awards currency, marks quest as claimed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimQuestReward = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../utils/admin");
exports.claimQuestReward = (0, https_1.onCall)(admin_1.callableOpts, async (request) => {
    const uid = (0, admin_1.requireAuth)(request);
    const { childId, questId } = request.data;
    await (0, admin_1.requireChildOwnership)(uid, childId);
    const questRef = admin_1.db.doc(`children/${childId}/quests/${questId}`);
    const childRef = admin_1.db.doc(`children/${childId}`);
    // Transaction: read + validate + write atomically to prevent double-claim
    const reward = await admin_1.db.runTransaction(async (tx) => {
        const questDoc = await tx.get(questRef);
        if (!questDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Quest not found');
        }
        const quest = questDoc.data();
        if (quest.claimed) {
            throw new https_1.HttpsError('already-exists', 'Quest already claimed');
        }
        if (quest.currentProgress < quest.targetProgress) {
            throw new https_1.HttpsError('failed-precondition', 'Quest not yet completed');
        }
        // Award currency/xp
        if (quest.reward.type === 'stars') {
            tx.update(childRef, {
                'currency.stars': (0, admin_1.increment)(quest.reward.amount),
            });
        }
        else if (quest.reward.type === 'gems') {
            tx.update(childRef, {
                'currency.gems': (0, admin_1.increment)(quest.reward.amount),
            });
        }
        else if (quest.reward.type === 'xp') {
            tx.update(childRef, {
                totalXP: (0, admin_1.increment)(quest.reward.amount),
            });
        }
        tx.update(questRef, {
            claimed: true,
            claimedAt: (0, admin_1.serverTimestamp)(),
        });
        return quest.reward;
    });
    return {
        reward,
        questId,
    };
});
//# sourceMappingURL=claimQuestReward.js.map