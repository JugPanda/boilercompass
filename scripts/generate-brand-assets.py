#!/usr/bin/env python3
"""Regenerate BoilerCompass PNG and ICO derivatives from the checked-in SVG source."""

from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/brand/boilercompass-favicon.svg"
MASKABLE_SOURCE = ROOT / "public/brand/boilercompass-maskable.svg"
CONVERT = shutil.which("convert")

if not CONVERT:
    raise SystemExit("ImageMagick 'convert' is required to rasterize the SVG source.")

outputs = {
    ROOT / "src/app/apple-icon.png": (SOURCE, 180),
    ROOT / "src/app/icon.png": (SOURCE, 512),
    ROOT / "public/brand/boilercompass-icon-192.png": (SOURCE, 192),
    ROOT / "public/brand/boilercompass-icon-512.png": (MASKABLE_SOURCE, 512),
}

with tempfile.TemporaryDirectory(prefix="boilercompass-brand-") as temp_dir:
    rendered_sources: dict[Path, Image.Image] = {}

    for svg_source in {SOURCE, MASKABLE_SOURCE}:
        rendered = Path(temp_dir) / f"{svg_source.stem}.png"
        subprocess.run(
            [
                CONVERT,
                "-background",
                "none",
                "-density",
                "1024",
                str(svg_source),
                "-resize",
                "512x512",
                str(rendered),
            ],
            check=True,
        )
        rendered_sources[svg_source] = Image.open(rendered).convert("RGBA")

    for output, (svg_source, size) in outputs.items():
        output.parent.mkdir(parents=True, exist_ok=True)
        image = rendered_sources[svg_source].resize((size, size), Image.Resampling.LANCZOS)
        image.save(output, format="PNG", optimize=True)

    source = rendered_sources[SOURCE]
    favicon = source.resize((256, 256), Image.Resampling.LANCZOS)
    favicon.save(
        ROOT / "src/app/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48)],
    )

print("Generated favicon.ico, apple-icon.png, icon.png, and 192/512px brand icons.")
