"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, CircleAlert, RotateCw } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/api";
import { paymentMessage } from "@/lib/payment-result";
import type { Payment } from "@/lib/types";
import { QueryError, Skeleton } from "./ui";

export function PaymentResult() {
  const params = useSearchParams();
  const parsed = z.string().uuid().safeParse(params.get("complaintId"));
  const id = parsed.success ? parsed.data : null;
  const payment = useQuery({
    queryKey: ["payment", id],
    queryFn: () => api<Payment>(`payments/${id}/status`),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" && query.state.dataUpdateCount < 12
        ? 5000
        : false,
  });
  if (id && payment.isPending) return <Skeleton />;
  const message = paymentMessage(
    payment.data?.status,
    params.get("outcome") || undefined,
  );
  const Icon =
    message.tone === "success"
      ? CheckCircle2
      : message.tone === "pending"
        ? Clock3
        : CircleAlert;
  return (
    <section className="empty" aria-live="polite">
      <Icon size={40} />
      <h1>{message.title}</h1>
      <p>{message.text}</p>
      {payment.data && (
        <p>
          {payment.data.currency} {payment.data.amount}
        </p>
      )}
      {payment.isError && (
        <QueryError
          message={payment.error.message}
          retry={() => payment.refetch()}
          busy={payment.isFetching}
        />
      )}
      {id && !payment.isError && (
        <button
          type="button"
          className="button secondary"
          disabled={payment.isFetching}
          onClick={() => payment.refetch()}
        >
          <RotateCw size={16} />
          Check status
        </button>
      )}
      <Link
        className="button primary"
        href={id ? `/dashboard/requests/${id}` : "/dashboard/payments"}
      >
        {id ? "View request" : "View payments"}
      </Link>
    </section>
  );
}
