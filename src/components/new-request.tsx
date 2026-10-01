"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Send, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import type { Category, Complaint } from "@/lib/types";
import { Field, PageHeading } from "./ui";
const schema = z.object({
  title: z.string().min(5, "Use at least 5 characters"),
  description: z
    .string()
    .min(10, "Add a little more detail (at least 10 characters)"),
  categoryId: z.string().uuid("Choose a category"),
  address: z.string().min(5, "Enter a complete location"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});
type Values = z.infer<typeof schema>;
export function NewRequest() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const cache = useQueryClient();
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" },
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<Category[]>("categories"),
  });
  const create = useMutation({
    mutationFn: (v: Values) =>
      api<Complaint>("complaints", { method: "POST", body: JSON.stringify(v) }),
    onSuccess: (c) => {
      cache.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Request submitted");
      router.push(`/dashboard/requests/${c.id}`);
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="MAKE A DIFFERENCE"
        title="Report a neighborhood issue"
        description="Tell us what needs attention. We'll take it from here."
      />
      <div className="wizard">
        <div className="steps">
          {["The issue", "Location", "Review"].map((s, i) => (
            <span className={step >= i + 1 ? "active" : ""} key={s}>
              <b>{i + 1}</b>
              {s}
            </span>
          ))}
        </div>
        <form
          className="form-stack"
          onSubmit={handleSubmit((v) => create.mutate(v))}
        >
          {step === 1 && (
            <>
              <h2>What needs attention?</h2>
              <Field label="Category" error={errors.categoryId?.message}>
                <select {...register("categoryId")}>
                  <option value="">
                    {categories.isPending
                      ? "Loading categories..."
                      : "Select a service"}
                  </option>
                  {categories.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Request title" error={errors.title?.message}>
                <input
                  placeholder="e.g. Broken streetlight on Station Road"
                  {...register("title")}
                />
              </Field>
              <Field label="Description" error={errors.description?.message}>
                <textarea
                  rows={5}
                  placeholder="What happened? What should the team know?"
                  {...register("description")}
                />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <h2>Where is the issue?</h2>
              <Field
                label="Address or landmark"
                error={errors.address?.message}
              >
                <textarea
                  rows={3}
                  placeholder="Street, area, and a nearby landmark"
                  {...register("address")}
                />
              </Field>
              <Field label="Priority">
                <select {...register("priority")}>
                  <option value="LOW">Low - general maintenance</option>
                  <option value="MEDIUM">Medium - needs attention</option>
                  <option value="HIGH">High - significant disruption</option>
                </select>
              </Field>
              <div className="notice">
                <MapPin size={20} />
                <span>
                  Use a precise location so the service team can find the issue.
                </span>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>Ready to send?</h2>
              <dl className="review-list">
                <dt>Issue</dt>
                <dd>{getValues("title")}</dd>
                <dt>Details</dt>
                <dd>{getValues("description")}</dd>
                <dt>Location</dt>
                <dd>{getValues("address")}</dd>
                <dt>Priority</dt>
                <dd>{getValues("priority")}</dd>
              </dl>
              <p className="muted">
                You can attach photos and documents after submitting your
                request.
              </p>
            </>
          )}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="button primary"
                onClick={async () => {
                  if (
                    await trigger(
                      step === 1
                        ? ["title", "description", "categoryId"]
                        : ["address", "priority"],
                    )
                  )
                    setStep(step + 1);
                }}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button disabled={create.isPending} className="button primary">
                <Send size={16} />
                {create.isPending ? "Submitting..." : "Submit request"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
