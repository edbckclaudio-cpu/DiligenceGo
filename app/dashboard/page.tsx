"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, User, BadgeCheck, Crown, FileText, ScrollText, Cookie, LifeBuoy, KeyRound, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataCard } from "@/components/cvm/DataCard";
import { ExportButton } from "@/components/cvm/ExportButton";
import { SearchForm } from "@/components/cvm/SearchForm";
import { useCvmData } from "@/hooks/useCvmData";
import { clearAllMemory, loadReportLocal } from "@/lib/cvm-parser";

export default function Dashboard() {
  const router = useRouter();
  const { cnpj, year, setYear, limparCnpj, consultar, importarZip, carregarCache, exportarCSV, zipUrl, files, loading, error, errorInfo, current } =
    useCvmData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [pendingDigits, setPendingDigits] = useState("");
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp" | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [lastSelected, setLastSelected] = useState<{ file?: string; index: number } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [eulaOpen, setEulaOpen] = useState(false);
  const [licensesOpen, setLicensesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; photo?: string } | null>(null);
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "Resumo Executivo",
    "Governança",
    "Antecedentes (CVM)",
    "Estrutura Acionária",
    "Passivos (Debêntures)",
    "Diversidade (ESG)",
  ]);
  const [settingsOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setNavOpen(false);
        setFormatPickerOpen(false);
        setReportOpen(false);
        setProfileOpen(false);
        setPlansOpen(false);
        setPrivacyOpen(false);
        setTermsOpen(false);
        setCookiesOpen(false);
        setEulaOpen(false);
        setLicensesOpen(false);
        setSupportOpen(false);
        setApiOpen(false);
        setConfirmDeleteOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    try {
      const u = window.localStorage.getItem("dg:user");
      if (u) setUser(JSON.parse(u));
      const p = window.localStorage.getItem("dg:plan");
      if (p === "premium" || p === "free") setPlan(p as any);
      const ak = window.localStorage.getItem("dg:apiKey");
      if (ak) setApiKey(ak);
    } catch {}
  }, []);

  function saveUser(u: { name: string; email: string; photo?: string } | null) {
    setUser(u);
    try {
      if (u) window.localStorage.setItem("dg:user", JSON.stringify(u));
      else window.localStorage.removeItem("dg:user");
    } catch {}
  }
  function savePlan(p: "free" | "premium") {
    setPlan(p);
    try { window.localStorage.setItem("dg:plan", p); } catch {}
  }
  function saveApiKey(k: string) {
    setApiKey(k);
    try { window.localStorage.setItem("dg:apiKey", k); } catch {}
  }
  async function logout() {
    saveUser(null);
    savePlan("free");
    setNavOpen(false);
  }
  async function googleLogin() {
    try {
      const mod = await import("@codetrix-studio/capacitor-google-auth");
      const GoogleAuth = (mod as any).GoogleAuth;
      try { await GoogleAuth.initialize({ clientId: "YOUR_WEB_CLIENT_ID" }); } catch {}
      const res = await GoogleAuth.signIn();
      const profile = res?.authentication ?? res;
      const u = {
        name: res?.name || res?.displayName || "Usuário",
        email: res?.email || "",
        photo: res?.imageUrl || res?.photoUrl || "",
      };
      saveUser(u);
      setNavOpen(true);
      return;
    } catch {}
    try {
      const name = prompt("Nome completo:");
      const email = prompt("E-mail:");
      if (name || email) saveUser({ name: name || "Usuário", email: email || "", photo: "" });
      setNavOpen(true);
    } catch {}
  }
  async function purchasePremium() {
    try {
      const mode = (process.env.NEXT_PUBLIC_PURCHASES_MODE || (typeof window !== "undefined" ? window.localStorage.getItem("dg:purchasesMode") : null) || "test").toLowerCase();
      if (mode === "real") {
        const mod = await import("@capgo/capacitor-purchases");
        const Purchases = (mod as any).default || (mod as any);
        const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || "";
        if (apiKey && Purchases?.setup) {
          try { await Purchases.setup({ apiKey }); } catch {}
        }
        try {
          const offeringsRes = await Purchases.getOfferings();
          const current = offeringsRes?.offerings?.current;
          const pkg = current?.availablePackages?.[0];
          if (pkg) {
            await Purchases.purchasePackage({ identifier: pkg.identifier, offeringIdentifier: current.identifier || "default" });
            savePlan("premium");
          } else {
            savePlan("premium");
          }
        } catch {
          savePlan("premium");
        }
      } else {
        savePlan("premium");
      }
      setPlansOpen(false);
      setNavOpen(true);
    } catch {}
  }
  async function deleteAccountAndData() {
    try {
      saveUser(null);
      savePlan("free");
      saveApiKey("");
      await clearAllMemory();
    } catch {}
    setConfirmDeleteOpen(false);
    setNavOpen(false);
  }

  function classifyFile(name: string): "Governança" | "Litígios" | "Sancionador" | "Remuneração" {
    const n = name.toLowerCase();
    if (n.includes("remu") || n.includes("bonus") || n.includes("compensa")) return "Remuneração";
    if (n.includes("lit") || n.includes("processo") || n.includes("acao")) return "Litígios";
    if (n.includes("pas") || n.includes("sanc")) return "Sancionador";
    return "Governança";
  }

  const groups: Record<string, { file: string; rows: string[][]; headers?: string[] }[]> = {
    Governança: [],
    Remuneração: [],
    Litígios: [],
    Sancionador: [],
  };
  for (const f of files) {
    groups[classifyFile(f.file)].push(f);
  }

  async function abrirZipExterno() {
    const url = zipUrl();
    try {
      const { Browser } = await import("@capacitor/browser");
      await (Browser as any).open({ url });
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const prevSummaryText = useMemo(() => {
    const totalRows = files.reduce((acc, f) => acc + f.rows.length, 0);
    const lines: string[] = [];
    lines.push(`Relatório DiligenceGo`);
    lines.push(`CNPJ: ${cnpj}`);
    lines.push(`Ano: ${year ?? current}`);
    lines.push(`Arquivos: ${files.length}`);
    lines.push(`Linhas: ${totalRows}`);
    return lines.join("\n");
  }, [files, cnpj, year, current]);

  function handleSearchRequest(digits: string) {
    const only = digits.replace(/\D+/g, "");
    if (files.length > 0 && only !== cnpj) {
      setPendingDigits(only);
      setDrawerOpen(true);
      return;
    }
    limparCnpj(digits);
    consultar(only);
  }

  async function proceedNewSearch() {
    try {
      await clearAllMemory();
    } catch {}
    setDrawerOpen(false);
    setFormatPickerOpen(false);
    limparCnpj(pendingDigits);
    consultar();
    setPendingDigits("");
    setChannel(null);
  }

  async function sendEmailThenSearch() {
    try {
      const snap = loadReportLocal(cnpj, year ?? current)?.files || files;
      const textContent = buildFullText(snap as any, cnpj, year ?? current);
      const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
      await shareTextIntent(textContent, subject);
    } catch {}
    proceedNewSearch();
  }

  async function sendWhatsAppThenSearch() {
    try {
      const snap = loadReportLocal(cnpj, year ?? current)?.files || files;
      const textContent = buildFullText(snap as any, cnpj, year ?? current);
      await shareWhatsAppIntent(textContent);
    } catch {}
    proceedNewSearch();
  }

  function discardAndSearch() {
    proceedNewSearch();
  }

  return (
    <div className="p-4 space-y-6 mx-auto max-w-4xl">
      <header className="flex items-center gap-3">
        <button
          aria-label="Abrir menu"
          onClick={() => setNavOpen(true)}
          className="p-2 rounded-md border bg-white text-[var(--color-primary)]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Consulta Due Diligence (CVM)</h1>
          <p className="text-sm text-neutral-600">Digite o CNPJ, escolha o ano e veja os resultados agrupados em Governança, Litígios e Sanções.</p>
        </div>
      </header>
      <div className="flex items-center justify-end gap-2">
        <div className="w-full sm:w-auto">
          <ExportButton
            isPremium={true}
            onExport={() => setReportOpen(true)}
          />
        </div>
      </div>

      <SearchForm
        onSearch={(v) => handleSearchRequest(v)}
        loading={loading}
        canShare={files.length > 0}
        onShareEmail={async () => {
          const snap = loadReportLocal(cnpj, year ?? current)?.files || files;
          const textContent = buildFullText(snap as any, cnpj, year ?? current);
          const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
          await shareTextIntent(textContent, subject);
        }}
        onShareWhatsApp={async () => {
          const snap = loadReportLocal(cnpj, year ?? current)?.files || files;
          const textContent = buildFullText(snap as any, cnpj, year ?? current);
          await shareWhatsAppIntent(textContent);
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <select
          value={String(year ?? current)}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded-md bg-white"
        >
          <option value={current}>{current}</option>
          <option value={current - 1}>{current - 1}</option>
          <option value={current - 2}>{current - 2}</option>
          <option value={current - 3}>{current - 3}</option>
          <option value={current - 4}>{current - 4}</option>
        </select>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div>{error}</div>
              {errorInfo && (
                <div className="text-xs text-neutral-600 mt-1">
                  {typeof errorInfo.status !== "undefined" && <span>Status: {errorInfo.status} </span>}
                  {errorInfo.url && <span>URL: {errorInfo.url} </span>}
                  {errorInfo.message && <span>Detalhe: {errorInfo.message}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={abrirZipExterno} className="underline">Baixar ZIP</button>
              <label className="underline cursor-pointer">
                Importar ZIP
                <input type="file" accept=".zip" onChange={(e) => e.target.files && importarZip(e.target.files[0])} className="hidden" />
              </label>
              <button onClick={carregarCache} className="underline">Carregar cache</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-base font-semibold">Resultados</h2>
      <Tabs defaultValue="litigios">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="gov">Governança</TabsTrigger>
          <TabsTrigger value="litigios">Litígios</TabsTrigger>
          <TabsTrigger value="sancoes">Sanções</TabsTrigger>
        </TabsList>

        <TabsContent value="litigios">
          {groups["Litígios"].map((f) => (
            <DataCard
              key={f.file}
              title={`Processos (FRE) - ${f.file}`}
              rows={f.rows}
              headers={f.headers || []}
              file={f.file}
              lastSelected={lastSelected}
              onSelected={(file, index) => setLastSelected({ file, index })}
            />
          ))}
          {groups["Litígios"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de litígios.</div>}
        </TabsContent>
        <TabsContent value="gov">
          {groups["Governança"].map((f) => (
            <DataCard
              key={f.file}
              title={`Governança - ${f.file}`}
              rows={f.rows}
              headers={f.headers || []}
              file={f.file}
              lastSelected={lastSelected}
              onSelected={(file, index) => setLastSelected({ file, index })}
            />
          ))}
          {groups["Governança"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado de governança.</div>}
        </TabsContent>
        <TabsContent value="sancoes">
          {groups["Sancionador"].map((f) => (
            <DataCard
              key={f.file}
              title={`Sancionador - ${f.file}`}
              rows={f.rows}
              headers={f.headers || []}
              file={f.file}
              lastSelected={lastSelected}
              onSelected={(file, index) => setLastSelected({ file, index })}
            />
          ))}
          {groups["Sancionador"].length === 0 && <div className="text-sm text-neutral-600">Nenhum dado sancionador.</div>}
        </TabsContent>
      </Tabs>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-md max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Enviar a consulta anterior e iniciar nova?</div>
            <div className="text-sm text-neutral-600">Escolha uma opção para compartilhar a anterior e continuaremos com a nova consulta.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={sendEmailThenSearch} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]">Enviar por E-mail</button>
              <button onClick={sendWhatsAppThenSearch} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]">Enviar por WhatsApp</button>
              <button onClick={discardAndSearch} className="px-3 py-2 rounded-md border">Descartar e consultar</button>
              <button onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {navOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setNavOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[86vw] max-w-[320px] bg-[#0f172a] text-white z-50 flex flex-col">
            <div className="p-4 flex items-center gap-3 border-b border-white/10">
              <img
                src={user?.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "Usuário")}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-white/30"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{user?.name || "Convidado"}</div>
                <div className="text-xs opacity-90 truncate">{user?.email || "Faça login com Google"}</div>
              </div>
              {user ? (
                <button onClick={() => setProfileOpen(true)} className="text-sm underline flex items-center gap-1"><User className="w-4 h-4" /> Meu Perfil</button>
              ) : (
                <button onClick={googleLogin} className="text-sm underline flex items-center gap-1"><User className="w-4 h-4" /> Entrar com Google</button>
              )}
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-auto">
              <div className="rounded-md p-3 bg-white/05 border border-white/10">
                <div className="text-sm flex items-center gap-2">
                  {plan === "premium" ? <Crown className="w-4 h-4 text-yellow-300" /> : <BadgeCheck className="w-4 h-4 text-blue-300" />}
                  Plano: <span className="font-semibold">{plan === "premium" ? "Premium" : "Grátis"}</span>
                </div>
                {plan === "free" && (
                  <button
                    onClick={() => setPlansOpen(true)}
                    className="mt-2 w-full px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                  >
                    ✨ Assinar Plano Premium
                  </button>
                )}
              </div>
              <div className="rounded-md p-3 bg-white/05 border border-white/10">
                <div className="font-semibold mb-2">Termos e Políticas</div>
                <div className="space-y-2">
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/privacy"); }}>
                    <FileText className="w-4 h-4" /> Política de Privacidade
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/terms"); }}>
                    <ScrollText className="w-4 h-4" /> Termos de Uso
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/cookies"); }}>
                    <Cookie className="w-4 h-4" /> Política de Cookies
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/eula"); }}>
                    <ScrollText className="w-4 h-4" /> EULA (Licença de Uso)
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/licenses"); }}>
                    <FileText className="w-4 h-4" /> Licenças de Terceiros
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => setSupportOpen(true)}>
                    <LifeBuoy className="w-4 h-4" /> Suporte / Fale Conosco
                  </button>
                  <button className="underline block text-left flex items-center gap-2" onClick={() => { setNavOpen(false); router.push("/account/delete"); }}>
                    <Trash2 className="w-4 h-4" /> Página de Exclusão de Conta e Dados
                  </button>
                </div>
                <div className="mt-3">
                  <button className="px-3 py-2 rounded-md bg-red-600 text-white flex items-center gap-2" onClick={() => setConfirmDeleteOpen(true)}>
                    <Trash2 className="w-4 h-4" /> Excluir Conta e Dados
                  </button>
                </div>
              </div>
              <div className="rounded-md p-3 bg-white/05 border border-white/10">
                <div className="font-semibold mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4" /> Configurações de API</div>
                <label className="text-sm">API Key do Portal da Transparência</label>
                <input
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Informe sua API Key"
                  className="mt-1 w-full border px-3 py-2 rounded-md bg-white text-neutral-900"
                />
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <button onClick={logout} className="w-full px-3 py-2 rounded-md border border-white/20">Sair</button>
            </div>
          </aside>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setReportOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-2xl max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Gerar Resumo</div>
            <div className="text-sm text-neutral-600">Selecione as seções a incluir.</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {["Resumo Executivo","Governança","Antecedentes (CVM)","Estrutura Acionária","Passivos (Debêntures)","Diversidade (ESG)"].map((sec) => {
                const checked = selectedSections.includes(sec);
                return (
                  <label key={sec} className="flex items-center gap-2 border rounded-md px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSelectedSections((prev) => {
                          if (val) return Array.from(new Set([...prev, sec]));
                          return prev.filter((s) => s !== sec);
                        });
                      }}
                    />
                    <span>{sec}</span>
                  </label>
                );
              })}
            </div>
            <div className="text-sm text-neutral-600">Compartilhar</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text = buildReportText(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  try { window.open(url, "_blank", "noopener,noreferrer"); } catch { location.assign(url); }
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                WhatsApp (texto)
              </button>
              <button
                onClick={() => {
                  const text = buildReportText(selectedSections, { cnpj, year: year ?? current }, files as any);
                  const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
                  const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
                  try { window.location.href = mail; } catch {}
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                E-mail (texto)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setReportOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
              <button
                onClick={() => {
                  const html = generateProfessionalReport(selectedSections, { cnpj, year: year ?? current }, files as any);
                  setPreviewHtml(html);
                }}
                className="px-3 py-2 rounded-md border"
              >
                Pré-visualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {previewHtml && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setPreviewHtml(null)} />
          <div className="absolute inset-0 z-50 flex flex-col">
            <div className="flex-1 bg-white">
              <iframe
                title="Pré-visualização do Resumo"
                srcDoc={previewHtml}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <div
              className="border-t bg-white p-3 flex flex-wrap items-center justify-between sm:justify-end gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
            >
              <button
                onClick={() => { setPreviewHtml(null); }}
                className="px-4 py-3 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] w-full sm:w-auto"
              >
                Ir para a Home
              </button>
              <button
                onClick={() => setPreviewHtml(null)}
                className="px-4 py-3 rounded-md border w-full sm:w-auto"
              >
                Fechar Pré-visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {formatPickerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setFormatPickerOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-4 z-50 w-[92vw] max-w-md max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">Formato de envio</div>
            <div className="text-sm text-neutral-600">Envio somente em texto organizado.</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setFormatPickerOpen(false);
                  const snap = loadReportLocal(cnpj, year ?? current)?.files || files;
                  const textContent = buildFullText(snap as any, cnpj, year ?? current);
                  if (channel === "email") {
                    const subject = `DiligenceGo relatório ${cnpj} ${year ?? current}`;
                    const mail = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textContent)}`;
                    try { window.location.href = mail; } catch {}
                    proceedNewSearch();
                  } else if (channel === "whatsapp") {
                    const url = `https://wa.me/?text=${encodeURIComponent(textContent)}`;
                    try { window.open(url, "_blank", "noopener,noreferrer"); } catch {}
                    proceedNewSearch();
                  }
                }}
                className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              >
                Enviar texto
              </button>
              <button
                onClick={() => setFormatPickerOpen(false)}
                className="px-3 py-2 rounded-md border"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setProfileOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-3 z-50 w-[92vw] max-w-md">
            <div className="text-base font-semibold">Meu Perfil</div>
            <div className="flex items-center gap-3">
              <img
                src={user?.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "Usuário")}
                alt="Avatar"
                className="w-12 h-12 rounded-full border"
              />
              <div className="flex-1">
                <div className="font-semibold">{user?.name || "Convidado"}</div>
                <div className="text-sm text-neutral-600">{user?.email || "-"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setProfileOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {plansOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setPlansOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-3 z-50 w-[92vw] max-w-md">
            <div className="text-base font-semibold">Planos</div>
            <div className="space-y-2 text-sm">
              <div className="font-semibold">Premium</div>
              <ul className="list-disc pl-5">
                <li>Relatórios ilimitados</li>
                <li>Compliance automático</li>
                <li>Suporte priorizado</li>
                <li>Exportação profissional</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPlansOpen(false)} className="px-3 py-2 rounded-md border">Fechar</button>
              <button onClick={purchasePremium} className="px-3 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)]">Assinar Premium</button>
            </div>
          </div>
        </div>
      )}

      {(privacyOpen || termsOpen || cookiesOpen || eulaOpen || licensesOpen || supportOpen) && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => { setPrivacyOpen(false); setTermsOpen(false); setCookiesOpen(false); setEulaOpen(false); setLicensesOpen(false); setSupportOpen(false); }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-3 z-50 w-[92vw] max-w-2xl max-h-[80vh] overflow-auto">
            <div className="text-base font-semibold">
              {privacyOpen ? "Política de Privacidade" : termsOpen ? "Termos de Uso" : cookiesOpen ? "Política de Cookies" : eulaOpen ? "EULA (Licença de Uso)" : licensesOpen ? "Licenças de Terceiros" : "Suporte / Fale Conosco"}
            </div>
            <div className="text-sm text-neutral-700 space-y-2">
              {privacyOpen && (
                <>
                  <p>Uso de dados: o app processa dados públicos da CVM (FRE/PAS) localmente. O CNPJ não é enviado a servidores.</p>
                  <p>API Key local: a chave do Portal da Transparência, quando informada, é armazenada apenas no dispositivo.</p>
                </>
              )}
              {termsOpen && <p>Uso permitido: consulta de dados públicos, geração de relatórios e compartilhamento informacional.</p>}
              {cookiesOpen && <p>Não utilizamos cookies de rastreamento; armazenamento local usa localStorage/Cache API.</p>}
              {eulaOpen && <p>Licença de uso pessoal/profissional; sem garantia; sujeito a atualizações.</p>}
              {licensesOpen && <p>Terceiros: JSZip, PapaParse, Capacitor. Consulte repositórios oficiais para licenças completas.</p>}
              {supportOpen && <p>Suporte: envie sua dúvida para suporte@diligencego.app (canal de atendimento).</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setPrivacyOpen(false); setTermsOpen(false); setCookiesOpen(false); setEulaOpen(false); setLicensesOpen(false); setSupportOpen(false); }} className="px-3 py-2 rounded-md border">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 z-40" onClick={() => setConfirmDeleteOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border p-4 space-y-3 z-50 w-[92vw] max-w-md">
            <div className="text-base font-semibold">Excluir Conta e Dados</div>
            <div className="text-sm text-neutral-700">Esta ação remove perfil, assinatura, API Key e resultados em cache. Deseja continuar?</div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmDeleteOpen(false)} className="px-3 py-2 rounded-md border">Cancelar</button>
              <button onClick={deleteAccountAndData} className="px-3 py-2 rounded-md bg-red-600 text-white">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildDelimitedContent(files: any[], fallbackDelim: string): string {
  const lines: string[] = [];
  for (const f of files) {
    const delim = (f?.delimiter as string) || fallbackDelim;
    const headers = (f?.headers as string[]) || [];
    lines.push(`# arquivo: ${String(f.file)}`);
    if (headers.length > 0) {
      lines.push(headers.map((h) => String(h)).join(delim));
    }
    for (const r of f.rows as string[][]) {
      lines.push(r.map((c) => String(c)).join(delim));
    }
    lines.push("");
  }
  return lines.join("\n");
}

function buildFullText(files: any[], cnpj: string, year: number): string {
  const out: string[] = [];
  out.push(`Relatório DiligenceGo`);
  out.push(`CNPJ: ${cnpj}`);
  out.push(`Ano: ${year}`);
  out.push("");
  for (const f of files) {
    const headers = (f?.headers as string[]) || [];
    out.push(`Arquivo: ${String(f.file)}`);
    const rows: string[][] = (f?.rows as string[][]) || [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      out.push(`Linha ${i + 1}:`);
      for (let j = 0; j < r.length; j++) {
        const k = headers[j] ?? `Coluna ${j + 1}`;
        const v = String(r[j] ?? "");
        out.push(`${k}: ${v}`);
      }
      out.push("");
    }
    out.push("");
  }
  return out.join("\n");
}

async function shareTextIntent(text: string, title: string): Promise<void> {
  try {
    const { Share } = await import("@capacitor/share");
    await (Share as any).share({ title, text, dialogTitle: "Compartilhar consulta" });
    return;
  } catch {}
  try {
    if ((navigator as any).share) {
      await (navigator as any).share({ title, text });
      return;
    }
  } catch {}
  try {
    const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
    window.location.href = mail;
  } catch {}
}

async function shareWhatsAppIntent(text: string): Promise<void> {
  const waWeb = `https://wa.me/?text=${encodeURIComponent(text)}`;
  try {
    const { Browser } = await import("@capacitor/browser");
    await (Browser as any).open({ url: waWeb });
    return;
  } catch {}
  try {
    window.open(waWeb, "_blank", "noopener,noreferrer");
    return;
  } catch {
    location.assign(waWeb);
  }
}
async function shareFile(content: string, mime: string, filename: string): Promise<void> {
  try {
    const { Filesystem } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const base64 = btoa(unescape(encodeURIComponent(content)));
    await (Filesystem as any).writeFile({
      path: filename,
      data: base64,
      directory: "DOCUMENTS",
      encoding: "base64",
    });
    const uriRes = await (Filesystem as any).getUri({ path: filename, directory: "DOCUMENTS" });
    const uri = (uriRes as any)?.uri || "";
    await (Share as any).share({ title: filename, text: filename, url: uri, dialogTitle: "Compartilhar arquivo" });
    return;
  } catch {}
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch {}
}

function normalizeDate(value: string): string {
  const t = String(value).trim();
  const m = t.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const m2 = t.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})/);
  if (m2) return `${m2[1]}/${m2[2]}/${m2[3]}`;
  return t;
}

function formatMoneyBr(val: string | number): string {
  const num = typeof val === "number" ? val : Number(String(val).replace(/[^\d.-]/g, ""));
  if (!isFinite(num)) return String(val);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function td(v: string) {
  return `<td style="padding:8px;border-bottom:1px solid #e5e7eb;">${v}</td>`;
}

function th(v: string) {
  return `<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:600;">${v}</th>`;
}

function table(headers: string[], rows: string[][]) {
  const head = `<thead><tr>${headers.map(th).join("")}</tr></thead>`;
  const body = `<tbody>${rows.map((r) => `<tr>${r.map(td).join("")}</tr>`).join("")}</tbody>`;
  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;margin-bottom:16px;">${head}${body}</table>`;
}

function section(title: string, contentHtml: string) {
  return `<section style="margin-top:16px;">
    <h2 style="font-size:16px;margin:0 0 8px 0;color:#111827;">${title}</h2>
    ${contentHtml}
  </section>`;
}

function buildReportText(sections: string[], meta: { cnpj: string; year: number }, files: any[]): string {
  const lines: string[] = [];
  const now = new Date();
  const dh = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`;
  lines.push(`DiligenceGo - Relatório de Due Diligence`);
  lines.push(`Gerado em: ${dh}`);
  lines.push(`CNPJ: ${meta.cnpj}`);
  lines.push(`Ano: ${meta.year}`);
  lines.push("");
  for (const sec of sections) {
    lines.push(`== ${sec} ==`);
    if (sec === "Resumo Executivo") {
      const totalRows = files.reduce((acc, f) => acc + (f.rows?.length || 0), 0);
      lines.push(`Arquivos processados: ${files.length}`);
      lines.push(`Registros totais: ${totalRows}`);
    } else if (sec === "Governança") {
      const gov = files.filter((f) => classifyByName(f.file) === "Governança");
      lines.push(`Itens de governança: ${gov.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
    } else if (sec === "Antecedentes (CVM)") {
      const pas = files.filter((f) => classifyByName(f.file) === "Sancionador");
      const lit = files.filter((f) => classifyByName(f.file) === "Litígios");
      lines.push(`Registros sancionadores: ${pas.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
      lines.push(`Registros de litígios: ${lit.reduce((a, f) => a + (f.rows?.length || 0), 0)}`);
    } else if (sec === "Estrutura Acionária") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    } else if (sec === "Passivos (Debêntures)") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    } else if (sec === "Diversidade (ESG)") {
      lines.push(`Dados não disponíveis no conjunto atual`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function generateProfessionalReport(sections: string[], meta: { cnpj: string; year: number }, files: any[]): string {
  const now = new Date();
  const dh = `${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`;
  const baseStyle = `body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#ffffff;color:#111827;line-height:1.5;padding:24px;} h1{font-size:20px;margin:0 0 12px 0;}`;
  let content = "";
  if (sections.includes("Resumo Executivo")) {
    const totalRows = files.reduce((acc, f) => acc + (f.rows?.length || 0), 0);
    const execHtml = table(["Arquivos","Registros"], [[String(files.length), String(totalRows)]]);
    content += section("Resumo Executivo", execHtml);
  }
  if (sections.includes("Governança")) {
    const gov = files.filter((f) => classifyByName(f.file) === "Governança");
    const parts = gov.map((f) => {
      const headers = (f.headers || []).map(String);
      const rows = (f.rows || []).map((r: any[]) => r.map((c: any) => String(c)));
      return `<div style="margin-top:8px;">
        <div style="font-size:13px;color:#374151;">Arquivo: ${f.file}</div>
        ${table(headers, rows)}
      </div>`;
    }).join("");
    content += section("Governança", parts || `<div style="color:#6b7280;">Nenhum dado.</div>`);
  }
  if (sections.includes("Antecedentes (CVM)")) {
    const pas = files.filter((f) => classifyByName(f.file) === "Sancionador");
    const lit = files.filter((f) => classifyByName(f.file) === "Litígios");
    const renderBlock = (arr: any[], title: string) => {
      const blocks = arr.map((f) => {
        const headers = (f.headers || []).map(String);
        const rows = (f.rows || []).map((r: any[]) => r.map((c: any, idx: number) => {
          const h = headers[idx]?.toLowerCase() || "";
          const s = String(c);
          if (h.includes("data")) return normalizeDate(s);
          if (h.includes("valor")) return formatMoneyBr(s);
          return s;
        }));
        return `<div style="margin-top:8px;">
          <div style="font-size:13px;color:#374151;">Arquivo: ${f.file}</div>
          ${table(headers, rows)}
        </div>`;
      }).join("");
      return `<div><div style="font-weight:600;margin-top:4px;">${title}</div>${blocks || `<div style="color:#6b7280;">Nenhum dado.</div>`}</div>`;
    };
    const compHtml = `${renderBlock(pas, "Sancionador (PAS)")} ${renderBlock(lit, "Litígios")}`;
    content += section("Antecedentes (CVM)", compHtml);
  }
  if (sections.includes("Estrutura Acionária")) {
    content += section("Estrutura Acionária", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  if (sections.includes("Passivos (Debêntures)")) {
    content += section("Passivos (Debêntures)", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  if (sections.includes("Diversidade (ESG)")) {
    content += section("Diversidade (ESG)", `<div style="color:#6b7280;">Dados não disponíveis no conjunto atual.</div>`);
  }
  // Seção de Compliance sancionatória removida por solicitação
  const html = `<!doctype html>
  <html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Relatório DiligenceGo</title>
  <style>${baseStyle}</style></head><body>
    <div style="position:fixed;top:12px;right:12px;z-index:9999;">
      <button onclick="window.close()" style="padding:10px 12px;border-radius:8px;background:#111827;color:#ffffff;border:none;box-shadow:0 2px 6px rgba(0,0,0,0.15);cursor:pointer;">Fechar</button>
    </div>
    <h1>DiligenceGo - Relatório de Due Diligence</h1>
    <div style="font-size:13px;color:#374151;">Gerado em: ${dh}</div>
    <div style="font-size:13px;color:#374151;">CNPJ: ${meta.cnpj} &nbsp; Ano: ${meta.year}</div>
    ${content}
  </body></html>`;
  return html;
}

function classifyByName(name: string): "Governança" | "Litígios" | "Sancionador" | "Remuneração" {
  const n = String(name).toLowerCase();
  if (n.includes("remu") || n.includes("bonus") || n.includes("compensa")) return "Remuneração";
  if (n.includes("lit") || n.includes("processo") || n.includes("acao")) return "Litígios";
  if (n.includes("pas") || n.includes("sanc")) return "Sancionador";
  return "Governança";
}
