let pending: Promise<boolean> | undefined;

export function refreshSession(): Promise<boolean> {
  if (pending) return pending;
  const refresh = async () => {
    const response = await fetch("/api/auth/refresh", { method: "POST" });
    if (response.status === 401) return false;
    if (!response.ok)
      throw new Error("Cannot restore your session. Please try again.");
    return true;
  };
  // Web Locks serialize rotation across tabs on the same origin.
  pending = Promise.resolve(
    navigator.locks
      ? navigator.locks.request("citycare-session", refresh)
      : refresh(),
  ).finally(() => {
    pending = undefined;
  });
  return pending;
}
