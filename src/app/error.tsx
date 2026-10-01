"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="not-found">
      <h1>Something interrupted the connection.</h1>
      <p>Please try again in a moment.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link href="/">Return home</Link>
    </main>
  );
}
