import { useMemo, useState } from "react";
import { currentYear, freZipUrl, loadReportLocal, mapErrorToUserMessage, parseFREBlobByCNPJ, parseFREByCNPJ, sanitizeCNPJ } from "@/lib/cvm-parser";

type Row = string[];

export function useCvmData() {
  const [cnpj, setCnpj] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<{ file: string; rows: Row[] }[]>([]);
  const current = useMemo(() => currentYear(), []);

  async function consultar() {
    setLoading(true);
    setError(null);
    try {
      const y = year ?? current;
      const summary = await parseFREByCNPJ(cnpj, y);
      setFiles(summary.files);
    } catch (e) {
      setError(mapErrorToUserMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function carregarCache() {
    const y = year ?? current;
    const cached = loadReportLocal(cnpj, y);
    if (cached) {
      setFiles(cached.files);
      setError(null);
    } else {
      setError("Nenhum resultado em cache para este CNPJ/ano.");
    }
  }

  async function importarZip(file: File) {
    setLoading(true);
    setError(null);
    try {
      const y = year ?? current;
      const summary = await parseFREBlobByCNPJ(cnpj, file, y);
      setFiles(summary.files);
    } catch (e) {
      setError(mapErrorToUserMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function limparCnpj(v: string) {
    setCnpj(v.replace(/\D+/g, ""));
  }

  function exportarCSV() {
    const lines: string[] = [];
    lines.push("arquivo;colunas");
    for (const f of files) {
      for (const r of f.rows) {
        lines.push(`${f.file};${r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")}`);
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=iso-8859-1" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DiligenceGo_${sanitizeCNPJ(cnpj)}_${year ?? current}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function zipUrl() {
    return freZipUrl(year ?? current);
  }

  return { cnpj, year, setYear, limparCnpj, consultar, importarZip, carregarCache, exportarCSV, zipUrl, files, loading, error, current };
}

