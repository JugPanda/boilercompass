import Link from "next/link";
import { ArrowRight, Route, ShieldCheck, Sparkles } from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { ResourceCard } from "@/components/resource-card";
import { RouteMotif } from "@/components/route-motif";
import { SourceLabelHelp } from "@/components/source-label-help";
import { guides } from "@/data/guides";
import { resourceRegistry, type ResourceCategory } from "@/data/resources";
import { categoryIcons } from "@/lib/category-icons";

const tasks: Array<{
  title: string;
  copy: string;
  category: ResourceCategory;
}> = [
  {
    title: "Plan classes",
    copy: "Catalog, registration, course context, and planning tools.",
    category: "Classes & academics",
  },
  {
    title: "Meet with an advisor",
    copy: "Advising appointments, degree planning, and decision preparation.",
    category: "Advising & degree planning",
  },
  {
    title: "Find study support",
    copy: "Tutoring, study sessions, writing, and course tools.",
    category: "Study & course tools",
  },
  {
    title: "Careers and organizations",
    copy: "Career coaching, jobs, student groups, and campus involvement.",
    category: "Careers & involvement",
  },
  {
    title: "Health and support",
    copy: "Medical, counseling, advocacy, and student support.",
    category: "Health, support & safety",
  },
  {
    title: "Money and billing",
    copy: "Financial aid, billing, emergency resources, and admin help.",
    category: "Money & administration",
  },
  {
    title: "Campus life and transportation",
    copy: "Maps, transit, dining, housing, recreation, and daily logistics.",
    category: "Campus life & logistics",
  },
];

const featuredIds = ["mypurdue", "brightspace", "boilerconnect", "boilerlink"];
const featured = featuredIds
  .map((id) => resourceRegistry.find((item) => item.id === id))
  .filter(
    (resource): resource is (typeof resourceRegistry)[number] =>
      resource !== undefined,
  );

const featuredGuideSlugs = [
  "parking-and-bringing-a-car",
  "understanding-financial-aid-offer",
  "laundry-in-university-residences",
  "new-student-essentials",
];
const featuredGuides = featuredGuideSlugs
  .map((slug) => guides.find((guide) => guide.slug === slug))
  .filter((guide): guide is (typeof guides)[number] => guide !== undefined);

export default function Home() {
  return (
    <>
      <section className="hero">
        <RouteMotif />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} /> Unofficial student resource guide
            </p>
            <h1>Find the right Purdue resource.</h1>
            <p className="hero-lede">
              Search by what you need to do, then see whether each result is
              official, who it is for, and where it applies.
            </p>
            <GlobalSearch />
            <div className="hero-actions">
              <Link className="button button-primary" href="/resources">
                Browse all resources <ArrowRight size={17} />
              </Link>
              <Link
                className="button button-ghost"
                href="/guides/advisor-meeting-prep"
              >
                Prepare for advising
              </Link>
            </div>
          </div>
          <aside className="route-card" aria-label="How BoilerCompass helps">
            <div className="route-card-head">
              <span>Compass route</span>
              <Route size={22} />
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>Find the right door</strong>
                  <p>Search aliases, needs, and common shortcuts.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Check the source</strong>
                  <p>See who operates it and which campus it covers.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Prepare before you go</strong>
                  <p>Read cautions and guided next steps.</p>
                </div>
              </li>
            </ol>
            <p className="route-note">
              <ShieldCheck size={16} /> No Purdue login or student data
              collected.
            </p>
          </aside>
        </div>
      </section>

      <section className="section section-tight">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Fast launch</p>
              <h2>Most-used Purdue tools</h2>
            </div>
            <Link href="/resources">
              See every resource <ArrowRight size={16} />
            </Link>
          </div>
          <SourceLabelHelp />
          <div className="resource-grid featured-grid">
            {featured.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      <section className="section task-section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Start with the task</p>
            <h2>What are you trying to do?</h2>
            <p>You do not need to know the name of the Purdue office first.</p>
          </div>
          <div className="task-grid">
            {tasks.map(({ title, copy, category }, index) => {
              const Icon = categoryIcons[category];
              return (
                <Link
                  key={title}
                  className={`task-card task-${index + 1}`}
                  href={`/resources?category=${encodeURIComponent(category)}`}
                >
                  <span className="task-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <Icon size={24} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <span className="task-arrow" aria-hidden="true">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section guide-band">
        <div className="shell guide-band-grid">
          <div className="guide-intro">
            <p className="eyebrow">Not just bookmarks</p>
            <h2>Guides for decisions with consequences.</h2>
            <p>
              Get ready for advising, understand official terminology, and know
              which questions to verify before changing your plan.
            </p>
            <Link className="button button-primary" href="/guides">
              Browse all guides <ArrowRight size={17} />
            </Link>
          </div>
          <div className="guide-stack">
            {featuredGuides.map((guide, index) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <span aria-hidden="true">0{index + 1}</span>
                <div>
                  <strong>{guide.title}</strong>
                  <p>{guide.summary}</p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section trust-section">
        <div className="shell trust-grid">
          <div>
            <p className="eyebrow">Trust, made visible</p>
            <h2>A link should tell you what it is before you click.</h2>
          </div>
          <div className="trust-points">
            <div>
              <span className="badge source-official">Official Purdue</span>
              <p>Operated on Purdue’s official web presence.</p>
            </div>
            <div>
              <span className="badge source-purdue_affiliated">
                Purdue-affiliated
              </span>
              <p>
                Connected to Purdue people or organizations, but not necessarily
                a university-operated service.
              </p>
            </div>
            <div>
              <span className="badge source-third_party">
                Independent / third-party
              </span>
              <p>
                Useful outside context that must be checked against official
                sources.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
