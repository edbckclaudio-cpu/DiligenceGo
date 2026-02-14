export type Dataset = "FRE" | "PAS";
export type FREFileResult = { file: string; rows: string[][] };
export type FRESummary = { cnpj: string; year: number; files: FREFileResult[] };

export class CVMOfflineError extends Error {
  status?: number;
  url?: string;
  constructor(message = "Serviço da CVM indisponível no momento", status?: number, url?: string) {
    super(message);
    this.name = "CVMOfflineError";
    this.status = status;
    this.url = url;
  }
}

export class CVMUnavailableError extends Error {
  status?: number;
  url?: string;
  constructor(message = "Conjunto de dados indisponível no momento", status?: number, url?: string) {
    super(message);
    this.name = "CVMUnavailableError";
    this.status = status;
    this.url = url;
  }
}

export function sanitizeCNPJ(input: string): string {
  return (input || "").replace(/\D+/g, "");
}

export function currentYear(): number {
  return new Date().getFullYear();
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeLatin1(buf: ArrayBuffer): string {
  try {
    const dec = new TextDecoder("iso-8859-1");
    return dec.decode(buf as ArrayBuffer);
  } catch {
    const bytes = new Uint8Array(buf as ArrayBuffer);
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return s;
  }
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
  const directUrl = buildCVMUrl(dataset, year);
  const proxyUrl = `/api/fre/${year}`;
  const isStaticExport = typeof location !== "undefined" && (location.protocol === "capacitor:" || location.protocol === "file:");
  let chosen = isStaticExport ? directUrl : proxyUrl;
  console.log("cvm:fetchZipBlob:start", { dataset, year, directUrl, proxyUrl, chosen });
  const requestToday = new Request(`${chosen}?day=${todayKey()}`, { cache: "no-store" as RequestCache });
  const cache = await getCache();
  const cachedToday = await cache.match(requestToday);
  if (cachedToday) {
    const blob = await cachedToday.blob();
    console.log("cvm:fetchZipBlob:cache-hit", { url: requestToday.url, size: blob.size });
    return blob;
  }
  try {
    let isNative = false;
    let hasCapHttp = false;
    try {
      const { Capacitor } = await import("@capacitor/core");
      const { Http } = await import("@capacitor/http");
      isNative = !!(Capacitor && typeof Capacitor.isNativePlatform === "function" && Capacitor.isNativePlatform());
      hasCapHttp = !!Http;
      if (isNative && hasCapHttp) {
        const r = await (Http as any).get({ url: directUrl, responseType: "arraybuffer" });
        const status = (r as any)?.status ?? 200;
        const data = (r as any)?.data;
        if (data && status >= 200 && status < 300) {
          const buf: ArrayBuffer = data instanceof ArrayBuffer ? data : (base64ToUint8Array(String(data)).buffer as ArrayBuffer);
          const blob = new Blob([buf], { type: "application/zip" });
          await cache.put(new Request(`${directUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache }), new Response(blob));
          console.log("cvm:fetchZipBlob:native-ok", { url: directUrl, size: blob.size });
          return blob;
        }
      }
    } catch {}
    let resp: Response;
    if (isNative || isStaticExport) {
      chosen = directUrl;
       console.log("cvm:fetchZipBlob:fetch-direct", { url: chosen });
      resp = await fetch(directUrl, { redirect: "follow" });
    } else {
      console.log("cvm:fetchZipBlob:fetch-proxy", { url: proxyUrl });
      resp = await fetch(proxyUrl, { redirect: "follow" });
      if (!resp.ok) {
        chosen = directUrl;
        console.log("cvm:fetchZipBlob:fallback-direct", { url: chosen, status: resp.status });
        resp = await fetch(directUrl, { redirect: "follow" });
      }
    }
    if (!resp.ok) {
      // Se for ano 2026, tentar silenciosamente 2025
      const targetFallbackYear = year === 2026 ? 2025 : undefined;
      if (dataset === "FRE" && typeof targetFallbackYear !== "undefined") {
        const prevUrl = buildCVMUrl(dataset, targetFallbackYear);
        try {
          if (isNative && hasCapHttp) {
            const { Http } = await import("@capacitor/http");
            const rr = await (Http as any).get({ url: prevUrl, responseType: "arraybuffer" });
            const status2 = (rr as any)?.status ?? 200;
            const data2 = (rr as any)?.data;
            if (data2 && status2 >= 200 && status2 < 300) {
              const buf2: ArrayBuffer = data2 instanceof ArrayBuffer ? data2 : (base64ToUint8Array(String(data2)).buffer as ArrayBuffer);
              const blob2 = new Blob([buf2], { type: "application/zip" });
              await cache.put(new Request(`${prevUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache }), new Response(blob2));
              console.log("cvm:fetchZipBlob:native-fallback-ok", { url: prevUrl, size: blob2.size });
              return blob2;
            }
          }
        } catch {}
        try {
          const resp2 = await fetch(prevUrl, { redirect: "follow" });
          if (resp2.ok) {
            const clone2 = resp2.clone();
            await cache.put(new Request(`${prevUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache }), clone2);
            const blob2 = await resp2.blob();
            console.log("cvm:fetchZipBlob:http-fallback-ok", { url: prevUrl, size: blob2.size });
            return blob2;
          }
        } catch {}
      }
      const fallback = await findAnyCachedVersion(cache, directUrl);
      if (fallback) return fallback;
      console.log("cvm:fetchZipBlob:http-error", { url: chosen, status: resp.status });
      throw new CVMOfflineError(`Falha ao baixar FRE ${year}: ${resp.status}`, resp.status, chosen);
    }
    const clone = resp.clone();
    await cache.put(requestToday, clone);
    const blob = await resp.blob();
    console.log("cvm:fetchZipBlob:http-ok", { url: chosen, size: blob.size });
    return blob;
  } catch (err: any) {
    const fallback = await findAnyCachedVersion(cache, directUrl);
    if (fallback) return fallback;
    console.log("cvm:fetchZipBlob:network-error", { url: directUrl, error: String(err && err.message || err) });
    throw new CVMOfflineError("Erro de rede ao baixar dados da CVM", undefined, directUrl);
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

import * as Papa from "papaparse";
export async function parseFREByCNPJ(cnpjInput: string, year?: number): Promise<FRESummary> {
  assertClient();
  const cnpj = sanitizeCNPJ(cnpjInput);
  const targetYear = year ?? currentYear();
  console.log("cvm:parse:start", { cnpj, year: targetYear });
  const zipBlob = await fetchZipBlob("FRE", targetYear);
  console.log("cvm:parse:zip", { size: zipBlob.size });
  const JSZip = await import("jszip");
  const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  console.log("cvm:parse:entries", { count: fileNames.length });
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    const buf = await file.async("arraybuffer");
    try {
      const csvText = decodeLatin1(buf as ArrayBuffer);
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
      console.log("cvm:parse:file", { name, rows: filtered.length });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
    } catch {}
  }
  const summary: FRESummary = { cnpj, year: targetYear, files };
  try {
    saveReportLocal(summary);
  } catch {}
  console.log("cvm:parse:done", { files: files.length });
  return summary;
}

export async function parseFREBlobByCNPJ(cnpjInput: string, blob: Blob, year?: number): Promise<FRESummary> {
  assertClient();
  const cnpj = sanitizeCNPJ(cnpjInput);
  const targetYear = year ?? currentYear();
  console.log("cvm:parse-blob:start", { cnpj, year: targetYear, size: blob.size });
  const JSZip = await import("jszip");
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  console.log("cvm:parse-blob:entries", { count: fileNames.length });
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    const buf = await file.async("arraybuffer");
    try {
      const csvText = decodeLatin1(buf as ArrayBuffer);
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
      console.log("cvm:parse-blob:file", { name, rows: filtered.length });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
    } catch {}
  }
  const summary: FRESummary = { cnpj, year: targetYear, files };
  try {
    saveReportLocal(summary);
  } catch {}
  console.log("cvm:parse-blob:done", { files: files.length });
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
