import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PublicActivityDetail } from "@/components/public-activity";

export const metadata: Metadata = {
  title: "Public activity",
  description:
    "Best-effort aggregate BoilerCompass activity, metric definitions, privacy limits, and accessible exact-value trends.",
  alternates: { canonical: "/about/activity" },
};

export default function ActivityPage() {
  return (
    <div className="page-shell activity-page">
      <Link className="back-link" href="/about">
        <ArrowLeft size={16} aria-hidden="true" /> About BoilerCompass
      </Link>
      <header className="page-header activity-page-header">
        <p className="eyebrow">Public activity</p>
        <h1>BoilerCompass activity, in broad strokes.</h1>
        <p>
          This page requests privacy-limited totals from the public stats
          endpoint. It never shows a person’s searches, browsing path, identity,
          or individual session. Missing data stays unavailable rather than
          becoming a made-up zero.
        </p>
      </header>

      <PublicActivityDetail />

      <section
        className="activity-limitations"
        aria-labelledby="activity-limits-title"
      >
        <ShieldCheck aria-hidden="true" />
        <div>
          <p className="eyebrow">Limits and privacy</p>
          <h2 id="activity-limits-title">
            Useful evidence, not an exact census.
          </h2>
          <ul>
            <li>
              Active sessions are anonymous browser sessions seen while the page
              is visible; bots and separate browsers or devices can be counted.
            </li>
            <li>
              JavaScript blockers, network failures, privacy tools, and closed
              or background tabs can make every total incomplete.
            </li>
            <li>
              Only broad public aggregates are exposed here. Private analytics
              dimensions are not returned by the public endpoint.
            </li>
            <li>
              Since-start page views begin only at the configured tracking start
              date and are not backfilled from older request logs.
            </li>
          </ul>
          <Link href="/about#privacy">Read the full privacy explanation</Link>
        </div>
      </section>
    </div>
  );
}
