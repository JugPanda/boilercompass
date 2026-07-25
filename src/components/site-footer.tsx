import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark />
          <p>Your guide to Purdue, all in one place.</p>
        </div>
        <div>
          <strong>Explore</strong>
          <Link href="/resources">All resources</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/support">Emergency & support</Link>
        </div>
        <div>
          <strong>Project</strong>
          <Link href="/about">About & methodology</Link>
          <Link href="/about#privacy">Privacy</Link>
          <Link href="/about#corrections">Report a correction</Link>
        </div>
      </div>
      <div className="shell legal-row">
        <p>
          BoilerCompass is an independent student resource directory and is not
          affiliated with, endorsed by, or operated by Purdue University. Purdue
          names and third-party service names belong to their respective owners.
        </p>
        <span>Updated July 2026</span>
      </div>
    </footer>
  );
}
