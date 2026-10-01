"use client";
import { createContext, useContext, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
const UiContext = createContext<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}>({ sidebarOpen: false, setSidebarOpen: () => {} });
export const useUi = () => useContext(UiContext);
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: (e) => toast.error(e.message) }),
        mutationCache: new MutationCache({
          onError: (e) => toast.error(e.message),
        }),
        defaultOptions: {
          queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <QueryClientProvider client={client}>
      <UiContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        {children}
        <Toaster richColors position="top-right" />
      </UiContext.Provider>
    </QueryClientProvider>
  );
}
