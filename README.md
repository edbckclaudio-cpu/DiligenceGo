DiligenceGo
============

Visão geral
- Consulta e análise de dados da CVM (FRE/PAS) com processamento 100% local (JSZip + PapaParse + ISO-8859-1).
- App Next.js com App Router e Tailwind; versão Android via Capacitor.
- Política de privacidade: CNPJ nunca sai do dispositivo; dados são processados no navegador/app.

Execução (Web)
- Requisitos: Node 18+
- Instalar: npm install
- Dev: npm run dev
- Acessar: http://localhost:3000/ (redireciona para /dashboard)

Observação CORS (Web)
- O domínio dados.cvm.gov.br não retorna cabeçalhos CORS para ZIPs do FRE.
- Navegação direta em https funciona, mas fetch via JavaScript é bloqueado.
- Fluxo suportado no navegador:
  - Baixar ZIP do FRE pelo link “Baixar ZIP”.
  - Importar ZIP local pelo botão “Importar ZIP”.
  - Carregar cache local quando disponível.

Android (Capacitor)
- Instalar dependências nativas:
  - npm install @capacitor/core
  - npx cap add android
- Build web: npm run build
- Sincronizar: npx cap sync android
- Abrir Android Studio: npx cap open android
- No app Android, o download do ZIP pode usar plugin HTTP nativo (sem CORS), mantendo o processamento local.

Scripts
- npm run dev: servidor de desenvolvimento
- npm run build: build para produção (Next)
- npm run start: iniciar build produzido
- npm run test: Vitest (encoding ISO-8859-1 validado)

Estrutura
- app/ e src/app/: rotas e layout; dashboard principal em /dashboard
- src/components/: UI estilo Shadcn (leve), SearchForm/DataCard/ExportButton
- src/lib/: coração do parser (cvm-parser.ts)
- src/hooks/: useCvmData para estado e integração do parser

Exportação
- Botão “Gerar Relatório” exporta CSV ISO-8859-1 (compatível com Excel).
- Share: usa navigator.share no navegador e pode usar Capacitor Share no Android.

Proteção de branch (main)
- Recomendações no GitHub:
  - Settings → Branches → Add rule:
    - Require a pull request before merging
    - Require status checks to pass before merging (habilitar “CI”)
    - Require linear history
    - Include administrators (opcional)
  - Opcional: bloquear force-push e deletar branch protegida

Licença
- Indique aqui sua licença (por exemplo, MIT) conforme a política do projeto.
