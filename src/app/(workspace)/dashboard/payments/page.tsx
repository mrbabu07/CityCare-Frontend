import { Suspense } from "react";
import { Payments } from "@/components/payments";
import { Skeleton } from "@/components/ui";
export const metadata = { title: "Payments" };
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Payments />
    </Suspense>
  );
}
