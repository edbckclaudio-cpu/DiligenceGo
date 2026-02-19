import Link from "next/link";
export const metadata = {
  title: "TERMOS DE USO – DiligenceGo",
  description: "Termos de uso do DiligenceGo com regras de utilização e limitações de responsabilidade.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <Link href="/privacy" className="underline">Termos e Políticas</Link> / <span>Termos de Uso</span>
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
      <h1 className="text-2xl font-semibold mb-4">TERMOS DE USO – DILIGENCEGO</h1>
      <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Aceite</h2>
        <p>
          Ao utilizar o DiligenceGo, você concorda com estes Termos de Uso. Caso não concorde, interrompa o uso do aplicativo.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">2. Uso Permitido</h2>
        <p>
          O aplicativo destina‑se à consulta e organização local de dados públicos (FRE/PAS da CVM e Portal da Transparência) para fins de due
          diligence. É vedado o uso para práticas ilícitas, violação de direitos ou qualquer finalidade contrária à legislação vigente.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">3. Responsabilidade</h2>
        <p>
          O conteúdo é derivado de fontes oficiais públicas e pode conter inconsistências. O DiligenceGo não garante exatidão, completude ou
          adequação a propósitos específicos. O usuário é responsável por validar e interpretar os resultados.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">4. Limitações</h2>
        <p>
          O aplicativo não substitui parecer jurídico e não realiza coleta ou processamento em servidores externos. A exportação e o compartilhamento
          são realizados pelo usuário, que assume responsabilidade pelo conteúdo compartilhado.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">5. Atualizações</h2>
        <p>
          Estes Termos podem ser atualizados. O uso contínuo implica concordância com a versão vigente. Consulte regularmente esta página.
        </p>
      </section>
    </main>
  );
}
