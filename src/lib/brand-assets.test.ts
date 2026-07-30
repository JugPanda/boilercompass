import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const brandAssets = [
  "public/brand/boilercompass-mark.svg",
  "public/brand/boilercompass-mark-mono.svg",
  "public/brand/boilercompass-lockup.svg",
  "public/brand/boilercompass-lockup-light.svg",
  "public/brand/boilercompass-favicon.svg",
  "public/brand/boilercompass-maskable.svg",
];

describe("BoilerCompass production brand package", () => {
  it("ships clean, editable SVG source assets without embedded raster data", () => {
    for (const asset of brandAssets) {
      const svg = read(asset);
      expect(svg).toContain("<svg");
      expect(svg).not.toMatch(/<image\b|data:image|<metadata\b|<filter\b/i);
      expect(svg).not.toContain("Purdue University");
    }
  });

  it("uses the original route-bearing mark instead of the Lucide Compass", () => {
    const brandMark = read("src/components/brand-mark.tsx");
    expect(brandMark).toContain("BoilerCompassSymbol");
    expect(brandMark).not.toContain('from "lucide-react"');
    expect(brandMark).not.toContain("<Compass");
  });

  it("keeps route decoration semantic-free and category icons centralized", () => {
    const page = read("src/app/page.tsx");
    const motif = read("src/components/route-motif.tsx");
    const categoryIcons = read("src/lib/category-icons.ts");

    expect(page).toContain("<RouteMotif />");
    expect(motif).toContain('aria-hidden="true"');
    expect(categoryIcons).toContain(
      "satisfies Record<ResourceCategory, LucideIcon>",
    );
  });

  it("keeps the required sharing copy in the dynamic Open Graph image", () => {
    const og = read("src/app/opengraph-image.tsx");
    expect(og).toContain("Your guide to Purdue, all in one place.");
    expect(og).toContain("Unofficial student resource guide");
    expect(og).toContain("BoilerCompassLogo");
  });

  it("ships a portfolio preview as 1600 x 1000 PNG and WebP files", async () => {
    for (const [path, format] of [
      ["public/brand/boilercompass-project-preview.png", "png"],
      ["public/brand/boilercompass-project-preview.webp", "webp"],
    ] as const) {
      const metadata = await sharp(join(root, path)).metadata();
      expect(metadata.width).toBe(1600);
      expect(metadata.height).toBe(1000);
      expect(metadata.format).toBe(format);
      expect(metadata.hasAlpha).toBe(false);
    }
  });

  it("keeps the project preview tied to a deterministic browser capture", () => {
    const capture = read("scripts/capture-project-preview.ts");
    expect(capture).toContain("width: 1600");
    expect(capture).toContain("height: 1000");
    expect(capture).toContain("colorScheme: theme");
    expect(capture).toContain('capture(browser, "light")');
    expect(capture).toContain('capture(browser, "dark")');
    expect(capture).toContain("animation: none !important");
    expect(capture).toContain("boilercompass-project-preview.webp");
  });
});
