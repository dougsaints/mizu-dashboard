# Handoff — Sessão 2026-05-24 (v0.3 Phase 14 em progresso)

> Pra próxima sessão começar com contexto rico. Leia STATE.md + PROJECT.md + ROADMAP.md primeiro, depois esse arquivo pra saber exatamente onde parou e o que está aberto.

## Estado do projeto

- **Milestone v0.3 Arquitetura Multi-Página + Analytics Aprofundadas** em progresso
- **Phase 14: Sidebar + Multi-página** em progresso — **2/4-5 plans done**
- **Loop IDLE** (último plan 14-02 unificado, pronto pro próximo `/paul:plan`)
- **Build limpo** (292ms, zero warnings)
- **5 commits da v0.3 pushados pra GitHub** + Vercel deploy automático ativo

## O que foi feito nessa sessão (em ordem cronológica)

### Encerramento da v0.2 (no início da sessão)
- `/paul:complete-milestone` da v0.2 — MILESTONES.md atualizado, PROJECT.md evoluído (16 reqs movidos pra Validated), ROADMAP collapsed, archive em `.paul/milestones/v0.2-ROADMAP.md`, git tag `v0.2.0`
- 2 commits: `c1a9b6a` (feat código v0.2 + bump package.json 0.1 → 0.2) + `d9ec217` (chore PAUL bookkeeping)
- Push pra origin/main + tag

### Discussão e criação da v0.3
- `/paul:discuss-milestone` rodou **autônomo** — 4 agentes Opus em paralelo:
  1. Codebase audit (navegação atual + alertas)
  2. Codebase audit (inventário de charts + análises)
  3. Web research (sidebar nav + multi-página em Stripe/Linear/Vercel)
  4. Web research (F&B analytics state-of-art 2025/2026)
- `/paul:milestone` — criou 4 phase dirs (14, 15, 16, 17) com PHASE-OVERVIEW.md em cada, ROADMAP atualizado, paul.json `phase: 14, status: not_started`
- Commit: `eae3cd5`

### Memória salva nessa sessão
- `meta_ads_api_integration_futuro.md` — quando migrar de CSV pra API: System User + Edge Function + App Review; zero risco pras contas dos clientes se feito direito (v0.5/v0.6)
- (já tinha: `header_subheader_alignment_v03.md` da sessão anterior — carryover incorporado ao Phase 14-04)

### Plan 14-01 — Sidebar + Layout + 8 rotas (APLICADO + UNIFIED)
- Sidebar lateral esquerda 240px expandida / 64px colapsada / drawer mobile
- 8 NavLinks agrupados em 3 categorias (Visão Geral / Análises / Operação)
- Toggle collapse persiste em localStorage (`mizu-sidebar-collapsed`)
- Ícones SVG inline lucide-style (zero nova dep)
- Layout shell (Sidebar + Header + Outlet) com `useAutoPollSales(300)` global
- FilterProvider lifted pra acima de Routes (filtros persistem entre páginas)
- 8 rotas (`/hoje, /recap-semanal, /vendas, /produtos, /marketing, /padroes, /diario, /dados`), `/` redireciona pra `/hoje`, catch-all idem
- HojePage temporariamente renderizou Dashboard inteiro
- Outras 7 pages = placeholder pedagógico
- Mobile (<1024px): sidebar `display: none` (drawer entra em 14-03)
- Print: sidebar hidden (mantém export PDF v0.2 funcional)
- **Decisão:** `JSX.Element` → `ReactNode` (React 19 não expõe `JSX` namespace por default)
- Commits: `4a36930` (feat) + `ae91432` (chore unify)

### Plan 14-02 — Redistribuir 13 sections em 8 pages (APLICADO + UNIFIED)
- HojePage focado: **OperationalAlerts + TrendsSection** (não mais dashboard inteiro)
- RecapSemanalPage: WeeklyRecap
- VendasPage: SalesSection + AnalysisSection
- ProdutosPage: ProductsAnalysisSection
- MarketingPage: MetaAdsAnalysisSection + RoiSection + MarketingUnif + CorrelationSection
- PadroesPage: PatternsSection
- DiarioPage: DiarioSection
- DadosPage: DataTableSection + uploads `<details>` colapsável
- **Dashboard.tsx DELETADO** (sem mais uso)
- **PageHeader.tsx novo** — componente leve (~15 linhas) title + subtitle, consistente em todas as 8 pages
- **UAT delegado a agente Opus** (Doug pediu autônomo) — verificou via HTTP curl em 10 rotas + auditoria estática de imports + cross-check do mapping. Veredito: **APROVADO PRA UNIFY**
- **Cosmético fixado:** comentário `Sidebar.tsx:2` "7 NavLinks" → "8 NavLinks"
- **WeeklyRecap agora vive SÓ em /recap-semanal** (não duplica em /hoje) — decisão consciente: cada page tem motivo de existir
- Commits: `ddd2bfd` (feat) + `c3097c7` (chore unify)

## O que ESTÁ aberto pra próxima sessão

### 🎯 Próximo plan: 14-03 Mobile drawer + hambúrguer

Hoje a sidebar tem `display: none` abaixo de 1024px. Mobile = sem navegação. Plan vai:

1. **Adicionar botão hambúrguer no Header** (SVG inline, lucide-style menu icon), visível só em mobile (`<1024px`)
2. **Sidebar vira drawer** slide-from-left com overlay escuro/blur (`position: fixed` + transform translateX)
3. **Tocar em NavLink dentro do drawer** → drawer fecha + navega
4. **Tocar no backdrop** → drawer fecha (sem navegar)
5. **Body scroll lock** enquanto drawer aberto (evitar scroll fantasma)
6. **Animação suave** (transform 280ms ease) + fade do backdrop
7. **Acessibilidade:** ESC fecha drawer (mesmo Doug não usando, é padrão a11y)

**Arquivos provavelmente modificados:**
- `src/components/Sidebar.tsx` — aceita prop `isOpen` + `onClose`, adiciona handlers
- `src/components/Layout.tsx` — gerencia estado isOpen com useState
- `src/components/Header.tsx` — botão hambúrguer condicional
- `src/index.css` — drawer transitions + backdrop + body-lock helper

**Não esquecer:**
- Testar com sidebar tanto colapsada quanto expandida (estado localStorage não deve interferir mobile)
- Testar em viewport mobile (DevTools 375×667)
- Drawer abre em 240px (não 64px — usuário precisa ver labels em mobile)

### Plans subsequentes da Phase 14

- **14-04: Alinhamento header/subheader** — carryover v0.2 UAT (Doug notou que subheader alinha esquerda enquanto header tem padding diferente). Plan curto (XS), mas precisa close pra Phase 14 fechar.
- ~~14-05~~: não previsto (4 plans cobrem Phase 14, dentro do estimado 4-5)

### Phases seguintes (depois de 14 fechar)

- **Phase 15** (3-4 plans): Aviso planilha desatualizada PRO DONO (não só pra Claude) + Chart theme tokenizado + débito técnico (KPI_DEFS.map, unitSlug, @media print, regex unicode, useCORS fallback)
- **Phase 16** (5-6 plans): Quick wins F&B — YoY/WoW lado-a-lado, sazonalidade decomposta, waterfall variação, frequency Meta, distribuição ticket boxplot, cancellation rate
- **Phase 17** (5-6 plans): Refatorar análises fracas — gauge ROAS, CorrelationSection v2 (lag+p-value), heatmap hora×dia, treemap produtos, MA+banda na AnalysisSection, z-score em alertas

## Coisas que Doug pode testar manualmente no browser (UAT visual humano)

O agente fez UAT técnico (HTTP, imports, build), mas não tem acesso a browser real. Quando Doug abrir <http://localhost:5173/>:

**Confere visualmente:**

1. **Sidebar à esquerda** — fundo branco, kanji 水 dourado no topo, 8 NavLinks em 3 grupos, footer com avatar+email+logout
2. **Toggle collapse** — chevron-left → recolhe pra 64px, expanding chevron-right → expande de volta. Reload mantém estado.
3. **Navegação entre as 8 URLs** — cada uma mostra seu PageHeader (h1 dourado + subtítulo cinza) + sections corretas
4. **`/hoje` mudou de comportamento** — não mostra mais WeeklyRecap, só alerts + tendências. **Decisão consciente.** Se preferir reverter, é 1 linha.
5. **Filtros persistem** — muda período em /vendas → vai pra /marketing → período preservado
6. **Mobile (<1024px)** — sidebar SOME (intencional, 14-03 vai criar drawer). Conteúdo ocupa largura total.
7. **Export PNG por section** — botão 📷 ainda funciona em cada section interna
8. **Print PDF** — botão printer no Header ainda imprime (sidebar é escondida no `@media print`)

**Possíveis bugs visuais que merecem atenção (não detectados pelo agente):**

- Visual do PageHeader em cada page — peso de fonte, espaçamento, alinhamento com sections abaixo
- Avatar circular gold com iniciais (Doug = "ED" do edsonmaatheus) na sidebar footer — fica bom?
- Hover states nos NavLinks — gold transparente, registra bem?
- Border-left 3px gold no NavLink ativo — fica forte demais?

## Carryover técnico ainda vivo

**Da v0.2** (em phases já planejadas):
- Tooltip Chart.js customizado branded → Phase 15
- Débito técnico (KPI_DEFS.map, unitSlug, @media print, regex unicode, useCORS fallback) → Phase 15
- Heatmap hora×dia → Phase 17
- Gauge ROAS, CorrelationSection v2, treemap, MA+banda, z-score → Phase 17

**Da v0.2 (não absorvido — avaliar se entra em algum plan futuro):**
- Pílulas mensais ❌✅⚠️ saúde da planilha
- Lista campanhas Jatiúca individuais
- "% do alcance" em unit-cards Meta
- Frases comparativas em TODOS os KPIs (hero já tem, restante não)

**Da v0.1 (vivos):**
- Policies tenant-scoped via `is_member_of_tenant` (13 WARNs `rls_policy_always_true`) — v0.4+
- Filtro global de período no topo do sistema — virou parte da sidebar header (parcialmente resolvido)
- Toggle Mensal/Semanal pro gráfico de linha de Vendas — pode entrar em Phase 17
- HaveIBeenPwned password protection — cosmético, adiar
- Adicionar Mike + Gab como usuários — manual no Supabase Dashboard

**Adiado pra v0.4+ (decidido na discussão da v0.3):**
- RFM + cohort de clientes delivery (precisa customer_id no iFood/AnotaAi)
- LTV / CAC por canal
- Menu engineering matrix (BCG) — precisa COGS por produto
- Geo-heatmap bairros entrega — precisa parsear CEP
- Forecast 7-30d com confidence interval
- Anomaly detection com root-cause GenAI — LLM pago

**Adiado pra v0.5/v0.6:**
- Integração Meta Ads API (System User + Edge Function) — CSV funciona, migra quando virar fricção. Memória salva.

## Arquivos novos criados nessa sessão

- `src/components/Sidebar.tsx` (135 linhas)
- `src/components/Layout.tsx` (20 linhas)
- `src/components/PageHeader.tsx` (15 linhas)
- `src/pages/HojePage.tsx`, `RecapSemanalPage.tsx`, `VendasPage.tsx`, `ProdutosPage.tsx`, `MarketingPage.tsx`, `PadroesPage.tsx`, `DiarioPage.tsx`, `DadosPage.tsx`

## Arquivos editados nessa sessão

- `src/App.tsx` — FilterProvider lifted, 8 routes, Layout parent
- `src/index.css` — +310 linhas (app-shell + sidebar + page-header + page-placeholder + print overrides)
- `package.json` — version 0.1.0 → 0.2.0 → (mantém em 0.2.0 até v0.3 fechar)
- `.paul/MILESTONES.md`, `PROJECT.md`, `ROADMAP.md`, `STATE.md`, `paul.json` — atualizados em cada etapa do loop

## Arquivos deletados nessa sessão

- `src/pages/Dashboard.tsx` — substituído por 8 pages

## Dev server

Rodando em <http://localhost:5173>. Vai morrer quando fechar terminal. Próxima sessão: `npm run dev` na pasta `mizu-dashboard/`. Se aparecer comportamento estranho no browser, mata processos node órfãos primeiro (memória `dev-server-fantasma.md` cobre isso).

## Como continuar na próxima sessão

1. Abre Claude Code na pasta `mizu-dashboard/`
2. Digita `/paul:resume` — eu leio STATE.md + esse HANDOFF.md e te coloco em contexto
3. Confirma comigo que vai pra 14-03 (mobile drawer) ou alguma outra direção
4. Digita `/paul:plan` — eu planejo o 14-03
5. Aprovação → `/paul:apply` → eu executo
6. Eu chamo agente Opus pra UAT autônomo de novo (você já validou que esse fluxo funciona)
7. `/paul:unify` → loop fechado, vamos pro 14-04

---

*HANDOFF.md — gerado em 2026-05-24, fim da sessão depois de unify 14-02. Próximo plan: 14-03 mobile drawer.*
