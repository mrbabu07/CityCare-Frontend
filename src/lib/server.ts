import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Envelope, User } from "./types";
export const backend =
  process.env.BACKEND_API_URL || "https://city-care-backend.vercel.app/api/v1";
export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get("cc_access")?.value;
  if (!token) return null;
  const res = await fetch(`${backend}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401) return null;
  if (!res.ok)
    throw new Error("CityCare is temporarily unavailable. Please try again.");
  const body: Envelope<User> = await res.json();
  return body.data;
});
