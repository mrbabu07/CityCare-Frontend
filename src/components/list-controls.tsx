"use client";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { pageNumber, updateSearch } from "@/lib/list-state";
export function useCanonicalPage(totalPages: number | undefined) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const query = params.toString();
  useEffect(() => {
    if (totalPages === undefined) return;
    const current = new URLSearchParams(query).get("page");
    const page = Math.min(pageNumber(current), Math.max(1, totalPages));
    if (current !== null && current !== String(page)) {
      router.replace(`${path}?${updateSearch(query, { page: String(page) })}`, {
        scroll: false,
      });
    }
  }, [query, path, router, totalPages]);
}

export function useListState() {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  return {
    page: pageNumber(params.get("page")),
    search: params.get("search") || "",
    role: params.get("role") || "",
    update(values: Record<string, string>) {
      router.push(`${path}?${updateSearch(params.toString(), values)}`, {
        scroll: false,
      });
    },
  };
}

export function ListFilters({ roles = false }: { roles?: boolean }) {
  const state = useListState();
  return (
    <form
      key={`${state.search}:${state.role}`}
      className="filter-bar"
      onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        state.update({
          search: String(values.get("search") || "").trim(),
          ...(roles ? { role: String(values.get("role") || "") } : {}),
          page: "1",
        });
      }}
    >
      <div className="search-field">
        <Search size={17} />
        <input
          name="search"
          aria-label="Search records"
          placeholder="Search records..."
          maxLength={100}
          defaultValue={state.search}
        />
      </div>
      {roles && (
        <select
          name="role"
          aria-label="Filter by role"
          defaultValue={state.role}
        >
          <option value="">All roles</option>
          <option value="CITIZEN">Citizen</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      )}
      <button className="button secondary">
        <SlidersHorizontal size={16} />
        Apply
      </button>
      {(state.search || state.role) && (
        <button
          type="button"
          className="text-link"
          onClick={() => state.update({ search: "", role: "", page: "1" })}
        >
          Clear
        </button>
      )}
    </form>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  busy = false,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  busy?: boolean;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <span aria-live="polite">{total} records</span>
      <div>
        <button
          className="icon-button"
          aria-label="Previous page"
          title="Previous page"
          disabled={busy || page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          className="icon-button"
          aria-label="Next page"
          title="Next page"
          disabled={busy || page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
