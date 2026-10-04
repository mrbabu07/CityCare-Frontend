import test from "node:test";
import assert from "node:assert/strict";
import { paymentMessage } from "../src/lib/payment-result.ts";

test("untrusted return parameters never prove a successful payment", () => {
  for (const outcome of ["success", "failed", "cancelled", "unverified"]) {
    assert.notEqual(paymentMessage(undefined, outcome).tone, "success");
    assert.equal(paymentMessage("PENDING", outcome).tone, "pending");
  }
});
test("verified database status overrides the browser outcome", () => {
  assert.equal(paymentMessage("PAID", "cancelled").title, "Payment confirmed");
  assert.equal(
    paymentMessage("FAILED", "success").title,
    "Payment unsuccessful",
  );
  assert.equal(
    paymentMessage("FAILED", "cancelled").title,
    "Payment cancelled",
  );
  assert.equal(paymentMessage("REFUNDED", "success").title, "Payment refunded");
});
