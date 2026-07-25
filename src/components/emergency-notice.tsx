import Link from "next/link";
import { PhoneCall } from "lucide-react";

export function EmergencyNotice() {
  return (
    <aside className="emergency-notice" aria-label="Emergency help">
      <div className="shell">
        <PhoneCall size={16} aria-hidden="true" />
        <span>
          <strong>Call 911 for an immediate emergency.</strong>
        </span>
        <Link href="/support">View Purdue support resources</Link>
      </div>
    </aside>
  );
}
