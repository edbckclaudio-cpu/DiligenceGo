"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataCard } from "@/components/cvm/DataCard";
import { ExportButton } from "@/components/cvm/ExportButton";
import { SearchForm } from "@/components/cvm/SearchForm";
import { useCvmData } from "@/hooks/useCvmData";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { cnpj, year, setYear, limparCnpj, consultar, importarZip, carregarCache, exportarCSV, zipUrl, files, loading, error, errorInfo, current } =
    useCvmData();

  function classifyFile(name: string): "Governança" | "Litígios" | "Sancionador" | "Remuneração" {
    const n = name.toLowerCase();
    if (n.includes("remu") || n.includes("bonus") || n.includes("compensa")) return "Remuneração";
    if (n.includes("lit") || n.includes("processo") || n.includes("acao")) return "Litígios";
    if (n.includes("pas") || n.includes("sanc")) return "Sancionador";
    return "Governança";
  }

  const groups: Record<string, { file: string; rows: string[][] }[]> = {
    Governança: [],
    Remuneração: [],
    Litígios: [],
    Sancionador: [],
  };
  for (const f of files) {
    groups[classifyFile(f.file)].push(f);
  }

  return (
    <div className="p-4 space-y-6 mx-auto max-w-4xl">
      <header className="flex items-center justify-between sm:flex-row flex-col gap-2">
        <h1 className="text-2xl font-bold">DiligenceGo</h1>
        <div className="w-full sm:w-auto">
          <ExportButton isPremium={true} onExport={exportarCSV} />
        </div>
      </header>

      <SearchForm onSearch={(v) => { limparCnpj(v); consultar(); }} />

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
              <a href={zipUrl()} target="_blank" rel="noreferrer" className="underline">Baixar ZIP</a>
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
            <DataCard key={f.file} title={`Processos (FRE) - ${f.file}`} rows={f.rows} />
          ))}
          {groups["Litígios"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de litígios.</div>}
        </TabsContent>
        <TabsContent value="gov">
          {groups["Governança"].map((f) => (
            <DataCard key={f.file} title={`Governança - ${f.file}`} rows={f.rows} />
          ))}
          {groups["Governança"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de governança.</div>}
        </TabsContent>
        <TabsContent value="sancoes">
          {groups["Sancionador"].map((f) => (
            <DataCard key={f.file} title={`Sancionador - ${f.file}`} rows={f.rows} />
          ))}
          {groups["Sancionador"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado sancionador.</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
