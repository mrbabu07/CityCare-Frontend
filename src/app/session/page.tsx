"use client";
import { useEffect, useState } from "react";
import { refreshSession } from "@/lib/refresh";

export default function SessionPage() {
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    refreshSession()
      .then((ok) => {
        if (active) window.location.replace(ok ? "/dashboard" : "/login");
      })
      .catch(() => {
        if (active) setError("Cannot reconnect to CityCare. Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="page-container">
      <p role="status">{error || "Restoring your session..."}</p>
      {error && (
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      )}
    </main>
  );
}
