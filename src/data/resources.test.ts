import { describe, expect, it } from "vitest";
import { resourceRegistry, resourceRegistrySchema } from "@/data/resources";

const requiredIds = [
  "onepurdue",
  "mypurdue",
  "brightspace",
  "boilerconnect",
  "boilerlink",
  "codo",
  "location-change",
  "degree-plus",
  "caps",
  "push",
  "boilerexams",
  "boilerclasses",
  "student-parking",
  "residence-laundry",
  "residence-mail-packages",
  "purdue-it-new-students",
  "mobile-id-card",
  "academic-calendars",
  "financial-aid",
];

describe("resource registry", () => {
  it("passes the runtime schema", () => {
    expect(resourceRegistrySchema.safeParse(resourceRegistry).success).toBe(
      true,
    );
  });

  it("contains a meaningful, unique seed set", () => {
    expect(resourceRegistry.length).toBeGreaterThanOrEqual(45);
    expect(new Set(resourceRegistry.map((resource) => resource.id)).size).toBe(
      resourceRegistry.length,
    );
    expect(
      requiredIds.every((id) =>
        resourceRegistry.some((item) => item.id === id),
      ),
    ).toBe(true);
  });

  it("captures verified provenance and current aliases", () => {
    expect(
      resourceRegistry.find((item) => item.id === "boilerexams")?.sourceType,
    ).toBe("purdue_affiliated");
    expect(resourceRegistry.find((item) => item.id === "mycco")?.name).toBe(
      "Purdue Career Gateway",
    );
    expect(resourceRegistry.some((item) => item.id === "boilercourses")).toBe(
      false,
    );
  });

  it("labels every record with source, campus, and freshness metadata", () => {
    for (const resource of resourceRegistry) {
      expect(["official", "purdue_affiliated", "third_party"]).toContain(
        resource.sourceType,
      );
      expect(resource.campuses.length).toBeGreaterThan(0);
      expect(resource.audiences.length).toBeGreaterThan(0);
    }
  });

  it("uses valid review dates and unique resource IDs", () => {
    const ids = resourceRegistry.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const resource of resourceRegistry) {
      expect(resource.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        Number.isNaN(Date.parse(`${resource.lastVerified}T12:00:00Z`)),
      ).toBe(false);
      if (resource.contentReviewed) {
        expect(resource.contentReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(
          Number.isNaN(Date.parse(`${resource.contentReviewed}T12:00:00Z`)),
        ).toBe(false);
      }
    }
  });
});
