import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Flag,
  LogIn,
  Users,
} from "lucide-react";
import { CampusBadge, SourceBadge } from "@/components/resource-badges";
import { ResourceCard } from "@/components/resource-card";
import { ResourceLaunchButton } from "@/components/resource-launch-button";
import { resourceById, resourceRegistry } from "@/data/resources";
import { audienceLabel } from "@/lib/resource-search";
import { siteConfig } from "@/lib/site";

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
    .filter(Boolean) as typeof resourceRegistry;
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
              </dd>
            </div>
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
