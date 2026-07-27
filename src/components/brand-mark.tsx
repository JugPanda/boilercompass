import { BoilerCompassSymbol } from "@/components/boilercompass-logo";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup">
      <span className="brand-icon" aria-hidden="true">
        <BoilerCompassSymbol size={24} />
      </span>
      {!compact && <span>BoilerCompass</span>}
    </span>
  );
}
