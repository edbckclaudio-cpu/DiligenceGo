import { describe, it, expect } from "vitest";
import Papa from "papaparse";

describe("Parsing ISO-8859-1 não corrompe strings", () => {
  it('mantém "Vila das Meninas" intacto após filtragem', () => {
    const csv = "nome\nVila das Meninas\n";
    const bytes = new Uint8Array([...csv].map((ch) => ch.charCodeAt(0)));
    const decoder = new TextDecoder("iso-8859-1");
    const decoded = decoder.decode(bytes);

    const parsed = Papa.parse<string[]>(decoded, {
      delimiter: ",",
      newline: "\n",
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as unknown as Record<string, string>[];
    const match = rows.find((r) => r.nome === "Vila das Meninas");
    expect(match).toBeTruthy();
    expect(match?.nome).toBe("Vila das Meninas");
  });
});

