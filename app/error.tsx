"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state">
      <h1>The experiment paused.</h1>
      <p>
        Something interrupted this view. Your saved scenarios remain on this
        device.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
