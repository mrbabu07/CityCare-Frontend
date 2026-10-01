import { Suspense } from "react";
import { RequestList } from "@/components/requests";
import { Skeleton } from "@/components/ui";
export const metadata = { title: "Service requests" };
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <RequestList />
    </Suspense>
  );
}
