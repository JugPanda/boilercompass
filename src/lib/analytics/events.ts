import { track } from "@vercel/analytics";
import { z } from "zod";

const resourceOpenedSchema = z
  .object({
    source_type: z.enum(["official", "purdue_affiliated", "third_party"]),
  })
  .strict();

const searchSubmittedSchema = z
  .object({
    result_count_bucket: z.enum(["0", "1", "2-5", "6-10", "11+"]),
    surface: z.enum(["launcher", "directory"]),
  })
  .strict();

const searchNoResultsSchema = z
  .object({ surface: z.enum(["launcher", "directory"]) })
  .strict();

const categoryFilterSelectedSchema = z
  .object({ category_group: z.enum(["academics", "career", "core"]) })
  .strict();

const feedbackSubmittedSchema = z
  .object({ surface: z.enum(["about", "resource"]) })
  .strict();

const analyticsEventSchemas = {
  resource_opened: resourceOpenedSchema,
  search_submitted: searchSubmittedSchema,
  search_no_results: searchNoResultsSchema,
  category_filter_selected: categoryFilterSelectedSchema,
  feedback_submitted: feedbackSubmittedSchema,
} as const;

export type AnalyticsEventName = keyof typeof analyticsEventSchemas;
export type AnalyticsEventProperties = {
  [Name in AnalyticsEventName]: z.infer<(typeof analyticsEventSchemas)[Name]>;
};

type RawAnalyticsTrack = (
  name: string,
  properties?: Record<string, string>,
) => void;

export function trackAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventProperties[Name],
  rawTrack: RawAnalyticsTrack = track,
): boolean {
  try {
    if (!Object.hasOwn(analyticsEventSchemas, name)) return false;

    const schema = analyticsEventSchemas[name];
    const parsed = schema.safeParse(properties);
    if (!parsed.success) return false;

    rawTrack(name, parsed.data);
    return true;
  } catch {
    return false;
  }
}

export type ResultCountBucket =
  AnalyticsEventProperties["search_submitted"]["result_count_bucket"];

export function bucketResultCount(count: number): ResultCountBucket {
  if (count <= 0) return "0";
  if (count === 1) return "1";
  if (count <= 5) return "2-5";
  if (count <= 10) return "6-10";
  return "11+";
}

const safeCategoryGroups = {
  "Core portals": "core",
  "Classes & academics": "academics",
  "Advising & degree planning": "academics",
  "Study & course tools": "academics",
  "Careers & involvement": "career",
} as const satisfies Record<
  string,
  AnalyticsEventProperties["category_filter_selected"]["category_group"]
>;

export function mapCategoryToAnalyticsGroup(
  category: string,
):
  | AnalyticsEventProperties["category_filter_selected"]["category_group"]
  | null {
  if (!Object.hasOwn(safeCategoryGroups, category)) return null;
  return safeCategoryGroups[category as keyof typeof safeCategoryGroups];
}

export function sanitizeAnalyticsEvent<Event extends { url: string }>(
  event: Event,
): Event | null {
  try {
    const parsedUrl = new URL(event.url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return null;
    }

    return {
      ...event,
      url: `${parsedUrl.origin}${parsedUrl.pathname}`,
    };
  } catch {
    return null;
  }
}
