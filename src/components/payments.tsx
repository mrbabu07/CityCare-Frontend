"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { ComplaintList, Complaint, Payment } from "@/lib/types";
import { PageHeading, Empty, Skeleton, Badge, QueryError } from "./ui";
import { pageNumber } from "@/lib/list-state";
import { useCanonicalPage } from "./list-controls";
function PaymentRow({ complaint }: { complaint: Complaint }) {
  const q = useQuery({
    queryKey: ["payment", complaint.id],
    queryFn: async () => {
      try {
        return await api<Payment>(`payments/${complaint.id}/status`);
      } catch (e) {
        if ((e as { status?: number }).status === 404) return null;
        throw e;
      }
    },
  });
  return (
    <tr>
      <td>
        <Link
          className="request-title"
          href={`/dashboard/requests/${complaint.id}`}
        >
          {complaint.title}
        </Link>
      </td>
      <td>
        {q.isPending
          ? "Loading..."
          : q.isError
            ? "Unavailable"
            : q.data
              ? `${q.data.currency} ${q.data.amount}`
              : "No payment"}
      </td>
      <td>
        {q.data ? (
          <Badge value={q.data.status} />
        ) : (
          <span className="muted">
            {q.isPending ? "Checking..." : q.isError ? "Unknown" : "Not paid"}
          </span>
        )}
      </td>
      <td>
        {q.isError && (
          <button
            className="text-link"
            disabled={q.isFetching}
            onClick={() => q.refetch()}
          >
            Retry
          </button>
        )}
        <Link
          className="text-link"
          href={`/dashboard/requests/${complaint.id}`}
        >
          View request
        </Link>
      </td>
    </tr>
  );
}
export function Payments() {
  const search = useSearchParams();
  const router = useRouter();
  const page = pageNumber(search.get("page"));
  const q = useQuery({
    queryKey: ["complaints", "payments", page],
    queryFn: () => api<ComplaintList>(`complaints?limit=10&page=${page}`),
  });
  useCanonicalPage(q.data?.pagination.totalPages);
  return (
    <>
      <PageHeading
        eyebrow="PRIORITY SERVICES"
        title="Payments"
        description="Payment status for your neighborhood requests."
      />
      {q.isPending ? (
        <Skeleton />
      ) : q.isError ? (
        <QueryError
          message={q.error.message}
          retry={() => q.refetch()}
          busy={q.isFetching}
        />
      ) : !q.data.complaints.length ? (
        <Empty
          title="No requests yet"
          text="Payments for priority services will appear here."
        />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Amount</th>
                  <th>Payment status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {q.data.complaints.map((c) => (
                  <PaymentRow key={c.id} complaint={c} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              Page {page} of {q.data.pagination.totalPages}
            </span>
            <div>
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => router.push(`?page=${page - 1}`)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next page"
                disabled={page >= q.data.pagination.totalPages}
                onClick={() => router.push(`?page=${page + 1}`)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}
      {!q.isPending && !q.isError && !q.data.complaints.length && page > 1 && (
        <button
          className="button secondary"
          onClick={() => router.push("?page=1")}
        >
          Back to first page
        </button>
      )}
    </>
  );
}
