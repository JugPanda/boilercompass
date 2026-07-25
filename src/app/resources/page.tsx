import type { Metadata } from "next";
import { ResourceDirectory } from "@/components/resource-directory";

export const metadata: Metadata = {
  title: "All resources",
  description:
    "Search and filter curated Purdue resources by task, source type, campus, audience, and login requirement.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return (
    <div className="page-shell shell-wide">
      <header className="page-header page-header-split">
        <div>
          <p className="eyebrow">Auditable directory</p>
          <h1>All resources</h1>
        </div>
        <p>
          Search by what you need, then verify the source, campus scope, and
          last-checked date before opening it.
        </p>
      </header>
      <ResourceDirectory initialQuery={q} />
    </div>
  );
}
