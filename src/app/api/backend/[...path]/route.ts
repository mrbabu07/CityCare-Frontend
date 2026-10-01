import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backend } from "@/lib/server";

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (
    request.method !== "GET" &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { success: false, message: "Invalid request origin", errors: [] },
      { status: 403 },
    );
  const { path } = await context.params;
  if (
    ![
      "users",
      "complaints",
      "departments",
      "categories",
      "admin",
      "payments",
    ].includes(path[0]) ||
    path.some((p) => p === "." || p === ".." || p.includes("/"))
  )
    return NextResponse.json(
      { success: false, message: "Route not allowed", errors: [] },
      { status: 404 },
    );
  const token = (await cookies()).get("cc_access")?.value;
  if (!token)
    return NextResponse.json(
      { success: false, message: "Please sign in again", errors: [] },
      { status: 401 },
    );
  try {
    const type = request.headers.get("content-type");
    const response = await fetch(
      `${backend}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
      {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(type ? { "Content-Type": type } : {}),
        },
        body:
          request.method === "GET" ? undefined : await request.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(25000),
        redirect: "manual",
      },
    );
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Service unavailable. Please try again.",
        errors: [],
      },
      { status: 502 },
    );
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
