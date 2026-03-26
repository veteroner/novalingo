const fs = require('fs');
const path = require('path');

const files = [
  'colors/paintNovasRoom.ts',
  'colors/shapeAndColorBox.ts',
  'emotions/cheerUpNova.ts',
  'emotions/howDoYouFeel.ts',
  'emotions/myFavoriteColorAndAnimal.ts',
  'food/healthyOrYummy.ts',
  'food/picnicBasket.ts',
  'food/restaurantHelper.ts',
  'routine/bedtimeWindDown.ts',
  'routine/getReadyInTheMorning.ts',
  'routine/packMySchoolBag.ts',
  'toys/buildAPlayTeam.ts',
  'toys/fixTheBrokenToy.ts',
  'toys/toyShopChoice.ts',
];

const basePath =
  '/Volumes/LaCie/novalingo/src/features/learning/data/conversations/registry/phase1';

let totalRepairs = 0;
let totalHints = 0;

for (const file of files) {
  const filePath = path.join(basePath, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileRepairs = 0;
  let fileHints = 0;

  let searchFrom = 0;
  while (true) {
    const idx = content.indexOf('responses: [', searchFrom);
    if (idx === -1) break;

    // Get line start and indent
    let lineStart = content.lastIndexOf('\n', idx);
    lineStart = lineStart < 0 ? 0 : lineStart + 1;
    const indent = content.substring(lineStart, idx);

    // Only process if indent is pure whitespace (node-level property)
    if (!/^\s+$/.test(indent)) {
      searchFrom = idx + 12;
      continue;
    }

    // Check preceding ~500 chars for existing repair/hint
    const windowStart = Math.max(0, idx - 500);
    const windowText = content.substring(windowStart, idx);
    const hasRepair = windowText.includes('repair:');
    const hasHint = windowText.includes('hint:');

    if (hasRepair) {
      searchFrom = idx + 12;
      continue;
    }

    // Extract first expectedText from the responses array
    const chunk = content.substring(idx, Math.min(idx + 800, content.length));
    const m = chunk.match(/expectedText:\s*'([^']*)'/);
    if (!m) {
      searchFrom = idx + 12;
      continue;
    }
    const text = m[1];

    // Build repair block
    const repair =
      indent +
      'repair: {\n' +
      indent +
      '  enabled: true,\n' +
      indent +
      "  prompt: 'Say: " +
      text +
      "',\n" +
      indent +
      "  promptTr: '\u015E\u00F6yle s\u00F6yle: " +
      text +
      "',\n" +
      indent +
      '  maxRetries: 2,\n' +
      indent +
      '},\n';

    // Build hint block
    const hint =
      indent +
      'hint: {\n' +
      indent +
      '  delayMs: 8000,\n' +
      indent +
      "  text: 'Try saying: " +
      text +
      "',\n" +
      indent +
      "  textTr: '\u015E\u00F6yle s\u00F6ylemeyi dene: " +
      text +
      "',\n" +
      indent +
      '  revealPattern: true,\n' +
      indent +
      '},\n';

    if (!hasHint) {
      // Insert both repair + hint before responses line
      const insertText = repair + hint;
      content = content.slice(0, lineStart) + insertText + content.slice(lineStart);
      searchFrom = lineStart + insertText.length + 12;
      fileRepairs++;
      fileHints++;
    } else {
      // Has existing hint but no repair — insert repair before hint
      const hintPos = content.lastIndexOf('hint:', idx);
      if (hintPos >= windowStart) {
        let hintLineStart = content.lastIndexOf('\n', hintPos);
        hintLineStart = hintLineStart < 0 ? 0 : hintLineStart + 1;
        content = content.slice(0, hintLineStart) + repair + content.slice(hintLineStart);
        searchFrom = hintLineStart + repair.length + 200;
        fileRepairs++;
      } else {
        searchFrom = idx + 12;
      }
    }
  }

  fs.writeFileSync(filePath, content);
  totalRepairs += fileRepairs;
  totalHints += fileHints;
  console.log(`${file}: +${fileRepairs} repair(s), +${fileHints} hint(s)`);
}

console.log(`\nTotal: +${totalRepairs} repairs, +${totalHints} hints across ${files.length} files`);
