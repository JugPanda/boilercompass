import { describe, expect, it, vi } from "vitest";
import {
  bucketResultCount,
  mapCategoryToAnalyticsGroup,
  sanitizeAnalyticsEvent,
  trackAnalyticsEvent,
} from "@/lib/analytics/events";

describe("privacy-safe analytics events", () => {
  it.each([
    ["resource_opened", { source_type: "official" }],
    ["search_submitted", { result_count_bucket: "2-5", surface: "launcher" }],
    ["search_no_results", { surface: "directory" }],
    ["category_filter_selected", { category_group: "academics" }],
    ["feedback_submitted", { surface: "resource" }],
  ] as const)("tracks allowlisted %s data", (name, properties) => {
    const tracker = vi.fn();

    expect(trackAnalyticsEvent(name, properties, tracker)).toBe(true);
    expect(tracker).toHaveBeenCalledOnce();
    expect(tracker).toHaveBeenCalledWith(name, properties);
  });

  it("rejects unknown event names", () => {
    const tracker = vi.fn();

    expect(
      trackAnalyticsEvent(
        "resource_searched" as never,
        { surface: "launcher" } as never,
        tracker,
      ),
    ).toBe(false);
    expect(tracker).not.toHaveBeenCalled();
  });

  it.each([
    ["raw query", { surface: "launcher", query: "therapy near me" }],
    ["raw search", { surface: "launcher", search: "financial aid" }],
    ["URL", { source_type: "official", url: "https://example.com/private" }],
    ["token", { source_type: "official", token: "secret" }],
    ["email", { source_type: "official", email: "student@example.com" }],
    ["name", { source_type: "official", name: "Student Name" }],
    ["identifier", { source_type: "official", resource_id: "counseling" }],
    ["nested value", { source_type: { value: "official" } }],
  ])("rejects an additional or invalid %s field", (_label, properties) => {
    const tracker = vi.fn();
    const eventName =
      "source_type" in properties ? "resource_opened" : "search_no_results";

    expect(
      trackAnalyticsEvent(eventName as never, properties as never, tracker),
    ).toBe(false);
    expect(tracker).not.toHaveBeenCalled();
  });

  it.each([
    "Health, support & safety",
    "Money & administration",
    "Campus life & logistics",
    "housing",
    "support",
  ])("does not map sensitive category %s", (category) => {
    expect(mapCategoryToAnalyticsGroup(category)).toBeNull();
  });

  it.each([
    ["Core portals", "core"],
    ["Classes & academics", "academics"],
    ["Advising & degree planning", "academics"],
    ["Study & course tools", "academics"],
    ["Careers & involvement", "career"],
  ] as const)("maps %s to %s", (category, group) => {
    expect(mapCategoryToAnalyticsGroup(category)).toBe(group);
  });

  it("rejects sensitive category values instead of tracking them", () => {
    const tracker = vi.fn();

    expect(
      trackAnalyticsEvent(
        "category_filter_selected",
        { category_group: "health" as never },
        tracker,
      ),
    ).toBe(false);
    expect(tracker).not.toHaveBeenCalled();
  });

  it("returns false when the injected tracker throws", () => {
    const tracker = vi.fn(() => {
      throw new Error("analytics blocked");
    });

    expect(
      trackAnalyticsEvent("feedback_submitted", { surface: "about" }, tracker),
    ).toBe(false);
  });

  it.each([
    [0, "0"],
    [1, "1"],
    [2, "2-5"],
    [5, "2-5"],
    [6, "6-10"],
    [10, "6-10"],
    [11, "11+"],
    [100, "11+"],
  ] as const)("buckets %i results as %s", (count, bucket) => {
    expect(bucketResultCount(count)).toBe(bucket);
  });
});

describe("analytics pageview sanitizer", () => {
  it("strips query strings and fragments while preserving origin and pathname", () => {
    const event = {
      type: "pageview" as const,
      url: "https://boilercompass.com/resources?q=mental%20health#results",
    };

    expect(sanitizeAnalyticsEvent(event)).toEqual({
      type: "pageview",
      url: "https://boilercompass.com/resources",
    });
  });

  it("preserves ports and encoded path segments", () => {
    expect(
      sanitizeAnalyticsEvent({
        type: "pageview" as const,
        url: "http://localhost:3000/resources/course%20tools?token=secret#top",
      }),
    ).toEqual({
      type: "pageview",
      url: "http://localhost:3000/resources/course%20tools",
    });
  });

  it.each(["not a url", "/relative?query=private", "data:text/plain,secret"])(
    "returns null for malformed or non-web URL %s",
    (url) => {
      expect(
        sanitizeAnalyticsEvent({ type: "pageview" as const, url }),
      ).toBeNull();
    },
  );
});
