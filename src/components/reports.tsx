"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { type Audit, type PageInfo, date, label } from "@/lib/types";
import { PageHeading, Skeleton, Empty, QueryError } from "./ui";
import { pageNumber } from "@/lib/list-state";
import { useCanonicalPage } from "./list-controls";
export function Reports() {
  const params = useSearchParams();
  const router = useRouter();
  const page = pageNumber(params.get("page"));
  const q = useQuery({
    queryKey: ["audit", page],
    queryFn: () =>
      api<{ logs: Audit[]; pagination: PageInfo }>(
        `admin/audit-logs?page=${page}&limit=15`,
      ),
  });
  useCanonicalPage(q.data?.pagination.totalPages);
  return (
    <>
      <PageHeading
        eyebrow="ACCOUNTABILITY"
        title="Activity log"
        description="A record of important changes across CityCare."
      />
      {q.isPending ? (
        <Skeleton />
      ) : q.isError ? (
        <QueryError
          message={q.error.message}
          retry={() => q.refetch()}
          busy={q.isFetching}
        />
      ) : !q.data.logs.length ? (
        <Empty
          title="No activity yet"
          text="Changes will be recorded here as your team works."
        />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>By</th>
                  <th>Resource</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {q.data.logs.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{label(l.action)}</strong>
                    </td>
                    <td>{l.actor.name}</td>
                    <td>
                      {l.entityType}{" "}
                      <small className="muted">#{l.entityId.slice(0, 8)}</small>
                    </td>
                    <td>{date(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>{q.data.pagination.total} events</span>
            <div>
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => router.push(`?page=${page - 1}`)}
              >
                <ChevronLeft size={18} />
              </button>
              {page}
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
      {!q.isPending && !q.isError && !q.data.logs.length && page > 1 && (
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
