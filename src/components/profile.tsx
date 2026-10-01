"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { api } from "@/lib/api";
import { date, label } from "@/lib/types";
import { useUser } from "./workspace-shell";
import { Field, PageHeading } from "./ui";
const schema = z.object({
  name: z.string().min(2, "Enter at least 2 characters"),
  phone: z.string(),
});
export function Profile() {
  const user = useUser();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, phone: user.phone || "" },
  });
  const save = useMutation({
    mutationFn: (v: z.infer<typeof schema>) =>
      api("users/me", { method: "PATCH", body: JSON.stringify(v) }),
    onSuccess: () => {
      toast.success("Profile updated");
      router.refresh();
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="ACCOUNT"
        title="My profile"
        description="Your details, kept up to date."
      />
      <div className="profile-layout">
        <div className="profile-summary">
          <span className="avatar large">{user.name[0]}</span>
          <h2>{user.name}</h2>
          <p>{label(user.role)}</p>
          <small>Member since {date(user.createdAt)}</small>
        </div>
        <form
          className="form-stack content-form"
          onSubmit={handleSubmit((v) => save.mutate(v))}
        >
          <h2>Personal information</h2>
          <Field label="Full name" error={errors.name?.message}>
            <input autoComplete="name" {...register("name")} />
          </Field>
          <Field label="Email address">
            <input value={user.email} disabled />
          </Field>
          <Field label="Phone number" error={errors.phone?.message}>
            <input type="tel" autoComplete="tel" {...register("phone")} />
          </Field>
          <button className="button primary" disabled={save.isPending}>
            <Save size={17} />
            {save.isPending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </>
  );
}
