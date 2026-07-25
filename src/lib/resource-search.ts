import Fuse from "fuse.js";
import type {
  Audience,
  Campus,
  Resource,
  ResourceSourceType,
} from "@/data/resources";

export type ResourceFilters = {
  category?: string;
  sourceType?: ResourceSourceType | "all";
  campus?: Campus | "all";
  audience?: Audience | "all";
  requiresLogin?: "all" | "yes" | "no";
};

const shortcuts: Record<string, string> = {
  bs: "brightspace",
  mp: "mypurdue",
  bc: "boilerconnect",
  clubs: "boilerlink",
  codo: "codo",
  therapy: "caps",
  doctor: "push",
};

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function searchResources(
  resources: Resource[],
  query: string,
): Resource[] {
  const q = normalized(query);
  if (!q) return resources;

  const shortcutId = shortcuts[q];
  const fuse = new Fuse(resources, {
    keys: [
      { name: "name", weight: 0.8 },
      { name: "aliases", weight: 0.12 },
      { name: "tags", weight: 0.04 },
      { name: "shortDescription", weight: 0.03 },
      { name: "longDescription", weight: 0.01 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  });
  const results = fuse
    .search(q)
    .sort((a, b) => {
      const scoreGap = Math.abs((a.score ?? 1) - (b.score ?? 1));
      if (scoreGap < 0.04 && a.item.featured !== b.item.featured) {
        return Number(b.item.featured) - Number(a.item.featured);
      }
      return (a.score ?? 1) - (b.score ?? 1);
    })
    .map(({ item }) => item);

  if (shortcutId) {
    const shortcut = resources.find((item) => item.id === shortcutId);
    return shortcut
      ? [shortcut, ...results.filter((item) => item.id !== shortcutId)]
      : results;
  }
  return results;
}

export function filterResources(
  resources: Resource[],
  filters: ResourceFilters,
): Resource[] {
  return resources.filter((resource) => {
    if (
      filters.category &&
      filters.category !== "all" &&
      resource.category !== filters.category
    )
      return false;
    if (
      filters.sourceType &&
      filters.sourceType !== "all" &&
      resource.sourceType !== filters.sourceType
    )
      return false;
    if (
      filters.campus &&
      filters.campus !== "all" &&
      !resource.campuses.includes(filters.campus)
    )
      return false;
    if (
      filters.audience &&
      filters.audience !== "all" &&
      !resource.audiences.includes(filters.audience)
    )
      return false;
    if (filters.requiresLogin === "yes" && !resource.requiresLogin)
      return false;
    if (filters.requiresLogin === "no" && resource.requiresLogin) return false;
    return true;
  });
}

export function sourceLabel(source: ResourceSourceType) {
  return {
    official: "Official Purdue",
    purdue_affiliated: "Purdue-affiliated",
    third_party: "Independent / third-party",
  }[source];
}

export function campusLabel(campus: Campus) {
  return {
    west_lafayette: "West Lafayette",
    indianapolis: "Indianapolis",
    online: "Online",
    statewide: "Purdue system / statewide",
    all_or_verify: "Verify campus applicability",
  }[campus];
}

export function audienceLabel(audience: Audience) {
  return {
    all_students: "All students",
    undergraduate: "Undergraduate",
    graduate: "Graduate",
    prospective: "Prospective students",
    new_students: "New students",
  }[audience];
}

export function sortResources(
  resources: Resource[],
  sort: "featured" | "alphabetical" | "verified",
) {
  return [...resources].sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "verified")
      return (
        b.lastVerified.localeCompare(a.lastVerified) ||
        a.name.localeCompare(b.name)
      );
    return (
      Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name)
    );
  });
}
