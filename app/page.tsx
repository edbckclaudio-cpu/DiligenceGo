"use client";
import { useEffect } from "react";
import Script from "next/script";
 import { useRouter } from "next/navigation";
 
 export default function Home() {
   const router = useRouter();
   useEffect(() => {
     try {
      if (typeof window !== "undefined") {
        const isFile = window.location.protocol === "file:";
        const target = isFile ? "dashboard.html" : "/dashboard";
        if (!window.location.pathname.endsWith("/dashboard") && !window.location.pathname.endsWith("/dashboard.html")) {
          window.location.replace(target);
          return;
        }
      }
      router.replace("/dashboard");
     } catch {}
   }, [router]);
   return (
    <>
      <Script id="auto-redirect" strategy="beforeInteractive">
        {`(function(){try{var isFile=location.protocol==='file:';var t=isFile?'dashboard.html':'/dashboard';var p=location.pathname||'';if(!p.endsWith('/dashboard')&&!p.endsWith('/dashboard.html')){location.replace(t);}}catch(e){}})();`}
      </Script>
      <div className="p-4 mx-auto max-w-4xl">
        <p className="text-sm text-neutral-600">Redirecionando para o painel...</p>
        <a href="dashboard.html" className="underline">Ir para o Dashboard</a>
      </div>
    </>
   );
 }
