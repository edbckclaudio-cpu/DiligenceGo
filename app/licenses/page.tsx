import Link from "next/link";
export const metadata = {
  title: "Licenças de Terceiros – DiligenceGo",
  description: "Lista de bibliotecas de terceiros utilizadas pelo DiligenceGo e informações de licença.",
};

export default function LicensesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <Link href="/privacy" className="underline">Termos e Políticas</Link> / <span>Licenças de Terceiros</span>
      </nav>
      <div className="text-sm mb-6">
        <div className="font-semibold mb-2">Índice de Políticas</div>
        <ul className="flex flex-wrap gap-3">
          <li><Link className="underline" href="/privacy">Privacidade</Link></li>
          <li><Link className="underline" href="/terms">Termos de Uso</Link></li>
          <li><Link className="underline" href="/cookies">Política de Cookies</Link></li>
          <li><Link className="underline" href="/eula">EULA</Link></li>
          <li><Link className="underline" href="/licenses">Licenças</Link></li>
          <li><Link className="underline text-red-700" href="/account/delete">Excluir Conta e Dados</Link></li>
        </ul>
      </div>
      <h1 className="text-2xl font-semibold mb-4">LICENÇAS DE TERCEIROS – DILIGENCEGO</h1>
      <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Bibliotecas Utilizadas</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>JSZip — Biblioteca para manipulação de arquivos ZIP. Consulte o repositório oficial para detalhes de licença.</li>
          <li>PapaParse — Parser CSV. Consulte o repositório oficial para detalhes de licença.</li>
          <li>Capacitor — Stack de integração nativa para Android. Consulte o repositório oficial para detalhes de licença.</li>
          <li>Next.js — Framework web. Consulte o repositório oficial para detalhes de licença.</li>
          <li>React / React‑DOM — Biblioteca UI. Consulte o repositório oficial para detalhes de licença.</li>
          <li>lucide‑react — Ícones. Consulte o repositório oficial para detalhes de licença.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">Observações</h2>
        <p>
          As licenças e termos de uso de cada projeto são de responsabilidade de seus mantenedores. Recomendamos consultar as páginas oficiais
          para o texto completo de cada licença antes de qualquer redistribuição ou modificação.
        </p>
      </section>
    </main>
  );
}
