import "server-only";
import { cookies } from "next/headers";

const backend =
  process.env.BACKEND_API_URL || "https://city-care-backend.vercel.app/api/v1";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function restoreSession() {
  const jar = await cookies();
  const access = jar.get("cc_access")?.value;
  if (access) {
    const check = await fetch(`${backend}/users/me`, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (check.ok) return true;
    if (check.status !== 401)
      throw new Error("Session verification unavailable");
  }
  const refreshToken = jar.get("cc_refresh")?.value;
  if (!refreshToken) return false;
  const response = await fetch(`${backend}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if ([401, 403, 404].includes(response.status)) {
    jar.delete("cc_access");
    jar.delete("cc_refresh");
    return false;
  }
  if (!response.ok) throw new Error("Session refresh unavailable");
  const { data } = await response.json();
  if (!data?.accessToken || !data?.refreshToken)
    throw new Error("Invalid session response");
  jar.set("cc_access", data.accessToken, { ...cookieOptions, maxAge: 86400 });
  jar.set("cc_refresh", data.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 86400,
  });
  return true;
}
