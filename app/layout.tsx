export const metadata = {
  title: "DiligenceGo — Due Diligence CVM local-first",
  description: "Realize due diligence com dados da CVM (FRE/PAS), filtrando por CNPJ. Processamento local, exportação, resumo e compartilhamento por WhatsApp/E-mail.",
  keywords: ["due diligence", "CVM", "FRE", "PAS", "CNPJ", "Governança", "Litígios", "Sanções", "relatório", "consulta", "dados abertos", "compliance"],
  metadataBase: new URL("http://localhost:3000"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  openGraph: {
    title: "DiligenceGo — Due Diligence CVM local-first",
    description: "Consulta e análise de dados da CVM com processamento local. Resultados agrupados (Governança, Litígios, Sanções) e exportação.",
    url: "http://localhost:3000/",
    siteName: "DiligenceGo",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "DiligenceGo — Due Diligence CVM local-first",
    description: "Consulta e análise de dados da CVM com processamento local"
  }
};

import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C2D6C5"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
              <span className="font-semibold">DiligenceGo</span>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-4xl px-4 py-3 text-xs text-neutral-600">
              O DiligenceGo é uma ferramenta independente e não possui vínculo com a Comissão de Valores Mobiliários (CVM). Os dados são extraídos do Portal de Dados Abertos oficial.
            </div>
          </footer>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "DiligenceGo",
                  "url": "http://localhost:3000/",
                  "description": "Plataforma de due diligence baseada em dados da CVM (FRE/PAS), com processamento local e exportação.",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service"
                  }
                },
                {
                  "@type": "WebSite",
                  "name": "DiligenceGo",
                  "url": "http://localhost:3000/",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "http://localhost:3000/dashboard?cnpj={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "O que é due diligence pela CVM?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "É a análise de informações públicas como FRE e PAS para avaliar governança, litígios e sanções de companhias abertas."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Os dados saem do meu dispositivo?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Não. O processamento é local e o CNPJ não é enviado a servidores externos."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Posso usar offline?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sim, após baixar o ZIP e salvar o resultado, você consegue consultar sem internet."
                      }
                    }
                  ]
                },
                {
                  "@type": "Product",
                  "name": "DiligenceGo Premium",
                  "description": "Plano premium com detalhes de processos, remuneração e exportação profissional.",
                  "brand": { "@type": "Brand", "name": "DiligenceGo" },
                  "offers": {
                    "@type": "Offer",
                    "availability": "https://schema.org/InStock"
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
