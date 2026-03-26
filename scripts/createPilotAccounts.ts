/* eslint-disable */
/**
 * Pilot Test Account Setup Script
 *
 * Creates pilot test user accounts in Firebase Auth + Firestore.
 *
 * Usage (against emulator):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
 *   npx ts-node --esm scripts/createPilotAccounts.ts
 *
 * Usage (against production — requires service account):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
 *   npx ts-node --esm scripts/createPilotAccounts.ts
 *
 * Creates 5 parent accounts, each with 1 child profile:
 *   pilot1@novalingo.test → child "Ayşe" (cubs 4-6)
 *   pilot2@novalingo.test → child "Mert" (stars 7-9)
 *   pilot3@novalingo.test → child "Zeynep" (legends 10-12)
 *   pilot4@novalingo.test → child "Ali" (cubs 4-6)
 *   pilot5@novalingo.test → child "Elif" (stars 7-9)
 */

import admin from 'firebase-admin';

// ---------------------------------------------------------------------------
// Pilot account definitions
// ---------------------------------------------------------------------------

interface PilotAccount {
  email: string;
  password: string;
  displayName: string;
  child: {
    name: string;
    ageBand: 'cubs' | 'stars' | 'legends'; // maps to age groups
    age: number;
    avatarId: string;
  };
}

const PILOT_ACCOUNTS: PilotAccount[] = [
  {
    email: 'pilot1@novalingo.test',
    password: 'Pilot2024!',
    displayName: 'Pilot Ebeveyn 1',
    child: { name: 'Ayşe', ageBand: 'cubs', age: 5, avatarId: 'unicorn' },
  },
  {
    email: 'pilot2@novalingo.test',
    password: 'Pilot2024!',
    displayName: 'Pilot Ebeveyn 2',
    child: { name: 'Mert', ageBand: 'stars', age: 8, avatarId: 'lion' },
  },
  {
    email: 'pilot3@novalingo.test',
    password: 'Pilot2024!',
    displayName: 'Pilot Ebeveyn 3',
    child: { name: 'Zeynep', ageBand: 'legends', age: 11, avatarId: 'dragon' },
  },
  {
    email: 'pilot4@novalingo.test',
    password: 'Pilot2024!',
    displayName: 'Pilot Ebeveyn 4',
    child: { name: 'Ali', ageBand: 'cubs', age: 6, avatarId: 'fox' },
  },
  {
    email: 'pilot5@novalingo.test',
    password: 'Pilot2024!',
    displayName: 'Pilot Ebeveyn 5',
    child: { name: 'Elif', ageBand: 'stars', age: 9, avatarId: 'owl' },
  },
];

// ageBand label → ageGroup string used by the app
const AGE_BAND_TO_GROUP: Record<string, string> = {
  cubs: 'cubs',
  stars: 'stars',
  legends: 'legends',
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!admin.apps?.length) {
  admin.initializeApp({
    projectId: 'novalingo-app',
  });
}

const auth = admin.auth();
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function createPilotAccounts() {
  console.log('🚀 Creating pilot test accounts...\n');

  for (const account of PILOT_ACCOUNTS) {
    try {
      // 1. Create or get the auth user
      let uid: string;
      try {
        const existing = await auth.getUserByEmail(account.email);
        uid = existing.uid;
        console.log(`  ↩️  ${account.email} already exists (uid: ${uid})`);
      } catch {
        const created = await auth.createUser({
          email: account.email,
          password: account.password,
          displayName: account.displayName,
          emailVerified: true,
        });
        uid = created.uid;
        console.log(`  ✅ Created auth user: ${account.email} (uid: ${uid})`);
      }

      // 2. Create Firestore user document
      const childId = `child_${uid}_01`;
      const now = admin.firestore.Timestamp.now();

      await db.doc(`users/${uid}`).set(
        {
          uid,
          email: account.email,
          displayName: account.displayName,
          isPilot: true,
          subscription: { plan: 'premium', status: 'active' }, // Pilot gets premium
          createdAt: now,
          updatedAt: now,
          activeChildId: childId,
        },
        { merge: true },
      );

      // 3. Create child document
      await db.doc(`users/${uid}/children/${childId}`).set(
        {
          id: childId,
          name: account.child.name,
          age: account.child.age,
          ageGroup: AGE_BAND_TO_GROUP[account.child.ageBand],
          avatarId: account.child.avatarId,
          currentWorldId: 'world1',
          xp: 0,
          level: 1,
          streak: 0,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );

      console.log(
        `     👤 Child "${account.child.name}" (${account.child.ageBand}, age ${account.child.age}) created\n`,
      );
    } catch (err) {
      console.error(`  ❌ Error creating ${account.email}:`, err);
    }
  }

  console.log('✅ Pilot accounts setup complete!\n');
  console.log('📋 Account Summary:');
  console.log('─────────────────────────────────────────────────');
  for (const acc of PILOT_ACCOUNTS) {
    console.log(`  ${acc.email} / ${acc.password}`);
    console.log(`    → Child: ${acc.child.name}, age ${acc.child.age} (${acc.child.ageBand})`);
  }
  console.log('─────────────────────────────────────────────────');
}

createPilotAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
