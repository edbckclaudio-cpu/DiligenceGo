import * as React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="border rounded-md bg-[var(--surface)] border-[var(--surface-border)]">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-3 border-b border-[var(--surface-border)]">{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-medium ${className}`}>{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}
