# Sushi Mizú Dashboard

## What This Is

Um painel web que centraliza dados de vendas, Meta Ads e delivery do Sushi Mizú, com atualização automática de alguns dados (Google Sheets) e upload manual de outros num momento inicial (Meta Ads CSV, Anota AI CSV). Projetado para leitura diária rápida e análise de tendências e correlações entre fontes.

## Core Value

Dono do restaurante, gestor e time de assessoria têm acesso rápido às principais métricas de faturamento, tráfego pago e marketing orgânico em um único lugar — sem abrir múltiplas plataformas.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.2.0 |
| Status | ✅ v0.2 Polish, Densidade & Exportação completo (2026-05-24) — em uso, aguardando próxima milestone |
| Last Updated | 2026-05-24 (após /paul:complete-milestone v0.2) |

## Requirements

### Core Features

- Visualização diária de vendas (ontem, semana, mês) com comparação de períodos
- Acompanhamento de métricas de tráfego pago (Meta Ads)
- Acompanhamento de marketing orgânico e delivery (Anota AI)
- Comparativos entre períodos (diário, semanal, mensal)
- Cruzamento de dados entre fontes para identificar tendências e correlações

### Validated (Shipped)

- [x] Scaffold base (React + TypeScript + Vite + Supabase) — v0.1
- [x] Leitura de planilhas Google Sheets (vendas Serraria + Jatiúca) — v0.1
- [x] Upload de CSV Meta Ads — v0.1
- [x] Seção de diário de operações — v0.1
- [x] Upload e visualização de dados Anota AI (produtos/delivery) — v0.1
- [x] WeeklyRecap — resumo semanal (faturamento, ROAS, top 3 produtos) — v0.1
- [x] RoiSection — ROI / investimento vs retorno (salvo na nuvem) — v0.1
- [x] MarketingUnif — marketing unificado Instagram (total + fatia paga) — v0.1
- [x] Gráfico de linha de faturamento diário por unidade (Chart.js) — Phase 5
- [x] Gráficos de Meta Ads e delivery — Phase 5
- [x] Seletor global de período (calendário + 12 atalhos) — Phase 5
- [x] Filtros globais Unidade + Canal de Venda — Phase 5
- [x] Comparativos entre períodos (anterior / mês passado) com delta ▲▼% nos KPIs e linha tracejada no gráfico — Phase 5
- [x] Análise mensal/semanal agregada (AnalysisSection com barras agrupadas) — Phase 5
- [x] Correlação Meta Ads × Vendas (CorrelationSection, ParetoChart, TopProductsChart) — Phase 6
- [x] Painel de tendências e indicadores consolidados (TrendsSection com delta ▲▼%) — Phase 6
- [x] Análise de produtos (ProductsAnalysisSection, CategoryDonutChart) — Phase 6
- [x] Padrões de uso (PatternsSection, SalesHeatmap, JatiucaVisibilityCard) — Phase 6
- [x] Tabela de dados consolidada com export CSV (DataTableSection) — Phase 6
- [x] Deploy Vercel via GitHub (mizu-dashboard-pi.vercel.app) — Phase 7-01
- [x] Code-splitting do bundle (React.lazy nas sections + manualChunks no Vite) — Phase 7
- [x] Auth magic link + código OTP fallback (contorna Gmail scanner) — Phase 7-02b
- [x] Polish visual: KPI heroes pretos com gradient + watermark 水 dourado — Phase 8-01
- [x] Meta Ads expandido: donut por objetivo, donut por unidade, hero Jatiúca azul — Phase 8-02
- [x] RLS hardening: cutover authenticated-only (anon dropado, banco trancado) — Phase 9
- [x] Identidade visual por fonte de dados (kanji-pill + badge, paleta por seção) — v0.2 / Phase 10
- [x] Densidade visual ~2x — KPI heroes compactos + sparklines SVG inline em Vendas — v0.2 / Phase 10-11
- [x] Cores por unidade determinísticas (Jatiúca azul, Serraria roxo) em todo painel — v0.2 / Phase 10
- [x] Storytelling em prosa nos heroes (WeeklyRecap, MarketingUnif, RoiSection) — v0.2 / Phase 10
- [x] 8 KPIs Meta-only no topo + tabela Por Categoria 6 colunas + cards unidade — v0.2 / Phase 11
- [x] 5 KPIs de Vendas com sparklines (Vendas Totais, Item Mais Vendido, PDV, iFood, AnotaAi) — v0.2 / Phase 11-04
- [x] 4 KPIs de Produtos (Unidades, SKUs, Concentração Top 10, Maior Categoria) — v0.2 / Phase 11-06
- [x] Painel de Alertas Operacionais preto/gold (anomalyDetection) — v0.2 / Phase 11-09
- [x] Gráfico Investimento × Faturamento diário (eixo Y duplo) — v0.2 / Phase 11-11
- [x] Header em 2 faixas (marca sticky 60px + filtros sticky 12px) — v0.2 / Phase 11-05
- [x] Dashboard reordenado + uploads colapsáveis em `<details>` — v0.2 / Phase 12-01
- [x] Mobile responsivo (13 grids → 1-col em <640px, touch ≥44px, filter reflow) — v0.2 / Phase 12-02
- [x] Export PNG por seção (html2canvas lazy, marca d'água, data + URL no rodapé) — v0.2 / Phase 13-01
- [x] Print PDF global (window.print + @media print branded) — v0.2 / Phase 13-02
- [x] Header refinado (emojis → SVG inline + bullet CSS + selects estilizados) — v0.2 / sprint refinamento

### Active (In Progress)

- [ ] Nada em andamento — milestone v0.2 fechada, aguardando definição de v0.3

### Planned (Next)

- Aguardando `/paul:discuss-milestone` ou `/paul:milestone` pra próxima direção

### Carryover (deferred do v0.2)

- [ ] **Alinhamento header vs subheader** — UAT v0.2 OK no refinamento, mas Doug notou que subheader alinha à esquerda enquanto header tem padding diferente. Plan precoce de polish na v0.3
- [ ] Pílulas mensais ❌✅⚠️ de saúde da planilha (do audit HTML antigo, item médio)
- [ ] Lista de campanhas Jatiúca individuais
- [ ] "% do alcance" em cards de unidade Meta
- [ ] Frases comparativas "vs R$ X (data-data)" embaixo de todos os KPIs (hero já tem, restante não)
- [ ] Heatmap tooltip rico
- [ ] Sinergia diária pago + orgânico
- [ ] Tooltip Chart.js customizado branded
- [ ] **Débito técnico:** 8 KPIs Meta como `KPI_DEFS.map()` em vez de inline; helper `unitSlug(name)` (lógica duplicada 3x); unificar 2 blocos `@media print`; refazer regex unicode em `exportPng.ts`; fallback se `useCORS:true` falhar

### Carryover (deferred do v0.1, ainda vivos)

- [ ] Policies tenant-scoped via `is_member_of_tenant` (resolve 13 WARNs `rls_policy_always_true`) — requer popular `tenant_users` primeiro
- [ ] Filtro global de período no topo do sistema (sincronizar com seletores 7/30/60 existentes)
- [ ] Estender toggle Mensal/Semanal pro gráfico de linha de Vendas (Doug optou por isolar; revisitar se sentir falta)
- [ ] HaveIBeenPwned password protection (cosmético, não usamos senha)
- [ ] Adicionar Mike + Gab como usuários autorizados (Supabase Dashboard → Authentication → Users)

### Out of Scope

- MovimentoSection (covers no salão) — não vai ser portada
- API paga do Meta Ads — upload manual de CSV por enquanto

## Constraints

### Technical Constraints

- Meta Ads: sem API pública gratuita — upload manual de CSV
- Anota AI: CSV encoding Latin-1, linha "Total,X" não é produto
- Google Sheets: lidas como CSV publicado (polling 5min)
- Auth: Supabase Auth obrigatório (RLS hardened em Phase 9). Signup público OFF; admin cadastra usuários manualmente.
- 1 tenant (Sushi Mizú) + 2 unidades (Serraria + Jatiúca)

### Business Constraints

- Hospedagem: gratuita ou muito barata (Vercel free tier definido)
- Sem prazo fixo, mas MVP funcional é prioridade
- Usuários leigos — interface deve ser simples e intuitiva

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Vercel para hospedagem | Free tier, deploy automático via GitHub, SSL incluído | 2026-05-18 | Active |
| Sem auth no MVP | Reduz complexidade; URL privada suficiente por ora | 2026-05-18 | Active |
| Upload manual Meta Ads | Meta não tem API pública gratuita | 2026-05-18 | Active |
| React Query + Supabase Realtime | Atualização automática sem polling manual | 2026-05-18 | Active |
| Filtros globais via FilterProvider (Context único) | Período + Unidade + Canal + cmpMode + analysisMode num só lugar; setters via spread preservam outros campos | 2026-05-22 | Active |
| Filtros Unidade/Canal aplicam só em Vendas | Meta Ads ~48% sem loja, Anota AI 100% sem; filtrar lá esconderia dado válido | 2026-05-22 | Active |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | Evita cascade de invalidates → loop ERR_INSUFFICIENT_RESOURCES. Pattern: QK_X_CMP separada + staleTime alto | 2026-05-22 | Active |
| Hooks Realtime multi-consumer com opt-out (subscribeRealtime?: false) | Cache do React Query é compartilhado pela queryKey; 2º consumer não precisa abrir WebSocket próprio | 2026-05-22 | Active |
| Magic link + código OTP fallback no Login | Gmail scanner "queima" magic link via prefetch; código numérico contorna sem alterar UX | 2026-05-23 | Active |
| RLS hardening em 2 passos (aditivo + subtrativo) | Mudança de policy em produção: adiciona authenticated em paralelo, valida login real, depois dropa anon. Zero risco de "trancar a chave dentro do carro" | 2026-05-23 | Active |
| Identidade por fonte via kanji-pill (não cor de borda) | Paleta Mizú é coesa demais; cor pequena some. Área generosa registra | 2026-05-23 | Active |
| Cores por unidade determinísticas por nome (`includes('jatiu')`) | Jatiúca sempre azul, Serraria sempre roxo, mesmo se ordem mudar — paleta determinística em SalesLineChart + unit-cards | 2026-05-23 | Active |
| Sparklines SVG puro (sem Chart.js) | 5 KPIs com mini-charts = render barato, zero dependência nova | 2026-05-24 | Active |
| Alertas Operacionais hardcoded (não config) | Thresholds escolhidos com Doug, mudança = nova versão (não setting). Simplifica MVP de alertas | 2026-05-24 | Active |
| html2canvas lazy + useCORS:true pro PNG | Lazy = bundle não infla pra quem não exporta; useCORS = fonts custom do painel renderizam | 2026-05-24 | Active |
| Print PDF via window.print (não jspdf) | Zero dependência nova; @media print branded já é suficiente pro fluxo WhatsApp/email | 2026-05-24 | Active |
| Emojis → SVG inline lucide-style no header | Doug detectou 🔄 "parecendo WhatsApp"; SVG inline fica profissional, ainda zero dependência | 2026-05-24 | Active |
| Auditoria automatizada vs HTML antigo quando Doug diz "tava melhor" | Doug é leigo em código mas tem olho de design; quando ele sente regressão visual, o gap é real e mensurável — vale rodar audit | 2026-05-24 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Todas as fontes de dados conectadas | 4 fontes (Vendas, Meta, Delivery, Orgânico) | 4/4 | ✅ Completo |
| Comparativo de períodos funcionando | Diário + semanal + mensal | 3/3 | ✅ Completo (Phase 5) |
| Correlações entre métricas visíveis | Pelo menos 2 cruzamentos | 5 (Meta×Vendas, Pareto, TopProducts, Padrões, Heatmap) | ✅ Completo (Phase 6) |
| Deploy em produção | Vercel com URL pública | mizu-dashboard-pi.vercel.app | ✅ Completo (Phase 7-01) |
| Auth funcional | Login magic link end-to-end testado | Doug logado em 2026-05-23 18:42 UTC | ✅ Completo (Phase 7-02b) |
| Banco trancado (não vaza por anon) | curl anon retorna `[]` em todas as tabelas | Confirmado em 2026-05-23 | ✅ Completo (Phase 9) |
| Leitura diária efetiva | Time usa todo dia sem abrir outras plataformas | A medir nas próximas semanas de uso | 🔍 Em observação |

## Tech Stack / Tools

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + TypeScript + Vite | — |
| Banco de dados | Supabase (PostgreSQL) | Schema em supabase/migrations/ |
| Hospedagem | Vercel (free tier) | Deploy via GitHub |
| Auth | Supabase Auth (magic link + OTP fallback) | Sessão JWT persistente; signup público OFF; só users criados manualmente |
| Dados externos | Google Sheets (CSV publicado) | Polling 5min |
| Tráfego pago | Meta Ads CSV (upload manual) | — |
| Delivery/produtos | Anota AI CSV (upload manual) | Encoding Latin-1 |

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/dougsaints/mizu-dashboard |
| Painel original | painel-diario.html (referência, 5000+ linhas) |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-05-24 after /paul:complete-milestone (v0.2 Polish, Densidade & Exportação fechada)*
