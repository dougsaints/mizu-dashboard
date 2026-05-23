---
phase: 05-graficos-comparativos
plan: 05
subsystem: ui
tags: [comparar, analise, mensal, semanal, react-context, chart-bar, react-query, realtime]

requires:
  - phase: 05-graficos-comparativos
    provides: filtros globais Período + Unidade + Canal (05-03/04), seção Vendas (05-01), gráficos Meta Ads/Delivery (05-02)
provides:
  - Seletor global "Comparar com" (Período anterior / Mês passado / Não comparar)
  - Toggle global "Análise por" (Mensal / Semanal)
  - Variação % (delta) em todos os KPIs de Vendas (Total + por unidade + breakdown PDV/iFood/AnotaAi)
  - 2ª linha tracejada no gráfico de Faturamento (período comparado)
  - Nova seção AnalysisSection com 2 gráficos de barras agrupadas (faturamento por unidade + custo Meta Ads)
  - useSalesComparison (hook + queryKey separada de QK_SALES)
  - Opt-out de Realtime em useSales/useAds (subscribeRealtime?: false)
affects: [06-correlacoes, 07-deploy-auth]

tech-stack:
  added: []
  patterns:
    - "queryKey de queries derivadas NÃO deve compartilhar prefix com chave invalidada por Realtime (evita cascata)"
    - "Hooks Realtime consumidos por múltiplos componentes oferecem opt-out via options.subscribeRealtime"
    - "Agrupamento ISO week (YYYY-Www) e monthly (YYYY-MM) implementado localmente em AnalysisSection"
    - "Chart.js Bar agrupadas (1 cor por unidade) pra séries de período fechado; Line para série diária contínua"

key-files:
  created:
    - src/sections/AnalysisSection.tsx
  modified:
    - src/lib/period.tsx
    - src/components/Header.tsx
    - src/api/useSales.ts
    - src/api/useAds.ts
    - src/sections/SalesSection.tsx
    - src/components/SalesLineChart.tsx
    - src/pages/Dashboard.tsx
    - src/index.css

key-decisions:
  - "Toggle Mensal/Semanal vive na AnalysisSection isolado — não vaza pro gráfico de linha de Vendas (opção (a) do plano)"
  - "Comparar com tem 3 opções, não 4 — 'Ano passado' descartado por falta de histórico no banco"
  - "Comparativo aplica SÓ na seção Vendas — Meta Ads e Delivery seguem sem badge (dados incompletos)"
  - "Default = 'monthly' (consistente com painel antigo)"
  - "useSalesComparison usa QK_SALES_CMP (chave separada) + staleTime 10min — evita refetch em cascata quando Realtime invalida QK_SALES"
  - "AnalysisSection passa subscribeRealtime: false em useSales/useAds — cache compartilhado por queryKey; SalesSection/MarketingUnif/AdsUploadCard já mantêm o canal"

patterns-established:
  - "Filtros globais expandidos via FilterProvider (período + unidade + canal + cmpMode + analysisMode num único Context)"
  - "DeltaBadge component (em SalesSection) — renderiza ▲/▼/flat com tooltip e estado 'sem dados'"
  - "Hooks de leitura com Realtime aceitam { subscribeRealtime?: boolean } pra cenários multi-consumer"

duration: ~50min (inclui ~30min de debug + fix do loop ERR_INSUFFICIENT_RESOURCES)
started: 2026-05-22T21:15:00Z
completed: 2026-05-22T22:05:00Z
---

# Phase 5 Plan 05: "Comparar com" + Análise Mensal/Semanal — Summary

**Fase 5 fechada. Header completou a barra de filtros com seletor "Comparar com" e toggle "Análise por". Vendas mostra delta ▲▼% em todos os KPIs e 2ª linha tracejada no gráfico. Nova seção "Análise por Período" com 2 gráficos de barras agrupadas. Spec issue descoberto no checkpoint (cascata de invalidates por prefix-match no React Query) → fix com queryKey separada + opt-out de Realtime.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~50 min (entrega ~20min + debug+fix ~30min) |
| Started | 2026-05-22T21:15:00Z |
| Completed | 2026-05-22T22:05:00Z |
| Tasks | 3 auto + 1 checkpoint human-verify |
| Files | 1 criado, 8 modificados |
| Bundle JS | 738 KB (+9 KB vs 05-04) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Select "Comparar com" no Header | Pass | 3 opções (prev / prevMonth / none); default 'prev'; ordem Período → Comparar com → Unidade → Canal → Análise por |
| AC-2: Comparativo nos KPIs e gráfico | Pass (após fix GAP) | Badges em Total + por unidade + breakdown PDV/iFood/AnotaAi; linha tracejada cinza no gráfico; legenda "Atual" + "Comparado" |
| AC-3: Toggle + AnalysisSection | Pass | Renderiza entre WeeklyRecap e SalesSection; 2 gráficos Bar (Serraria laranja + Jatiúca azul + Meta Ads dourado); ISO week + monthly |
| AC-4: Sem dados no período comparado | Pass | Badge "— sem dados" cinza; linha tracejada some; nota discreta abaixo do título |
| AC-5: Realtime canal único por instância | Pass + estendido | `sales-${tenantId}-${randomUUID()}`; também recebeu fix de cascade via QK_SALES_CMP separada |

## Accomplishments

- **Barra de filtros global completa** — fecha a sequência iniciada no 05-03 (período) e 05-04 (unidade/canal): agora tem Período + Comparar com + Unidade + Canal + Análise por num único `FilterProvider`.
- **Nova seção AnalysisSection** com agrupamento mensal/semanal (ISO week) e 2 gráficos de barras agrupadas — primeira view do projeto com perspectiva agregada (não diária).
- **Comparativo de KPIs em tempo real** — usuário troca "Comparar com" e vê instantaneamente o delta ▲▼% em todos os KPIs + linha tracejada no gráfico.
- **Spec issue de cascade de invalidates descoberto e resolvido** — bug não óbvio que só apareceu com múltiplos consumers do useSales. Aprendizado salvo na memória do projeto pra futuras sessões (`queryKey-prefix-realtime-cascade.md`).

## Task Commits

Commit único agregado (não atomizou por task — Doug pediu commit no fim):

| Task | Commit | Tipo | Descrição |
|------|--------|------|-----------|
| T1 + T2 + T3 + fix GAP + spec fix | `1015dcc` | feat | feat(graficos): "Comparar com" + Análise Mensal/Semanal (05-05) |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/sections/AnalysisSection.tsx` | Criado | Seção nova com 2 gráficos Bar + ISO week + monthly grouping |
| `src/lib/period.tsx` | Modificado | FilterProvider estendido com cmpMode + analysisMode + setters |
| `src/components/Header.tsx` | Modificado | Select "Comparar com" + toggle "Análise por" |
| `src/api/useSales.ts` | Modificado | useSalesComparison + getComparisonRange + opt-out de Realtime + QK_SALES_CMP separada |
| `src/api/useAds.ts` | Modificado | Opt-out de Realtime (subscribeRealtime?: false) |
| `src/sections/SalesSection.tsx` | Modificado | DeltaBadge em Total + por unidade + breakdown PDV/iFood/AnotaAi |
| `src/components/SalesLineChart.tsx` | Modificado | Prop `cmpRows` + 2ª série tracejada cinza alinhada por índice |
| `src/pages/Dashboard.tsx` | Modificado | Wire-up da AnalysisSection entre WeeklyRecap e SalesSection |
| `src/index.css` | Modificado | Estilos para .kpi-delta--up/down/flat/empty, .fg-toggle, .analysis-section, .sales-cmp-note |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| 3 opções de "Comparar com" (sem "Ano passado") | Banco com pouco histórico geraria muitos "sem dados" | UX honesta; revisitar em pós-MVP se acumular 1+ ano |
| Toggle Mensal/Semanal isolado na AnalysisSection | Decisão (a) escolhida na revisão pré-plano | Gráfico de linha mantém granularidade diária; option (c) anotada como Deferred Issue |
| Comparativo só em Vendas | Meta Ads tem ~48% sem loja, Anota AI 100% sem | Plano honesto com dados disponíveis; revisitar quando importações marcarem unit_id |
| Variação % em TODOS os KPIs (não só Total) | "Esforço marginal, valor alto" | Cobertura visual completa quando channel === 'all' |
| QK_SALES_CMP separada de QK_SALES | Evita cascata de invalidates por prefix match | Fix do loop ERR_INSUFFICIENT_RESOURCES |
| subscribeRealtime: false em hooks multi-consumer | Cache compartilhado por queryKey; 2º consumer não precisa abrir WebSocket | Reduz carga de WebSocket no StrictMode dev |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | GAP em AC-2 detectado no qualify do agente; corrigido em <5min |
| Spec-fixed | 1 | Spec issue de cascade descoberto no checkpoint; reclassificado e patcheado |
| Scope additions | 0 | — |
| Deferred | 2 | Toggle Mensal/Semanal estendido (op c); bundle splitting (>500KB) |

**Total impact:** Entregou tudo do plano, mas o spec teve um buraco arquitetural não óbvio (cascade de invalidation) que custou ~30min de debug. Vale o registro como pattern pra evitar em planos futuros.

### Auto-fixed Issues

**1. [GAP] Badges de delta não estavam no breakdown PDV/iFood/AnotaAi por unidade**
- **Found during:** Qualify externo do main Claude após o react-engineer reportar DONE
- **Issue:** O plano (AC-2 + decisão #6) exigia "variação % em todos os KPIs (PDV, iFood, AnotaAi etc.)" mas o agente colocou DeltaBadge só no Total geral e no Total por unidade. O breakdown ficava sem delta quando channel === 'all'.
- **Fix:** Adicionar `<DeltaBadge>` inline com cada `<span>` do breakdown em SalesSection.tsx (bloco `{channel === 'all' && (...)}`)
- **Files:** src/sections/SalesSection.tsx
- **Verification:** npm run build PASS + checkpoint visual aprovado

### Spec-fixed Issues (não previstos no PLAN)

**1. [LOOP] ERR_INSUFFICIENT_RESOURCES em rajada (até 7434 erros) no checkpoint visual**
- **Found during:** Checkpoint human-verify (Doug abriu browser e viu 7434 erros no console)
- **Root cause:** `useSalesComparison` usava queryKey `[...QK_SALES, ...]` → cada Realtime event do `sales_daily` (incluindo eventos gerados pelo `useAutoPollSales` UPSERT) cascadeava `invalidateQueries({ queryKey: QK_SALES })` via prefix match, disparando refetch da comparison. Combinado com:
  - `useSales` agora chamado em 2 componentes (SalesSection + AnalysisSection) → 2 consumers do cache
  - StrictMode dev monta efeitos 2× → multiplica WebSockets
  - Browser satura conexões → ERR_INSUFFICIENT_RESOURCES → React Query retry exponencial → loop visível
- **Classification:** **Spec issue (2)** — o PLAN previu canal Realtime único (AC-5) mas não previu cascade de invalidates entre queries que compartilham prefix.
- **Diagnostic:** Bisseção (comentar AnalysisSection → 637 erros; também comentar useSalesComparison → 75 erros = baseline). Confirmou os 2 contribuidores.
- **Fix aplicado:**
  1. `QK_SALES_CMP` separada de `QK_SALES` em useSales.ts
  2. `staleTime: 10 * 60 * 1000` no useSalesComparison
  3. `subscribeRealtime?: boolean` em useSales e useAds; AnalysisSection passa `false`
- **Files:** src/api/useSales.ts, src/api/useAds.ts, src/sections/AnalysisSection.tsx
- **Verification:** Reabertura em janela anônima: 88 erros e estabilizou (baseline natural)
- **Pattern salvo na memória:** `queryKey-prefix-realtime-cascade.md`

### Deferred Items

Logged no STATE.md Deferred Issues:
- **Estender toggle Mensal/Semanal pro gráfico de linha de Vendas (opção c do plano)** — Phase 6 ou pós-MVP, se Doug sentir falta usando
- **Bundle JS em ~738 KB (warning Vite >500 KB)** — Phase 7, usar dynamic import() / code-splitting antes do deploy

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Processos node fantasmas (Vite das 18:45 ainda rodando) | Identificados via PowerShell + horário; 8 PIDs mortos preservando o atual (PID 28604 na porta 5174) |
| HMR servindo código mid-edit causou warning "useFilters precisa estar dentro de FilterProvider" durante renomeação | Resolvido com hard refresh (Ctrl+Shift+R) |
| react-engineer criou SUMMARY draft prematuro durante o APPLY (antes do UNIFY) | Mantido untracked; sobrescrito por este SUMMARY oficial no UNIFY |
| Build warning de chunk >500 KB (738 KB) | Logado como Deferred Issue pra Phase 7 (code-splitting) |

## Next Phase Readiness

**Ready:**
- Fase 5 inteira fechada (5 de 5 plans). Barra de filtros global completa.
- Padrões estabelecidos pra Fase 6 (Correlações): usar QK separada pra queries derivadas, opt-out de Realtime em multi-consumers, agrupamento ISO week local.
- Cache do React Query bem segmentado entre dados ao vivo (QK_SALES, QK_ADS) e dados derivados (QK_SALES_CMP).

**Concerns:**
- Bundle em ~738 KB — não bloqueia desenvolvimento mas vai ser preciso resolver antes do deploy Vercel (Phase 7).
- Hooks Realtime restantes ainda usam canal fixo (`useWeeklyRecap`, `useRoi`, `useOrganic`, `useDiary`, `useAnotaaiProducts`) — não são problema hoje (só 1 consumer cada), mas se algum vier a ser consumido por 2+ componentes, aplicar o mesmo padrão de UUID + opt-out.

**Blockers:**
- None. Fase 6 pode iniciar quando Doug quiser.

---
*Phase: 05-graficos-comparativos, Plan: 05*
*Completed: 2026-05-22*
