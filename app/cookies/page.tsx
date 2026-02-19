import Link from "next/link";
export const metadata = {
  title: "POLÍTICA DE COOKIES – DiligenceGo",
  description: "Política de Cookies do DiligenceGo com detalhes sobre armazenamento local e ausência de rastreamento.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <Link href="/privacy" className="underline">Termos e Políticas</Link> / <span>Política de Cookies</span>
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
      <h1 className="text-2xl font-semibold mb-4">POLÍTICA DE COOKIES – DILIGENCEGO</h1>
      <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Conceito</h2>
        <p>
          O DiligenceGo prioriza processamento local e não utiliza cookies de rastreamento. A aplicação pode usar armazenamento local (localStorage e
          Cache API) para guardar preferências, resultados e chaves informadas pelo usuário.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">2. Armazenamento Local</h2>
        <p>
          Dados como perfil, plano (Grátis/Premium) e API Key do Portal da Transparência podem ser mantidos exclusivamente no dispositivo, sem envio
          a terceiros. Esse armazenamento melhora a experiência do usuário e permite uso offline.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">3. Sem Cookies de Rastreamento</h2>
        <p>
          Não empregamos cookies de publicidade, perfis comportamentais ou mecanismos similares. O controle permanece com o usuário.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">4. Controle pelo Usuário</h2>
        <p>
          O usuário pode limpar dados locais e realizar logout pelo menu lateral (Drawer), incluindo exclusão de resultados e remoção da API Key.
        </p>
      </section>
    </main>
  );
}
