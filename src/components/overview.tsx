"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock3,
  CheckCheck,
  ArrowUpRight,
  Plus,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { type ComplaintList, type Stats, roleHome, label } from "@/lib/types";
import { PageHeading, Skeleton, Empty } from "./ui";
import { useUser } from "./workspace-shell";
import { RequestTable } from "./requests";
const StatusChart = dynamic(() => import("./status-chart"), {
  ssr: false,
  loading: () => <div className="skeleton chart" />,
});
export function Overview() {
  const user = useUser();
  const home = roleHome[user.role];
  const recent = useQuery({
    queryKey: ["complaints", "recent"],
    queryFn: () => api<ComplaintList>("complaints?limit=5"),
  });
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api<Stats>("admin/dashboard-stats"),
    enabled: user.role === "ADMIN",
  });
  const counts = useQueries({
    queries: ["SUBMITTED", "IN_PROGRESS", "RESOLVED"].map((status) => ({
      queryKey: ["complaints", "count", status],
      queryFn: () => api<ComplaintList>(`complaints?limit=1&status=${status}`),
    })),
  });
  if (recent.isPending) return <Skeleton />;
  if (recent.isError)
    return <Empty title="Workspace unavailable" text={recent.error.message} />;
  const cards = [
    {
      name: "Total requests",
      value: recent.data.pagination.total,
      icon: ClipboardList,
      tone: "green",
    },
    {
      name: "Awaiting review",
      value: counts[0].data?.pagination.total ?? "--",
      icon: Clock3,
      tone: "gold",
    },
    {
      name: "In progress",
      value: counts[1].data?.pagination.total ?? "--",
      icon: Users,
      tone: "blue",
    },
    {
      name: "Resolved",
      value: counts[2].data?.pagination.total ?? "--",
      icon: CheckCheck,
      tone: "pink",
    },
  ];
  const chart =
    stats.data?.complaintsByStatus.map((x) => ({
      name: label(x.status),
      count: x._count,
    })) ||
    counts.map((x, i) => ({
      name: ["Submitted", "In progress", "Resolved"][i],
      count: x.data?.pagination.total || 0,
    }));
  return (
    <>
      <PageHeading
        eyebrow={`${label(user.role).toUpperCase()} WORKSPACE`}
        title={`Hello, ${user.name.split(" ")[0]}.`}
        description={
          user.role === "CITIZEN"
            ? "Here's what's happening with your neighborhood requests."
            : "A clear view of the work that keeps our city moving."
        }
      >
        {user.role === "CITIZEN" && (
          <Link className="button primary" href="/dashboard/new">
            <Plus size={17} />
            Report an issue
          </Link>
        )}
      </PageHeading>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-item" key={c.name}>
            <div className="stat-label">
              <span>{c.name}</span>
              <span className={`stat-icon ${c.tone}`}>
                <c.icon size={18} />
              </span>
            </div>
            <strong>{c.value}</strong>
            <small>Current request status</small>
          </div>
        ))}
      </div>
      <div className="overview-middle">
        <section className="chart-section">
          <div className="section-heading">
            <div>
              <h2>Request activity</h2>
              <p className="muted">A view of your service workflow</p>
            </div>
            <span className="small-label">ALL TIME</span>
          </div>
          <StatusChart data={chart} />
        </section>
        <aside className="care-note">
          <span className="eyebrow">A LITTLE CARE, EVERY DAY</span>
          <h2>
            Good neighborhoods
            <br />
            start with us.
          </h2>
          <p>
            {user.role === "CITIZEN"
              ? "A broken streetlight. A blocked drain. Report what you see, and follow the work through to resolution."
              : "Keep requests moving with clear assignments and timely updates. Every resolved issue makes a difference."}
          </p>
          <Link href={`${home}/requests`} className="text-link">
            View service requests <ArrowUpRight size={17} />
          </Link>
          <div className="note-bottom">
            <span className="note-line" />
            <span>CITYCARE / COMMUNITY FIRST</span>
          </div>
        </aside>
      </div>
      <section className="recent-section">
        <div className="section-heading">
          <h2>Recent requests</h2>
          <Link href={`${home}/requests`} className="text-link">
            View all <ArrowUpRight size={16} />
          </Link>
        </div>
        {recent.data.complaints.length ? (
          <RequestTable items={recent.data.complaints} />
        ) : (
          <Empty
            title="Your first request starts here"
            text="Your submitted requests and their progress will appear here."
            href={user.role === "CITIZEN" ? "/dashboard/new" : undefined}
          />
        )}
      </section>
    </>
  );
}
