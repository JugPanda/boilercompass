import { describe, expect, it } from "vitest";
import { absoluteUrl, siteConfig, socialImage } from "@/lib/site";

describe("BoilerCompass production URL", () => {
  it("uses the custom domain as the metadata source of truth", () => {
    expect(siteConfig.url).toBe("https://boilercompass.com");
    expect(absoluteUrl("/resources")).toBe(
      "https://boilercompass.com/resources",
    );
    expect(absoluteUrl("/opengraph-image")).toBe(
      "https://boilercompass.com/opengraph-image",
    );
    expect(socialImage).toMatchObject({
      url: "https://boilercompass.com/opengraph-image",
      width: 1200,
      height: 630,
    });
  });
});
