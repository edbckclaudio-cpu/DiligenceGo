"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAllMemory } from "@/lib/cvm-parser";

export default function AccountDeletePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      try {
        window.localStorage.removeItem("dg:user");
        window.localStorage.removeItem("dg:plan");
        window.localStorage.removeItem("dg:apiKey");
      } catch {}
      try {
        await clearAllMemory();
      } catch {}
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <h1 className="text-2xl font-semibold mb-4">Excluir Conta e Dados</h1>
      <p className="text-sm text-neutral-600 mb-6">Remova seu perfil, assinatura, API Key e resultados em cache deste dispositivo.</p>

      <div className="space-y-3 text-sm">
        <div>Itens que serão excluídos:</div>
        <ul className="list-disc pl-5">
          <li>Perfil (nome, e‑mail, avatar)</li>
          <li>Status do plano (Grátis/Premium)</li>
          <li>API Key do Portal da Transparência</li>
          <li>Resultados e relatórios salvos em cache</li>
        </ul>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={busy || done}
          className="px-3 py-2 rounded-md bg-red-600 text-white disabled:opacity-60"
        >
          {done ? "Excluído" : busy ? "Excluindo..." : "Excluir agora"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-3 py-2 rounded-md border"
        >
          Voltar para Dashboard
        </button>
      </div>

      {done && (
        <div className="mt-4 text-sm text-green-700">
          Exclusão concluída. Você pode fazer login novamente pelo menu lateral se desejar.
        </div>
      )}
    </main>
  );
}
