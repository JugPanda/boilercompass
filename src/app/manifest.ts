import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f2e8",
    theme_color: "#11100e",
    icons: [
      {
        src: "/brand/boilercompass-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/boilercompass-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
