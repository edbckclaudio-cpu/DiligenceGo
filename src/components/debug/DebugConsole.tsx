 "use client";
 import { useEffect, useRef, useState } from "react";
 
 type LogEntry = { ts: number; level: "log" | "error"; text: string };
 
 function fmtArg(a: unknown): string {
   if (typeof a === "string") return a;
   try {
     return JSON.stringify(a);
   } catch {
     return String(a);
   }
 }
 
 export function DebugConsole() {
   const [entries, setEntries] = useState<LogEntry[]>([]);
   const originals = useRef<{ log: (...args: any[]) => void; error: (...args: any[]) => void } | null>(null);
 
   useEffect(() => {
     if (!originals.current) {
       originals.current = { log: console.log, error: console.error };
       console.log = (...args: any[]) => {
         const text = args.map(fmtArg).join(" ");
         setEntries((prev) => {
          const next: LogEntry[] = [...prev, { ts: Date.now(), level: "log", text }];
          return next.slice(-50);
         });
         originals.current!.log(...args);
       };
       console.error = (...args: any[]) => {
         const text = args.map(fmtArg).join(" ");
         setEntries((prev) => {
          const next: LogEntry[] = [...prev, { ts: Date.now(), level: "error", text }];
          return next.slice(-50);
         });
         originals.current!.error(...args);
       };
     }
     return () => {
       if (originals.current) {
         console.log = originals.current.log;
         console.error = originals.current.error;
       }
     };
   }, []);
 
  const last50 = entries.slice(-50);
  const text = last50
     .map((e) => {
       const d = new Date(e.ts).toISOString();
       return `[${d}] ${e.level.toUpperCase()}: ${e.text}`;
     })
     .join("\n");
 
   async function copy() {
     try {
       await navigator.clipboard.writeText(text);
     } catch {}
   }
 
   return (
     <div className="mt-6">
       <div className="flex items-center justify-between mb-2">
         <div className="text-sm font-medium">Debug Console</div>
         <button onClick={copy} className="px-2 py-1 border rounded-md bg-white text-sm">Copiar Logs</button>
       </div>
       <textarea
         readOnly
         value={text}
         className="w-full h-32 text-xs border rounded-md p-2 bg-neutral-50"
       />
     </div>
   );
 }
