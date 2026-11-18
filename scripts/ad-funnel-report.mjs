#!/usr/bin/env node
/**
 * NovaLingo — reklam testi için günlük huni raporu (yalnız okuma).
 *
 * Uygulamaya SDK eklemeden, Firestore'daki mevcut kayıtlardan kohort raporu üretir:
 * hesabın açıldığı güne göre → profil → ilk ders → 3+ ders → sonraki bir gün geri geldi
 * → abonelik başlattı → şu an deneme / ücretli / iade.
 *
 * Kişisel veri yazdırılmaz: yalnız günlük toplam sayılar çıkar. Hiçbir şey YAZILMAZ.
 *
 * Kullanım (üretim — okuma yetkili servis hesabı gerekir):
 *   GOOGLE_APPLICATION_CREDENTIALS=/yol/servis-hesabi.json \
 *     node scripts/ad-funnel-report.mjs --from 2026-11-18 --to 2026-12-01 [--csv] [--exclude uids.txt]
 *
 * Emülatör:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/ad-funnel-report.mjs --project demo-novalingo --from ... --to ...
 *
 * Sınırlar (rapora da yazılır):
 * - Kayıtlar kişi bazında reklamla EŞLEŞMEZ. Reklam etkisi, reklamlı günlerin reklamsız
 *   dönemle karşılaştırılmasıyla okunur.
 * - Abonelik dokümanı geçmişi değil SON durumu tutar; "şu an deneme / ücretli" anlık görüntüdür.
 * - Test satın almaları (Apple Sandbox, Google testPurchase) ayrı sayılır, gerçek sayılara katılmaz.
 * - `--exclude` dosyasındaki UID'ler, `pilotCohort` alanı olanlar ve `.test` e-postalı hesaplar dışlanır.
 */

import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';
import { classifySubscription, toDate } from './lib/subscriptionStatus.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- argümanlar ----------
function parseArgs(argv) {
  const args = { csv: false, exclude: null, project: null, from: null, to: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--csv') args.csv = true;
    else if (a === '--from') args.from = argv[++i];
    else if (a === '--to') args.to = argv[++i];
    else if (a === '--exclude') args.exclude = argv[++i];
    else if (a === '--project') args.project = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`Bilinmeyen argüman: ${a}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
if (args.help || !DATE_RE.test(args.from ?? '') || !DATE_RE.test(args.to ?? '')) {
  console.error('Kullanım: node scripts/ad-funnel-report.mjs --from YYYY-AA-GG --to YYYY-AA-GG [--csv] [--exclude dosya] [--project id]');
  process.exit(args.help ? 0 : 1);
}

// Türkiye 2016'dan beri sabit UTC+3.
const TR_OFFSET_MS = 3 * 60 * 60 * 1000;
const fromUtc = new Date(Date.parse(`${args.from}T00:00:00Z`) - TR_OFFSET_MS);
const toUtcExclusive = new Date(Date.parse(`${args.to}T00:00:00Z`) - TR_OFFSET_MS + DAY_MS);

function trDay(date) {
  return new Date(date.getTime() + TR_OFFSET_MS).toISOString().slice(0, 10);
}


const excluded = new Set();
if (args.exclude) {
  for (const line of readFileSync(args.exclude, 'utf8').split(/\r?\n/)) {
    const uid = line.trim();
    if (uid && !uid.startsWith('#')) excluded.add(uid);
  }
}

// ---------- Firestore ----------
admin.initializeApp(args.project ? { projectId: args.project } : undefined);
const db = admin.firestore();

async function main() {
  const now = new Date();
  const userSnap = await db
    .collection('users')
    .where('createdAt', '>=', fromUtc)
    .where('createdAt', '<', toUtcExclusive)
    .get();

  const users = [];
  let skipped = 0;
  for (const doc of userSnap.docs) {
    const data = doc.data();
    const email = String(data.email ?? '').toLowerCase();
    if (excluded.has(doc.id) || data.pilotCohort || email.endsWith('.test')) {
      skipped++;
      continue;
    }
    const createdAt = toDate(data.createdAt);
    if (!createdAt) continue;
    users.push({ uid: doc.id, day: trDay(createdAt), provider: data.provider ?? 'unknown' });
  }

  // Çocuk profilleri (parentUid 'in' sorgusu en fazla 30 değer alır).
  const childrenByParent = new Map();
  for (let i = 0; i < users.length; i += 30) {
    const batch = users.slice(i, i + 30).map((u) => u.uid);
    const snap = await db.collection('children').where('parentUid', 'in', batch).get();
    for (const c of snap.docs) {
      const d = c.data();
      const list = childrenByParent.get(d.parentUid) ?? [];
      list.push({ completedLessons: Number(d.completedLessons ?? 0), lastActivityDate: d.lastActivityDate ?? '' });
      childrenByParent.set(d.parentUid, list);
    }
  }

  const rows = new Map();
  const blank = (day) => ({
    day, accounts: 0, guests: 0, profile: 0, firstLesson: 0, threeLessons: 0, returned: 0,
    subscribed: 0, trial: 0, paid: 0, canceledActive: 0, ended: 0, refunded: 0, testPurchases: 0,
  });
  for (let t = Date.parse(`${args.from}T00:00:00Z`); t <= Date.parse(`${args.to}T00:00:00Z`); t += DAY_MS) {
    const day = new Date(t).toISOString().slice(0, 10);
    rows.set(day, blank(day));
  }

  for (const u of users) {
    const r = rows.get(u.day) ?? blank(u.day);
    rows.set(u.day, r);
    r.accounts++;
    if (u.provider === 'anonymous') r.guests++;

    const kids = childrenByParent.get(u.uid) ?? [];
    if (kids.length) r.profile++;
    const lessons = kids.reduce((n, k) => n + k.completedLessons, 0);
    if (lessons >= 1) r.firstLesson++;
    if (lessons >= 3) r.threeLessons++;
    if (kids.some((k) => k.lastActivityDate && k.lastActivityDate > u.day)) r.returned++;

    const subs = await db.collection(`users/${u.uid}/subscriptions`).get();
    let realSub = false;
    const statuses = new Set();
    for (const s of subs.docs) {
      const c = classifySubscription(s.data(), now);
      if (c.test) { r.testPurchases++; continue; }
      realSub = true;
      statuses.add(c.status);
    }
    if (realSub) r.subscribed++;
    // Kullanıcı başına tek durum: en "değerli" olanı say.
    if (statuses.has('paid')) r.paid++;
    else if (statuses.has('trial')) r.trial++;
    else if (statuses.has('canceled_active')) r.canceledActive++;
    else if (statuses.has('refunded')) r.refunded++;
    else if (statuses.has('ended')) r.ended++;
  }

  const ordered = [...rows.values()].sort((a, b) => a.day.localeCompare(b.day));
  const total = ordered.reduce((acc, r) => {
    for (const k of Object.keys(acc)) if (k !== 'day') acc[k] += r[k];
    return acc;
  }, blank('TOPLAM'));

  const cols = [
    ['day', 'Gün'], ['accounts', 'Hesap'], ['guests', 'Misafir'], ['profile', 'Profil'],
    ['firstLesson', 'İlk ders'], ['threeLessons', '3+ ders'], ['returned', 'Geri geldi'],
    ['subscribed', 'Abonelik'], ['trial', 'Deneme'], ['paid', 'Ücretli'],
    ['canceledActive', 'İptal (süre var)'], ['ended', 'Bitti'], ['refunded', 'İade'],
    ['testPurchases', 'Test alımı'],
  ];

  if (args.csv) {
    console.log(cols.map(([, h]) => h).join(','));
    for (const r of [...ordered, total]) console.log(cols.map(([k]) => r[k]).join(','));
  } else {
    console.log(`NovaLingo huni raporu — kohort: hesap açılış günü (TR), ${args.from} → ${args.to}`);
    console.log(`Rapor zamanı: ${now.toISOString()} · dışlanan iç/test hesap: ${skipped}`);
    console.table([...ordered, total].map((r) => Object.fromEntries(cols.map(([k, h]) => [h, r[k]]))));
    const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');
    console.log(`Hesap → ilk ders: ${pct(total.firstLesson, total.accounts)} · ilk ders → geri geldi: ${pct(total.returned, total.firstLesson)} · hesap → abonelik: ${pct(total.subscribed, total.accounts)} · hesap → ücretli: ${pct(total.paid, total.accounts)}`);
    console.log('Not: Kayıtlar reklamla kişi bazında eşleşmez; reklamlı ve reklamsız dönemleri karşılaştırın. Abonelik durumları anlık görüntüdür.');
  }
}

main().catch((err) => {
  console.error('Rapor üretilemedi:', err.message);
  process.exit(1);
});
