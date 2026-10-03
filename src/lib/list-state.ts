export function pageNumber(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1000000 ? page : 1;
}

export function pageItems<T>(items: T[], requestedPage: number, size = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(requestedPage, totalPages);
  return {
    page,
    totalPages,
    total: items.length,
    items: items.slice((page - 1) * size, page * size),
  };
}

export function updateSearch(current: string, values: Record<string, string>) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(values)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next.toString();
}
