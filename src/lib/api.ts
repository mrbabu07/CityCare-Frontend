import type { Envelope } from "./types";
import { refreshSession } from "./refresh";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const send = () =>
    fetch(`/api/backend/${path}`, {
      ...init,
      headers: {
        ...(init?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init?.headers,
      },
    });
  let response = await send();
  if (response.status === 401) {
    if (await refreshSession()) response = await send();
    // A full navigation drops cached protected UI after session expiry.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (response.status === 401) window.location.assign("/login");
  }
  const result: Envelope<T> = await response.json();
  if (!response.ok || !result.success)
    throw new ApiError(result.message || "Request failed", response.status);
  return result.data;
}
