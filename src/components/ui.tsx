import Link from "next/link";
import { Building2, Inbox, ArrowUpRight } from "lucide-react";
import { label } from "@/lib/types";
export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-icon">
        <Building2 size={23} />
      </span>
      CityCare<span className="brand-dot">.</span>
    </Link>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge badge-${value.toLowerCase()}`}>{label(value)}</span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title = "Nothing here yet",
  text,
  href,
}: {
  title?: string;
  text: string;
  href?: string;
}) {
  return (
    <div className="empty">
      <Inbox size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <Link className="button primary" href={href}>
          Create a request <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="skeleton-page" aria-label="Loading">
      <div className="skeleton heading" />
      <div className="stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton stat" />
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton row" />
      ))}
    </div>
  );
}
export function Field({
  label: text,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{text}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
