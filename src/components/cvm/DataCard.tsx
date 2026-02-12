import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function DataCard({ title, rows }: { title: string; rows: string[][] }) {
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
            {rows.slice(0, 20).map((r, i) => (
              <div key={i} className="border-b pb-2 last:border-0">
                <p className="font-semibold">{r.join(" • ")}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

