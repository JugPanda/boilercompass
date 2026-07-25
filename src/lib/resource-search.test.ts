import { describe, expect, it } from "vitest";
import { resourceRegistry } from "@/data/resources";
import {
  filterResources,
  searchResources,
  sourceLabel,
  campusLabel,
} from "@/lib/resource-search";

describe("resource search", () => {
  it.each([
    ["bs", "brightspace"],
    ["mp", "mypurdue"],
    ["bc", "boilerconnect"],
    ["clubs", "boilerlink"],
    ["codo", "codo"],
    ["therapy", "caps"],
    ["doctor", "push"],
    ["boilercourses", "boilerclasses"],
  ])("maps shortcut %s to %s", (query, expectedId) => {
    expect(searchResources(resourceRegistry, query)[0]?.id).toBe(expectedId);
  });

  it("tolerates a reasonable typo", () => {
    expect(searchResources(resourceRegistry, "brigthspace")[0]?.id).toBe(
      "brightspace",
    );
  });

  it("filters across source, campus, audience, and login", () => {
    const results = filterResources(resourceRegistry, {
      sourceType: "official",
      campus: "west_lafayette",
      audience: "undergraduate",
      requiresLogin: "yes",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (item) => item.sourceType === "official" && item.requiresLogin,
      ),
    ).toBe(true);
  });

  it("provides non-color text labels", () => {
    expect(sourceLabel("official")).toBe("Official Purdue");
    expect(sourceLabel("third_party")).toBe("Independent / third-party");
    expect(campusLabel("all_or_verify")).toBe("Verify campus applicability");
  });
});
