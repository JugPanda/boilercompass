import Link from "next/link";
import { Menu, ShieldPlus } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  ["Resources", "/resources"],
  ["Guides", "/guides"],
  ["About", "/about"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand-link" aria-label="BoilerCompass home">
          <BrandMark />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="support-link" href="/support">
            <ShieldPlus size={17} /> Support now
          </Link>
          <ThemeToggle />
          <details className="mobile-menu">
            <summary aria-label="Open navigation">
              <Menu size={20} />
            </summary>
            <nav aria-label="Mobile navigation">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <Link href="/support">Emergency & support</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
