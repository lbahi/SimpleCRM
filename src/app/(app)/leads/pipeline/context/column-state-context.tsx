// SimpleCRM — column-state-context
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useColumnState } from "../hooks/use-column-state";

type ColumnStateContextValue = ReturnType<typeof useColumnState>;

const ColumnStateContext = createContext<ColumnStateContextValue | null>(null);

export function ColumnStateProvider({ children }: { children: ReactNode }) {
  const columnState = useColumnState();
  return (
    <ColumnStateContext.Provider value={columnState}>
      {children}
    </ColumnStateContext.Provider>
  );
}

export function useColumnStateContext(): ColumnStateContextValue {
  const ctx = useContext(ColumnStateContext);
  if (!ctx) {
    throw new Error(
      "useColumnStateContext must be used within a ColumnStateProvider"
    );
  }
  return ctx;
}
