"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataCard } from "@/components/cvm/DataCard";
import { ExportButton } from "@/components/cvm/ExportButton";
import { SearchForm } from "@/components/cvm/SearchForm";
import { useCvmData } from "@/hooks/useCvmData";
import { Input } from "@/components/ui/input";
import { clearAllMemory } from "@/lib/cvm-parser";

export default function Dashboard() {
  const { cnpj, year, setYear, limparCnpj, consultar, importarZip, carregarCache, exportarCSV, zipUrl, files, loading, error, errorInfo, current } =
    useCvmData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingDigits, setPendingDigits] = useState("");
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "Resumo Executivo",
    "Governança",
    "Compliance/Antecedentes",
    "Estrutura Acionária",
    "Passivos (Debêntures)",
    "Diversidade (ESG)",
  ]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setFormatPickerOpen(false);
        setReportOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function classifyFile(name: string): "Governança" | "Litígios" | "Sancionador" | "Remuneração" {
    const n = name.toLowerCase();
    if (n.includes("remu") || n.includes("bonus") || n.includes("compensa")) return "Remuneração";
    if (n.includes("lit") || n.includes("processo") || n.includes("acao")) return "Litígios";
    if (n.includes("pas") || n.includes("sanc")) return "Sancionador";
    return "Governança";
  }

  const groups: Record<string, { file: string; rows: string[][]; headers?: string[] }[]> = {
    Governança: [],
    Remuneração: [],
    Litígios: [],
    Sancionador: [],
  };
  for (const f of files) {
    groups[classifyFile(f.file)].push(f);
  }

  async function abrirZipExterno() {
    const url = zipUrl();
    try {
      const { Browser } = await import("@capacitor/browser");
      await (Browser as any).open({ url });
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const prevSummaryText = useMemo(() => {
    const totalRows = files.reduce((acc, f) => acc + f.rows.length, 0);
    const lines: string[] = [];
    lines.push(`Relatório DiligenceGo`);
    lines.push(`CNPJ: ${cnpj}`);
    lines.push(`Ano: ${year ?? current}`);
    lines.push(`Arquivos: ${files.length}`);
    lines.push(`Linhas: ${totalRows}`);
    return lines.join("\n");
  }, [files, cnpj, year, current]);

  function handleSearchRequest(digits: string) {
    const only = digits.replace(/\D+/g, "");
    if (files.length > 0 && only !== cnpj) {
      setPendingDigits(only);
      setDrawerOpen(true);
      return;
    }
    limparCnpj(digits);
    consultar(only);
  }

  async function proceedNewSearch() {
    try {
      await clearAllMemory();
    } catch {}
    setDrawerOpen(false);
    setFormatPickerOpen(false);
    limparCnpj(pendingDigits);
    consultar();
    setPendingDigits("");
    setChannel(null);
  }

  function sendEmailThenSearch() {
    setChannel("email");
    setDrawerOpen(false);
    setFormatPickerOpen(true);
  }

  function sendWhatsAppThenSearch() {
    setChannel("whatsapp");
    setDrawerOpen(false);
    setFormatPickerOpen(true);
  }

  function discardAndSearch() {
    proceedNewSearch();
  }

  return (
    <div className="p-4 space-y-6 mx-auto max-w-4xl">
      <div className="flex items-center justify-end">
        <div className="w-full sm:w-auto">
          <ExportButton
            isPremium={true}
            onExport={() => setReportOpen(true)}
          />
        </div>
      </div>

      <SearchForm
        onSearch={(v) => handleSearchRequest(v)}
        loading={loading}
        canShare={files.length > 0}
        onShareEmail={() => {
          const textContent = buildFullText(files as any, cnpj, year ?? current);
          const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
          const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textContent)}`;
          try { window.location.href = mail; } catch {}
        }}
        onShareWhatsApp={() => {
          const textContent = buildFullText(files as any, cnpj, year ?? current);
          const url = `https://wa.me/?text=${encodeURIComponent(textContent)}`;
          try { window.open(url, "_blank", "noopener,noreferrer"); } catch { location.assign(url); }
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select
          value={String(year ?? current)}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded-md bg-white"
        >
          <option value={current}>{current}</option>
          <option value={current - 1}>{current - 1}</option>
          <option value={current - 2}>{current - 2}</option>
          <option value={current - 3}>{current - 3}</option>
          <option value={current - 4}>{current - 4}</option>
        </select>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div>{error}</div>
              {errorInfo && (
                <div className="text-xs text-neutral-600 mt-1">
                  {typeof errorInfo.status !== "undefined" && <span>Status: {errorInfo.status} </span>}
                  {errorInfo.url && <span>URL: {errorInfo.url} </span>}
                  {errorInfo.message && <span>Detalhe: {errorInfo.message}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={abrirZipExterno} className="underline">Baixar ZIP</button>
              <label className="underline cursor-pointer">
                Importar ZIP
                <input type="file" accept=".zip" onChange={(e) => e.target.files && importarZip(e.target.files[0])} className="hidden" />
              </label>
              <button onClick={carregarCache} className="underline">Carregar cache</button>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="litigios">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="gov">Governança</TabsTrigger>
          <TabsTrigger value="litigios">Litígios</TabsTrigger>
          <TabsTrigger value="sancoes">Sanções</TabsTrigger>
        </TabsList>

        <TabsContent value="litigios">
          {groups["Litígios"].map((f) => (
            <DataCard key={f.file} title={`Processos (FRE) - ${f.file}`} rows={f.rows} headers={f.headers || []} file={f.file} />
          ))}
          {groups["Litígios"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de litígios.</div>}
        </TabsContent>
        <TabsContent value="gov">
          {groups["Governança"].map((f) => (
            <DataCard key={f.file} title={`Governança - ${f.file}`} rows={f.rows} headers={f.headers || []} file={f.file} />
          ))}
          {groups["Governança"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de governança.</div>}
        </TabsContent>
        <TabsContent value="sancoes">
          {groups["Sancionador"].map((f) => (
            <DataCard key={f.file} title={`Sancionador - ${f.file}`} rows={f.rows} headers={f.headers || []} file={f.file} />
          ))}
          {groups["Sancionador"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado sancionador.</div>}
        </TabsContent>
      </Tabs>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-md max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Enviar a consulta anterior e iniciar nova?</div>
            <div className="text-sm text-neutral-600">Escolha uma opção para compartilhar a anterior e continuaremos com a nova consulta.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={sendEmailThenSearch} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]">Enviar por E-mail</button>
              <button onClick={sendWhatsAppThenSearch} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]">Enviar por WhatsApp</button>
              <button onClick={discardAndSearch} className="px-3 py-2 rounded-md border">Descartar e consultar</button>
              <button onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setReportOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-2xl max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Gerar Relatório</div>
            <div className="text-sm text-neutral-600">Selecione as seções a incluir.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {["Resumo Executivo","Governança","Compliance/Antecedentes","Estrutura Acionária","Passivos (Debêntures)","Diversidade (ESG)"].map((sec) => {
                const checked = selectedSections.includes(sec);
                return (
                  <label key={sec} className="flex items-center gap-2 border rounded-md px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSelectedSections((prev) => {
                          if (val) return Array.from(new Set([...prev, sec]));
                          return prev.filter((s) => s !== sec);
                        });
                      }}
                    />
                    <span>{sec}</span>
                  </label>
                );
              })}
            </div>
            <div className="text-sm text-neutral-600">Compartilhar</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={async () => {
                  const html = generateProfessionalReport(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const filename = `Relatorio_DiligenceGo_${cnpj}_${year ?? current}.html`;
                  await shareFile(html, "text/html", filename);
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                HTML (arquivo)
              </button>
              <button
                onClick={() => {
                  const text = buildReportText(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  try { window.open(url, "_blank", "noopener,noreferrer"); } catch { location.assign(url); }
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                WhatsApp (texto)
              </button>
              <button
                onClick={() => {
                  const text = buildReportText(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
                  const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
                  try { window.location.href = mail; } catch {}
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                E-mail (texto)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setReportOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
              <button
                onClick={() => {
                  const html = generateProfessionalReport(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank", "noopener,noreferrer");
                  setTimeout(() => URL.revokeObjectURL(url), 30000);
                }}
                className="px-3 py-2 rounded-md border"
              >
                Pré-visualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {formatPickerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setFormatPickerOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-md max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Formato de envio</div>
            <div className="text-sm text-neutral-600">Envio somente em texto organizado.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setFormatPickerOpen(false);
                  const textContent = buildFullText(files as any, cnpj, year ?? current);
                  if (channel === "email") {
                    const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
                    const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textContent)}`;
                    try { window.location.href = mail; } catch {}
                    proceedNewSearch();
                  } else if (channel === "whatsapp") {
                    const url = `https://wa.me/?text=${encodeURIComponent(textContent)}`;
                    try { window.open(url, "_blank", "noopener,noreferrer"); } catch {}
                    proceedNewSearch();
                  }
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                Enviar texto
              </button>
              <button
                onClick={() => setFormatPickerOpen(false)}
                className="px-3 py-2 rounded-md border"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildDelimitedContent(files: any[], fallbackDelim: string): string {
  const lines: string[] = [];
  for (const f of files) {
    const delim = (f?.delimiter as string) || fallbackDelim;
    const headers = (f?.headers as string[]) || [];
    lines.push(`# arquivo: ${String(f.file)}`);
    if (headers.length > 0) {
      lines.push(headers.map((h) => String(h)).join(delim));
    }
    for (const r of f.rows as string[][]) {
      lines.push(r.map((c) => String(c)).join(delim));
    }
    lines.push("");
  }
  return lines.join("\n");
}

function buildFullText(files: any[], cnpj: string, year: number): string {
  const out: string[] = [];
  out.push(`Relatório DiligenceGo`);
  out.push(`CNPJ: ${cnpj}`);
  out.push(`Ano: ${year}`);
  out.push("");
  for (const f of files) {
    const headers = (f?.headers as string[]) || [];
    out.push(`Arquivo: ${String(f.file)}`);
    const rows: string[][] = (f?.rows as string[][]) || [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      out.push(`Linha ${i + 1}:`);
      for (let j = 0; j < r.length; j++) {
        const k = headers[j] ?? `Coluna ${j + 1}`;
        const v = String(r[j] ?? "");
        out.push(`${k}: ${v}`);
      }
      out.push("");
    }
    out.push("");
  }
  return out.join("\n");
}

async function shareFile(content: string, mime: string, filename: string): Promise<void> {
  try {
    const { Filesystem } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const base64 = btoa(unescape(encodeURIComponent(content)));
    await (Filesystem as any).writeFile({
      path: filename,
      data: base64,
      directory: "DOCUMENTS",
      encoding: "base64",
    });
    const uriRes = await (Filesystem as any).getUri({ path: filename, directory: "DOCUMENTS" });
    const uri = (uriRes as any)?.uri || "";
    await (Share as any).share({ title: filename, text: filename, url: uri, dialogTitle: "Compartilhar arquivo" });
    return;
  } catch {}
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    if (navigator.share) {
      await navigator.share({ title: filename, text: filename, url });
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch {}
}

function normalizeDate(value: string): string {
  const t = String(value).trim();
  const m = t.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const m2 = t.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})/);
  if (m2) return `${m2[1]}/${m2[2]}/${m2[3]}`;
  return t;
}

function formatMoneyBr(val: string | number): string {
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
  if (!isFinite(num)) return String(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function td(v: string) {
  return `<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${v}</td>`;
}

function th(v: string) {
  return `<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:600;">${v}</th>`;
}

function table(headers: string[], rows: string[][]) {
  const head = `<thead><tr>${headers.map(th).join("")}</tr></thead>`;
  const body = `<tbody>${rows.map((r) => `<tr>${r.map(td).join("")}</tr>`).join("")}</tbody>`;
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;margin-bottom:16px;">${head}${body}</table>`;
}

function section(title: string, contentHtml: string) {
  return `<section style="margin-top:16px;">
    <h2 style="font-size:16px;margin:0 0 8px 0;color:#111827;">${title}</h2>
    ${contentHtml}
  </section>`;
}

function buildReportText(sections: string[], meta: { cnpj: string; year: number }, files: any[]): string {
  const lines: string[] = [];
  const now = new Date();
  const dh = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`;
  lines.push(`DiligenceGo - Relatório de Due Diligence`);
  lines.push(`Gerado em: ${dh}`);
  lines.push(`CNPJ: ${meta.cnpj}`);
  lines.push(`Ano: ${meta.year}`);
  lines.push("");
  for (const sec of sections) {
    lines.push(`== ${sec} ==`);
    if (sec === "Resumo Executivo") {
      const totalRows = files.reduce((acc, f) => acc + (f.rows?.length || 0), 0);
      lines.push(`Arquivos processados: ${files.length}`);
      lines.push(`Registros totais: ${totalRows}`);
    } else if (sec === "Governança") {
      const gov = files.filter((f) => classifyByName(f.file) === "Governança");
      lines.push(`Itens de governança: ${gov.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
    } else if (sec === "Compliance/Antecedentes") {
      const pas = files.filter((f) => classifyByName(f.file) === "Sancionador");
      const lit = files.filter((f) => classifyByName(f.file) === "Litígios");
      lines.push(`Registros sancionadores: ${pas.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
      lines.push(`Registros de litígios: ${lit.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
    } else if (sec === "Estrutura Acionária") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    } else if (sec === "Passivos (Debêntures)") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    } else if (sec === "Diversidade (ESG)") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function generateProfessionalReport(sections: string[], meta: { cnpj: string; year: number }, files: any[]): string {
  const now = new Date();
  const dh = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`;
  const baseStyle = `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#ffffff;color:#111827;line-height:1.5;padding:24px;} h1{font-size:20px;margin:0 0 12px 0;}`;
  let content = "";
  if (sections.includes("Resumo Executivo")) {
    const totalRows = files.reduce((acc, f) => acc + (f.rows?.length || 0), 0);
    const execHtml = table(["Arquivos","Registros"], [[String(files.length), String(totalRows)]]);
    content += section("Resumo Executivo", execHtml);
  }
  if (sections.includes("Governança")) {
    const gov = files.filter((f) => classifyByName(f.file) === "Governança");
    const parts = gov.map((f) => {
      const headers = (f.headers || []).map(String);
      const rows = (f.rows || []).map((r: any[]) => r.map((c: any) => String(c)));
      return `<div style="margin-top:8px;">
        <div style="font-size:13px;color:#374151;">Arquivo: ${f.file}</div>
        ${table(headers, rows)}
      </div>`;
    }).join("");
    content += section("Governança", parts || `<div style="color:#6b7280;">Nenhum dado.</div>`);
  }
  if (sections.includes("Compliance/Antecedentes")) {
    const pas = files.filter((f) => classifyByName(f.file) === "Sancionador");
    const lit = files.filter((f) => classifyByName(f.file) === "Litígios");
    const renderBlock = (arr: any[], title: string) => {
      const blocks = arr.map((f) => {
        const headers = (f.headers || []).map(String);
        const rows = (f.rows || []).map((r: any[]) => r.map((c: any, idx: number) => {
          const h = headers[idx]?.toLowerCase() || "";
          const s = String(c);
          if (h.includes("data")) return normalizeDate(s);
          if (h.includes("valor")) return formatMoneyBr(s);
          return s;
        }));
        return `<div style="margin-top:8px;">
          <div style="font-size:13px;color:#374151;">Arquivo: ${f.file}</div>
          ${table(headers, rows)}
        </div>`;
      }).join("");
      return `<div><div style="font-weight:600;margin-top:4px;">${title}</div>${blocks || `<div style="color:#6b7280;">Nenhum dado.</div>`}</div>`;
    };
    const compHtml = `${renderBlock(pas, "Sancionador (PAS)")} ${renderBlock(lit, "Litígios")}`;
    content += section("Compliance/Antecedentes", compHtml);
  }
  if (sections.includes("Estrutura Acionária")) {
    content += section("Estrutura Acionária", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  if (sections.includes("Passivos (Debêntures)")) {
    content += section("Passivos (Debêntures)", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  if (sections.includes("Diversidade (ESG)")) {
    content += section("Diversidade (ESG)", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  const html = `<!doctype html>
  <html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Relatório DiligenceGo</title>
  <style>${baseStyle}</style></head><body>
    <div style="position:fixed;top:12px;right:12px;z-index:9999;">
      <button onclick="window.close()" style="padding:10px 12px;border-radius:8px;background:#111827;color:#ffffff;border:none;box-shadow:0 2px 6px rgba(0,0,0,0.15);cursor:pointer;">Fechar</button>
    </div>
    <h1>DiligenceGo - Relatório de Due Diligence</h1>
    <div style="font-size:13px;color:#374151;">Gerado em: ${dh}</div>
    <div style="font-size:13px;color:#374151;">CNPJ: ${meta.cnpj} &nbsp; Ano: ${meta.year}</div>
    ${content}
  </body></html>`;
  return html;
}

function classifyByName(name: string): "Governança" | "Litígios" | "Sancionador" | "Remuneração" {
  const n = String(name).toLowerCase();
  if (n.includes("remu") || n.includes("bonus") || n.includes("compensa")) return "Remuneração";
  if (n.includes("lit") || n.includes("processo") || n.includes("acao")) return "Litígios";
  if (n.includes("pas") || n.includes("sanc")) return "Sancionador";
  return "Governança";
}
