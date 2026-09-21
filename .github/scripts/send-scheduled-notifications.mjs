/**
 * NovaLingo — Zamanlanmış Push Bildirimleri (Blaze'siz)
 *
 * Firebase Cloud Scheduler (Blaze planı) yerine GitHub Actions cron ile çalışır.
 * FCM gönderimi Spark planında da ücretsizdir; ücretli olan yalnızca Cloud
 * Functions/Scheduler'dır. Bu script Firestore'u Admin SDK ile okuyup
 * bildirimleri doğrudan gönderir.
 *
 * Aynı mantığın Firebase Functions sürümü `functions/src/scheduled/` altında
 * duruyor; Blaze'e geçilirse oraya dönülebilir. Dedup alanları (`srsReminderSentAt`,
 * `streakDangerSentAt`) bilerek aynı tutuldu.
 *
 * Kullanım:
 *   FIREBASE_SERVICE_ACCOUNT='{...}' JOB=srs node .github/scripts/send-scheduled-notifications.mjs
 *
 * JOB: srs | streak | weekly
 */

import admin from 'firebase-admin';

const JOB = process.env.JOB ?? 'srs';
const DRY_RUN = process.env.DRY_RUN === 'true';

const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;

if (rawCredentials) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(rawCredentials)) });
} else if (process.env.FIRESTORE_EMULATOR_HOST) {
  // Yerel test: emülatör kimlik doğrulaması istemez.
  admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-novalingo' });
} else {
  console.error('FIREBASE_SERVICE_ACCOUNT tanımlı değil.');
  process.exit(1);
}

const db = admin.firestore();

/** Türkiye saatine göre bugün — çocuk dokümanlarındaki tarih alanlarıyla aynı biçim. */
function todayTR() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}

/** Ebeveyn bildirim tercihleri — istemcideki varsayılanlarla birebir. */
const DEFAULT_PREFS = {
  dailyReminder: true,
  weeklyReport: true,
  achievementAlert: true,
  inactivityAlert: false,
};

const stats = { sent: 0, skipped: 0, failed: 0 };

/**
 * Ebeveyne bildirim gönderir. Tercih kapalıysa, token yoksa veya token bir
 * APNs cihaz token'ıysa (iOS'ta Firebase Messaging entegre edilmeden gelen tip)
 * sessizce atlar. Geçersiz token'ları temizler.
 */
async function sendToParent(parentUid, { title, body, category, data }) {
  const userSnap = await db.doc(`users/${parentUid}`).get();
  const user = userSnap.data();
  if (!user) return false;

  const token = user.fcmToken;
  if (!token) {
    stats.skipped++;
    return false;
  }

  if (user.pushProvider === 'apns') {
    console.warn(`[skip] ${parentUid}: APNs token'ına FCM ile gönderilemez (docs/PUSH_SETUP.md).`);
    stats.skipped++;
    return false;
  }

  const prefs = { ...DEFAULT_PREFS, ...(user.settings?.notifications ?? {}) };
  if (category && !prefs[category]) {
    stats.skipped++;
    return false;
  }

  if (DRY_RUN) {
    console.log(`[dry-run] ${parentUid} → ${title} | ${body.split('\n')[0]}`);
    stats.sent++;
    return true;
  }

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: data ?? {},
      android: { priority: 'high', notification: { sound: 'default', priority: 'high' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
    stats.sent++;
    return true;
  } catch (error) {
    stats.failed++;
    console.warn(`[error] ${parentUid}: ${error.code ?? ''} ${error.message}`);
    if (
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/invalid-argument'
    ) {
      await db.doc(`users/${parentUid}`).update({
        fcmToken: admin.firestore.FieldValue.delete(),
      });
      console.log(`[cleanup] ${parentUid}: geçersiz token silindi.`);
    }
    return false;
  }
}

/** Çocuğun ebeveynine bildirim gönderir. */
async function notifyParentAboutChild(childId, payload) {
  const childSnap = await db.doc(`children/${childId}`).get();
  const parentUid = childSnap.data()?.parentUid;
  if (!parentUid) return false;
  return sendToParent(parentUid, payload);
}

/**
 * 09:00 TR — Tekrar zamanı gelen kelimesi olan çocukların ebeveynlerine.
 *
 * Not: Koleksiyon-grubu sorgusu yerine çocuk başına alt koleksiyon sorgusu
 * kullanıyoruz; tek alanlı sorgu otomatik indekslidir, manuel indeks gerekmez.
 * Çocuk sayısı büyüdüğünde `collectionGroup('vocabulary')` + indekse geçilebilir.
 */
async function runSrsReminder() {
  const today = todayTR();
  const childrenSnap = await db.collection('children').get();
  console.log(`[srs] ${childrenSnap.size} çocuk taranıyor (tarih: ${today})`);

  for (const childDoc of childrenSnap.docs) {
    const child = childDoc.data();
    if (child.srsReminderSentAt === today) {
      stats.skipped++;
      continue;
    }

    const dueSnap = await db
      .collection(`children/${childDoc.id}/vocabulary`)
      .where('nextReviewDate', '<=', today)
      .get();

    const dueCount = dueSnap.docs.filter((doc) => (doc.data().repetitions ?? 0) > 0).length;
    if (dueCount === 0) continue;

    const childName = child.name ?? 'çocuğunuz';
    const sent = await notifyParentAboutChild(childDoc.id, {
      title: '🐾 Nova seni bekliyor!',
      body: `${childName} için ${Math.min(dueCount, 20)} kelime tekrar zamanı. Birlikte öğrenelim!`,
      category: 'dailyReminder',
      data: { type: 'srs_review', childId: childDoc.id, dueCount: String(dueCount), date: today },
    });

    if (sent && !DRY_RUN) {
      await childDoc.ref.update({ srsReminderSentAt: today });
    }
  }
}

/**
 * 19:00 TR — Bugün henüz oynamamış, serisi devam eden çocukların ebeveynlerine.
 *
 * Şema notu: çocuk dokümanı `currentStreak` / `lastActivityDate` alanlarını
 * düz tutar (iç içe `streak` nesnesi yoktur).
 */
async function runStreakReminder() {
  const today = todayTR();
  const childrenSnap = await db.collection('children').where('currentStreak', '>=', 1).get();
  console.log(`[streak] serisi olan ${childrenSnap.size} çocuk (tarih: ${today})`);

  for (const childDoc of childrenSnap.docs) {
    const child = childDoc.data();

    if (child.lastActivityDate === today) continue;
    if (child.streakDangerSentAt === today) {
      stats.skipped++;
      continue;
    }

    const childName = child.name ?? 'çocuğunuz';
    const streakDays = child.currentStreak ?? 0;

    const sent = await notifyParentAboutChild(childDoc.id, {
      title: '🔥 Seri tehlikede!',
      body: `${childName} bugün henüz oynamadı. ${streakDays} günlük seriyi birlikte koruyalım!`,
      category: 'dailyReminder',
      data: {
        type: 'streak_danger',
        childId: childDoc.id,
        streak: String(streakDays),
        date: today,
      },
    });

    if (sent && !DRY_RUN) {
      await childDoc.ref.update({ streakDangerSentAt: today });
    }
  }
}

/** Pazar 10:00 TR — Ebeveyne haftalık özet. */
async function runWeeklyReport() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const childrenSnap = await db.collection('children').where('updatedAt', '>=', sevenDaysAgo).get();
  console.log(`[weekly] son 7 günde aktif ${childrenSnap.size} çocuk`);

  /** parentUid → özet satırları */
  const byParent = new Map();

  for (const childDoc of childrenSnap.docs) {
    const child = childDoc.data();
    if (!child.parentUid) continue;

    const lessonsSnap = await db
      .collection(`children/${childDoc.id}/lessonProgress`)
      .where('completedAt', '>=', sevenDaysAgo)
      .get();

    const line = `${child.name ?? 'Çocuğunuz'}: ${lessonsSnap.size} ders, ${child.currentStreak ?? 0} günlük seri, seviye ${child.level ?? 1}`;
    byParent.set(child.parentUid, [...(byParent.get(child.parentUid) ?? []), line]);
  }

  for (const [parentUid, lines] of byParent) {
    await sendToParent(parentUid, {
      title: '📊 Haftalık Rapor',
      body: lines.join('\n'),
      category: 'weeklyReport',
      data: { type: 'weekly_report' },
    });
  }
}

const jobs = { srs: runSrsReminder, streak: runStreakReminder, weekly: runWeeklyReport };

const job = jobs[JOB];
if (!job) {
  console.error(`Bilinmeyen JOB: ${JOB} (srs | streak | weekly)`);
  process.exit(1);
}

console.log(`=== NovaLingo bildirim işi: ${JOB}${DRY_RUN ? ' (dry-run)' : ''} ===`);
await job();
console.log(`Sonuç → gönderildi: ${stats.sent}, atlandı: ${stats.skipped}, hata: ${stats.failed}`);
process.exit(0);
