import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const noLaunch = args.has('--no-launch');
const help = args.has('--help') || args.has('-h');

const repoRoot = process.cwd();
const gradlew = resolve(repoRoot, 'android/gradlew');
const apkPath = resolve(repoRoot, 'android/app/build/outputs/apk/debug/app-debug.apk');
const appId = 'com.novalingo.app';
const activityName = `${appId}/.MainActivity`;

function printHelp() {
  console.log('Usage: node scripts/android-device-staging.mjs [--dry-run] [--no-launch]');
  console.log('');
  console.log('Runs the full staging Android device flow:');
  console.log('1. pnpm run smoke:cap:staging');
  console.log('2. pnpm run cap:build:android:staging');
  console.log('3. ./android/gradlew assembleDebug');
  console.log('4. adb install -r app-debug.apk');
  console.log('5. adb shell am start -n com.novalingo.app/.MainActivity');
}

function run(command, commandArgs, options = {}) {
  const rendered = [command, ...commandArgs].join(' ');
  console.log(`\n$ ${rendered}`);

  if (dryRun) {
    return;
  }

  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function commandExists(command, checkArgs = ['--version']) {
  const result = spawnSync(command, checkArgs, {
    cwd: repoRoot,
    stdio: 'ignore',
    shell: false,
    env: process.env,
  });
  return result.status === 0;
}

if (help) {
  printHelp();
  process.exit(0);
}

if (!existsSync(gradlew)) {
  console.error(`[android:device:staging] Missing Gradle wrapper: ${gradlew}`);
  process.exit(1);
}

if (!dryRun && !commandExists('adb')) {
  console.error(
    '[android:device:staging] `adb` was not found in PATH. Open Android Studio once or export platform-tools into PATH.',
  );
  process.exit(1);
}

console.log('[android:device:staging] Preparing staging Android device build...');

run('pnpm', ['run', 'smoke:cap:staging']);
run('pnpm', ['run', 'cap:build:android:staging']);
run('./gradlew', ['assembleDebug'], { cwd: resolve(repoRoot, 'android') });

if (!dryRun && !existsSync(apkPath)) {
  console.error(`[android:device:staging] APK not found after build: ${apkPath}`);
  process.exit(1);
}

run('adb', ['devices']);
run('adb', ['install', '-r', apkPath]);

if (!noLaunch) {
  run('adb', ['shell', 'am', 'start', '-n', activityName]);
}

console.log(`\n[android:device:staging] OK: ${apkPath}`);
if (noLaunch) {
  console.log('[android:device:staging] Launch skipped because --no-launch was passed.');
}
