import React, { createContext, useContext, useState } from "react";

type TabsContextType = { value: string; setValue: (v: string) => void };
const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>;
}

export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-grid items-center gap-1 rounded-md border bg-[var(--surface)] border-[var(--surface-border)] p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={
        active
          ? "px-3 py-3 sm:py-2 text-sm rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
          : "px-3 py-3 sm:py-2 text-sm rounded-md hover:bg-[var(--surface-hover)]"
      }
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}
