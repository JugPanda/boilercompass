import type { Campus, ResourceSourceType } from "@/data/resources";
import { campusLabel, sourceLabel } from "@/lib/resource-search";

export function SourceBadge({ source }: { source: ResourceSourceType }) {
  return (
    <span className={`badge source-${source}`}>{sourceLabel(source)}</span>
  );
}

export function CampusBadge({ campus }: { campus: Campus }) {
  return <span className="badge badge-muted">{campusLabel(campus)}</span>;
}
