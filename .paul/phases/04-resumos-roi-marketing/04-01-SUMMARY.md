---
phase: 04-resumos-roi-marketing
plan: 01
type: summary
completed: 2026-05-22
retroactive: true
---

# Summary: Resumos — semana, ROI e marketing — Plan 04-01

> ⚠️ **Documentado retroativamente em 2026-05-22.** Estas 3 features
> foram construídas fora do loop do PAUL (sessões de 20-22/05, registradas
> no `PLAN.md`). Esta fase foi criada na reconciliação de 22/05 pra o
> PAUL refletir o que de fato foi entregue.

## What Was Built

Três painéis de resumo que cruzam as fontes de dados num panorama executivo:

- **WeeklyRecap** (`src/sections/WeeklyRecap.tsx` + `src/api/useWeeklyRecap.ts`)
  — resumo semanal: faturamento por unidade vs semana anterior, ROAS de
  marketing, top 3 produtos do último snapshot Anota AI. Compara janelas
  de mesmo tamanho ancoradas no último dia com dado (corrige lag da
  planilha e fuso UTC-3).
- **RoiSection** (`src/sections/RoiSection.tsx` + `src/api/useRoi.ts`)
  — ROI / investimento vs retorno: 3 inputs (tráfego, mão de obra, mkt
  geral) salvos no Supabase, toggle Mensal/Semanal, métricas de margem
  e ROAS. Atualização otimista no toggle.
- **MarketingUnif** (`src/sections/MarketingUnif.tsx` + `src/api/useOrganic.ts`
  + `src/lib/instagramCsv.ts`) — marketing unificado do Instagram: total
  real do Business Suite (alcance, visualizações, interações, novos
  seguidores, visitas, cliques) + fatia paga vinda do Meta Ads (% do
  alcance impulsionado). Migration `0005` recriou `organic_entries`
  com o schema correto + `organic_imports` (audit log).

## Acceptance Criteria — Results

| AC | Status | Notes |
|----|--------|-------|
| WeeklyRecap validado no browser | ✅ | 3 bugs de janela/fuso corrigidos · commit 0b063a5 |
| RoiSection validado no browser | ✅ | toggle fluido após otimismo · commit 275c410 |
| MarketingUnif validado no browser | ✅ | migration 0005 rodada · commit 55e82c5 / b97421c |

## Decisions Made

- ROI agora salvo no Supabase (antes era `localStorage` de um aparelho só).
- MarketingUnif mostra o total real do Instagram + fatia paga — NÃO
  estima "orgânico = total − pago" (estimativa descartada por imprecisão).
- A partir de 22/05, o PAUL passa a ser o sistema oficial de planejamento
  do projeto (registrado no `CLAUDE.md`).

## Deferred Issues

- Nenhum.

## Next Phase

Phase 5: Gráficos e comparativos — completar SalesSection com gráficos Chart.js.
