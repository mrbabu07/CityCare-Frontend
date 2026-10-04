import { Suspense } from "react";
import { PaymentResult } from "@/components/payment-result";
import { Skeleton } from "@/components/ui";
export const metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};
export default function PaymentResultPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <PaymentResult />
    </Suspense>
  );
}
