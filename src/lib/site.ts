export const siteConfig = {
  name: "BoilerCompass",
  tagline: "Your guide to Purdue, all in one place.",
  description:
    "An unofficial, student-friendly guide to Purdue resources, services, and common academic workflows.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://boilercompass.vercel.app",
  correctionsUrl:
    process.env.NEXT_PUBLIC_CORRECTIONS_URL ??
    "https://github.com/JugPanda/boilercompass/issues/new",
};

export function absoluteUrl(path = "") {
  return new URL(path, siteConfig.url).toString();
}
