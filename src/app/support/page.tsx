import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  HeartHandshake,
  PhoneCall,
  Shield,
  Stethoscope,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Emergency and support",
  description:
    "Calm, direct access to official Purdue emergency, counseling, medical, advocacy, and student-support resources.",
  alternates: { canonical: "/support" },
};
const links = [
  {
    title: "Purdue emergency status",
    copy: "Official status for West Lafayette and Indianapolis.",
    href: "https://www.purdue.edu/emergency/",
    icon: Shield,
  },
  {
    title: "CAPS crisis guidance",
    copy: "Current mental-health crisis instructions and support options.",
    href: "https://www.purdue.edu/caps/crisis.php",
    icon: HeartHandshake,
  },
  {
    title: "PUSH",
    copy: "Student medical-service and appointment guidance.",
    href: "https://www.purdue.edu/push/",
    icon: Stethoscope,
  },
  {
    title: "Office of the Dean of Students",
    copy: "Student support, advocacy, and help finding the right office.",
    href: "https://www.purdue.edu/odos/",
    icon: PhoneCall,
  },
];
export default function SupportPage() {
  return (
    <div className="page-shell support-page">
      <header className="support-hero">
        <p className="eyebrow">Emergency & support</p>
        <h1>Start with the right level of help.</h1>
        <p>
          BoilerCompass is a directory—not an emergency, medical, counseling, or
          crisis service.
        </p>
        <div className="callout-911">
          <PhoneCall size={25} />
          <div>
            <strong>Call 911 for an immediate emergency.</strong>
            <span>Do not wait for a website response.</span>
          </div>
        </div>
        <p>
          For a mental-health crisis, use Purdue CAPS’ current crisis guidance
          or call or text <strong>988</strong>.
        </p>
      </header>
      <section>
        <div className="section-heading">
          <h2>Official Purdue support</h2>
          <p>
            Open current official pages for service details and campus-specific
            contacts.
          </p>
        </div>
        <div className="support-grid">
          {links.map(({ title, copy, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{copy}</p>
              <span>
                Open official page <ArrowUpRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <div className="support-note">
        <strong>Not sure where to start?</strong>
        <p>
          The Office of the Dean of Students can help identify the appropriate
          student-support path. Campus and service availability can differ
          between West Lafayette, Indianapolis, online, and statewide programs.
        </p>
        <Link href="/resources?q=health%20support">
          Compare support resources
        </Link>
      </div>
    </div>
  );
}
