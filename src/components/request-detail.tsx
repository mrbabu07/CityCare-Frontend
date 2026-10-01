"use client";
import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  MapPin,
  Upload,
  FileText,
  CreditCard,
  Check,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  type Complaint,
  type User,
  type Status,
  type Payment,
  date,
  label,
} from "@/lib/types";
import { Badge, Empty, Field, PageHeading, Skeleton } from "./ui";
import { useUser } from "./workspace-shell";
const transitions: Record<Status, Status[]> = {
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "UNDER_REVIEW"],
  IN_PROGRESS: ["RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED"],
  REJECTED: [],
  CLOSED: [],
};
const statusSchema = z.object({
  status: z.string().min(1, "Choose a status"),
  note: z.string().optional(),
});
const assignSchema = z.object({
  staffId: z.string().uuid("Select a staff member"),
});
const feedbackSchema = z.object({
  rating: z.string().regex(/^[1-5]$/, "Choose a rating"),
  comment: z.string().optional(),
});
export function RequestDetail({ id }: { id: string }) {
  const user = useUser();
  const cache = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const detail = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => api<Complaint>(`complaints/${id}`),
  });
  const staff = useQuery({
    queryKey: ["users"],
    queryFn: () => api<User[]>("users"),
    enabled: user.role === "ADMIN",
  });
  const pay = useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      try {
        return await api<Payment>(`payments/${id}/status`);
      } catch (e) {
        if ((e as { status?: number }).status === 404) return null;
        throw e;
      }
    },
    enabled: user.role === "CITIZEN",
  });
  const statusForm = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: "", note: "" },
  });
  const assignForm = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: { staffId: "" },
  });
  const feedback = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: "", comment: "" },
  });
  function refresh() {
    cache.invalidateQueries({ queryKey: ["complaint", id] });
    cache.invalidateQueries({ queryKey: ["complaints"] });
    cache.invalidateQueries({ queryKey: ["admin-stats"] });
  }
  const change = useMutation({
    mutationFn: ({
      path,
      body,
      method = "PATCH",
    }: {
      path: string;
      body?: unknown;
      method?: string;
    }) => api(path, { method, body: body ? JSON.stringify(body) : undefined }),
    onSuccess: () => {
      refresh();
      toast.success("Changes saved");
    },
  });
  const checkout = useMutation({
    mutationFn: () =>
      api<{ paymentUrl: string; paymentId: string }>("payments/initiate", {
        method: "POST",
        body: JSON.stringify({ complaintId: id }),
      }),
    onSuccess: (p) => {
      const url = new URL(p.paymentUrl);
      if (
        url.protocol !== "https:" ||
        !/(^|\.)sslcommerz\.com$/.test(url.hostname)
      ) {
        toast.error("Unexpected payment provider URL");
        return;
      }
      window.location.assign(p.paymentUrl);
    },
  });
  async function upload(file: File) {
    if (
      file.size > 4 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      )
    ) {
      toast.error("Choose a JPG, PNG, WebP or PDF up to 4 MB");
      return;
    }
    setUploading(true);
    setProgress(0);
    const form = new FormData();
    form.append("file", file);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/backend/complaints/${id}/attachments`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const b = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(Error(b.message));
          } catch {
            reject(Error("Upload failed"));
          }
        };
        xhr.onerror = () =>
          reject(Error("Upload failed. Check your connection."));
        xhr.send(form);
      });
      refresh();
      toast.success("Attachment added");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  if (detail.isPending) return <Skeleton />;
  if (detail.isError)
    return <Empty title="Request unavailable" text={detail.error.message} />;
  const c = detail.data;
  return (
    <>
      <PageHeading
        eyebrow={`REQUEST / ${id.slice(0, 8).toUpperCase()}`}
        title={c.title}
        description={`Submitted ${date(c.createdAt)}`}
      >
        <Badge value={c.status} />
      </PageHeading>
      <div className="detail-grid">
        <div>
          <section className="detail-section">
            <h2>Issue details</h2>
            <p className="description">{c.description}</p>
            <div className="location">
              <MapPin size={19} />
              {c.address}
            </div>
            <dl className="detail-meta">
              <div>
                <dt>Category</dt>
                <dd>{c.category?.name}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{c.department?.name}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <Badge value={c.priority} />
                </dd>
              </div>
              <div>
                <dt>Service target</dt>
                <dd>{date(c.slaDueAt)}</dd>
              </div>
              <div>
                <dt>Assigned to</dt>
                <dd>{c.assignedTo?.name || "Awaiting assignment"}</dd>
              </div>
            </dl>
          </section>
          <section className="detail-section">
            <div className="section-heading">
              <h2>Attachments</h2>
              <label className="button secondary upload-label">
                <Upload size={16} />
                {uploading ? `${progress}%` : "Upload file"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {uploading && (
              <progress
                value={progress}
                max={100}
                className="upload-progress"
              />
            )}
            {!c.attachments?.length ? (
              <p className="muted">No attachments added.</p>
            ) : (
              <div className="attachment-grid">
                {c.attachments.map((a) => (
                  <div key={a.id} className="attachment">
                    <a href={a.url} target="_blank" rel="noreferrer">
                      {a.type.includes("image") ? (
                        <Image
                          src={a.url}
                          alt="Request evidence"
                          width={240}
                          height={160}
                        />
                      ) : (
                        <span>
                          <FileText size={26} />
                          Open document
                        </span>
                      )}
                    </a>
                    {(user.role === "ADMIN" || a.uploadedById === user.id) && (
                      <button
                        title="Delete attachment"
                        aria-label="Delete attachment"
                        className="icon-button"
                        onClick={() => {
                          if (window.confirm("Delete this attachment?"))
                            change.mutate({
                              path: `complaints/${id}/attachments/${a.id}`,
                              method: "DELETE",
                            });
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="detail-section">
            <h2>Progress timeline</h2>
            <ol className="timeline">
              {c.statusHistory?.map((h) => (
                <li key={h.id}>
                  <span className="timeline-dot">
                    <Check size={11} />
                  </span>
                  <div>
                    <strong>{label(h.toStatus)}</strong>
                    {h.note && <p>{h.note}</p>}
                    <small>{date(h.createdAt)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="detail-aside">
          {user.role !== "CITIZEN" && transitions[c.status].length > 0 && (
            <form
              className="form-stack action-panel"
              onSubmit={statusForm.handleSubmit((v) =>
                change.mutate({ path: `complaints/${id}/status`, body: v }),
              )}
            >
              <h2>Update progress</h2>
              <Field
                label="Next status"
                error={statusForm.formState.errors.status?.message}
              >
                <select {...statusForm.register("status")}>
                  <option value="">Choose status</option>
                  {transitions[c.status].map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Update note">
                <textarea rows={3} {...statusForm.register("note")} />
              </Field>
              <button className="button primary" disabled={change.isPending}>
                Save update
              </button>
            </form>
          )}
          {user.role === "ADMIN" &&
            ["UNDER_REVIEW", "ASSIGNED"].includes(c.status) && (
              <form
                className="form-stack action-panel"
                onSubmit={assignForm.handleSubmit((v) =>
                  change.mutate({ path: `complaints/${id}/assign`, body: v }),
                )}
              >
                <h2>Assign a team member</h2>
                <Field
                  label="Staff"
                  error={assignForm.formState.errors.staffId?.message}
                >
                  <select {...assignForm.register("staffId")}>
                    <option value="">Choose staff</option>
                    {staff.data
                      ?.filter((s) => s.role === "STAFF" && s.isActive)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <button className="button primary" disabled={change.isPending}>
                  Assign request
                </button>
              </form>
            )}
          {user.role === "CITIZEN" && (
            <section className="action-panel">
              <CreditCard size={25} />
              <h2>Priority service</h2>
              <p className="muted">Upgrade this request to urgent priority.</p>
              <p className="payment-price">
                BDT 100 <small>one-time</small>
              </p>
              {pay.data?.status === "PAID" ? (
                <Badge value="PAID" />
              ) : (
                <button
                  disabled={checkout.isPending}
                  className="button primary wide"
                  onClick={() => checkout.mutate()}
                >
                  {checkout.isPending ? "Connecting..." : "Continue to payment"}
                </button>
              )}
            </section>
          )}
          {user.role === "CITIZEN" &&
            ["RESOLVED", "CLOSED"].includes(c.status) &&
            !c.feedback && (
              <form
                className="form-stack action-panel"
                onSubmit={feedback.handleSubmit((v) =>
                  change.mutate({
                    path: `complaints/${id}/feedback`,
                    body: { ...v, rating: Number(v.rating) },
                    method: "POST",
                  }),
                )}
              >
                <h2>How did we do?</h2>
                <Field
                  label="Rating"
                  error={feedback.formState.errors.rating?.message}
                >
                  <select {...feedback.register("rating")}>
                    <option value="">Choose a rating</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} out of 5
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Your feedback">
                  <textarea rows={3} {...feedback.register("comment")} />
                </Field>
                <button className="button primary" disabled={change.isPending}>
                  Send feedback
                </button>
              </form>
            )}
          {c.feedback && (
            <section className="action-panel">
              <h2>Your feedback</h2>
              <strong>{c.feedback.rating}/5</strong>
              <p>{c.feedback.comment}</p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
