import Link from "next/link";
import { PhoneCall } from "lucide-react";

export function EmergencyNotice() {
  return (
    <div className="emergency-notice" role="note">
      <div className="shell">
        <PhoneCall size={16} aria-hidden="true" />
        <span>
          <strong>Immediate emergency?</strong> Call 911.
        </span>
        <Link href="/support">View Purdue support resources</Link>
      </div>
    </div>
  );
}
