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
          <p className="eyebrow">Purdue resource directory</p>
          <h1>Find a Purdue resource</h1>
        </div>
        <p>
          Search by what you need to do, use common categories, or open more
          filters when you need them. Favorites and recently opened items stay
          in this browser—no account is needed.
        </p>
      </header>
      <ResourceDirectory initialQuery={q} />
    </div>
  );
}
