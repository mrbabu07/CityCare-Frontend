"use client";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export type RequestDraft = {
  step: number;
  values: {
    title?: string;
    description?: string;
    categoryId?: string;
    address?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  };
};
const DraftContext = createContext<{
  draft: RequestDraft | null;
  setDraft: Dispatch<SetStateAction<RequestDraft | null>>;
} | null>(null);
export function RequestDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  return (
    <DraftContext.Provider value={{ draft, setDraft }}>
      {children}
    </DraftContext.Provider>
  );
}
export function useRequestDraft() {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error("Request draft provider is missing");
  return draft;
}
