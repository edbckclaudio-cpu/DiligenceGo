import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportButton({ isPremium, onExport }: { isPremium: boolean; onExport: () => void }) {
  return (
    <Button onClick={onExport} className="bg-neutral-900" disabled={!isPremium}>
      <Download className="w-4 h-4 mr-2" />
      Gerar Relatório
    </Button>
  );
}

