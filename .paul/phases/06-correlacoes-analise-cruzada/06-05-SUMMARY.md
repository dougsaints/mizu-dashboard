---
phase: 06-correlacoes-analise-cruzada
plan: 05
status: complete
completed_at: 2026-05-23
---

# 06-05 SUMMARY — Heatmap semanal + Comparação justa por unidade

## O que foi entregue

Nova `PatternsSection` entre `ProductsAnalysisSection` e `RoiSection`. Layout 2 colunas (no desktop):

1. **Heatmap semanal de faturamento** (CSS Grid, não canvas) — 12 semanas × 7 dias. Cor verde-claro → verde-escuro conforme intensidade do faturamento diário. Células futuras ou sem dado em cinza. Tooltip absoluto no hover: "Data dd/mm/yyyy · R$ X,XX". Legenda topo: "R$ Xk —— R$ Yk" com gradient bar. **Ignora filtro global de período** (sempre últimas 12 semanas), respeita unidade e canal.

2. **Comparação justa por unidade** — 1 card por unidade ativa com:
   - Total R$ no período + share% do grupo
   - R$/dia (total ÷ dias com dados)
   - Badge ▲▼ Δ% vs período comparado (se cmpMode != 'none')
   - "vs R$ Y" no período comparado
   - Média histórica de R$/dia (só se range de 12 semanas tem ≥56 dias de cobertura)
   - Border-left colorido por unidade (Serraria roxo, Jatiúca azul — paleta do SalesLineChart)

**Phase 6 fechada 100% (5/5 plans).**

## Arquivos criados/modificados

**Criados:**
- `src/lib/heatmap.ts` — puras: `startOfWeekSun`, `toIso`, `buildWeekBuckets`, `colorScale`, `daysBetween`
- `src/components/SalesHeatmap.tsx` — heatmap CSS Grid + tooltip via React state
- `src/components/UnitCompareCard.tsx` — card de stats da unidade
- `src/sections/PatternsSection.tsx` — orquestra os 2 + 3 queries useSales

**Modificados:**
- `src/pages/Dashboard.tsx` — lazy + Suspense pra PatternsSection
- `src/index.css` — bloco "Padrões e Performance (Phase 6-05)" (~170 linhas incluindo heatmap, tooltip, unit-compare-card)

## Decisões tomadas

1. **CSS Grid puro pro heatmap em vez de canvas.** Vantagens: HTML acessível (ARIA-friendly), tooltip via React state (sem DOM manual), hover via CSS, sem dependência de lib de visualização. Trade-off: cada célula é um nó DOM (12×7 = 84 cells), mas é trivial pro browser.

2. **Tooltip via React state em vez de portal.** Mais simples: `position: fixed` + coords do MouseEvent. `window.innerWidth/Height` usados pra evitar overflow nas bordas. Single tooltip elemento na árvore (sem ref/portal).

3. **`computeHistRate` usa apenas o range de 12 semanas do heatmap** (mesmo dado já no cache). Decisão deliberada: o spec "≥8 semanas" vira "≥56 dias dentro das 12 semanas". Não busca histórico mais profundo pra economizar query e manter o cache leve. Documentado como "média histórica das 12 semanas exibidas" no `.uc-ref`.

4. **3 queries `useSales` diferentes na mesma seção** — `start/end`, `cmpStart/cmpEnd` (via `useSalesComparison`), `heatmapStart/heatmapEnd`. Todas com `subscribeRealtime: false`. Cache compartilhado por queryKey — se outra seção já pediu o mesmo range, vem de graça. Sem cascade-invalidate porque o pattern Phase 5 já fixou isso.

5. **Unit slug pra className** — `'Jatiúca' → 'jatiuca'` via NFD normalize + remove combining marks. Permite `.uc-serraria` / `.uc-jatiuca` no CSS sem precisar mapear ID UUID → className.

6. **Heatmap range fixo nas 12 últimas semanas a partir de HOJE (não da última data com dados)** — diferente do HTML original que usava `maxDate` das rows. Decisão: como o app tem polling automático das planilhas, o painel quase sempre está fresco. Se planilha estiver desatualizada, o heatmap mostra as células faltantes como "cinza/futuro" — visualmente honesto.

7. **Tooltip de célula vazia** mostra "Data futura" ou "Sem dados" em cinza claro, não esconde — usuário entende o vazio.

## Verificação

- [x] `npx tsc --noEmit` passa (corrigi 1 import não usado em SalesHeatmap)
- [x] `npm run build` passa, novo chunk `PatternsSection-*.js` (8.06KB / 3.03KB gzip)
- [x] Chunk principal 69.4KB (vs 69.1KB antes, +0.3KB)
- [x] Sem warning >500KB
- [x] Lazy + Suspense individual
- [ ] **Validação visual pendente:** Doug confere heatmap + cards com dados reais

## Acceptance criteria

- [x] AC-1: Helpers de heatmap puros (5 funções exportadas)
- [x] AC-2: SalesHeatmap com grid CSS, células coloridas, tooltip, legenda, empty state
- [x] AC-3: UnitCompareCard com total/rate/share/delta/histRate, cores per unit
- [x] AC-4: PatternsSection orquestra com 3 queries, filtros corretos
- [x] AC-5: Visual integrado, kanji 律, lazy + Suspense

## Issues deferidas

- **Médias por dia da semana no cabeçalho do heatmap** ("Dom: R$ X média") — fácil de adicionar (já tem `dowAverages` no HTML original mas não portei). Effort XS.
- **Histórico mais profundo (>12 semanas) pra hist rate** — precisa query nova com range maior. Effort S.
- **Tap em célula do heatmap leva ao detalhe daquele dia** — drill-down, fora de escopo. Effort M.
- **Linha de referência 80% no Pareto** (deferred do 06-04) — annotation plugin do Chart.js. Effort XS.

## Próximo passo

**Phase 6 fechada 100%.** Sugestão pro Doug:
- Validar visualmente as 5 entregas (06-01 a 06-05) no `npm run dev`
- Decidir Phase 7: deploy Vercel (07-01) + auth (07-02), que aguardam decisões dele

Estado atual do dashboard: **15 seções/cards funcionais**, todas com lazy-loading, build em 69KB principal + 196KB supabase + 193KB chart + 182KB react + 35KB query (gzip ~210KB total cacheável).
