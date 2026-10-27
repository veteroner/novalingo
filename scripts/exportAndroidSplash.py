#!/usr/bin/env python3
"""Re-encode the approved Nova pose for Android's code-defined splash.

Only pads/resizes existing art; no new artwork or image service is used.
The XML layout controls background, placement and size at runtime.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'public/nova/nova-idle.webp'
OUTPUT = ROOT / 'android/app/src/main/res/drawable-nodpi/nova_splash.png'


def main():
    with Image.open(SOURCE) as source:
        portrait = ImageOps.contain(source.convert('RGBA'), (512, 512), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (512, 512))
        canvas.alpha_composite(portrait, ((512 - portrait.width) // 2, (512 - portrait.height) // 2))
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(OUTPUT, 'PNG', optimize=True)
        print(f'{OUTPUT.relative_to(ROOT)}: 512x512 RGBA')


if __name__ == '__main__':
    main()
