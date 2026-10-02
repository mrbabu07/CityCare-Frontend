import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backend } from "@/lib/server";
import { restoreSession, cookieOptions } from "@/lib/session";
import { roleHome, type Role, type User } from "@/lib/types";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  const { action } = await context.params;
  if (!["login", "register", "demo", "logout", "refresh"].includes(action))
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  const jar = await cookies();
  try {
    if (action === "refresh") {
      const success = await restoreSession();
      return NextResponse.json(
        { success },
        {
          status: success ? 200 : 401,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }
    if (action === "logout") {
      await restoreSession().catch(() => false);
      const access = jar.get("cc_access")?.value;
      const refreshToken = jar.get("cc_refresh")?.value;
      if (access && refreshToken)
        await fetch(`${backend}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ refreshToken }),
          signal: AbortSignal.timeout(10000),
        }).catch(() => null);
      jar.delete("cc_access");
      jar.delete("cc_refresh");
      return NextResponse.json({ success: true });
    }
    let body = await request.json();
    if (action === "demo") {
      const role = String(body.role) as Role;
      if (!Object.hasOwn(roleHome, role))
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      const email = process.env[`DEMO_${role}_EMAIL`];
      const password = process.env[`DEMO_${role}_PASSWORD`];
      if (!email || !password)
        return NextResponse.json(
          { message: "This demo account has not been configured yet." },
          { status: 503 },
        );
      body = { email, password };
    }
    const upstream = await fetch(
      `${backend}/auth/${action === "demo" ? "login" : action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      },
    );
    const result = await upstream.json();
    if (!upstream.ok)
      return NextResponse.json(
        { message: result.message, errors: result.errors },
        { status: upstream.status },
      );
    const { accessToken, refreshToken, user } = result.data as {
      accessToken: string;
      refreshToken: string;
      user: User;
    };
    const options = cookieOptions;
    jar.set("cc_access", accessToken, { ...options, maxAge: 86400 });
    jar.set("cc_refresh", refreshToken, { ...options, maxAge: 7 * 86400 });
    return NextResponse.json({ success: true, redirect: roleHome[user.role] });
  } catch {
    return NextResponse.json(
      { message: "Cannot connect to CityCare. Please try again." },
      { status: 502 },
    );
  }
}
