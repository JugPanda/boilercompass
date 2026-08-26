# BoilerCompass brand assets

The current BoilerCompass mark is the supplied black-and-gold compass, route, and destination-pin artwork.

## Source files

- `boilercompass-logo-source.jpg` — original supplied 1254×1254 JPEG artwork. The white exterior is part of the JPEG; JPEG does not support transparency.
- `boilercompass-mark.png` — transparent 1024×1024 web derivative generated from the supplied artwork.
- `boilercompass-icon-192.png` — standard install icon on the site’s warm neutral background.
- `boilercompass-icon-512.png` — maskable install icon with extra safe-zone padding.

The live header combines the transparent mark with accessible HTML text for the `BoilerCompass` wordmark.

## Regenerating derivatives

Run from the repository root:

```bash
python scripts/generate-brand-assets.py
```

The Pillow-based script removes only the exterior white field connected to the JPEG canvas edge, preserving the enclosed cream compass face. It deterministically regenerates:

- `public/brand/boilercompass-mark.png` (1024×1024 with transparency)
- `src/lib/brand-mark-data.ts` (generated 256×256 data URI for the Open Graph renderer)
- `src/app/favicon.ico` (16, 24, 32, and 48px frames)
- `src/app/apple-icon.png` (180×180)
- `src/app/icon.png` (512×512)
- `public/brand/boilercompass-icon-192.png` (192×192)
- `public/brand/boilercompass-icon-512.png` (512×512, maskable safe zone)
