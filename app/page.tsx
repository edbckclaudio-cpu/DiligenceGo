"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    try {
      const url = "/dashboard/";
      window.location.replace(url);
    } catch {}
  }, []);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm">Redirecionando para o dashboard…</p>
      <noscript>
        <a href="/dashboard/">Ir para Dashboard</a>
      </noscript>
    </main>
  );
}
