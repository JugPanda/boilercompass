import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { resourceRegistry } from "@/data/resources";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = "2026-07-25";
  const staticRoutes = ["", "/resources", "/guides", "/about", "/support"];
  return [
    ...staticRoutes.map((route, index) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: index === 0 ? 1 : 0.8,
    })),
    ...resourceRegistry.map((resource) => ({
      url: absoluteUrl(`/resources/${resource.id}`),
      lastModified: resource.lastVerified,
      changeFrequency: "monthly" as const,
      priority: resource.featured ? 0.7 : 0.5,
    })),
    ...guides.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
