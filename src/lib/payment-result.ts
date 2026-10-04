export function paymentMessage(status?: string, outcome?: string) {
  if (status === "PAID")
    return {
      title: "Payment confirmed",
      text: "Your priority service payment has been verified.",
      tone: "success",
    };
  if (status === "REFUNDED")
    return {
      title: "Payment refunded",
      text: "This payment has been refunded.",
      tone: "neutral",
    };
  if (status === "FAILED")
    return {
      title:
        outcome === "cancelled" ? "Payment cancelled" : "Payment unsuccessful",
      text: "No successful payment was recorded for this request. You can try again from the request page.",
      tone: "neutral",
    };
  if (status === "PENDING")
    return {
      title: "Payment awaiting confirmation",
      text: "The payment has not been confirmed yet. Check its status before starting another payment.",
      tone: "pending",
    };
  return {
    title: "Payment not verified",
    text: "Open your payments to check the recorded status. Do not assume a charge succeeded or failed from this return page alone.",
    tone: "neutral",
  };
}
