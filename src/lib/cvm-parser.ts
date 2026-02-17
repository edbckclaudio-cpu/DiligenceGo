export type Dataset = "FRE" | "PAS";
export type FREFileResult = { file: string; rows: string[][]; headers?: string[]; delimiter?: string };
export type FRESummary = {
  cnpj: string;
  year: number;
  files: FREFileResult[];
};

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

// Módulo CEIS/CNEP removido

 

 

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

function detectDelimiter(s: string): string {
  const sample = s.slice(0, 4000);
  const count = (ch: string) => (sample.match(new RegExp(`\\${ch}`, "g")) || []).length;
  const cSemi = count(";");
  const cComma = count(",");
  const cTab = count("\t");
  const candidates = [
    { ch: ";", n: cSemi },
    { ch: ",", n: cComma },
    { ch: "\t", n: cTab },
  ].sort((a, b) => b.n - a.n);
  return candidates[0].n > 0 ? candidates[0].ch : ";";
}

function normHeader(s: string): string {
  const noAccents = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents.replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function containsCnpjDeep(value: any, cnpjDigits: string): boolean {
  try {
    if (value == null) return false;
    if (typeof value === "string") {
      const digits = value.replace(/\D+/g, "");
      return digits === cnpjDigits || (digits.length >= 14 && digits.includes(cnpjDigits));
    }
    if (typeof value === "number") {
      const digits = String(value).replace(/\D+/g, "");
      return digits === cnpjDigits || (digits.length >= 14 && digits.includes(cnpjDigits));
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (containsCnpjDeep(item, cnpjDigits)) return true;
      }
      return false;
    }
    if (typeof value === "object") {
      for (const k of Object.keys(value)) {
        if (containsCnpjDeep((value as any)[k], cnpjDigits)) return true;
      }
    }
  } catch {}
  return false;
}

const CNPJ_HEADER_ALIASES = [
  "cnpj",
  "cnpj cia",
  "cnpj companhia",
  "cnpjcia",
  "cnpjcompanhia",
];

function findCnpjColumns(headers: string[], delim: string): number[] {
  const n = headers.map((h) => normHeader(h));
  const idx: number[] = [];
  for (let i = 0; i < n.length; i++) {
    const h = n[i];
    if (h.includes("cnpj")) {
      idx.push(i);
      continue;
    }
    for (const a of CNPJ_HEADER_ALIASES) {
      if (h === a) {
        idx.push(i);
        break;
      }
    }
  }
  return idx;
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

async function purgeZipCache(): Promise<void> {
  assertClient();
  try {
    const cache = await getCache();
    const keys = await cache.keys();
    await Promise.all(keys.map((req) => cache.delete(req)));
    console.log("cvm:cache:purged");
  } catch (err: any) {
    console.log("cvm:cache:purge-error", String(err && err.message || err));
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchZipBlob(dataset: Dataset, year: number): Promise<Blob> {
  assertClient();
  const directUrl = buildCVMUrl(dataset, year);
  const proxyUrl = `/api/fre/${year}`;
  let isNative = false;
  let capHttp: any = null;
  const protocol = typeof location !== "undefined" ? location.protocol : "";
  const host = typeof location !== "undefined" ? location.hostname : "";
  try {
    const core = await import("@capacitor/core");
    const Capacitor = (core as any).Capacitor || (core as any).default || null;
    if (Capacitor && typeof Capacitor.isNativePlatform === "function") {
      isNative = !!Capacitor.isNativePlatform();
    }
    capHttp = (core as any).CapacitorHttp || null;
    if (!capHttp) {
      try {
        const httpPkg = await import("@capacitor/http");
        capHttp = (httpPkg as any).Http || null;
      } catch {}
    }
  } catch {}
  const isCapOrFile = protocol === "capacitor:" || protocol === "file:";
  const isLocalHost = host === "localhost";
  let chosen = (isNative || isCapOrFile || isLocalHost) ? directUrl : proxyUrl;
  console.log("cvm:fetchZipBlob:start", { dataset, year, directUrl, proxyUrl, chosen, protocol, host, isNative });
  if (isNative || isCapOrFile) {
    await purgeZipCache();
  }
  const requestToday = new Request(`${chosen}?day=${todayKey()}`, { cache: "no-store" as RequestCache });
  const cache = await getCache();
  const cachedToday = await cache.match(requestToday);
  if (cachedToday) {
    const blob = await cachedToday.blob();
    console.log("cvm:fetchZipBlob:cache-hit", { url: requestToday.url, size: blob.size });
    return blob;
  }
  try {
    if (isNative) {
      try {
        if (!capHttp) throw new Error("CapacitorHttp indisponível");
        const r = await capHttp.get({
          url: directUrl,
          responseType: "arraybuffer",
          connectTimeout: 20000,
          readTimeout: 60000,
          shouldEncodeUrlParams: false,
        });
        const status = (r as any)?.status ?? 0;
        const data = (r as any)?.data;
        console.log("cvm:fetchZipBlob:native-http", { url: directUrl, status });
        if (status >= 200 && status < 300 && data != null) {
          let buf: ArrayBuffer;
          if (data instanceof ArrayBuffer) {
            buf = data as ArrayBuffer;
          } else if (typeof data === "string") {
            buf = base64ToUint8Array(data).buffer as ArrayBuffer;
          } else if (typeof (data as any)?.data === "string") {
            buf = base64ToUint8Array((data as any).data).buffer as ArrayBuffer;
          } else {
            throw new Error("Resposta nativa sem ArrayBuffer/base64 esperado");
          }
          const blob = new Blob([buf], { type: "application/zip" });
          await cache.put(new Request(`${directUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache }), new Response(blob));
          console.log("cvm:fetchZipBlob:native-ok", { url: directUrl, size: blob.size });
          return blob;
        }
        throw new Error(`HTTP nativo status ${status}`);
      } catch (e: any) {
        console.log("cvm:fetchZipBlob:native-http-error", String(e && e.message || e));
        const targetFallbackYear = year === 2026 ? 2025 : undefined;
        if (dataset === "FRE" && typeof targetFallbackYear !== "undefined") {
          try {
            const prevUrl = buildCVMUrl(dataset, targetFallbackYear);
            const rr = await capHttp.get({ url: prevUrl, responseType: "arraybuffer" });
            const status2 = (rr as any)?.status ?? 0;
            const data2 = (rr as any)?.data;
            console.log("cvm:fetchZipBlob:native-http-fallback", { url: prevUrl, status: status2 });
            if (status2 >= 200 && status2 < 300 && data2 != null) {
              let buf2: ArrayBuffer;
              if (data2 instanceof ArrayBuffer) {
                buf2 = data2 as ArrayBuffer;
              } else if (typeof data2 === "string") {
                buf2 = base64ToUint8Array(data2).buffer as ArrayBuffer;
              } else if (typeof (data2 as any)?.data === "string") {
                buf2 = base64ToUint8Array((data2 as any).data).buffer as ArrayBuffer;
              } else {
                throw new Error("Resposta nativa sem ArrayBuffer/base64 esperado");
              }
              const blob2 = new Blob([buf2], { type: "application/zip" });
              await cache.put(new Request(`${prevUrl}?day=${todayKey()}`, { cache: "no-store" as RequestCache }), new Response(blob2));
              console.log("cvm:fetchZipBlob:native-fallback-ok", { url: prevUrl, size: blob2.size });
              return blob2;
            }
          } catch {}
        }
        const fallback = await findAnyCachedVersion(cache, directUrl);
        if (fallback) return fallback;
        throw new CVMOfflineError("Erro de rede ao baixar dados da CVM (nativo)", undefined, directUrl);
      }
    }
    let resp: Response;
    if (isNative || isCapOrFile || isLocalHost) {
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
          if (isNative && capHttp) {
            const rr = await capHttp.get({ url: prevUrl, responseType: "arraybuffer" });
            const status2 = (rr as any)?.status ?? 0;
            const data2 = (rr as any)?.data;
            console.log("cvm:fetchZipBlob:native-http-fallback", { url: prevUrl, status: status2 });
            if (data2 && status2 >= 200 && status2 < 300) {
              let buf2: ArrayBuffer;
              if (data2 instanceof ArrayBuffer) {
                buf2 = data2 as ArrayBuffer;
              } else if (typeof data2 === "string") {
                buf2 = base64ToUint8Array(String(data2)).buffer as ArrayBuffer;
              } else if (typeof (data2 as any)?.data === "string") {
                buf2 = base64ToUint8Array((data2 as any).data).buffer as ArrayBuffer;
              } else {
                throw new Error("Resposta nativa sem ArrayBuffer/base64 esperado");
              }
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
  const JSZipMod = await import("jszip");
  const JSZipCls: any = (JSZipMod as any).default || JSZipMod;
  const zip = await JSZipCls.loadAsync(await zipBlob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  console.log("cvm:parse:entries", { count: fileNames.length });
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    console.log("Iniciando arquivo:", name);
    try {
      const buf = await file.async("arraybuffer");
      const csvText = decodeLatin1(buf as ArrayBuffer);
      const delimUsed = detectDelimiter(csvText);
      const firstLine = (csvText.split(/\r?\n/).find((l) => l.trim().length > 0) || "");
      const headers = firstLine ? firstLine.split(delimUsed).map((h) => h.trim()) : [];
      console.log("cvm:parse:headers", { name, headers });
      const parsed = Papa.parse<string[]>(csvText, {
        delimiter: delimUsed,
        skipEmptyLines: true,
        header: false,
        dynamicTyping: false,
      });
      const filtered: string[][] = [];
      const data = parsed.data as unknown as string[][];
      const delim = (parsed as any)?.meta?.delimiter ?? "";
      const cnpjCols = findCnpjColumns(headers, delimUsed);
      console.log("cvm:parse:cnpj-columns", { name, indices: cnpjCols });
      for (const row of data) {
        if (!Array.isArray(row)) continue;
        if (cnpjCols.length > 0) {
          let hit = false;
          for (const idx of cnpjCols) {
            const v = row[idx];
            if (typeof v === "string" && v.replace(/\D+/g, "") === cnpj) {
              hit = true;
              break;
            }
          }
          if (hit) filtered.push(row);
        } else {
          let hit = false;
          for (const col of row) {
            if (typeof col === "string" && col.replace(/\D+/g, "") === cnpj) {
              hit = true;
              break;
            }
          }
          if (hit) filtered.push(row);
        }
      }
      files.push({ file: name, rows: filtered, headers, delimiter: delimUsed });
      console.log("cvm:parse:file", { name, rows: filtered.length, delimiter: delim });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
      console.log("Finalizado:", name);
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (e: any) {
      console.log("cvm:parse:file-error", { name, error: String(e && e.message || e) });
    }
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
  const JSZipMod = await import("jszip");
  const JSZipCls: any = (JSZipMod as any).default || JSZipMod;
  const zip = await JSZipCls.loadAsync(await blob.arrayBuffer());
  const files: FREFileResult[] = [];
  const fileNames = Object.keys(zip.files).filter((f) => f.toLowerCase().endsWith(".csv"));
  console.log("cvm:parse-blob:entries", { count: fileNames.length });
  for (const name of fileNames) {
    const file = zip.file(name);
    if (!file) continue;
    console.log("Iniciando arquivo:", name);
    try {
      const buf = await file.async("arraybuffer");
      const csvText = decodeLatin1(buf as ArrayBuffer);
      const delimUsed = detectDelimiter(csvText);
      const firstLine = (csvText.split(/\r?\n/).find((l) => l.trim().length > 0) || "");
      const headers = firstLine ? firstLine.split(delimUsed).map((h) => h.trim()) : [];
      console.log("cvm:parse-blob:headers", { name, headers });
      const parsed = Papa.parse<string[]>(csvText, {
        delimiter: delimUsed,
        skipEmptyLines: true,
        header: false,
        dynamicTyping: false,
      });
      const filtered: string[][] = [];
      const data = parsed.data as unknown as string[][];
      const delim = (parsed as any)?.meta?.delimiter ?? "";
      const cnpjCols = findCnpjColumns(headers, delimUsed);
      console.log("cvm:parse-blob:cnpj-columns", { name, indices: cnpjCols });
      for (const row of data) {
        if (!Array.isArray(row)) continue;
        if (cnpjCols.length > 0) {
          let hit = false;
          for (const idx of cnpjCols) {
            const v = row[idx];
            if (typeof v === "string" && v.replace(/\D+/g, "") === cnpj) {
              hit = true;
              break;
            }
          }
          if (hit) filtered.push(row);
        } else {
          let hit = false;
          for (const col of row) {
            if (typeof col === "string" && col.replace(/\D+/g, "") === cnpj) {
              hit = true;
              break;
            }
          }
          if (hit) filtered.push(row);
        }
      }
      files.push({ file: name, rows: filtered, headers, delimiter: delimUsed });
      console.log("cvm:parse-blob:file", { name, rows: filtered.length, delimiter: delim });
      (parsed as unknown) = null as unknown as any;
      (csvText as unknown) = "" as unknown as any;
      (buf as unknown) = null as unknown as any;
      console.log("Finalizado:", name);
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (e: any) {
      console.log("cvm:parse-blob:file-error", { name, error: String(e && e.message || e) });
    }
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

export async function clearAllMemory(): Promise<void> {
  assertClient();
  try {
    await purgeZipCache();
  } catch {}
  try {
    const keys = Object.keys(window.localStorage);
    for (const k of keys) {
      if (k.startsWith("DiligenceGo:report:")) {
        window.localStorage.removeItem(k);
      }
    }
  } catch {}
}

export function legalDisclaimer(): string {
  return "O DiligenceGo é uma ferramenta independente e não possui vínculo com a CVM. Os dados são extraídos do Portal de Dados Abertos oficial.";
}
