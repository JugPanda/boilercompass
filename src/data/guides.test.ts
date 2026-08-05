import { describe, expect, it } from "vitest";
import { guides } from "@/data/guides";
import { resourceById, resourceRegistry } from "@/data/resources";

const priorityGuideSlugs = [
  "parking-and-bringing-a-car",
  "understanding-financial-aid-offer",
  "laundry-in-university-residences",
  "new-student-essentials",
];

const expectedSources: Record<string, string[]> = {
  "parking-and-bringing-a-car": [
    "https://www.purdue.edu/operations/parking/home/permits/students/",
  ],
  "understanding-financial-aid-offer": [
    "https://www.purdue.edu/dfa/accept/refund/mypurdue/",
    "https://www.purdue.edu/dfa/accept/",
    "https://www.purdue.edu/dfa/aid/grants/",
  ],
  "laundry-in-university-residences": [
    "https://www.housing.purdue.edu/my-housing/info/amenities-accommodations/laundry.html",
  ],
  "new-student-essentials": [
    "https://www.purdue.edu/dfa/accept/refund/mypurdue/",
    "https://it.purdue.edu/services/new-to-purdue.php",
    "https://www.purdue.edu/treasurer/finance/card/",
    "https://www.purdue.edu/registrar/calendars/",
    "https://www.housing.purdue.edu/my-housing/info/general/postal-service.html",
    "https://www.purdue.edu/operations/parking/home/permits/students/",
    "https://www.housing.purdue.edu/my-housing/info/amenities-accommodations/laundry.html",
  ],
};

describe("student guides", () => {
  it("uses unique slugs and valid resource references", () => {
    expect(new Set(guides.map((guide) => guide.slug)).size).toBe(guides.length);

    for (const guide of guides) {
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.resourceIds.length).toBeGreaterThan(0);
      if (guide.lastReviewed) {
        expect(guide.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(
          Number.isNaN(Date.parse(`${guide.lastReviewed}T12:00:00Z`)),
        ).toBe(false);
      }
      for (const resourceId of guide.resourceIds) {
        expect(
          resourceById.has(resourceId),
          `${guide.slug} -> ${resourceId}`,
        ).toBe(true);
      }
    }
  });

  it("keeps resource-to-guide links valid and reciprocal", () => {
    const guideSlugs = new Set(guides.map((guide) => guide.slug));

    for (const resource of resourceRegistry) {
      for (const guideSlug of resource.guideSlugs ?? []) {
        expect(
          guideSlugs.has(guideSlug),
          `${resource.id} -> ${guideSlug}`,
        ).toBe(true);
        expect(
          guides.find((guide) => guide.slug === guideSlug)?.resourceIds,
          `${resource.id} should appear in ${guideSlug}`,
        ).toContain(resource.id);
      }
    }
  });

  it("dates the current priority guides and links controlling official sources", () => {
    for (const slug of priorityGuideSlugs) {
      const guide = guides.find((item) => item.slug === slug);
      expect(guide, slug).toBeDefined();
      expect(guide?.lastReviewed).toBe("2026-08-05");
      expect(guide?.sources?.map((source) => source.url)).toEqual(
        expectedSources[slug],
      );
      for (const source of guide?.sources ?? []) {
        expect(source.label.length).toBeGreaterThan(10);
        expect(new URL(source.url).protocol).toBe("https:");
        expect(new URL(source.url).hostname).toMatch(/(^|\.)purdue\.edu$/);
      }
    }
  });
});
