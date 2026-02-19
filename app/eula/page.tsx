import Link from "next/link";
export const metadata = {
  title: "EULA – Licença de Uso – DiligenceGo",
  description: "Contrato de Licença de Usuário Final (EULA) para o aplicativo DiligenceGo.",
};

export default function EulaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <Link href="/privacy" className="underline">Termos e Políticas</Link> / <span>EULA</span>
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
      <h1 className="text-2xl font-semibold mb-4">EULA – LICENÇA DE USO – DILIGENCEGO</h1>
      <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Concessão de Licença</h2>
        <p>
          É concedida uma licença não exclusiva, intransferível, para uso pessoal ou profissional do DiligenceGo, observadas as leis aplicáveis e
          estes termos.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">2. Restrições</h2>
        <p>
          É proibida engenharia reversa, distribuição não autorizada, sublicenciamento e uso com finalidade ilícita. O aplicativo não deve ser usado
          para violar direitos de terceiros.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">3. Isenção de Garantias</h2>
        <p>
          O DiligenceGo é fornecido “no estado em que se encontra”. Não há garantias de desempenho, adequação ou disponibilidade contínua.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">4. Rescisão</h2>
        <p>
          O descumprimento deste EULA enseja rescisão imediata da licença. O usuário pode encerrar o uso a qualquer momento, excluindo dados locais
          pelo menu lateral.
        </p>
      </section>
    </main>
  );
}
