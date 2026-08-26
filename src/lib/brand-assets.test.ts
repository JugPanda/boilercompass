import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("BoilerCompass production brand package", () => {
  it("ships the supplied source artwork and a transparent web mark", async () => {
    const source = await sharp(
      join(root, "public/brand/boilercompass-logo-source.jpg"),
    ).metadata();
    const mark = await sharp(
      join(root, "public/brand/boilercompass-mark.png"),
    ).metadata();

    expect(source).toMatchObject({
      width: 1254,
      height: 1254,
      format: "jpeg",
      hasAlpha: false,
    });
    expect(mark).toMatchObject({
      width: 1024,
      height: 1024,
      format: "png",
      hasAlpha: true,
    });
  });

  it("uses the supplied compass-and-route artwork in the live brand component", () => {
    const logo = read("src/components/boilercompass-logo.tsx");
    const brandMark = read("src/components/brand-mark.tsx");
    expect(logo).toContain("/brand/boilercompass-mark.png");
    expect(brandMark).toContain("BoilerCompassSymbol");
    expect(brandMark).not.toContain('from "lucide-react"');
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
    expect(og).toContain("BOILERCOMPASS_MARK_DATA_URI");
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
