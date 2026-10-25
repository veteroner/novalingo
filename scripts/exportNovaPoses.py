#!/usr/bin/env python3
"""Normalize approved Nova cutouts and export WebP poses plus an embedded PNG fallback.

Only technical crop/pad/resize/encoding; generated source PNGs remain untouched.
Usage: python3 scripts/exportNovaPoses.py --generated-dir /absolute/generated/images/folder
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent


def framed(source, size, max_art, bottom_margin):
    alpha = source.getchannel('A')
    bounds = alpha.getbbox()
    if bounds is None or alpha.getextrema() != (0, 255):
        raise ValueError('Approved pose must contain visible art and real transparency')
    portrait = ImageOps.contain(source.crop(bounds), (max_art, max_art), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size))
    canvas.alpha_composite(portrait, ((size - portrait.width) // 2, size - bottom_margin - portrait.height))
    return canvas


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--generated-dir', type=Path, required=True)
    args = parser.parse_args()
    records = json.loads((ROOT / 'docs/design/2026-10-25-nova-expression-prompts.json').read_text())['poses']
    sources = {name: ROOT / f'public/nova/nova-{name}.webp' for name in ['idle', 'listen', 'celebrate']}
    sources.update({record['id']: args.generated_dir / record['sourceFile'] for record in records})
    destination = ROOT / 'public/nova/poses-v3'
    destination.mkdir(parents=True, exist_ok=True)
    total = 0
    for name, path in sources.items():
        with Image.open(path) as image:
            result = framed(image.convert('RGBA'), 768, 704, 52)
            target = destination / f'{name}.webp'
            result.save(target, 'WEBP', quality=88, method=6)
            total += target.stat().st_size
            print(f'{target.relative_to(ROOT)}: {target.stat().st_size} bytes')
    with Image.open(sources['idle']) as image:
        fallback = ROOT / 'src/assets/images/nova-fallback-v2.png'
        framed(image.convert('RGBA'), 256, 240, 8).save(fallback, 'PNG', optimize=True)
        print(f'{fallback.relative_to(ROOT)}: {fallback.stat().st_size} bytes')
    print(f'Eight pose exports: {total} bytes')


if __name__ == '__main__':
    main()
