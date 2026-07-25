import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="empty-state not-found">
        <span>404</span>
        <h1>That route is not on the map.</h1>
        <p>The resource may have moved or the address may be incomplete.</p>
        <div>
          <Link className="button button-primary" href="/resources">
            Search resources
          </Link>
          <Link className="button button-secondary" href="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
