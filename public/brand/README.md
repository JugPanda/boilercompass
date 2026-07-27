# BoilerCompass brand assets

The mark is an original **route-bearing B**: a structural `B` doubles as a wayfinding path, with an origin node and a northeast destination bearing. It is intentionally geometric and restrained so search, resource labels, and student tasks remain the product's visual priority.

## Source files

- `boilercompass-mark.svg` — primary standalone mark on its near-black field
- `boilercompass-mark-mono.svg` — single-color `currentColor` mark
- `boilercompass-lockup.svg` — mark with dark wordmark for light surfaces
- `boilercompass-lockup-light.svg` — mark with light wordmark for dark surfaces
- `boilercompass-favicon.svg` — padded square source for favicon and app-icon derivatives
- `boilercompass-maskable.svg` — extra-safe padded source for the maskable 512px icon

The live header keeps `BoilerCompass` as HTML text. These SVG lockups are export assets, not a replacement for accessible live text.

## Regenerating raster derivatives

Run from the repository root:

```bash
python scripts/generate-brand-assets.py
```

The script requires ImageMagick (`convert`) and Pillow. It deterministically regenerates:

- `src/app/favicon.ico` (16, 24, 32, and 48px frames)
- `src/app/apple-icon.png` (180×180)
- `src/app/icon.png` (512×512)
- `public/brand/boilercompass-icon-192.png` (192×192)
- `public/brand/boilercompass-icon-512.png` (512×512, with the mark inside the maskable safe zone)

No generated campus imagery, university marks, embedded raster logo data, external fonts, or editor metadata are used.
