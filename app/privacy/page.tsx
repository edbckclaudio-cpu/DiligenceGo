"use client";
import Link from "next/link";
import { Suspense } from "react";
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <span>Termos e Políticas</span> / <span>Privacidade</span>
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

      <h1 className="text-2xl font-semibold mb-4">POLÍTICA DE PRIVACIDADE – DILIGENCEGO</h1>
      <Suspense fallback={<p className="text-sm text-neutral-600 mb-6">Última atualização</p>}>
        <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      </Suspense>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Compromisso com a Privacidade</h2>
        <p>
          O DiligenceGo prioriza processamento local de dados (local-first). As consultas por CNPJ, bem como o parsing e a análise dos arquivos
          da CVM (FRE/PAS), são executados no próprio dispositivo do usuário.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">2. Dados Processados</h2>
        <p>
          - CNPJ informado pelo usuário é utilizado apenas para localizar e processar dados públicos do Portal de Dados Abertos da CVM.<br />
          - Resultados e preferências podem ser armazenados localmente (localStorage e Cache API) para uso offline e melhoria de experiência.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">3. Não Enviamos CNPJ a Servidores</h2>
        <p>
          Não há envio do CNPJ ou dos resultados das consultas para servidores externos. A aplicação evita o uso de cookies de rastreamento e
          não realiza perfilamento.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">4. Direitos do Usuário</h2>
        <p>
          O usuário pode limpar dados locais, realizar logout, e optar por excluir conta e dados. Consulte a página de exclusão para instruções.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">5. Contato</h2>
        <p>
          Para dúvidas ou solicitações, utilize o menu “Suporte / Fale Conosco” na aplicação.
        </p>
      </section>
    </main>
  );
}
