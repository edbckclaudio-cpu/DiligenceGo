import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useMemo } from "react";

export function DataCard({ title, rows, headers = [], file }: { title: string; rows: string[][]; headers?: string[]; file?: string }) {
  const [selected, setSelected] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function formatCNPJ(s: string): string {
    const only = (s || "").replace(/\D+/g, "");
    if (only.length !== 14) return s;
    const g = [2, 3, 3, 4, 2];
    const sep = [".", ".", "/", "-"];
    let out = "";
    let i = 0;
    for (let k = 0; k < g.length; k++) {
      out += only.slice(i, i + g[k]);
      i += g[k];
      if (k < sep.length) out += sep[k];
    }
    return out;
  }

  const pairs = useMemo(() => {
    if (!selected) return [] as { k: string; v: string }[];
    const list: { k: string; v: string }[] = [];
    for (let i = 0; i < selected.length; i++) {
      const k = headers[i] ?? `Coluna ${i + 1}`;
      let v = String(selected[i] ?? "");
      const kh = (k || "").toLowerCase();
      if (kh.includes("cnpj")) v = formatCNPJ(v);
      list.push({ k, v });
    }
    return list;
  }, [selected, headers]);

  function openDetails(row: string[], idx: number) {
    setSelected(row);
    setSelectedIndex(idx);
    setOpen(true);
  }

  function buildShareText(): string {
    const lines: string[] = [];
    if (file) lines.push(`Arquivo: ${String(file)}`);
    for (const p of pairs) lines.push(`${p.k}: ${p.v}`);
    return lines.join("\n");
  }

  function shareWhatsApp() {
    const text = buildShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      location.assign(url);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-sm text-neutral-600">Nenhum dado disponível.</div>
        ) : (
          <div className="space-y-2 text-sm">
            {rows.map((r, i) => (
              <button
                key={i}
                className={`w-full text-left border-b pb-2 last:border-0 rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                  selectedIndex === i
                    ? "bg-[var(--color-primary)]/15 border-2 border-[var(--color-primary)]"
                    : "hover:bg-[var(--green-100)]"
                }`}
                onClick={() => openDetails(r, i)}
              >
                <p className="font-semibold">{r.join(" • ")}</p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      {open && selected && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 z-40"
            onClick={() => {
              setOpen(false);
              setSelectedIndex(null);
            }}
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 w-[92vw] max-w-md space-y-3 z-50">
            <div className="text-base font-semibold">Detalhes</div>
            {file && <div className="text-xs text-neutral-600">Arquivo: {file}</div>}
            <div className="space-y-2">
              {pairs.map((p, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-semibold">{p.k}</span>
                  <span className="text-neutral-700">{p.v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setSelectedIndex(null);
                }}
                className="px-3 py-2 rounded-md bg-neutral-200"
              >
                Fechar
              </button>
              <button onClick={shareWhatsApp} className="px-3 py-2 rounded-md bg-green-600 text-white">WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
