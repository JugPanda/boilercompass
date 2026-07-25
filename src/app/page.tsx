import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CircleDollarSign,
  GraduationCap,
  HeartPulse,
  Map,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { ResourceCard } from "@/components/resource-card";
import { guides } from "@/data/guides";
import { resourceRegistry } from "@/data/resources";

const tasks = [
  {
    title: "Plan classes",
    copy: "Catalog, registration, course context, and planning tools.",
    query: "course planning",
    icon: BookOpen,
  },
  {
    title: "Get academic help",
    copy: "Tutoring, study sessions, writing, and accessibility support.",
    query: "academic help",
    icon: GraduationCap,
  },
  {
    title: "Find an organization",
    copy: "Browse student groups, events, and campus involvement.",
    query: "clubs",
    icon: Users,
  },
  {
    title: "Career and jobs",
    copy: "Career coaching, recruiting, internships, and job tools.",
    query: "career jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "Health and support",
    copy: "Medical, counseling, advocacy, and student support.",
    query: "health support",
    icon: HeartPulse,
  },
  {
    title: "Money and billing",
    copy: "Financial aid, billing, emergency resources, and admin help.",
    query: "financial billing",
    icon: CircleDollarSign,
  },
  {
    title: "Get around campus",
    copy: "Maps, transit, dining, housing, and recreation.",
    query: "campus transit",
    icon: Map,
  },
];

const featuredIds = ["mypurdue", "brightspace", "boilerconnect", "boilerlink"];
const featured = featuredIds
  .map((id) => resourceRegistry.find((item) => item.id === id))
  .filter(Boolean) as typeof resourceRegistry;

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-map" aria-hidden="true">
          <span className="ring-one ring" />
          <span className="ring-two ring" />
          <span className="route-line" />
          <span className="map-point point-one" />
          <span className="map-point point-two" />
        </div>
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={14} /> Independent Purdue resource guide
            </p>
            <h1>Your route through Purdue starts here.</h1>
            <p className="hero-lede">
              Find the right official portal, understand what it does, and move
              through common student tasks with fewer dead ends.
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
              <h2>The four doors students open most</h2>
            </div>
            <Link href="/resources">
              See every resource <ArrowRight size={16} />
            </Link>
          </div>
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
            {tasks.map(({ title, copy, query, icon: Icon }, index) => (
              <Link
                key={title}
                className={`task-card task-${index + 1}`}
                href={`/resources?q=${encodeURIComponent(query)}`}
              >
                <span className="task-index">0{index + 1}</span>
                <Icon size={24} />
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="task-arrow">
                  <ArrowRight size={17} />
                </span>
              </Link>
            ))}
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
            {guides.slice(0, 4).map((guide, index) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <span>0{index + 1}</span>
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
