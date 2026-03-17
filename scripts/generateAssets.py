#!/usr/bin/env python3
"""
Generate app icons and splash screens for NovaLingo.
Uses Pillow (PIL) with drawing primitives.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND = (108, 92, 231)  # #6c5ce7
BRAND_LIGHT = (124, 108, 247)  # #7c6cf7
WHITE = (255, 255, 255)
CREAM = (240, 236, 255)  # #F0ECFF
DARK = (26, 26, 46)  # #1A1A2E
ORANGE = (255, 167, 38)  # #FFA726
LAVENDER = (221, 214, 254)  # #DDD6FE
STAR = (253, 230, 138)  # #FDE68A


def draw_owl(draw, cx, cy, scale):
    """Draw the Nova owl mascot at given center and scale."""
    s = scale

    # Body
    draw.ellipse([cx-60*s, cy+10*s, cx+60*s, cy+120*s], fill=WHITE)
    draw.ellipse([cx-55*s, cy+15*s, cx+55*s, cy+115*s], fill=CREAM)
    # Belly
    draw.ellipse([cx-35*s, cy+45*s, cx+35*s, cy+105*s], fill=WHITE)

    # Head
    draw.ellipse([cx-48*s, cy-70*s, cx+48*s, cy+26*s], fill=WHITE)
    draw.ellipse([cx-43*s, cy-65*s, cx+43*s, cy+21*s], fill=CREAM)

    # Eyes
    draw.ellipse([cx-30*s, cy-35*s, cx-2*s, cy-3*s], fill=WHITE)
    draw.ellipse([cx+2*s, cy-35*s, cx+30*s, cy-3*s], fill=WHITE)
    # Pupils
    draw.ellipse([cx-23*s, cy-30*s, cx-7*s, cy-14*s], fill=DARK)
    draw.ellipse([cx+7*s, cy-30*s, cx+23*s, cy-14*s], fill=DARK)
    # Eye shine
    draw.ellipse([cx-19*s, cy-28*s, cx-13*s, cy-22*s], fill=WHITE)
    draw.ellipse([cx+13*s, cy-28*s, cx+19*s, cy-22*s], fill=WHITE)

    # Beak
    draw.polygon([(cx-7*s, cy+2*s), (cx, cy+14*s), (cx+7*s, cy+2*s)], fill=ORANGE)

    # Ear tufts
    draw.polygon([(cx-35*s, cy-55*s), (cx-28*s, cy-75*s), (cx-20*s, cy-50*s)], fill=LAVENDER)
    draw.polygon([(cx+35*s, cy-55*s), (cx+28*s, cy-75*s), (cx+20*s, cy-50*s)], fill=LAVENDER)

    # Wings
    draw.ellipse([cx-70*s, cy+10*s, cx-42*s, cy+80*s], fill=LAVENDER)
    draw.ellipse([cx+42*s, cy+10*s, cx+70*s, cy+80*s], fill=LAVENDER)

    # Feet
    draw.ellipse([cx-25*s, cy+115*s, cx-5*s, cy+130*s], fill=ORANGE)
    draw.ellipse([cx+5*s, cy+115*s, cx+25*s, cy+130*s], fill=ORANGE)

    # Graduation cap
    draw.rectangle([cx-32*s, cy-70*s, cx+32*s, cy-65*s], fill=DARK)
    draw.polygon([(cx, cy-85*s), (cx-35*s, cy-68*s), (cx+35*s, cy-68*s)], fill=DARK)
    # Tassel
    draw.line([(cx, cy-85*s), (cx, cy-95*s)], fill=ORANGE, width=max(1, int(2*s)))
    draw.ellipse([cx-4*s, cy-100*s, cx+4*s, cy-92*s], fill=ORANGE)


def create_icon(size, output_path):
    """Create app icon at specified size."""
    img = Image.new('RGBA', (size, size), BRAND)
    draw = ImageDraw.Draw(img)

    # Background glow
    cx, cy = size // 2, int(size * 0.48)
    glow_r = int(size * 0.35)
    for i in range(glow_r, 0, -1):
        alpha = int(30 * (i / glow_r))
        draw.ellipse([cx-i, cy-i, cx+i, cy+i], fill=BRAND_LIGHT + (alpha,))

    # Draw owl
    scale = size / 300
    draw_owl(draw, size // 2, int(size * 0.48), scale)

    # Small stars
    star_positions = [
        (0.15, 0.15), (0.85, 0.18), (0.12, 0.75),
        (0.88, 0.7), (0.25, 0.9), (0.75, 0.88)
    ]
    for sx, sy in star_positions:
        r = max(2, int(size * 0.012))
        px, py = int(size * sx), int(size * sy)
        draw.ellipse([px-r, py-r, px+r, py+r], fill=STAR + (180,))

    # Convert to RGB for PNG (no alpha for app icons)
    rgb = Image.new('RGB', img.size, BRAND)
    rgb.paste(img, mask=img.split()[3])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    rgb.save(output_path, 'PNG')
    print(f"  ✓ {output_path} ({size}x{size})")


def create_adaptive_foreground(size, output_path):
    """Create Android adaptive icon foreground (transparent bg)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 108dp with 18dp safe zone = draw owl in center 72dp area
    scale = size / 450
    draw_owl(draw, size // 2, int(size * 0.46), scale)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"  ✓ {output_path} ({size}x{size})")


def create_splash(w, h, output_path):
    """Create splash screen."""
    img = Image.new('RGB', (w, h), BRAND)
    draw = ImageDraw.Draw(img)

    # Background glow
    cx, cy = w // 2, int(h * 0.38)
    glow_r = int(min(w, h) * 0.2)
    for i in range(glow_r, 0, -2):
        alpha = int(20 * (i / glow_r))
        overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([cx-i, cy-i, cx+i, cy+i], fill=BRAND_LIGHT + (alpha,))
        img.paste(Image.alpha_composite(Image.new('RGBA', img.size, BRAND + (255,)), overlay).convert('RGB'))

    draw = ImageDraw.Draw(img)

    # Draw owl
    scale = min(w, h) / 800
    draw_owl(draw, w // 2, int(h * 0.38), scale)

    # App name text
    try:
        font_size = int(min(w, h) * 0.06)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        small_size = int(min(w, h) * 0.025)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", small_size)
    except (OSError, IOError):
        font = ImageFont.load_default()
        small_font = font

    # "NovaLingo"
    text = "NovaLingo"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, int(h * 0.62)), text, fill=WHITE, font=font)

    # Subtitle
    sub = "Çocuklar için İngilizce"
    bbox2 = draw.textbbox((0, 0), sub, font=small_font)
    sw = bbox2[2] - bbox2[0]
    draw.text(((w - sw) // 2, int(h * 0.69)), sub, fill=LAVENDER, font=small_font)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"  ✓ {output_path} ({w}x{h})")


def main():
    print("🎨 Generating app icons and splash screens...\n")

    # ─── iOS App Icon ───────────────────────────────────
    print("📱 iOS App Icon:")
    create_icon(1024, os.path.join(ROOT,
        "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"))

    # ─── Android Icons ──────────────────────────────────
    print("\n🤖 Android Icons:")
    densities = [
        ("mdpi", 48), ("hdpi", 72), ("xhdpi", 96),
        ("xxhdpi", 144), ("xxxhdpi", 192)
    ]
    for name, size in densities:
        base = os.path.join(ROOT, f"android/app/src/main/res/mipmap-{name}")
        create_icon(size, os.path.join(base, "ic_launcher.png"))
        create_icon(size, os.path.join(base, "ic_launcher_round.png"))
        fg_size = int(size * 108 / 48)
        create_adaptive_foreground(fg_size, os.path.join(base, "ic_launcher_foreground.png"))

    # ─── Android Splash ─────────────────────────────────
    print("\n🤖 Android Splash Screens:")
    port = [("mdpi",320,480), ("hdpi",480,800), ("xhdpi",720,1280),
            ("xxhdpi",960,1600), ("xxxhdpi",1280,1920)]
    land = [("mdpi",480,320), ("hdpi",800,480), ("xhdpi",1280,720),
            ("xxhdpi",1600,960), ("xxxhdpi",1920,1280)]

    for name, w, h in port:
        create_splash(w, h, os.path.join(ROOT,
            f"android/app/src/main/res/drawable-port-{name}/splash.png"))
    for name, w, h in land:
        create_splash(w, h, os.path.join(ROOT,
            f"android/app/src/main/res/drawable-land-{name}/splash.png"))
    create_splash(480, 800, os.path.join(ROOT,
        "android/app/src/main/res/drawable/splash.png"))

    # ─── iOS Splash ─────────────────────────────────────
    print("\n📱 iOS Splash Screens:")
    splash_dir = os.path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset")
    create_splash(2732, 2732, os.path.join(splash_dir, "splash-2732x2732.png"))
    create_splash(2732, 2732, os.path.join(splash_dir, "splash-2732x2732-1.png"))
    create_splash(2732, 2732, os.path.join(splash_dir, "splash-2732x2732-2.png"))

    # ─── PWA Icons ──────────────────────────────────────
    print("\n🌐 PWA Icons:")
    pwa_dir = os.path.join(ROOT, "public")
    os.makedirs(pwa_dir, exist_ok=True)
    for size in [72, 96, 128, 144, 152, 192, 384, 512]:
        create_icon(size, os.path.join(pwa_dir, f"icon-{size}x{size}.png"))
    create_icon(32, os.path.join(pwa_dir, "favicon.png"))
    create_icon(180, os.path.join(pwa_dir, "apple-touch-icon.png"))

    print("\n✅ All assets generated successfully!")


if __name__ == "__main__":
    main()
