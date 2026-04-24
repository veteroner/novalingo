"use strict";
/**
 * Scheduled: runs every Sunday at 10:00 Turkey time (07:00 UTC).
 * Generates a weekly progress summary for each parent
 * and sends a push notification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyReport = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const notificationService_1 = require("../services/notificationService");
const admin_1 = require("../utils/admin");
function buildWeeklyUtterancePreview(theme) {
    return theme.sampleUtterances[0] ? `, örnek: "${theme.sampleUtterances[0]}"` : '';
}
function buildWeeklyThemeExamplesBlock(themes) {
    const lines = themes
        .filter((theme) => theme.sampleUtterances.length > 0)
        .slice(0, 3)
        .map((theme) => `- ${theme.theme}: "${theme.sampleUtterances[0]}"`);
    if (lines.length === 0)
        return '';
    return `\nÖrnek cümleler:\n${lines.join('\n')}`;
}
function buildWeeklyConversationThemeProgress(lessonDocs) {
    const grouped = new Map();
    for (const lessonDoc of lessonDocs) {
        const data = lessonDoc.data();
        for (const evidence of data.conversationEvidence ?? []) {
            const theme = evidence.scenarioTheme?.trim();
            if (!theme)
                continue;
            const current = grouped.get(theme) ?? {
                attempts: 0,
                passedCount: 0,
                totalScore: 0,
                totalHints: 0,
                words: [],
                utterances: [],
            };
            current.attempts += 1;
            current.passedCount += evidence.passed ? 1 : 0;
            current.totalScore += evidence.score ?? 0;
            current.totalHints += evidence.hintedTurns ?? 0;
            current.words.push(...(evidence.targetWordsHit ?? []));
            current.utterances.push(...(evidence.rawChildResponses ?? []).slice(0, 2));
            grouped.set(theme, current);
        }
    }
    return [...grouped.entries()]
        .map(([theme, stats]) => ({
        theme,
        attempts: stats.attempts,
        successRate: stats.attempts > 0 ? stats.passedCount / stats.attempts : 0,
        averageScore: stats.attempts > 0 ? stats.totalScore / stats.attempts : 0,
        averageHints: stats.attempts > 0 ? stats.totalHints / stats.attempts : 0,
        focusWords: [...new Set(stats.words)].slice(0, 2),
        sampleUtterances: [...new Set(stats.utterances)].slice(0, 1),
    }))
        .sort((left, right) => right.averageScore - left.averageScore);
}
function getWeeklyRecommendedConversationTheme(themes) {
    const candidates = themes
        .filter((item) => item.averageScore < 80 || item.successRate < 0.75 || item.averageHints >= 0.75)
        .map((item) => ({
        item,
        needScore: 100 - item.averageScore + (1 - item.successRate) * 35 + item.averageHints * 12,
    }))
        .sort((left, right) => right.needScore - left.needScore);
    const selected = candidates[0]?.item;
    if (!selected)
        return null;
    return {
        theme: selected.theme,
        averageScore: Math.round(selected.averageScore),
        focusWords: selected.focusWords,
    };
}
exports.weeklyReport = (0, scheduler_1.onSchedule)({
    schedule: '0 7 * * 0', // Sunday 07:00 UTC = 10:00 Turkey
    timeZone: 'Europe/Istanbul',
    region: admin_1.REGION,
}, async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Get all active children (updated in last 7 days)
    const childrenSnap = await admin_1.db
        .collection('children')
        .where('updatedAt', '>=', sevenDaysAgo)
        .get();
    console.log(`Generating weekly reports for ${childrenSnap.size} children`);
    // Group children by parent
    const parentChildren = new Map();
    for (const doc of childrenSnap.docs) {
        const data = doc.data();
        const parentUid = data.parentUid;
        if (!parentUid)
            continue;
        const list = parentChildren.get(parentUid) ?? [];
        list.push({ name: data.name, childId: doc.id });
        parentChildren.set(parentUid, list);
    }
    let sentCount = 0;
    for (const [parentUid, children] of parentChildren) {
        const summaries = [];
        for (const child of children) {
            const lessonsSnap = await admin_1.db
                .collection(`children/${child.childId}/lessonProgress`)
                .where('completedAt', '>=', sevenDaysAgo)
                .get();
            const lessonsCount = lessonsSnap.size;
            const weeklyConversationThemes = buildWeeklyConversationThemeProgress(lessonsSnap.docs);
            const recommendedTheme = getWeeklyRecommendedConversationTheme(weeklyConversationThemes);
            // Get child stats
            const childDoc = await admin_1.db.doc(`children/${child.childId}`).get();
            const childData = childDoc.data();
            const streak = childData?.streak?.current ?? 0;
            const level = childData?.level ?? 1;
            const recommendationText = recommendedTheme
                ? ` • konuşma odağı: ${recommendedTheme.theme} (%${recommendedTheme.averageScore}${recommendedTheme.focusWords.length > 0 ? `, ${recommendedTheme.focusWords.join(', ')}` : ''}${buildWeeklyUtterancePreview(weeklyConversationThemes.find((item) => item.theme === recommendedTheme.theme) ?? { theme: recommendedTheme.theme, attempts: 0, successRate: 0, averageScore: 0, averageHints: 0, focusWords: [], sampleUtterances: [] })})`
                : '';
            const themeExamplesText = buildWeeklyThemeExamplesBlock(weeklyConversationThemes);
            summaries.push(`${child.name}: ${lessonsCount} ders, ${streak} günlük seri, seviye ${level}${recommendationText}${themeExamplesText}`);
        }
        if (summaries.length > 0) {
            const body = summaries.join('\n');
            const sent = await (0, notificationService_1.sendToParent)(parentUid, {
                title: '📊 Haftalık Rapor',
                body,
                category: 'weeklyReport',
                data: { type: 'weekly_report' },
            });
            if (sent)
                sentCount++;
        }
    }
    console.log(`Weekly reports sent: ${sentCount}`);
});
//# sourceMappingURL=weeklyReport.js.map