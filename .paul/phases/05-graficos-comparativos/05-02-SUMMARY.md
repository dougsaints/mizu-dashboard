---
phase: 05-graficos-comparativos
plan: 02
subsystem: ui
tags: [chart.js, react-chartjs-2, meta-ads, anotaai, delivery, graficos, realtime]

requires:
  - phase: 02-meta-ads
    provides: tabela ads_daily, hook useAds
  - phase: 03-anotaai-delivery
    provides: tabela anotaai_products, hook useAnotaaiProducts
  - phase: 05-graficos-comparativos
    provides: padrão de gráfico Chart.js (SalesLineChart, plano 05-01)
provides:
  - Gráficos do Meta Ads (gasto/dia em barras + impressões/alcance em linha)
  - Gráfico de produtos mais vendidos do delivery (barras horizontais)
  - Correção do bug de canal Realtime do useAds (nome único por instância)
affects: [05-03 filtro global, 06-correlacoes]

tech-stack:
  added: []
  patterns:
    - "Gráfico de barras Chart.js (BarElement registrado)"
    - "Canal Realtime com nome único por instância do hook"

key-files:
  created: [src/components/AdsCharts.tsx, src/components/TopProductsChart.tsx]
  modified:
    - src/components/AdsUploadCard.tsx
    - src/components/AnotaaiUploadCard.tsx
    - src/api/useAds.ts
    - src/index.css

key-decisions:
  - "Meta Ads recebe 2 gráficos separados (gasto + alcance) — escolha do Doug"
  - "Delivery usa o snapshot mais recente, sem seletor de período"
  - "Canal Realtime do useAds passou a ter nome único por instância"

patterns-established:
  - "Hooks com Realtime devem usar nome de canal único por instância (crypto.randomUUID) para suportar múltiplos consumidores"

duration: ~40min
started: 2026-05-22T00:25:00Z
completed: 2026-05-22T01:05:00Z
---

# Phase 5 Plan 02: Gráficos de Meta Ads e delivery — Summary

**Meta Ads e delivery, que antes só tinham caixa de upload, ganharam visualização: 2 gráficos do tráfego pago (gasto/dia + impressões/alcance, com seletor de período) e 1 gráfico de produtos mais vendidos do delivery.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~40 min |
| Started | 2026-05-22T00:25:00Z |
| Completed | 2026-05-22T01:05:00Z |
| Tasks | 3 completed (2 auto + 1 checkpoint) |
| Files modified | 6 (2 criados, 4 modificados) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Gráfico de gasto diário do Meta Ads | Pass | Barras, custo agregado por dia, valores em R$ |
| AC-2: Gráfico de impressões e alcance | Pass | Linha com 2 datasets, legenda nomeada |
| AC-3: Seletor de período no Meta Ads | Pass | Botões 7/30/60 reusando `.range-picker`; redesenha os 2 gráficos |
| AC-4: Gráfico de produtos mais vendidos | Pass | Barras horizontais, top 10 do snapshot mais recente |
| AC-5: Estados de vazio não quebram a página | Pass | Componentes de gráfico retornam `null` sem dados |

## Verification Results

- `npm run build` — passou sem erro de TypeScript (970 módulos).
- `npm run dev` — após corrigir o bug do Realtime (ver Deviations), a página
  carrega normalmente; servidor sem erros pós-correção.
- Checkpoint human-verify — Doug aprovou a verificação visual no browser.

## Accomplishments

- `AdsCharts` — componente com 2 gráficos do Meta Ads (Bar de custo + Line
  de impressões/alcance), agregando as várias linhas/campanha por dia.
- `TopProductsChart` — barras horizontais dos 10 produtos mais vendidos,
  usando só o snapshot mais recente (consistente com o WeeklyRecap).
- Seletor de período 7/30/60 adicionado ao card do Meta Ads.
- Bug latente do Realtime no `useAds` corrigido — canal com nome único.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/components/AdsCharts.tsx` | Criado | Gráficos do Meta Ads (gasto + alcance) |
| `src/components/TopProductsChart.tsx` | Criado | Barras horizontais dos mais vendidos |
| `src/components/AdsUploadCard.tsx` | Modificado | Seletor de período + render dos gráficos |
| `src/components/AnotaaiUploadCard.tsx` | Modificado | Render do gráfico de top produtos |
| `src/api/useAds.ts` | Modificado | Correção: canal Realtime com nome único |
| `src/index.css` | Modificado | Estilos dos containers de gráfico |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Meta Ads com 2 gráficos separados | Custo e impressões/alcance têm escalas muito diferentes; Doug quis os dois | Padrão de "1 card por gráfico" |
| Delivery sem seletor de período | Cada CSV do Anota AI é um relatório acumulado; usar o snapshot mais recente evita contar em dobro | Consistente com o WeeklyRecap |
| Canal Realtime com nome único por instância | Nome fixo colidia quando 2 componentes usam o mesmo hook | Padrão para hooks Realtime reutilizáveis |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 2 | Correções essenciais, sem scope creep |
| Scope additions | 0 | — |
| Deferred | 1 | Filtro global → plano 05-03 |

**Total impact:** Duas correções essenciais para o plano funcionar; uma das
quais exigiu tocar um arquivo protegido (com justificativa).

### Auto-fixed Issues

**1. [UI] Posição dos gráficos do Meta Ads**
- **Found during:** Task 1 (gráficos do Meta Ads)
- **Issue:** Gráficos renderizados acima da caixa de upload, em vez de abaixo
- **Fix:** Movido para o fim da seção, abaixo da lista de imports
- **Files:** src/components/AdsUploadCard.tsx
- **Verification:** Inspeção visual no checkpoint

**2. [Bug · violação de boundary] Canal Realtime do useAds com nome fixo**
- **Found during:** Task 1 — tela branca ao abrir o app
- **Issue:** `useAds` criava um canal Realtime com nome fixo
  (`ads-${tenant}`). Funcionava com 1 consumidor (MarketingUnif), mas o
  plano adicionou um 2º (AdsUploadCard); dois canais com o mesmo nome →
  erro `cannot add postgres_changes callbacks after subscribe()` → React
  derrubava a página inteira (tela branca).
- **Fix:** Nome do canal passou a incluir `crypto.randomUUID()` — único
  por instância do hook.
- **Boundary:** `src/api/useAds.ts` estava em "DO NOT CHANGE". O boundary
  assumia que o hook estava estável; na prática tinha um bug latente que
  bloqueava o plano. Correção mínima (1 linha), comunicada ao Doug.
- **Files:** src/api/useAds.ts
- **Verification:** Servidor sem erros após a correção; checkpoint aprovado

### Deferred Items

- **Filtro global de período no topo do sistema** — pedido pelo Doug
  durante a verificação do 05-02. Não pertence ao escopo do 05-02; vira o
  plano **05-03**. Decisão pendente para o planejamento: o filtro global
  substitui ou sincroniza os seletores 7/30/60 já existentes nas seções.
  Registrado em STATE.md › Deferred Issues.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Tela branca ao abrir o app | Diagnóstico via log do dev server → bug do canal Realtime no useAds → corrigido |
| Servidor subiu na porta 5174 | Porta 5173 estava ocupada por servidor antigo; orientado o Doug a usar 5174 |

## Next Phase Readiness

**Ready:**
- Todas as 4 fontes (Vendas, Meta Ads, Delivery, Marketing) agora têm
  visualização gráfica.
- Padrão de hook Realtime reutilizável estabelecido (nome de canal único).

**Concerns:**
- Bundle segue grande (~722 KB) — code-splitting fica pra Fase 7 (polish).
- Os hooks `useSales`, `useAnotaai`, `useOrganic`, `useRoi`, `useDiary`
  ainda usam nome de canal fixo. Hoje funcionam (1 consumidor cada), mas
  têm o mesmo bug latente do useAds se ganharem um 2º consumidor. Aplicar
  o mesmo padrão neles seria prudente — candidato a plano de polish.

**Blockers:**
- None. Phase 5 ganhou um 3º plano (05-03, filtro global) antes de fechar.

---
*Phase: 05-graficos-comparativos, Plan: 02*
*Completed: 2026-05-22*
