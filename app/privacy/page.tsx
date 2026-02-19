import Link from "next/link";
export const metadata = {
  title: "POLÍTICA DE PRIVACIDADE – DiligenceGo",
  description: "Política de Privacidade do DiligenceGo com informações sobre LGPD, não-coleta de dados, segurança da API Key local e fontes públicas.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 bg-white text-neutral-800">
      <nav className="text-sm text-neutral-600 mb-4">
        <Link href="/" className="underline">Início</Link> / <Link href="/privacy" className="underline">Termos e Políticas</Link> / <span>Política de Privacidade</span>
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
      <p className="text-sm text-neutral-600 mb-6">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Informações Gerais (LGPD)</h2>
        <p>
          O DiligenceGo respeita a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD). O aplicativo foi concebido para operar com
          processamento local, minimizando a circulação de dados pessoais. Não utilizamos servidores próprios para analisar ou armazenar dados de
          consulta; todo o processamento ocorre no dispositivo do usuário.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">2. Não‑Coleta de Dados</h2>
        <p>
          O aplicativo não coleta, armazena ou transmite CNPJ consultado, resultados de análise, relatórios ou informações sensíveis para servidores
          remotos. Os dados de consulta e relatórios podem ser armazenados localmente no dispositivo exclusivamente para conveniência do usuário.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">3. Segurança da API Key Local</h2>
        <p>
          Caso o usuário informe uma API Key do Portal da Transparência, essa chave é mantida exclusivamente no dispositivo (localStorage/Cache API)
          e não é enviada a terceiros. O usuário é responsável por sua guarda e por não compartilhá‑la indevidamente.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">4. Fontes Públicas (CVM/Portal da Transparência)</h2>
        <p>
          As informações analisadas pelo DiligenceGo derivam de bases públicas, como FRE/PAS da CVM e dados do Portal da Transparência. O aplicativo
          não altera o conteúdo das fontes; apenas realiza parsing e organização local para fins de due diligence.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">5. Exclusão de Conta e Dados</h2>
        <p>
          O usuário pode excluir seu perfil, plano, API Key e dados de cache a qualquer momento usando a opção “Excluir Conta e Dados” disponível no
          menu lateral (Drawer). Essa ação remove dados locais do dispositivo e efetua logout do perfil.
        </p>
      </section>

      <section className="space-y-4 mt-6">
        <h2 className="text-lg font-semibold">6. Contato</h2>
        <p>
          Dúvidas ou solicitações podem ser direcionadas para o e‑mail: <a href="mailto:edbck.claudio@gmail.com" className="underline">edbck.claudio@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
