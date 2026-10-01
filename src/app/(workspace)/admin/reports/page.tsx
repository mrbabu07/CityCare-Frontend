import { Suspense } from "react";
import { Reports } from "@/components/reports";
import { Skeleton } from "@/components/ui";
export const metadata = { title: "Activity log" };
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Reports />
    </Suspense>
  );
}
