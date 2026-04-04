#!/usr/bin/env python3
"""
Generate audio + illustration images for every story page in storyBank.ts.

Produces:
  public/audio/tts/{hash}.mp3              — TTS audio (edge-tts, en-US-AnaNeural)
  public/story/{story-id}-p{n}.jpg         — Illustrated card (Pillow)

Then patches storyBank.ts in-place with the actual URLs, and appends
new entries to src/services/speech/audioManifest.ts.

Usage:
    python3 scripts/generate-story-assets.py

Dependencies (already in requirements.txt):
    edge-tts >= 7.0
    Pillow >= 9.2
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import sys
import textwrap
from pathlib import Path
from typing import TypedDict

try:
    import edge_tts
except ImportError:
    print("ERROR: edge-tts not installed. Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install -r scripts/requirements.txt")
    sys.exit(1)

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
STORYBANK_PATH = ROOT / "src" / "features" / "learning" / "data" / "storyBank.ts"
AUDIO_DIR = ROOT / "public" / "audio" / "tts"
IMAGE_DIR = ROOT / "public" / "story"
MANIFEST_PATH = ROOT / "src" / "services" / "speech" / "audioManifest.ts"

# ─── TTS Config ───────────────────────────────────────────────────────────────
VOICE = "en-US-AnaNeural"
RATE = "-5%"
CONCURRENCY = 6

# ─── Image Config ─────────────────────────────────────────────────────────────
IMG_W, IMG_H = 800, 480
FONT_PATH = "/System/Library/Fonts/Helvetica.ttc"

# Theme → (background_hex, panel_hex, text_hex, accent_hex)
THEME_COLORS: dict[str, tuple[str, str, str, str]] = {
    "animals":             ("#2e7d32", "#e8f5e9", "#1b5e20", "#a5d6a7"),
    "colors":              ("#6a1b9a", "#f3e5f5", "#4a148c", "#ce93d8"),
    "numbers":             ("#1565c0", "#e3f2fd", "#0d47a1", "#90caf9"),
    "food":                ("#e65100", "#fff3e0", "#bf360c", "#ffcc80"),
    "home":                ("#f57f17", "#fffde7", "#e65100", "#ffe082"),
    "body":                ("#ad1457", "#fce4ec", "#880e4f", "#f48fb1"),
    "toys":                ("#0288d1", "#e1f5fe", "#01579b", "#80deea"),
    "review":              ("#37474f", "#eceff1", "#263238", "#b0bec5"),
    "nature":              ("#00695c", "#e0f2f1", "#004d40", "#80cbc4"),
    "school":              ("#283593", "#e8eaf6", "#1a237e", "#9fa8da"),
    "transportation":      ("#1b5e20", "#f1f8e9", "#33691e", "#c5e1a5"),
    "clothes":             ("#880e4f", "#fce4ec", "#4a148c", "#f48fb1"),
    "family":              ("#b71c1c", "#ffebee", "#7f0000", "#ef9a9a"),
    "daily-routine":       ("#4527a0", "#ede7f6", "#311b92", "#b39ddb"),
    "nature-exploration":  ("#2e7d32", "#f1f8e9", "#1b5e20", "#a5d6a7"),
    "grammar-tobe":        ("#0d47a1", "#e3f2fd", "#01579b", "#64b5f6"),
    "actions":             ("#e65100", "#fff8e1", "#bf360c", "#ffe57f"),
    "adjectives":          ("#6a1b9a", "#ede7f6", "#4a148c", "#ce93d8"),
    "helpers":             ("#0277bd", "#e1f5fe", "#01579b", "#81d4fa"),
    "greetings":           ("#558b2f", "#f9fbe7", "#33691e", "#dce775"),
    "default":             ("#455a64", "#eceff1", "#263238", "#b0bec5"),
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def text_hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()[:16]


def normalize_key(text: str) -> str:
    return text.strip().lower()


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    try:
        idx = 1 if bold else 0
        return ImageFont.truetype(FONT_PATH, size, index=idx)
    except Exception:
        return ImageFont.load_default()


# ─── Story Parsing ────────────────────────────────────────────────────────────

class StoryPage(TypedDict):
    story_id: str
    theme: str
    page_num: int   # 1-based
    text: str
    highlight_words: list[str]
    image_url: str  # filled after image generation
    audio_url: str  # filled after audio generation


def parse_storybank(content: str) -> list[StoryPage]:
    """
    Extract all story pages from storyBank.ts.
    Returns pages in file order (important for sequential patching).
    """
    pages: list[StoryPage] = []

    # Split into story blocks. Each story starts with: id: 'story-...'
    story_split = re.split(r"(?=\n\s*\{[^}]*?id:\s*['\"]story-)", content)

    for block in story_split:
        # Extract story id
        id_m = re.search(r"id:\s*['\"]([^'\"]+)['\"]", block)
        if not id_m:
            continue
        story_id = id_m.group(1)
        if not story_id.startswith("story-"):
            continue

        # Extract theme
        theme_m = re.search(r"theme:\s*['\"]([^'\"]+)['\"]", block)
        theme = theme_m.group(1) if theme_m else "default"

        # Find pages array within this story's data block
        pages_start = block.find("pages:")
        if pages_start < 0:
            continue
        pages_block = block[pages_start:]

        # Extract individual page objects
        # Each page: { text: '...', translation: '...', imageUrl: '', audioUrl: '', highlightWords: [...] }
        page_pattern = re.compile(
            r"\{\s*"
            r"text:\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\")"
            r".*?"
            r"highlightWords:\s*\[([^\]]*)\]",
            re.DOTALL,
        )

        page_num = 0
        for m in page_pattern.finditer(pages_block):
            text = m.group(1) if m.group(1) is not None else m.group(2)
            if not text:
                continue
            # Unescape any escape sequences
            text = text.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")

            raw_words = m.group(3)
            hw = [w.strip().strip("'\"") for w in raw_words.split(",") if w.strip().strip("'\"")]

            page_num += 1
            pages.append(StoryPage(
                story_id=story_id,
                theme=theme,
                page_num=page_num,
                text=text,
                highlight_words=hw,
                image_url="",
                audio_url="",
            ))

    return pages


# ─── Image Generation ─────────────────────────────────────────────────────────

def draw_story_card(
    story_id: str,
    page_num: int,
    text: str,
    highlight_words: list[str],
    theme: str,
) -> Image.Image:
    colors = THEME_COLORS.get(theme, THEME_COLORS["default"])
    bg_rgb   = hex_to_rgb(colors[0])
    panel_rgb = hex_to_rgb(colors[1])
    text_rgb  = hex_to_rgb(colors[2])
    accent_rgb = hex_to_rgb(colors[3])

    img = Image.new("RGB", (IMG_W, IMG_H), bg_rgb)
    draw = ImageDraw.Draw(img)

    # Decorative background blobs (large circles)
    draw.ellipse([-80, -80, 220, 220], fill=(*accent_rgb, 60))
    draw.ellipse([IMG_W - 150, IMG_H - 150, IMG_W + 80, IMG_H + 80], fill=(*accent_rgb, 60))
    draw.ellipse([IMG_W - 100, -60, IMG_W + 60, 100], fill=(*accent_rgb, 40))

    # White panel in center-top for highlight words
    panel_margin = 40
    panel_top = 40
    panel_bottom = IMG_H - 130
    draw.rounded_rectangle(
        [panel_margin, panel_top, IMG_W - panel_margin, panel_bottom],
        radius=28,
        fill=panel_rgb,
    )

    # Highlight words — large bold text
    hw_font_size = 52 if len(highlight_words) <= 2 else 40
    hw_font = load_font(hw_font_size, bold=True)
    hw_text = "  ·  ".join(w.upper() for w in highlight_words[:3])
    # Measure and center
    bbox = draw.textbbox((0, 0), hw_text, font=hw_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    panel_center_y = panel_top + (panel_bottom - panel_top) // 2
    hw_x = (IMG_W - tw) // 2 - bbox[0]
    hw_y = panel_center_y - th // 2 - bbox[1]
    draw.text((hw_x, hw_y), hw_text, font=hw_font, fill=text_rgb)

    # Story text — bottom banner
    banner_top = IMG_H - 115
    draw.rounded_rectangle(
        [0, banner_top, IMG_W, IMG_H],
        radius=0,
        fill=(*bg_rgb,),
    )
    # Slightly lighter strip
    draw.rectangle([0, banner_top, IMG_W, banner_top + 2], fill=(*accent_rgb,))

    small_font = load_font(22, bold=False)
    # Wrap text to fit width
    wrapped = textwrap.fill(text, width=72)
    lines = wrapped.split("\n")
    line_h = 28
    total_h = len(lines) * line_h
    y_start = banner_top + (IMG_H - banner_top - total_h) // 2
    for line in lines:
        lb = draw.textbbox((0, 0), line, font=small_font)
        lw = lb[2] - lb[0]
        draw.text(
            ((IMG_W - lw) // 2 - lb[0], y_start - lb[1]),
            line,
            font=small_font,
            fill=panel_rgb,
        )
        y_start += line_h

    # Page indicator dot (top-right of panel)
    dot_x = IMG_W - panel_margin - 20
    dot_y = panel_top + 20
    dot_r = 14
    draw.ellipse([dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r], fill=text_rgb)
    num_font = load_font(16, bold=True)
    nb = draw.textbbox((0, 0), str(page_num), font=num_font)
    draw.text(
        (dot_x - (nb[2] - nb[0]) // 2 - nb[0], dot_y - (nb[3] - nb[1]) // 2 - nb[1]),
        str(page_num),
        font=num_font,
        fill=panel_rgb,
    )

    return img


def save_image(story_id: str, page_num: int, theme: str, text: str, highlight_words: list[str]) -> str:
    filename = f"{story_id}-p{page_num}.jpg"
    out_path = IMAGE_DIR / filename
    if out_path.exists():
        return f"/story/{filename}"
    img = draw_story_card(story_id, page_num, text, highlight_words, theme)
    img.save(str(out_path), "JPEG", quality=88, optimize=True)
    return f"/story/{filename}"


# ─── Audio Generation ─────────────────────────────────────────────────────────

async def generate_one(text: str, out_path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(out_path))


async def generate_audio_batch(pages: list[StoryPage]) -> dict[str, str]:
    """Generate TTS for each unique text. Returns text → audio_url mapping."""
    # Deduplicate
    unique_texts: dict[str, str] = {}  # text → hash
    for p in pages:
        h = text_hash(p["text"])
        unique_texts[p["text"]] = h

    sem = asyncio.Semaphore(CONCURRENCY)

    async def safe_gen(text: str, h: str) -> tuple[str, str]:
        out_path = AUDIO_DIR / f"{h}.mp3"
        if out_path.exists():
            print(f"  [audio] skip (exists): {text[:50]}")
            return text, f"/audio/tts/{h}.mp3"
        print(f"  [audio] generating: {text[:55]}...")
        async with sem:
            try:
                await generate_one(text, out_path)
            except Exception as e:
                print(f"  [audio] ERROR for '{text[:40]}': {e}")
                return text, ""
        return text, f"/audio/tts/{h}.mp3"

    tasks = [safe_gen(text, h) for text, h in unique_texts.items()]
    results = await asyncio.gather(*tasks)
    return dict(results)


# ─── Manifest Update ──────────────────────────────────────────────────────────

def update_manifest(pages: list[StoryPage]) -> None:
    content = MANIFEST_PATH.read_text(encoding="utf-8")

    # Find existing keys
    existing_keys: set[str] = set()
    for m in re.finditer(r"^\s*'(.+?)':", content, re.MULTILINE):
        existing_keys.add(m.group(1))

    # Build new entries (skip existing)
    new_entries: list[str] = []
    for p in pages:
        if not p["audio_url"]:
            continue
        key = normalize_key(p["text"])
        if key not in existing_keys:
            h = text_hash(p["text"])
            filename = f"{h}.mp3"
            escaped_key = key.replace("'", "\\'")
            new_entries.append(f"  '{escaped_key}': '{filename}',")
            existing_keys.add(key)

    if not new_entries:
        print("[manifest] No new entries to add.")
        return

    # Insert before closing '};'
    close_pos = content.rfind("};")
    if close_pos < 0:
        print("[manifest] ERROR: could not find closing '};' in manifest")
        return

    insert_text = "\n".join(new_entries) + "\n"
    new_content = content[:close_pos] + insert_text + content[close_pos:]

    # Update entry count in header comment
    old_total_m = re.search(r"Total entries:\s*(\d+)", new_content)
    if old_total_m:
        old_count = int(old_total_m.group(1))
        new_count = old_count + len(new_entries)
        new_content = new_content.replace(
            f"Total entries: {old_count}",
            f"Total entries: {new_count}",
        )

    MANIFEST_PATH.write_text(new_content, encoding="utf-8")
    print(f"[manifest] Added {len(new_entries)} new entries.")


# ─── storyBank.ts Patching ────────────────────────────────────────────────────

def patch_storybank(
    content: str,
    pages: list[StoryPage],
) -> str:
    """
    Replace imageUrl: '', and audioUrl: '', in order.
    Uses str.replace(old, new, count=1) to advance through the file sequentially.
    """
    # Sanity checks
    img_count = content.count("imageUrl: '',")
    aud_count  = content.count("audioUrl: '',")
    print(f"[patch] Found {img_count} imageUrl:'' and {aud_count} audioUrl:'' placeholders")
    print(f"[patch] Have {len(pages)} pages to fill")

    if img_count != len(pages) or aud_count != len(pages):
        print(
            f"[patch] WARNING: counts do not match — "
            f"imageUrl: {img_count}, audioUrl: {aud_count}, pages: {len(pages)}"
        )
        print("[patch] Aborting patch to avoid misalignment.")
        return content

    result = content
    for p in pages:
        img_url = p["image_url"]
        aud_url = p["audio_url"]
        result = result.replace("imageUrl: '',", f"imageUrl: '{img_url}',", 1)
        result = result.replace("audioUrl: '',", f"audioUrl: '{aud_url}',", 1)

    return result


# ─── Main ─────────────────────────────────────────────────────────────────────

async def main() -> None:
    print("=== NovaLingo Story Asset Generator ===\n")

    content = STORYBANK_PATH.read_text(encoding="utf-8")

    print("[1/4] Parsing storyBank.ts...")
    pages = parse_storybank(content)
    print(f"      Found {len(pages)} story pages across stories")

    print("\n[2/4] Generating images...")
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    for p in pages:
        url = save_image(
            p["story_id"],
            p["page_num"],
            p["theme"],
            p["text"],
            p["highlight_words"],
        )
        p["image_url"] = url
        print(f"  [img] {p['story_id']}-p{p['page_num']} → {url}")
    print(f"      Done. {len(pages)} images in {IMAGE_DIR}")

    print("\n[3/4] Generating TTS audio...")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    audio_map = await generate_audio_batch(pages)
    for p in pages:
        p["audio_url"] = audio_map.get(p["text"], "")
    success = sum(1 for p in pages if p["audio_url"])
    print(f"      Done. {success}/{len(pages)} audio files ready")

    print("\n[4/4] Patching storyBank.ts...")
    patched = patch_storybank(content, pages)
    if patched != content:
        STORYBANK_PATH.write_text(patched, encoding="utf-8")
        print("      storyBank.ts updated.")
    else:
        print("      No changes made (already patched or mismatch).")

    print("\n[4b]  Updating audioManifest.ts...")
    update_manifest(pages)

    # Summary
    print("\n=== Done ===")
    print(f"  Images: {len(pages)} files in public/story/")
    print(f"  Audio:  {success} files in public/audio/tts/")
    print(f"  storyBank.ts patched: {'yes' if patched != content else 'no'}")


if __name__ == "__main__":
    asyncio.run(main())
