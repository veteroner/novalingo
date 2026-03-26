"use strict";
/**
 * NovaLingo Cloud Functions — Entry Point
 *
 * Firebase Cloud Functions v2, europe-west1 region.
 * All callable, trigger, and scheduled functions exported here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.weeklyReport = exports.updateLeaderboards = exports.streakCheckMidnight = exports.resetDailyQuests = exports.cleanupExpiredCache = exports.onUserCreated = exports.onStreakUpdate = exports.onLessonCompleted = exports.onAchievementUnlocked = exports.verifyParentPin = exports.useStreakFreeze = exports.updateVocabulary = exports.updateChildProfile = exports.syncOfflineProgress = exports.submitLessonResult = exports.spinDailyWheel = exports.setParentPin = exports.purchaseShopItem = exports.getLeaderboard = exports.deleteChildProfile = exports.deleteAccount = exports.createChildProfile = exports.claimQuestReward = void 0;
// Callable functions (client-invoked)
var claimQuestReward_1 = require("./callables/claimQuestReward");
Object.defineProperty(exports, "claimQuestReward", { enumerable: true, get: function () { return claimQuestReward_1.claimQuestReward; } });
var createChildProfile_1 = require("./callables/createChildProfile");
Object.defineProperty(exports, "createChildProfile", { enumerable: true, get: function () { return createChildProfile_1.createChildProfile; } });
var deleteAccount_1 = require("./callables/deleteAccount");
Object.defineProperty(exports, "deleteAccount", { enumerable: true, get: function () { return deleteAccount_1.deleteAccount; } });
var deleteChildProfile_1 = require("./callables/deleteChildProfile");
Object.defineProperty(exports, "deleteChildProfile", { enumerable: true, get: function () { return deleteChildProfile_1.deleteChildProfile; } });
var getLeaderboard_1 = require("./callables/getLeaderboard");
Object.defineProperty(exports, "getLeaderboard", { enumerable: true, get: function () { return getLeaderboard_1.getLeaderboard; } });
var purchaseShopItem_1 = require("./callables/purchaseShopItem");
Object.defineProperty(exports, "purchaseShopItem", { enumerable: true, get: function () { return purchaseShopItem_1.purchaseShopItem; } });
var setParentPin_1 = require("./callables/setParentPin");
Object.defineProperty(exports, "setParentPin", { enumerable: true, get: function () { return setParentPin_1.setParentPin; } });
var spinDailyWheel_1 = require("./callables/spinDailyWheel");
Object.defineProperty(exports, "spinDailyWheel", { enumerable: true, get: function () { return spinDailyWheel_1.spinDailyWheel; } });
var submitLessonResult_1 = require("./callables/submitLessonResult");
Object.defineProperty(exports, "submitLessonResult", { enumerable: true, get: function () { return submitLessonResult_1.submitLessonResult; } });
var syncOfflineProgress_1 = require("./callables/syncOfflineProgress");
Object.defineProperty(exports, "syncOfflineProgress", { enumerable: true, get: function () { return syncOfflineProgress_1.syncOfflineProgress; } });
var updateChildProfile_1 = require("./callables/updateChildProfile");
Object.defineProperty(exports, "updateChildProfile", { enumerable: true, get: function () { return updateChildProfile_1.updateChildProfile; } });
var updateVocabulary_1 = require("./callables/updateVocabulary");
Object.defineProperty(exports, "updateVocabulary", { enumerable: true, get: function () { return updateVocabulary_1.updateVocabulary; } });
var useStreakFreeze_1 = require("./callables/useStreakFreeze");
Object.defineProperty(exports, "useStreakFreeze", { enumerable: true, get: function () { return useStreakFreeze_1.useStreakFreeze; } });
var verifyParentPin_1 = require("./callables/verifyParentPin");
Object.defineProperty(exports, "verifyParentPin", { enumerable: true, get: function () { return verifyParentPin_1.verifyParentPin; } });
// Firestore triggers
var onAchievementUnlocked_1 = require("./triggers/onAchievementUnlocked");
Object.defineProperty(exports, "onAchievementUnlocked", { enumerable: true, get: function () { return onAchievementUnlocked_1.onAchievementUnlocked; } });
var onLessonCompleted_1 = require("./triggers/onLessonCompleted");
Object.defineProperty(exports, "onLessonCompleted", { enumerable: true, get: function () { return onLessonCompleted_1.onLessonCompleted; } });
var onStreakUpdate_1 = require("./triggers/onStreakUpdate");
Object.defineProperty(exports, "onStreakUpdate", { enumerable: true, get: function () { return onStreakUpdate_1.onStreakUpdate; } });
var onUserCreated_1 = require("./triggers/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
// Scheduled functions
var cleanup_1 = require("./scheduled/cleanup");
Object.defineProperty(exports, "cleanupExpiredCache", { enumerable: true, get: function () { return cleanup_1.cleanupExpiredCache; } });
var resetDailyQuests_1 = require("./scheduled/resetDailyQuests");
Object.defineProperty(exports, "resetDailyQuests", { enumerable: true, get: function () { return resetDailyQuests_1.resetDailyQuests; } });
var streakCheck_1 = require("./scheduled/streakCheck");
Object.defineProperty(exports, "streakCheckMidnight", { enumerable: true, get: function () { return streakCheck_1.streakCheckMidnight; } });
var updateLeaderboards_1 = require("./scheduled/updateLeaderboards");
Object.defineProperty(exports, "updateLeaderboards", { enumerable: true, get: function () { return updateLeaderboards_1.updateLeaderboards; } });
var weeklyReport_1 = require("./scheduled/weeklyReport");
Object.defineProperty(exports, "weeklyReport", { enumerable: true, get: function () { return weeklyReport_1.weeklyReport; } });
// HTTP endpoints
var healthCheck_1 = require("./http/healthCheck");
Object.defineProperty(exports, "healthCheck", { enumerable: true, get: function () { return healthCheck_1.healthCheck; } });
//# sourceMappingURL=index.js.map