import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="panel">
        <h1>Character not found</h1>
        <p className="muted">That record is not in the current catalog.</p>
        <Link className="text-button" href="/">
          Return to catalog
        </Link>
      </section>
    </div>
  );
}
