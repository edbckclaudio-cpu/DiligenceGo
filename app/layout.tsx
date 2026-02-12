export const metadata = {
  title: "DiligenceGo",
  description: "Consulta e análise de dados da CVM",
};

import "./globals.css";

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
      </body>
    </html>
  );
}

