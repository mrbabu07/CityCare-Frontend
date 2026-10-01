"use client";
import { AlertCircle, RotateCcw } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty">
      <AlertCircle size={34} />
      <h2>We couldn&apos;t load this page.</h2>
      <p>Please check your connection and try again.</p>
      <button className="button primary" onClick={reset}>
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
