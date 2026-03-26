const fs = require('fs');
const src = fs.readFileSync('src/features/learning/data/curriculum.ts', 'utf8');

const fields = ['objective', 'canDo', 'introLine', 'outroLine', 'outcomeTag'];

const lines = src.split('\n');
let currentWorld = '';
let lessons = [];
let braceDepth = 0;
let inLesson = false;
let lessonBlock = '';
let prevLine = '';

for (const line of lines) {
  const worldMatch = line.match(/const (world\d):/);
  if (worldMatch) currentWorld = worldMatch[1];

  if (line.match(/id:\s*['"]w\d+_u\d+_l\d+['"]/) && !inLesson) {
    inLesson = true;
    // Include the previous line which has the opening {
    lessonBlock = prevLine + '\n' + line;
    braceDepth = 0;
    for (const ch of lessonBlock) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0) {
      lessons.push({ world: currentWorld, block: lessonBlock });
      inLesson = false;
      lessonBlock = '';
    }
    prevLine = line;
    continue;
  }

  if (inLesson) {
    lessonBlock += '\n' + line;
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth <= 0) {
      lessons.push({ world: currentWorld, block: lessonBlock });
      inLesson = false;
      lessonBlock = '';
    }
  }
  prevLine = line;
}

const results = {};
for (const l of lessons) {
  const w = l.world;
  if (!results[w]) results[w] = { total: 0, complete: 0, withChunks: 0, missing: [] };
  results[w].total++;

  const block = l.block;
  const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
  const id = idMatch ? idMatch[1] : 'unknown';

  const missingFields = [];
  for (const f of fields) {
    // Match field: 'value' or `value` or "value"
    const pat = new RegExp(f + ':\\s*[\'"`]([^\'"`]*)[\'"`]');
    const m = block.match(pat);
    if (!m || m[1].trim() === '') {
      missingFields.push(f);
    }
  }

  // Check chunks
  const chunksMatch = block.match(/chunks:\s*\[([^\]]*)\]/s);
  if (chunksMatch && chunksMatch[1].trim().length > 0) {
    results[w].withChunks++;
  }

  if (missingFields.length === 0) {
    results[w].complete++;
  } else {
    results[w].missing.push({ id, missingFields });
  }
}

let grandTotal = 0,
  grandComplete = 0,
  grandChunks = 0,
  grandMissing = 0;

for (const [w, r] of Object.entries(results)) {
  console.log('\n=== ' + w.toUpperCase() + ' ===');
  console.log('Total lessons: ' + r.total);
  console.log('Complete (all 5 fields): ' + r.complete);
  console.log('With non-empty chunks: ' + r.withChunks);
  grandTotal += r.total;
  grandComplete += r.complete;
  grandChunks += r.withChunks;
  grandMissing += r.missing.length;
  if (r.missing.length > 0) {
    console.log('Incomplete lessons (' + r.missing.length + '):');
    for (const m of r.missing) {
      console.log('  ' + m.id + '  →  missing: ' + m.missingFields.join(', '));
    }
  } else {
    console.log('✅ All lessons complete!');
  }
}

console.log('\n=== GRAND TOTAL ===');
console.log('Total lessons across all worlds: ' + grandTotal);
console.log(
  'Fully complete: ' + grandComplete + ' (' + Math.round((grandComplete / grandTotal) * 100) + '%)',
);
console.log(
  'With chunks: ' + grandChunks + ' (' + Math.round((grandChunks / grandTotal) * 100) + '%)',
);
console.log('Incomplete: ' + grandMissing);
