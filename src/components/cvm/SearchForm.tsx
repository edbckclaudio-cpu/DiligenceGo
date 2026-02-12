import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchForm({ onSearch }: { onSearch: (cnpj: string) => void }) {
  const [value, setValue] = useState("");
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyDigits = e.target.value.replace(/\D+/g, "");
    setValue(onlyDigits);
  }
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg border">
      <h2 className="text-lg font-semibold text-slate-900">Consulta Due Diligence</h2>
      <div className="flex gap-2">
        <Input placeholder="00.000.000/0001-00" className="bg-white" value={value} onChange={onChange} />
        <Button onClick={() => onSearch(value)} className="bg-blue-600">
          <Search className="w-4 h-4 mr-2" />
          Consultar
        </Button>
      </div>
      <p className="text-xs text-slate-500">Dados processados localmente. Fonte: Portal de Dados Abertos CVM.</p>
    </div>
  );
}

