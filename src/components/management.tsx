"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { api } from "@/lib/api";
import type { Department, Category, User, Role } from "@/lib/types";
import { date, label } from "@/lib/types";
import { PageHeading, Field, Empty, Skeleton, Badge } from "./ui";
const resourceSchema = z.object({
  name: z.string().min(2, "Use at least 2 characters"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  slaHours: z.string().regex(/^[1-9]\d*$/, "Use a positive number of hours"),
});
export function Management({ kind }: { kind: "departments" | "categories" }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const cache = useQueryClient();
  const list = useQuery({
    queryKey: [kind],
    queryFn: () => api<(Department & Partial<Category>)[]>(kind),
  });
  const deps = useQuery({
    queryKey: ["departments"],
    queryFn: () => api<Department[]>("departments"),
    enabled: kind === "categories",
  });
  const form = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      description: "",
      departmentId: "",
      slaHours: "72",
    },
  });
  const save = useMutation({
    mutationFn: (v: z.infer<typeof resourceSchema>) =>
      api(`${kind}${editing ? `/${editing}` : ""}`, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(
          kind === "categories"
            ? {
                name: v.name,
                ...(!editing ? { departmentId: v.departmentId } : {}),
                slaHours: Number(v.slaHours),
              }
            : { name: v.name, description: v.description },
        ),
      }),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: [kind] });
      setOpen(false);
      toast.success("Saved successfully");
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`${kind}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      cache.invalidateQueries({ queryKey: [kind] });
      toast.success("Archived successfully");
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="CITY ADMINISTRATION"
        title={label(kind)}
        description={
          kind === "departments"
            ? "The teams responsible for keeping the city running."
            : "Route each issue to the right service team."
        }
      >
        <button
          className="button primary"
          onClick={() => {
            setEditing(null);
            form.reset({
              name: "",
              description: "",
              departmentId: "",
              slaHours: "72",
            });
            setOpen(true);
          }}
        >
          <Plus size={17} />
          Add {kind === "departments" ? "department" : "category"}
        </button>
      </PageHeading>
      {list.isPending ? (
        <Skeleton />
      ) : list.isError ? (
        <Empty text={list.error.message} />
      ) : !list.data.length ? (
        <Empty
          title={`No ${kind} yet`}
          text="Create your first entry to get started."
        />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>
                  {kind === "categories" ? "Service target" : "Description"}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((x) => (
                <tr key={x.id}>
                  <td>
                    <strong>{x.name}</strong>
                  </td>
                  <td>
                    {kind === "categories"
                      ? `${x.slaHours} hours`
                      : x.description || "No description"}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${x.name}`}
                        title="Edit"
                        onClick={() => {
                          setEditing(x.id);
                          form.reset({
                            name: x.name,
                            description: x.description || "",
                            departmentId: x.departmentId || "",
                            slaHours: String(x.slaHours || 72),
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Archive ${x.name}`}
                        title="Archive"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`Archive ${x.name}?`))
                            remove.mutate(x.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content className="modal">
            <div className="section-heading">
              <Dialog.Title>
                {editing ? "Edit" : "Add"}{" "}
                {kind === "categories" ? "category" : "department"}
              </Dialog.Title>
              <Dialog.Close className="icon-button" aria-label="Close">
                <X size={20} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="muted">
              {kind === "categories"
                ? "Set routing and the service completion target."
                : "Manage the responsible city department."}
            </Dialog.Description>
            <form
              className="form-stack"
              onSubmit={form.handleSubmit((v) => {
                if (kind === "categories" && !editing && !v.departmentId) {
                  form.setError("departmentId", {
                    message: "Choose a department",
                  });
                  return;
                }
                save.mutate(v);
              })}
            >
              <Field label="Name" error={form.formState.errors.name?.message}>
                <input {...form.register("name")} />
              </Field>
              {kind === "categories" ? (
                <>
                  <Field
                    label="Department"
                    error={form.formState.errors.departmentId?.message}
                  >
                    <select
                      disabled={!!editing}
                      {...form.register("departmentId")}
                    >
                      <option value="">Choose department</option>
                      {deps.data?.map((d) => (
                        <option value={d.id} key={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Service target (hours)"
                    error={form.formState.errors.slaHours?.message}
                  >
                    <input
                      type="number"
                      min={1}
                      {...form.register("slaHours")}
                    />
                  </Field>
                </>
              ) : (
                <Field label="Description">
                  <textarea rows={3} {...form.register("description")} />
                </Field>
              )}
              <button className="button primary" disabled={save.isPending}>
                <Save size={16} />
                Save
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
const roleSchema = z.object({ role: z.enum(["CITIZEN", "STAFF", "ADMIN"]) });
function RoleForm({ user }: { user: User }) {
  const cache = useQueryClient();
  const form = useForm({
    resolver: zodResolver(roleSchema),
    values: { role: user.role },
  });
  const save = useMutation({
    mutationFn: (v: { role: Role }) =>
      api(`users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify(v),
      }),
    onMutate: async (v) => {
      await cache.cancelQueries({ queryKey: ["users"] });
      const previous = cache.getQueryData<User[]>(["users"]);
      cache.setQueryData<User[]>(["users"], (users) =>
        users?.map((u) => (u.id === user.id ? { ...u, role: v.role } : u)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => cache.setQueryData(["users"], ctx?.previous),
    onSettled: () => cache.invalidateQueries({ queryKey: ["users"] }),
    onSuccess: () => toast.success("Role updated"),
  });
  return (
    <form
      className="row-actions"
      onSubmit={form.handleSubmit((v) => save.mutate(v))}
    >
      <select aria-label={`Role for ${user.name}`} {...form.register("role")}>
        <option>CITIZEN</option>
        <option>STAFF</option>
        <option>ADMIN</option>
      </select>
      <button
        className="icon-button"
        title="Save role"
        aria-label={`Save role for ${user.name}`}
        disabled={save.isPending}
      >
        <Save size={16} />
      </button>
    </form>
  );
}
export function People() {
  const list = useQuery({
    queryKey: ["users"],
    queryFn: () => api<User[]>("users"),
  });
  return (
    <>
      <PageHeading
        eyebrow="CITY ADMINISTRATION"
        title="People"
        description="Citizens, service staff, and city administrators."
      />
      {list.isPending ? (
        <Skeleton />
      ) : list.isError ? (
        <Empty text={list.error.message} />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Account</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>{date(u.createdAt)}</td>
                  <td>
                    <Badge value={u.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td>
                    <RoleForm user={u} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
