 "use client";
 import { useEffect } from "react";
 import { useRouter } from "next/navigation";
 
 export default function Home() {
   const router = useRouter();
   useEffect(() => {
     router.replace("/dashboard");
   }, [router]);
   return (
     <div className="p-4 mx-auto max-w-4xl">
       <p className="text-sm text-neutral-600">Redirecionando para o painel...</p>
       <a href="/dashboard" className="underline">Ir para o Dashboard</a>
     </div>
   );
 }
