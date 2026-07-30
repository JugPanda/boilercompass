export const siteConfig = {
  name: "BoilerCompass",
  tagline: "Your guide to Purdue, all in one place.",
  description:
    "An unofficial, student-friendly guide to Purdue resources, services, and common academic workflows.",
  url: "https://boilercompass.com",
  correctionsUrl:
    process.env.NEXT_PUBLIC_CORRECTIONS_URL ??
    "https://github.com/JugPanda/boilercompass/issues/new",
};

export function absoluteUrl(path = "") {
  return new URL(path, siteConfig.url).toString();
}

export const socialImage = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: "BoilerCompass — an unofficial Purdue student resource guide",
} as const;
