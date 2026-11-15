export default function NotFound() {
  return (
    <main className="empty-state">
      <span className="eyebrow">Ember Atlas · 404</span>
      <h1>Outside the observation field.</h1>
      <p>That page is not in this research workspace.</p>
      <a href="/" className="button primary">
        Return to the dashboard
      </a>
    </main>
  );
}
