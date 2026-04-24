#!/usr/bin/env python3
"""
Pre-generate TTS audio for all English text in the NovaLingo curriculum.

Parses TypeScript data files, extracts all speakable English text,
generates MP3 via edge-tts (Microsoft Neural TTS), and creates
an audioManifest.ts for the app to use.

Usage:
    .venv/bin/python scripts/generate-audio.py

Install dependencies:
    .venv/bin/python -m pip install -r scripts/requirements.txt
"""

import asyncio
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# edge-tts import
try:
    import edge_tts
except ImportError:
    print("ERROR: edge-tts not installed. Run: .venv/bin/python -m pip install -r scripts/requirements.txt")
    sys.exit(1)

# ===== CONFIG =====
VOICE = "en-US-AnaNeural"  # Clear, friendly child voice
RATE = "-5%"  # Slightly slower for children
VOLUME = "+0%"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio" / "tts"
MANIFEST_PATH = Path(__file__).parent.parent / "src" / "services" / "speech" / "audioManifest.ts"
DATA_DIR = Path(__file__).parent.parent / "src" / "features" / "learning" / "data"
STORYBANK_PATH = DATA_DIR / "storyBank.ts"
CONVERSATION_REGISTRY_DIR = DATA_DIR / "conversations" / "registry"
CONCURRENCY = 8  # Parallel generation limit
MAX_RETRIES = 3


def text_hash(text: str) -> str:
    """Generate a 16-char hex hash from normalized text for filenames."""
    normalized = text.strip().lower()
    return hashlib.md5(normalized.encode("utf-8")).hexdigest()[:16]


def normalize_key(text: str) -> str:
    """Normalize text for manifest key lookup."""
    return text.strip().lower()


# ===== TEXT EXTRACTION =====

def extract_vocabdb(content: str) -> list[dict]:
    """Extract all vocabDB entries from activityGenerator.ts"""
    entries = []

    # Find vocabDB block (from 'const vocabDB' to the closing '};')
    match = re.search(r"const vocabDB:\s*Record<string,\s*VocabEntry>\s*=\s*\{", content)
    if not match:
        print("WARNING: Could not find vocabDB")
        return entries

    start = match.end()
    # Find matching closing brace
    brace_count = 1
    pos = start
    while pos < len(content) and brace_count > 0:
        if content[pos] == "{":
            brace_count += 1
        elif content[pos] == "}":
            brace_count -= 1
        pos += 1

    vocab_block = content[match.start():pos]

    # Extract each word entry
    # Pattern: 'word': { ... } or word: { ... }
    word_pattern = re.compile(
        r"(?:^|\n)\s*(?:'([^']+)'|\"([^\"]+)\"|(\w[\w\s]*?))\s*:\s*\{",
        re.MULTILINE,
    )

    for m in word_pattern.finditer(vocab_block):
        word = m.group(1) or m.group(2) or m.group(3)
        if not word or word in ("tr", "sentence", "sentenceTr", "emoji", "altSentences", "en"):
            continue
        word = word.strip()
        entries.append({"type": "word", "text": word})

    # Extract all sentence: '...' values
    sentence_pattern = re.compile(r"sentence:\s*['\"](.+?)['\"]", re.MULTILINE)
    for m in sentence_pattern.finditer(vocab_block):
        entries.append({"type": "sentence", "text": m.group(1)})

    # Extract all en: '...' from altSentences
    alt_pattern = re.compile(r"en:\s*['\"](.+?)['\"]", re.MULTILINE)
    for m in alt_pattern.finditer(vocab_block):
        entries.append({"type": "alt_sentence", "text": m.group(1)})

    return entries


def extract_story_templates(content: str) -> list[dict]:
    """Extract story page texts from STORY_TEMPLATES in activityGenerator.ts"""
    entries = []

    # Find all text: '...' within STORY_TEMPLATES
    match = re.search(r"const STORY_TEMPLATES", content)
    if not match:
        return entries

    # Get everything from STORY_TEMPLATES to end of file
    story_block = content[match.start():]

    # Extract page text values - handle both single and double quotes, including multi-line
    text_pattern = re.compile(
        r"text:\s*'((?:[^'\\]|\\.)*)'|text:\s*\"((?:[^\"\\]|\\.)*)\"",
        re.MULTILINE,
    )
    for m in text_pattern.finditer(story_block):
        text = m.group(1) or m.group(2)
        if text:
            entries.append({"type": "story_page", "text": text})

    return entries


def extract_comprehension_passages(filepath: Path) -> list[dict]:
    """Extract passage texts from comprehensionTemplates.ts"""
    entries = []
    content = filepath.read_text(encoding="utf-8")

    # Match passage: '...' (may span continuation with +)
    # These are typically single-line strings
    passage_pattern = re.compile(
        r"passage:\s*\n?\s*'((?:[^'\\]|\\.)*)'|passage:\s*\n?\s*\"((?:[^\"\\]|\\.)*)\"",
        re.MULTILINE,
    )
    for m in passage_pattern.finditer(content):
        text = m.group(1) or m.group(2)
        if text:
            entries.append({"type": "passage", "text": text})

    return entries


def extract_grammar_sentences(filepath: Path) -> list[dict]:
    """Extract source and correct sentences from grammarPatterns.ts"""
    entries = []
    content = filepath.read_text(encoding="utf-8")

    source_pattern = re.compile(r"source:\s*'((?:[^'\\]|\\.)*)'", re.MULTILINE)
    correct_pattern = re.compile(r"correct:\s*'((?:[^'\\]|\\.)*)'", re.MULTILINE)

    for m in source_pattern.finditer(content):
        entries.append({"type": "grammar_source", "text": m.group(1)})

    for m in correct_pattern.finditer(content):
        entries.append({"type": "grammar_correct", "text": m.group(1)})

    return entries


def extract_storybank_pages(filepath: Path) -> list[dict]:
    """Extract story page text values from storyBank.ts."""
    entries = []
    content = filepath.read_text(encoding="utf-8")

    text_pattern = re.compile(
        r"text:\s*'((?:[^'\\]|\\.)*)'|text:\s*\"((?:[^\"\\]|\\.)*)\"",
        re.MULTILINE,
    )

    for m in text_pattern.finditer(content):
        text = m.group(1) or m.group(2)
        if text:
            entries.append({"type": "storybank_page", "text": text})

    return entries


def extract_conversation_registry_texts(registry_dir: Path) -> list[dict]:
    """Extract spoken prompt text from conversation registry scenario files."""
    entries = []
    text_pattern = re.compile(
        r"(?<![A-Za-z])text:\s*'((?:[^'\\]|\\.)*)'|(?<![A-Za-z])text:\s*\"((?:[^\"\\]|\\.)*)\"",
        re.MULTILINE,
    )

    for filepath in registry_dir.rglob("*.ts"):
        if any(part.startswith("._") or part.startswith(".") for part in filepath.parts):
            continue
        content = filepath.read_text(encoding="utf-8")
        for m in text_pattern.finditer(content):
            text = m.group(1) or m.group(2)
            if text:
                entries.append({"type": "conversation_prompt", "text": text})

    return entries


def extract_all_texts() -> dict[str, dict]:
    """Extract and deduplicate all English texts needing TTS."""
    ag_path = DATA_DIR / "activityGenerator.ts"
    comp_path = DATA_DIR / "comprehensionTemplates.ts"
    gram_path = DATA_DIR / "grammarPatterns.ts"

    ag_content = ag_path.read_text(encoding="utf-8")

    all_entries = []
    all_entries.extend(extract_vocabdb(ag_content))
    all_entries.extend(extract_story_templates(ag_content))
    all_entries.extend(extract_comprehension_passages(comp_path))
    all_entries.extend(extract_grammar_sentences(gram_path))
    all_entries.extend(extract_storybank_pages(STORYBANK_PATH))
    all_entries.extend(extract_conversation_registry_texts(CONVERSATION_REGISTRY_DIR))

    # Unescape TypeScript string escapes (e.g. \' → ')
    for entry in all_entries:
        entry["text"] = entry["text"].replace("\\'", "'")

    # Deduplicate by normalized text
    unique = {}
    for entry in all_entries:
        key = normalize_key(entry["text"])
        if key and key not in unique:
            unique[key] = entry

    return unique


# ===== AUDIO GENERATION =====

async def generate_single(text: str, output_path: Path, semaphore: asyncio.Semaphore) -> bool:
    """Generate a single MP3 file using edge-tts."""
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                communicate = edge_tts.Communicate(text, VOICE, rate=RATE, volume=VOLUME)
                await communicate.save(str(output_path))
                return True
            except Exception as e:
                if output_path.exists() and output_path.stat().st_size <= 100:
                    output_path.unlink(missing_ok=True)

                if attempt < MAX_RETRIES:
                    wait_seconds = attempt * 1.5
                    print(
                        f"  RETRY {attempt}/{MAX_RETRIES - 1} for '{text[:50]}...' after error: {e}"
                    )
                    await asyncio.sleep(wait_seconds)
                    continue

                print(f"  ERROR generating '{text[:50]}...': {e}")
                return False


async def generate_all(texts: dict[str, dict]) -> dict[str, str]:
    """Generate MP3 files for all texts. Returns mapping of normalized_text -> filename."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {}
    tasks = []
    semaphore = asyncio.Semaphore(CONCURRENCY)

    total = len(texts)
    generated = 0
    skipped = 0

    for norm_text, entry in texts.items():
        filename = f"{text_hash(norm_text)}.mp3"
        output_path = OUTPUT_DIR / filename

        # Skip if already generated
        if output_path.exists() and output_path.stat().st_size > 100:
            manifest[norm_text] = filename
            skipped += 1
            continue

        manifest[norm_text] = filename

        async def gen(t=entry["text"], p=output_path):
            nonlocal generated
            success = await generate_single(t, p, semaphore)
            if success:
                generated += 1
                if generated % 50 == 0:
                    print(f"  Progress: {generated}/{total - skipped} generated...")

        tasks.append(gen())

    if skipped:
        print(f"  Skipping {skipped} already-generated files")

    if tasks:
        print(f"  Generating {len(tasks)} audio files...")
        await asyncio.gather(*tasks)
        print(f"  Done! {generated} files generated.")
    else:
        print("  All files already exist!")

    return manifest


def write_manifest(manifest: dict[str, str]):
    """Write audioManifest.ts with text-to-filename mapping."""
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Sort for deterministic output
    sorted_items = sorted(manifest.items())

    lines = [
        "/**",
        " * Audio Manifest — Auto-generated by scripts/generate-audio.py",
        " * Maps normalized English text → pre-recorded MP3 filename.",
        f" * Total entries: {len(sorted_items)}",
        " *",
        " * DO NOT EDIT MANUALLY — regenerate with: python3 scripts/generate-audio.py",
        " */",
        "",
        "const AUDIO_MANIFEST: Record<string, string> = {",
    ]

    for norm_text, filename in sorted_items:
        # Escape single quotes in text for JS single-quoted strings
        escaped = norm_text.replace("'", "\\'")
        lines.append(f"  '{escaped}': '{filename}',")

    lines.extend([
        "};",
        "",
        "/**",
        " * Look up a pre-recorded audio URL for the given text.",
        " * Returns the URL path if found, undefined otherwise.",
        " */",
        "export function getPreRecordedUrl(text: string): string | undefined {",
        "  const key = text.trim().toLowerCase();",
        "  const filename = AUDIO_MANIFEST[key];",
        "  return filename ? `/audio/tts/${filename}` : undefined;",
        "}",
        "",
    ])

    MANIFEST_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✅ Manifest written: {MANIFEST_PATH}")
    print(f"   {len(sorted_items)} entries")


# ===== MAIN =====

async def main():
    print("🔊 NovaLingo Audio Generator")
    print("=" * 50)
    print(f"Voice: {VOICE}")
    print(f"Rate: {RATE}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    # Step 1: Extract texts
    print("📝 Step 1: Extracting texts from curriculum data...")
    texts = extract_all_texts()

    # Stats by type
    type_counts = {}
    for entry in texts.values():
        t = entry["type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    for t, c in sorted(type_counts.items()):
        print(f"  {t}: {c}")
    print(f"  TOTAL unique texts: {len(texts)}")
    print()

    # Step 2: Generate audio
    print("🎵 Step 2: Generating MP3 files with edge-tts...")
    manifest = await generate_all(texts)
    print()

    # Step 3: Write manifest
    print("📋 Step 3: Writing audioManifest.ts...")
    write_manifest(manifest)

    # Step 4: Size report
    total_size = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.mp3"))
    print(f"\n📊 Total audio size: {total_size / 1024 / 1024:.1f} MB")
    print(f"   Files: {len(list(OUTPUT_DIR.glob('*.mp3')))}")
    print(f"\n✨ Done! Now update speechService.ts to use pre-recorded audio.")


if __name__ == "__main__":
    asyncio.run(main())
