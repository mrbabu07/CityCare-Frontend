import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  if (!request.cookies.has("cc_access"))
    return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*", "/admin/:path*"],
};
