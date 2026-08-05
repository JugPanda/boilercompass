import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { GuideToc } from "@/components/guide-toc";
import { ResourceCard } from "@/components/resource-card";
import { guideBySlug, guides } from "@/data/guides";
import { resourceRegistry } from "@/data/resources";
import { socialImage } from "@/lib/site";

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  return guide
    ? {
        title: guide.title,
        description: guide.summary,
        alternates: { canonical: `/guides/${slug}` },
        openGraph: {
          title: `${guide.title} | BoilerCompass`,
          description: guide.summary,
          url: `/guides/${slug}`,
          images: [socialImage.url],
        },
      }
    : {};
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug.get(slug);
  if (!guide) notFound();
  const resources = guide.resourceIds
    .map((id) => resourceRegistry.find((resource) => resource.id === id))
    .filter(
      (resource): resource is (typeof resourceRegistry)[number] =>
        resource !== undefined,
    );
  return (
    <div className="page-shell guide-detail">
      <Link className="back-link" href="/guides">
        <ArrowLeft size={16} /> All guides
      </Link>
      <header className="guide-hero">
        <p className="eyebrow">{guide.eyebrow}</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <div className="guide-meta">
          <span>
            <Clock3 size={16} /> {guide.readTime} read
          </span>
          {guide.lastReviewed && (
            <span>
              <CalendarCheck size={16} /> Reviewed{" "}
              {new Date(`${guide.lastReviewed}T12:00:00Z`).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                },
              )}
            </span>
          )}
        </div>
      </header>
      <div className="guide-body">
        <GuideToc headings={guide.sections.map((section) => section.heading)} />
        <article>
          {guide.sections.map((section, index) => (
            <section key={section.heading} id={`step-${index + 1}`}>
              <span className="step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
              {section.checklist && (
                <ul className="checklist">
                  {section.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <div className="caution-box">
            <AlertTriangle size={21} />
            <div>
              <strong>Verify before deciding</strong>
              <p>{guide.caution}</p>
            </div>
          </div>
        </article>
      </div>
      {guide.sources && guide.sources.length > 0 && (
        <section
          className="guide-sources"
          aria-labelledby="guide-sources-title"
        >
          <p className="eyebrow">Direct citations</p>
          <h2 id="guide-sources-title">Official references reviewed</h2>
          <p className="guide-sources-note">
            BoilerCompass provides the plain-language guidance above. These
            Purdue pages are the controlling sources for current details.
          </p>
          <ul>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} <ExternalLink size={15} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="related-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Open the source</p>
            <h2>Resources for this guide</h2>
          </div>
          <Link href="/resources">
            All resources <ArrowRight size={16} />
          </Link>
        </div>
        <div className="resource-grid">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>
    </div>
  );
}
