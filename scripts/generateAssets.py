#!/usr/bin/env python3
"""Export launcher/PWA icons from the approved Nova v2 ImageGen masters.

Requires Pillow. Run from any directory; no image service or API key is used.
Only resizes/pads approved art. Splash resources are maintained separately.
"""
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = '#5145C8'
MASTER = ROOT / 'assets/branding/nova-app-icon-v2.png'
FOREGROUND = ROOT / 'assets/branding/nova-adaptive-foreground-v2.png'
DENSITIES = [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]


def save(image, relative_path):
    path = ROOT / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'PNG', optimize=True)
    print(f'{relative_path}: {image.width}x{image.height} {image.mode}')


def padded_foreground(source, size, radius_fraction):
    """Uniform export scaling; all visible art stays inside a central circle."""
    alpha = source.getchannel('A')
    bounds = alpha.point(lambda value: 255 if value >= 8 else 0).getbbox()
    if bounds is None:
        raise ValueError('Adaptive master has no visible portrait')
    portrait = source.crop(bounds)
    width, height = portrait.size
    cx, cy = (width - 1) / 2, (height - 1) / 2
    visible = portrait.getchannel('A')
    radius = max(math.hypot(x - cx, y - cy)
                 for y in range(height) for x in range(width) if visible.getpixel((x, y)) >= 8)
    factor = size * radius_fraction / radius
    portrait = portrait.resize((round(width * factor), round(height * factor)), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', (size, size))
    result.alpha_composite(portrait, ((size - portrait.width) // 2, (size - portrait.height) // 2))
    return result


def main():
    with Image.open(MASTER) as source, Image.open(FOREGROUND) as adaptive:
        if source.width != source.height or source.width < 1024:
            raise ValueError('Icon master must be square and at least 1024 pixels')
        if source.mode == 'RGBA' and source.getchannel('A').getextrema() != (255, 255):
            raise ValueError('iOS icon master must be opaque')
        if adaptive.mode != 'RGBA' or adaptive.getchannel('A').getextrema() != (0, 255):
            raise ValueError('Adaptive master must have real transparency')
        opaque = source.convert('RGB')
        icon = lambda size: opaque.resize((size, size), Image.Resampling.LANCZOS)
        save(icon(1024), 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
        for density, size in DENSITIES:
            base = f'android/app/src/main/res/mipmap-{density}'
            save(icon(size), f'{base}/ic_launcher.png')
            save(icon(size), f'{base}/ic_launcher_round.png')
            save(padded_foreground(adaptive, round(size * 108 / 48), .30), f'{base}/ic_launcher_foreground.png')
        for size in [72, 96, 128, 144, 152, 192, 384, 512]:
            save(icon(size), f'public/icon-{size}x{size}.png')
        save(icon(32), 'public/favicon.png')
        save(icon(180), 'public/apple-touch-icon.png')
        maskable = Image.new('RGBA', (512, 512), BRAND)
        maskable.alpha_composite(padded_foreground(adaptive, 512, .38))
        save(maskable.convert('RGB'), 'public/icon-maskable-512x512.png')


if __name__ == '__main__':
    main()
