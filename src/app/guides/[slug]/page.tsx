import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
import { guideBySlug, guides } from "@/data/guides";
import { resourceRegistry } from "@/data/resources";

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
    .filter(Boolean) as typeof resourceRegistry;
  return (
    <div className="page-shell guide-detail">
      <Link className="back-link" href="/guides">
        <ArrowLeft size={16} /> All guides
      </Link>
      <header className="guide-hero">
        <p className="eyebrow">{guide.eyebrow}</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <span>
          <Clock3 size={16} /> {guide.readTime} read
        </span>
      </header>
      <div className="guide-body">
        <nav className="guide-toc" aria-label="On this page">
          <strong>On this page</strong>
          {guide.sections.map((section, index) => (
            <a key={section.heading} href={`#step-${index + 1}`}>
              0{index + 1} {section.heading}
            </a>
          ))}
        </nav>
        <article>
          {guide.sections.map((section, index) => (
            <section key={section.heading} id={`step-${index + 1}`}>
              <span className="step-number">0{index + 1}</span>
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
