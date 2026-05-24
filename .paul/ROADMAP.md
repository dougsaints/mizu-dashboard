# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (`painel-diario.html`) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP (v0.1) entregou leitura diária efetiva de vendas, tráfego pago, delivery e marketing orgânico, com auth + RLS hardening. A v0.2 entregou **polish visual, densidade, organização e exportação PNG/PDF**. A v0.3 reorganiza o app numa estrutura **multi-página com sidebar lateral esquerda** e aprofunda as análises com práticas estado-da-arte de F&B analytics (Toast, Delaget, Square, iFood).

## Current Milestone

**v0.3 Arquitetura Multi-Página + Analytics Aprofundadas** (v0.3.0)
Status: 🆕 Not started (criada em 2026-05-24)
Phases: 0 of 4 complete

**Foco:** Sair do scroll-único pra sidebar+páginas (padrão Stripe/Linear/Vercel), fechar gap "planilha desatualizada pro dono", aprofundar análises fracas (gauge ROAS, lag analysis, heatmap hora×dia, treemap), e adicionar quick wins de F&B analytics (YoY/WoW lado-a-lado, sazonalidade decomposta, waterfall, frequency Meta, distribuição ticket).

**Tamanho estimado:** 4 phases, 18-22 plans, 3-5 dias de trabalho assistido.

## Phases

| Phase | Name | Plans (est.) | Status | Completed |
|-------|------|--------------|--------|-----------|
| 14 | Arquitetura: Sidebar + Multi-página | 4-5 | 🆕 Not started | — |
| 15 | Aviso planilha desatualizada + Chart theme tokenizado | 3-4 | ⏳ Pending | — |
| 16 | Analytics quick wins (high impact / low effort) | 5-6 | ⏳ Pending | — |
| 17 | Refatorar análises fracas + aprofundar razoáveis | 5-6 | ⏳ Pending | — |

## Phase Details

### Phase 14: Arquitetura — Sidebar + Multi-página

**Goal:** Reorganizar o app de scroll-único pra estrutura com sidebar lateral esquerda + páginas separadas. Resolver carryover de alinhamento header/subheader da v0.2.
**Depends on:** Nada (primeira phase da v0.3)
**Plans:** TBD (via `/paul:plan`). Ver [`phases/14-arquitetura-sidebar-multipagina/PHASE-OVERVIEW.md`](phases/14-arquitetura-sidebar-multipagina/PHASE-OVERVIEW.md)

**Scope:**

- Shell `<Layout>` com sidebar esquerda + `<Outlet>` (React Router já instalado)
- 7 itens nível 1 agrupados em 3 headers (VISÃO GERAL: Hoje, Recap Semanal · ANÁLISES: Vendas, Produtos, Marketing, Padrões · OPERAÇÃO: Diário, Dados)
- Sidebar 240px expandida / 64px colapsada / mobile drawer 280px com overlay, estado persistido em localStorage
- Redistribuir 13 sections atuais em 7 páginas conforme arquitetura proposta
- `/` redireciona pra `/hoje` (landing — vendas do dia + alertas + recap rápido, padrão Stripe)
- Alinhamento header vs subheader (carryover v0.2 UAT)
- Ícones SVG inline lucide-style (zero dep nova)

---

### Phase 15: Aviso planilha desatualizada + Chart theme tokenizado

**Goal:** Fechar gap "planilha desatualizada pro dono" e resolver débito técnico de chart (cores hardcoded + tooltip default Chart.js).
**Depends on:** Phase 14 (Layout shell pra plugar banner persistente)
**Plans:** TBD. Ver [`phases/15-aviso-planilha-chart-theme/PHASE-OVERVIEW.md`](phases/15-aviso-planilha-chart-theme/PHASE-OVERVIEW.md)

**Scope:**

- Banner persistente no `<Layout>` (visível em todas as páginas) com mensagem direcionada ao dono: "⚠ Jatiúca: 3 dias sem registro (último: 21/05). Doug, atualize a planilha"
- Distinguir 2 cenários no `OperationalAlerts`: sync OK mas dado vazio (dono não preencheu) vs sync falhou (problema técnico)
- Limiar configurável por unidade
- Botão "Abrir planilha" linkando direto pro Sheets correto
- `lib/chartTheme.ts` centralizando paleta + helpers `brl/brlShort/num`
- Tooltip plugin Chart.js branded único (background `--ink-soft`, border gold, font Inter)
- Migrar 14 charts pra consumir tokens
- Helper `unitSlug(name)` em `lib/` — elimina duplicação 3x
- `KPI_DEFS.map()` no MetaAdsAnalysisSection
- Unificar 2 blocos `@media print`
- Refazer regex unicode em `exportPng.ts` pra range explícito
- Fallback se `useCORS:true` falhar no html2canvas

---

### Phase 16: Analytics quick wins (high impact / low effort)

**Goal:** Adicionar análises estado-da-arte F&B identificadas na pesquisa Toast/Delaget/Square/iFood — todas priorizadas por alto impacto e baixo effort, funcionam com dados que já temos.
**Depends on:** Phase 15 (chart theme tokenizado pra novas visualizações nascerem com paleta única)
**Plans:** TBD. Ver [`phases/16-analytics-quick-wins/PHASE-OVERVIEW.md`](phases/16-analytics-quick-wins/PHASE-OVERVIEW.md)

**Scope:**

- Comparativo YoY / WoW lado-a-lado (Vendas + Marketing)
- Sazonalidade decomposta visual: trend + seasonal + residual (Padrões)
- Waterfall de variação ("vendas caíram -20%: -10% Meta, -5% iFood, -5% restante") na landing Hoje
- Saturação de audiência Meta (frequency >3 = saturando)
- Distribuição de ticket (boxplot, não só média)
- Cancellation / refund rate delivery (iFood + AnotaAi expoem)

---

### Phase 17: Refatorar análises fracas + aprofundar razoáveis

**Goal:** Atacar as sections classificadas como Fracas ou Razoáveis na auditoria de charts da v0.2. Cada uma vira viz/análise robusta consumindo o chart-theme da Phase 15.
**Depends on:** Phases 14-16 (estrutura final + theme + quick wins definidos)
**Plans:** TBD. Ver [`phases/17-refatorar-analises-fracas/PHASE-OVERVIEW.md`](phases/17-refatorar-analises-fracas/PHASE-OVERVIEW.md)

**Scope:**

- **RoiSection** (Fraca): adicionar gauge de ROAS com meta + bullet de margem
- **CorrelationSection** (Fraca): lag analysis (D, D+1, D+2) + p-value + linha de regressão + segmentação por unidade/canal
- **MarketingUnif** (Fraca): viz de fatia paga vs orgânica ao longo do tempo (stacked area)
- **PatternsSection** (Razoável): adicionar heatmap hora×dia (restaurante vive de horário de pico)
- **AnalysisSection** (Razoável): MA sobreposta + banda min/max + destaque mês corrente como projeção
- **ProductsAnalysisSection** (Razoável): treemap hierárquico categoria→produto complementando Pareto
- **OperationalAlerts** (Razoável): thresholds fixos → z-score (mais robusto a outlier)

---

## Adiado pra v0.4+

Análises de alto impacto mas effort L (requerem mudança de schema do banco):

- RFM + cohort de clientes delivery (precisa `customer_id` no iFood/AnotaAi)
- LTV / CAC por canal (depende do anterior)
- Menu engineering matrix (BCG) — precisa cadastrar custo unitário por produto (nova tabela `product_costs`)
- Geo-heatmap bairros entrega — precisa parsear CEP do CSV
- Forecast 7-30d com confidence interval (Holt-Winters) — escopo grande
- Anomaly detection com root-cause GenAI — requer LLM call paga
- **Integração Meta Ads API** (System User + Edge Function) — futuro v0.5/v0.6, zero risco pras contas dos clientes se feito direito. Salvo na memória do Claude

## Completed Milestones

<details>
<summary><strong>v0.2 Polish, Densidade & Exportação</strong> — 2026-05-24 (4 phases, 17 plans, ~36h)</summary>

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 10 | Densidade visual + identidade por fonte | 4 (10-01..10-04) | 2026-05-23 |
| 11 | Portar conteúdo do HTML antigo (+ remediação) | 9 (11-01, 11-02, 11-04..11-09, 11-11) | 2026-05-24 |
| 12 | Organização do Dashboard + Mobile | 2 (12-01, 12-02) | 2026-05-24 |
| 13 | Exportação PNG / PDF | 2 (13-01, 13-02) | 2026-05-24 |

Detalhes completos: [`.paul/milestones/v0.2-ROADMAP.md`](milestones/v0.2-ROADMAP.md)
Summary executivo: [`.paul/MILESTONES.md`](MILESTONES.md)

</details>

<details>
<summary><strong>v0.1 MVP</strong> — 2026-05-23 (9 phases, 20 plans, 8 dias)</summary>

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 1 | Fundação e dados de vendas | 3 | 2026-05-16 |
| 2 | Meta Ads | 1 | 2026-05-16 |
| 3 | Anota AI / Delivery | 1 | 2026-05-18 |
| 4 | Resumos: semana, ROI e marketing | 1 | 2026-05-22 |
| 5 | Gráficos e comparativos | 5 | 2026-05-22 |
| 6 | Correlações e análise cruzada | 5 | 2026-05-23 |
| 7 | Hospedagem, polish e autenticação | 4 | 2026-05-23 |
| 8 | Polish visual + Meta Ads expandido | 2 | 2026-05-23 |
| 9 | RLS hardening (authenticated-only) | 2 | 2026-05-23 |

Detalhes completos: [`.paul/milestones/v0.1-ROADMAP.md`](milestones/v0.1-ROADMAP.md)
Summary executivo: [`.paul/MILESTONES.md`](MILESTONES.md)

</details>

## Carryover (deferred vivos pra próximas milestones)

**Da v0.2:**

- Alinhamento header vs subheader (UAT v0.2 OK no header, mas subheader alinha à esquerda enquanto header tem padding diferente) — Effort XS. → v0.3 polish precoce
- Pílulas mensais de saúde da planilha + lista de campanhas Jatiúca + "% do alcance" em unit-cards Meta + frases comparativas em todos os KPIs + heatmap tooltip rico + sinergia diária pago+orgânico + tooltip Chart.js branded — Effort S-M cada
- Débito técnico (KPI_DEFS.map, unitSlug helper, unificar @media print, regex unicode em exportPng, fallback useCORS) — Effort S total

**Da v0.1:**

- Policies tenant-scoped via `is_member_of_tenant` (resolve 13 WARNs) — Effort M. Adiar pra v0.3+
- Filtro global de período no topo do sistema — Effort M
- Estender toggle Mensal/Semanal pro gráfico de linha de Vendas — Effort S
- HaveIBeenPwned password protection — Effort XS, cosmético
- Adicionar Mike + Gab como usuários (manual no Supabase Dashboard) — quando Doug quiser

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-24 (após /paul:complete-milestone v0.2)*
