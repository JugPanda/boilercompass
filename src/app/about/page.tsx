import type { Metadata } from "next";
import {
  CheckCircle2,
  Database,
  Eye,
  Flag,
  LockKeyhole,
  Tags,
} from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About and methodology",
  description:
    "How BoilerCompass selects, labels, verifies, and corrects Purdue student resources, plus privacy and unofficial-status information.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const correctionUrl = new URL(siteConfig.correctionsUrl);
  correctionUrl.searchParams.set("title", "BoilerCompass resource correction");
  correctionUrl.searchParams.set(
    "body",
    "Resource or page:\n\nWhat is outdated or broken?\n\nCurrent official source (if available):",
  );
  return (
    <div className="page-shell about-page">
      <header className="page-header">
        <p className="eyebrow">About BoilerCompass</p>
        <h1>Know who runs a link before you open it.</h1>
        <p>
          BoilerCompass is an unofficial, independent student resource guide. No
          account is needed, and the site does not collect Purdue passwords or
          make academic decisions for students.
        </p>
      </header>
      <section className="method-grid">
        <div>
          <Database />
          <h2>What this site does</h2>
          <p>
            BoilerCompass brings common Purdue and student resources into one
            searchable directory. Each listing explains who runs the
            destination, where it applies, whether login is expected, and when
            its link was checked.
          </p>
        </div>
        <div>
          <Tags />
          <h2>Source labels</h2>
          <p>
            <strong>Official Purdue</strong> means Purdue operates the
            destination. <strong>Purdue-affiliated</strong> means it is
            connected to Purdue people or organizations but may not be
            university-operated. <strong>Independent / third-party</strong>{" "}
            means outside context that must be checked against official sources.
          </p>
        </div>
        <div>
          <Eye />
          <h2>Verification</h2>
          <p>
            Public links are checked for live responses and redirects, then
            descriptions are reviewed against current official wording.
            Authentication redirects are reviewed rather than automatically
            marked broken.
          </p>
        </div>
        <div>
          <CheckCircle2 />
          <h2>How the directory is maintained</h2>
          <p>
            Listings live in a typed, schema-validated registry. A resource must
            answer a common student need, have a clear operator, and add enough
            context to prevent a blind click. BoilerCompass does not invent
            deadlines, popularity, status, or usage data.
          </p>
        </div>
      </section>
      <section id="privacy" className="about-block">
        <LockKeyhole />
        <div>
          <p className="eyebrow">Privacy</p>
          <h2>No accounts. No Purdue passwords.</h2>
          <p>
            BoilerCompass does not use Purdue authentication, proxy
            authenticated systems, or store student records. Favorites and
            recently opened resources stay in your browser’s local storage. No
            analytics or tracking are enabled by default.
          </p>
        </div>
      </section>
      <section id="corrections" className="about-block">
        <Flag />
        <div>
          <p className="eyebrow">Corrections</p>
          <h2>Links move. Tell us when one does.</h2>
          <p>
            Include the resource name, the listed URL, what failed, and the
            current official destination if you have it. Do not include
            passwords, student records, medical information, or other sensitive
            data.
          </p>
          <a
            className="button button-primary"
            href={correctionUrl.toString()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report a correction in a new tab"
          >
            Report a correction
          </a>
        </div>
      </section>
      <section className="unofficial-block">
        <h2>Unofficial status</h2>
        <p>
          BoilerCompass is an independent student resource directory and is not
          affiliated with, endorsed by, or operated by Purdue University. Purdue
          names and third-party service names belong to their respective owners.
        </p>
      </section>
    </div>
  );
}
