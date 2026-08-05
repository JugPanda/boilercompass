import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarCheck } from "lucide-react";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Student guides",
  description:
    "Plain-language Purdue student guides for parking, financial aid, laundry, advising, degree planning, academic help, and new-student essentials.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">
          <BookOpenCheck size={15} /> Guided tasks
        </p>
        <h1>Know the next question to ask.</h1>
        <p>
          These guides explain the shape of a task without pretending changeable
          policies are permanent. Every consequential decision points back to
          current Purdue sources and advisors.
        </p>
      </header>
      <div className="guide-grid">
        {guides.map((guide, index) => (
          <Link
            key={guide.slug}
            className="guide-card"
            href={`/guides/${guide.slug}`}
          >
            <div className="guide-card-top">
              <span aria-hidden="true">0{index + 1}</span>
              <small>{guide.readTime} read</small>
            </div>
            <p className="eyebrow">{guide.eyebrow}</p>
            <h2>{guide.title}</h2>
            <p>{guide.summary}</p>
            {guide.lastReviewed && (
              <span className="guide-card-reviewed">
                <CalendarCheck size={15} aria-hidden="true" /> Reviewed{" "}
                {new Date(`${guide.lastReviewed}T12:00:00Z`).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )}
              </span>
            )}
            <span className="guide-card-link">
              Read guide <ArrowRight size={17} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
