import type { Metadata, Viewport } from "next";
import { EmergencyNotice } from "@/components/emergency-notice";
import { SearchLauncherProvider } from "@/components/search-launcher";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { absoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "BoilerCompass — Your guide to Purdue",
    template: "%s | BoilerCompass",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "BoilerCompass — Your guide to Purdue",
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "BoilerCompass — an unofficial Purdue student resource guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoilerCompass — Your guide to Purdue",
    description: siteConfig.description,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3e9" },
    { media: "(prefers-color-scheme: dark)", color: "#11100e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <SearchLauncherProvider>
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
            <EmergencyNotice />
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
          </SearchLauncherProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
