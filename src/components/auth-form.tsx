"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  UserRound,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Field } from "./ui";
const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Use at least 6 characters"),
});
type Values = z.infer<typeof schema>;
export function AuthForm({
  register: isRegister = false,
}: {
  register?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Values>({ resolver: zodResolver(schema) });
  async function authenticate(action: string, body: unknown) {
    setBusy(
      action === "demo" ? String((body as { role: string }).role) : action,
    );
    try {
      const r = await fetch(`/api/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.message);
      router.push(b.redirect);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <p className="eyebrow">YOUR CITY. YOUR VOICE.</p>
      <h1>{isRegister ? "Join your neighborhood." : "Welcome back."}</h1>
      <p className="muted auth-intro">
        {isRegister
          ? "Create your CityCare account."
          : "A little care goes a long way. Sign in to CityCare."}
      </p>
      <form
        onSubmit={handleSubmit((v) => {
          if (isRegister && (!v.name || v.name.trim().length < 2)) {
            setError("name", { message: "Enter your full name" });
            return;
          }
          return authenticate(isRegister ? "register" : "login", v);
        })}
        className="form-stack"
      >
        {isRegister && (
          <Field label="Full name" error={errors.name?.message}>
            <input autoComplete="name" {...register("name")} />
          </Field>
        )}
        <Field label="Email address" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <span className="password-input">
            <input
              type={show ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              {...register("password")}
            />
            <button
              type="button"
              className="icon-button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </Field>
        <button disabled={!!busy} className="button primary wide">
          {busy === "login" || busy === "register" ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <>
              {isRegister ? "Create account" : "Sign in"}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        {isRegister ? "Already part of CityCare?" : "New to CityCare?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
      {!isRegister && (
        <div className="demo-section">
          <div className="divider">
            <span>Explore with a demo account</span>
          </div>
          <div className="demo-buttons">
            {[
              { role: "CITIZEN", text: "Citizen", icon: UserRound },
              { role: "STAFF", text: "Staff", icon: Wrench },
              { role: "ADMIN", text: "Admin", icon: ShieldCheck },
            ].map((d) => (
              <button
                key={d.role}
                disabled={!!busy}
                onClick={() => authenticate("demo", { role: d.role })}
              >
                <d.icon size={20} />
                <span>{busy === d.role ? "Signing in..." : d.text}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
