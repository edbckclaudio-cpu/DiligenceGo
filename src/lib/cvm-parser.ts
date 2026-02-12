export type Dataset = "FRE" | "PAS";
export type FREFileResult = { file: string; rows: string[][] };
export type FRESummary = { cnpj: string; year: number; files: FREFileResult[] };

export class CVMOfflineError extends Error {
  constructor(message = "Serviço da CVM indisponível no momento") {
    super(message);
    this.name = "CVMOfflineError";
  }
}

export class CVMUnavailableError extends Error {
  constructor(message = "Conjunto de dados indisponível no momento") {
    super(message);
    this.name = "CVMUnavailableError";
  }
}

export function sanitizeCNPJ(input: string): string {
  return (input || "").replace(/\D+/g, "");
}

export function currentYear(): number {
  return new Date().getFullYear();
}

function assertClient(): void {
  if (typeof window === "undefined") {
    throw new Error("Este módulo deve ser usado no client (browser).");
  }
}

function buildCVMUrl(dataset: Dataset, year: number): string {
  if (dataset === "FRE") {
    return `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/FRE/DADOS/fre_cia_aberta_${year}.zip`;
  }
  throw new CVMUnavailableError("Base PAS indisponível no momento");
}

export function freZipUrl(year: number): string {
  return buildCVMUrl("FRE", year);
}

async function getCache(): Promise<Cache> {
  assertClient();
  return caches.open("diligencego-zip-cache");
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchZipBlob(dataset: Dataset, year: number): Promise<Blob> {
  assertClient();
  const baseUrl = buildCVMUrl(dataset, year);
  const requestToday = new Request(`${baseUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache });
  const cache = await getCache();
  const cachedToday = await cache.match(requestToday);
  if (cachedToday) {
    const blob = await cachedToday.blob();
    return blob;
  }
  try {
    try {
      const { Capacitor, CapacitorHttp } = await import("@capacitor/core");
      if (Capacitor && typeof Capacitor.isNativePlatform === "function" && Capacitor.isNativePlatform() && CapacitorHttp) {
        const r = await CapacitorHttp.get({ url: baseUrl, responseType: "arraybuffer" } as any);
        const arrBuf: ArrayBuffer = (r as any)?.data;
        if (arrBuf) {
          const blob = new Blob([arrBuf], { type: "application/zip" });
          await cache.put(requestToday, new Response(blob));
          return blob;
        }
      }
    } catch {}
    const resp = await fetch(baseUrl, { redirect: "follow" });
    if (!resp.ok) {
      const fallback = await findAnyCachedVersion(cache, baseUrl);
      if (fallback) return fallback;
      throw new CVMOfflineError(`Falha ao baixar FRE ${year}: ${resp.status}`);
    }
    const clone = resp.clone();
    await cache.put(requestToday, clone);
    const blob = await resp.blob();
    return blob;
  } catch {
    const fallback = await findAnyCachedVersion(cache, baseUrl);
    if (fallback) return fallback;
    throw new CVMOfflineError("Erro de rede ao baixar dados da CVM");
  }
}

async function findAnyCachedVersion(cache: Cache, baseUrl: string): Promise<Blob | null> {
  const keys = await cache.keys();
  for (const req of keys) {
    if (req.url.startsWith(baseUrl)) {
      const resp = await cache.match(req);
      if (resp) return resp.blob();
    }
  }
  return null;
}

export async function parseFREByCNPJ(cnpjInput: string, year?: number): Promise<FRESummary> {
  assertClient();
  const cnpj = sanitizeCNPJ(cnpjInput);
  const targetYear = year ?? currentYear();
  const zipBlob = await fetchZipBlob("FRE", targetYear);
  const JSZip = await import("jszip");
  const Papa = await import("papaparse");
  const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    const buf = await file.async("arraybuffer");
    try {
      const decoder = new TextDecoder("iso-8859-1");
      const csvText = decoder.decode(buf as ArrayBuffer);
      const parsed = Papa.parse<string[]>(csvText, {
        delimiter: ",",
        newline: "\n",
        skipEmptyLines: true,
        header: false,
        dynamicTyping: false,
      });
      const filtered: string[][] = [];
      const data = parsed.data as unknown as string[][];
      for (const row of data) {
        if (!Array.isArray(row)) continue;
        for (const col of row) {
          if (typeof col === "string" && col.replace(/\D+/g, "") === cnpj) {
            filtered.push(row);
            break;
          }
        }
      }
      files.push({ file: name, rows: filtered });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
    } catch {}
  }
  const summary: FRESummary = { cnpj, year: targetYear, files };
  try {
    saveReportLocal(summary);
  } catch {}
  return summary;
}

export async function parseFREBlobByCNPJ(cnpjInput: string, blob: Blob, year?: number): Promise<FRESummary> {
  assertClient();
  const cnpj = sanitizeCNPJ(cnpjInput);
  const targetYear = year ?? currentYear();
  const JSZip = await import("jszip");
  const Papa = await import("papaparse");
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    const buf = await file.async("arraybuffer");
    try {
      const decoder = new TextDecoder("iso-8859-1");
      const csvText = decoder.decode(buf as ArrayBuffer);
      const parsed = Papa.parse<string[]>(csvText, {
        delimiter: ",",
        newline: "\n",
        skipEmptyLines: true,
        header: false,
        dynamicTyping: false,
      });
      const filtered: string[][] = [];
      const data = parsed.data as unknown as string[][];
      for (const row of data) {
        if (!Array.isArray(row)) continue;
        for (const col of row) {
          if (typeof col === "string" && col.replace(/\D+/g, "") === cnpj) {
            filtered.push(row);
            break;
          }
        }
      }
      files.push({ file: name, rows: filtered });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
    } catch {}
  }
  const summary: FRESummary = { cnpj, year: targetYear, files };
  try {
    saveReportLocal(summary);
  } catch {}
  return summary;
}

export function mapErrorToUserMessage(err: unknown): string {
  if (err instanceof CVMUnavailableError) {
    return "A base PAS está indisponível no momento. Tente novamente mais tarde ou utilize dados em cache.";
  }
  if (err instanceof CVMOfflineError) {
    return "Não foi possível acessar os dados da CVM agora. Verifique sua conexão ou carregue resultados salvos em cache.";
  }
  return "Ocorreu um erro inesperado. Tente novamente em instantes.";
}

export function saveReportLocal(summary: FRESummary): void {
  assertClient();
  const key = `DiligenceGo:report:${summary.cnpj}:${summary.year}`;
  const value = JSON.stringify(summary);
  window.localStorage.setItem(key, value);
}

export function loadReportLocal(cnpj: string, year: number): FRESummary | null {
  assertClient();
  const key = `DiligenceGo:report:${sanitizeCNPJ(cnpj)}:${year}`;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FRESummary;
  } catch {
    return null;
  }
}

export function legalDisclaimer(): string {
  return "O DiligenceGo é uma ferramenta independente e não possui vínculo com a CVM. Os dados são extraídos do Portal de Dados Abertos oficial.";
}
