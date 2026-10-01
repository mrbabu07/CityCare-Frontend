"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Plus,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import {
  type Complaint,
  type ComplaintList,
  date,
  label,
  roleHome,
  statuses,
} from "@/lib/types";
import { Badge, Empty, PageHeading, Skeleton } from "./ui";
import { useUser } from "./workspace-shell";
export function RequestTable({ items }: { items: Complaint[] }) {
  const user = useUser();
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Submitted</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>
                <Link
                  className="request-title"
                  href={`${roleHome[user.role]}/requests/${c.id}`}
                >
                  {c.title}
                </Link>
                <small className="address">
                  <MapPin size={12} />
                  {c.address}
                </small>
              </td>
              <td>{c.category?.name || "Uncategorized"}</td>
              <td>
                <Badge value={c.status} />
              </td>
              <td>
                <span
                  className={`priority priority-${c.priority.toLowerCase()}`}
                >
                  {label(c.priority)}
                </span>
              </td>
              <td className="nowrap muted">{date(c.createdAt)}</td>
              <td>
                <Link
                  title="Open request"
                  aria-label={`Open ${c.title}`}
                  href={`${roleHome[user.role]}/requests/${c.id}`}
                  className="icon-button"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const filterSchema = z.object({
  search: z.string().max(100),
  status: z.string(),
});
export function RequestList() {
  const user = useUser();
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const search = params.get("search") || "";
  const status = params.get("status") || "";
  const query = new URLSearchParams({
    page: String(page),
    limit: "10",
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  });
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(filterSchema),
    values: { search, status },
  });
  const result = useQuery({
    queryKey: ["complaints", query.toString()],
    queryFn: () => api<ComplaintList>(`complaints?${query}`),
  });
  function update(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k),
    );
    router.push(`${path}?${next}`);
  }
  return (
    <>
      <PageHeading
        eyebrow="NEIGHBORHOOD OPERATIONS"
        title={user.role === "STAFF" ? "Assigned requests" : "Service requests"}
        description="Every issue has a path to resolution."
      >
        {user.role === "CITIZEN" && (
          <Link href="/dashboard/new" className="button primary">
            <Plus size={17} />
            New request
          </Link>
        )}
      </PageHeading>
      <div className="list-surface">
        <form
          className="filter-bar"
          onSubmit={handleSubmit((v) => update({ ...v, page: "1" }))}
        >
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search requests"
              placeholder="Search requests..."
              {...register("search")}
            />
          </div>
          <select aria-label="Filter by status" {...register("status")}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
          <button className="button secondary">
            <SlidersHorizontal size={16} />
            Apply
          </button>
          {(search || status) && (
            <button
              className="text-link"
              type="button"
              onClick={() => router.push(path)}
            >
              Clear
            </button>
          )}
        </form>
        {result.isPending ? (
          <Skeleton />
        ) : result.isError ? (
          <Empty title="Requests unavailable" text={result.error.message} />
        ) : result.data.complaints.length ? (
          <RequestTable items={result.data.complaints} />
        ) : (
          <Empty
            title="No requests found"
            text="Try another search or submit an issue in your neighborhood."
            href={user.role === "CITIZEN" ? "/dashboard/new" : undefined}
          />
        )}
        <div className="pagination">
          <span>{result.data?.pagination.total || 0} requests</span>
          <div>
            <button
              className="icon-button"
              title="Previous page"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => update({ page: String(page - 1) })}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Page {page} of{" "}
              {Math.max(1, result.data?.pagination.totalPages || 1)}
            </span>
            <button
              className="icon-button"
              title="Next page"
              aria-label="Next page"
              disabled={
                !result.data || page >= result.data.pagination.totalPages
              }
              onClick={() => update({ page: String(page + 1) })}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
