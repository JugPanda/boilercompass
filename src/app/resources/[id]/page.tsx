import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CalendarCheck,
  CircleCheckBig,
  CircleX,
  ClipboardList,
  Flag,
  LogIn,
  Users,
} from "lucide-react";
import { CampusBadge, SourceBadge } from "@/components/resource-badges";
import { ResourceCard } from "@/components/resource-card";
import { ResourceLaunchButton } from "@/components/resource-launch-button";
import { guideBySlug } from "@/data/guides";
import { resourceById, resourceRegistry } from "@/data/resources";
import { audienceLabel } from "@/lib/resource-search";
import { siteConfig, socialImage } from "@/lib/site";

export function generateStaticParams() {
  return resourceRegistry.map(({ id }) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = resourceById.get(id);
  if (!resource) return {};
  return {
    title: resource.name,
    description: resource.shortDescription,
    alternates: { canonical: `/resources/${id}` },
    openGraph: {
      title: `${resource.name} | BoilerCompass`,
      description: resource.shortDescription,
      url: `/resources/${id}`,
      images: [socialImage.url],
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = resourceById.get(id);
  if (!resource) notFound();
  const related = resourceRegistry
    .filter(
      (item) => item.category === resource.category && item.id !== resource.id,
    )
    .slice(0, 3);
  const officialAlternatives = (resource.officialAlternativeIds ?? [])
    .map((alternativeId) => resourceById.get(alternativeId))
    .filter(
      (alternative): alternative is (typeof resourceRegistry)[number] =>
        alternative !== undefined,
    );
  const linkedGuides = (resource.guideSlugs ?? [])
    .map((guideSlug) => guideBySlug.get(guideSlug))
    .filter((guide): guide is NonNullable<typeof guide> => guide !== undefined);
  const correctionUrl = new URL(siteConfig.correctionsUrl);
  correctionUrl.searchParams.set("title", `Correction: ${resource.name}`);
  correctionUrl.searchParams.set(
    "body",
    `Resource: ${resource.name}\nListed URL: ${resource.url}\n\nWhat is outdated or broken?\n\nCurrent official source (if available):`,
  );

  return (
    <div className="page-shell">
      <Link className="back-link" href="/resources">
        <ArrowLeft size={16} /> All resources
      </Link>
      <article className="detail-layout">
        <div className="detail-main">
          <div className="detail-badges">
            <SourceBadge source={resource.sourceType} />
            {resource.campuses.map((campus) => (
              <CampusBadge key={campus} campus={campus} />
            ))}
          </div>
          <p className="eyebrow">{resource.category}</p>
          <h1>{resource.name}</h1>
          <p className="detail-lede">{resource.longDescription}</p>
          {resource.caution && (
            <div className="caution-box">
              <AlertTriangle size={21} />
              <div>
                <strong>Check before you act</strong>
                <p>{resource.caution}</p>
              </div>
            </div>
          )}
          {officialAlternatives.length > 0 && (
            <section className="official-alternatives">
              <h2>Official sources to verify</h2>
              <p>
                Use the independent tool to explore, then confirm decisions with
                these Purdue-operated sources.
              </p>
              <ul>
                {officialAlternatives.map((alternative) => (
                  <li key={alternative.id}>
                    <Link href={`/resources/${alternative.id}`}>
                      {alternative.name}
                    </Link>
                    <span>{alternative.shortDescription}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {linkedGuides.length > 0 && (
            <section className="resource-guides">
              <h2>
                <BookOpenCheck size={21} /> Step-by-step guidance
              </h2>
              <ul>
                {linkedGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                    <span>{guide.summary}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(resource.useWhen || resource.notFor || resource.beforeOpening) && (
            <section
              className="resource-task-context"
              aria-label="How to use this resource"
            >
              {resource.useWhen && (
                <div>
                  <h2>
                    <CircleCheckBig size={20} /> Use this when
                  </h2>
                  <ul>
                    {resource.useWhen.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resource.notFor && (
                <div>
                  <h2>
                    <CircleX size={20} /> This is not for
                  </h2>
                  <ul>
                    {resource.notFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resource.beforeOpening && (
                <div>
                  <h2>
                    <ClipboardList size={20} /> Prepare before opening
                  </h2>
                  <ul>
                    {resource.beforeOpening.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          <div className="detail-actions">
            <ResourceLaunchButton
              id={resource.id}
              name={resource.name}
              url={resource.url}
            />
            <a
              className="button button-secondary"
              href={correctionUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Report an outdated link in a new tab"
            >
              <Flag size={16} /> Report an outdated link
            </a>
          </div>
        </div>
        <aside className="detail-facts" aria-label="Resource facts">
          <h2>Before you open it</h2>
          <dl>
            <div>
              <dt>
                <CalendarCheck size={17} /> Last verified
              </dt>
              <dd>
                {new Date(
                  `${resource.lastVerified}T12:00:00Z`,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
                <small className="detail-date-note">
                  Official destination checked
                </small>
              </dd>
            </div>
            {resource.contentReviewed && (
              <div>
                <dt>
                  <CalendarCheck size={17} /> Content reviewed
                </dt>
                <dd>
                  {new Date(
                    `${resource.contentReviewed}T12:00:00Z`,
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                  <small className="detail-date-note">
                    BoilerCompass guidance reviewed
                  </small>
                </dd>
              </div>
            )}
            <div>
              <dt>
                <LogIn size={17} /> Purdue login
              </dt>
              <dd>
                {resource.requiresLogin ? "Required" : "Not required to start"}
              </dd>
            </div>
            <div>
              <dt>
                <Users size={17} /> Audience
              </dt>
              <dd>{resource.audiences.map(audienceLabel).join(", ")}</dd>
            </div>
          </dl>
          <div className="aliases">
            <strong>Search aliases</strong>
            <p>
              {resource.aliases.length
                ? resource.aliases.join(" · ")
                : "No additional aliases"}
            </p>
          </div>
        </aside>
      </article>
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <p className="eyebrow">Same route</p>
            <h2>Related resources</h2>
          </div>
          <div className="resource-grid">
            {related.map((item) => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
