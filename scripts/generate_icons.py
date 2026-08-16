#!/usr/bin/env python3
"""Regenerates icons/{green,red}-{16,32,48,128}.png.

Mirrors the glyph-drawing logic in background.js's drawGlyph() exactly, so
the static PNG fallback (used for chrome.notifications icons, the pre-alarm
default icon, and the OffscreenCanvas-failure fallback) always matches what
the dynamic canvas-drawn toolbar icon looks like.
"""
import os
from PIL import Image, ImageDraw

SIZES = [16, 32, 48, 128]
COLORS = {"green": "#388E3C", "red": "#D32F2F"}
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")

# Render everything at a large master size, then downsample with a proper
# resampling filter - at 16px, drawing the geometry directly makes the three
# soundwave bars merge into an unrecognizable blob, since 1-2px shapes don't
# survive rasterization/anti-aliasing cleanly at that scale.
MASTER_SIZE = 512


def draw_normal(size, color):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, size - 1, size - 1], fill=color)

    bar_w = size * 0.12
    gap = size * 0.09
    heights = [0.28, 0.62, 0.42]
    total_w = bar_w * 3 + gap * 2
    cx, cy = size / 2, size / 2
    x = cx - total_w / 2

    for h_frac in heights:
        bar_h = size * h_frac
        y0 = cy - bar_h / 2
        y1 = cy + bar_h / 2
        d.rounded_rectangle([x, y0, x + bar_w, y1], radius=bar_w / 2, fill="white")
        x += bar_w + gap
    return img


def draw_quiet(size, color):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, size - 1, size - 1], fill=color)

    cx, cy = size / 2, size / 2
    moon_r = size * 0.30
    d.ellipse([cx - moon_r, cy - moon_r, cx + moon_r, cy + moon_r], fill="white")

    punch_r = moon_r * 0.85
    offset = moon_r * 0.55
    px, py = cx + offset, cy - offset * 0.3
    d.ellipse([px - punch_r, py - punch_r, px + punch_r, py + punch_r], fill=color)
    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, color in COLORS.items():
        master = draw_quiet(MASTER_SIZE, color) if name == "red" else draw_normal(MASTER_SIZE, color)
        for size in SIZES:
            img = master.resize((size, size), Image.LANCZOS)
            path = os.path.join(OUT_DIR, f"{name}-{size}.png")
            img.save(path, "PNG")
            print("wrote", path)


if __name__ == "__main__":
    main()
