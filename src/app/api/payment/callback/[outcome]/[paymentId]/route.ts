import { NextRequest, NextResponse } from "next/server";
import { backend } from "@/lib/server";

const outcomes = new Set(["success", "fail", "cancel"]);
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ outcome: string; paymentId: string }> },
) {
  const { outcome, paymentId } = await context.params;
  const fallback = new URL(
    "/payment/result?outcome=unverified",
    request.nextUrl.origin,
  );

  if (!outcomes.has(outcome) || !uuid.test(paymentId)) {
    return NextResponse.redirect(fallback, 303);
  }

  try {
    const response = await fetch(
      `${backend}/payments/${outcome}/${paymentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: await request.text(),
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const location = response.headers.get("location");
    if (response.status === 303 && location) {
      const destination = new URL(location);
      if (destination.origin === request.nextUrl.origin) {
        return NextResponse.redirect(destination, 303);
      }
    }
  } catch {
    // Never trust callback input when the provider verification is unavailable.
  }

  return NextResponse.redirect(fallback, 303);
}
