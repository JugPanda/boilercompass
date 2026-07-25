import { Compass } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <span className="brand-icon" aria-hidden="true">
        <Compass size={20} strokeWidth={2.4} />
      </span>
      {!compact && <span>BoilerCompass</span>}
    </span>
  );
}
