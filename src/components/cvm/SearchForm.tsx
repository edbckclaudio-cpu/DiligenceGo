import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function SearchForm({ onSearch }: { onSearch: (cnpj: string) => void }) {
  const [digits, setDigits] = useState("");
  const formatted = useMemo(() => {
    const g = [2, 3, 3, 4, 2];
    const sep = [".", ".", "/", "-"];
    let s = "";
    let i = 0;
    for (let idx = 0; idx < g.length; idx++) {
      const take = Math.min(g[idx], Math.max(0, digits.length - i));
      if (take <= 0) break;
      const seg = digits.slice(i, i + take);
      s += seg;
      i += take;
      if (take === g[idx] && digits.length > i) s += sep[idx];
    }
    return s;
  }, [digits]);
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D+/g, "");
    setDigits(onlyDigits.slice(0, 14));
  }
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border">
      <h2 className="text-lg font-semibold text-slate-900">Consulta Due Diligence</h2>
      <div className="flex gap-2">
        <Input placeholder="00.000.000/0001-00" className="bg-white" value={formatted} onChange={onChange} inputMode="numeric" />
        <Button onClick={() => onSearch(digits)} className="bg-blue-600" disabled={!digits}>
          <Search className="w-4 h-4 mr-2" />
          Consultar
        </Button>
      </div>
      <p className="text-xs text-slate-500">Dados processados localmente. Fonte: Portal de Dados Abertos CVM.</p>
    </div>
  );
}
