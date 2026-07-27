#!/usr/bin/env python3
"""Verify BoilerCompass brand derivatives and create visual size evidence."""

from pathlib import Path

from PIL import IcoImagePlugin, Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts/branding/asset-checks"
ARTIFACTS.mkdir(parents=True, exist_ok=True)

expected_pngs = {
    "src/app/apple-icon.png": (180, 180),
    "src/app/icon.png": (512, 512),
    "public/brand/boilercompass-icon-192.png": (192, 192),
    "public/brand/boilercompass-icon-512.png": (512, 512),
}

for relative, expected_size in expected_pngs.items():
    path = ROOT / relative
    with Image.open(path) as image:
        assert image.format == "PNG", f"{relative} must be PNG"
        assert image.size == expected_size, f"{relative}: expected {expected_size}, got {image.size}"
        print(f"{relative}\t{image.size[0]}x{image.size[1]}\t{path.stat().st_size} bytes\timage/png")

favicon_path = ROOT / "src/app/favicon.ico"
with Image.open(favicon_path) as favicon:
    assert isinstance(favicon, IcoImagePlugin.IcoImageFile)
    ico_sizes = sorted(favicon.ico.sizes())
    expected_ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48)]
    assert ico_sizes == expected_ico_sizes, f"favicon frames: expected {expected_ico_sizes}, got {ico_sizes}"
    print(
        f"src/app/favicon.ico\t{','.join(f'{width}x{height}' for width, height in ico_sizes)}"
        f"\t{favicon_path.stat().st_size} bytes\timage/x-icon"
    )

maskable_path = ROOT / "public/brand/boilercompass-icon-512.png"
with Image.open(maskable_path) as maskable:
    rgb = maskable.convert("RGB")
    gold_pixels = []
    for y in range(rgb.height):
        for x in range(rgb.width):
            pixel = rgb.getpixel((x, y))
            assert isinstance(pixel, tuple)
            red, green, blue = int(pixel[0]), int(pixel[1]), int(pixel[2])
            if red > 120 and green > 90 and blue > 40:
                gold_pixels.append((x, y))
    assert gold_pixels, "maskable icon contains no visible gold mark"
    xs = [pixel[0] for pixel in gold_pixels]
    ys = [pixel[1] for pixel in gold_pixels]
    bounds = (min(xs), min(ys), max(xs), max(ys))
    safe_min = round(maskable.width * 0.18)
    safe_max = round(maskable.width * 0.82)
    assert bounds[0] >= safe_min and bounds[1] >= safe_min
    assert bounds[2] <= safe_max and bounds[3] <= safe_max
    print(f"maskable-gold-bounds\t{bounds}\tsafe-range={safe_min}..{safe_max}")

preview_sizes = [16, 24, 32, 48, 180, 192, 512]
source = Image.open(ROOT / "src/app/icon.png").convert("RGBA")
font = ImageFont.load_default()
tile_width = 170
tile_height = 190
sheet = Image.new("RGB", (tile_width * len(preview_sizes), tile_height), "#f6f2e8")
draw = ImageDraw.Draw(sheet)

for index, size in enumerate(preview_sizes):
    exact = source.resize((size, size), Image.Resampling.LANCZOS)
    preview_size = 132
    preview = exact.resize(
        (preview_size, preview_size),
        Image.Resampling.NEAREST if size <= 48 else Image.Resampling.LANCZOS,
    )
    x = index * tile_width + (tile_width - preview_size) // 2
    y = 18
    sheet.paste(preview, (x, y), preview)
    label = f"{size} x {size}px"
    label_box = draw.textbbox((0, 0), label, font=font)
    label_width = label_box[2] - label_box[0]
    draw.text((index * tile_width + (tile_width - label_width) // 2, 160), label, fill="#17140f", font=font)

contact_sheet = ARTIFACTS / "icon-size-contact-sheet.png"
sheet.save(contact_sheet, format="PNG", optimize=True)
print(f"contact-sheet\t{contact_sheet.relative_to(ROOT)}\t{contact_sheet.stat().st_size} bytes")
