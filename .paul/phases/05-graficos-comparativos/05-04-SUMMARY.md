---
phase: 05-graficos-comparativos
plan: 04
subsystem: ui
tags: [filtros, unidade, canal, react-context, vendas]

requires:
  - phase: 05-graficos-comparativos
    provides: contexto de período global (05-03), seção Vendas (05-01)
provides:
  - Filtro global de Unidade (Todas / Serraria / Jatiúca)
  - Filtro global de Canal de Venda (Todos / PDV / iFood / AnotaAi)
  - Aplicação dos filtros em SalesSection (filtro + troca de coluna)
affects: [05-05 Comparar/Análise, 06-correlacoes]

tech-stack:
  added: []
  patterns:
    - "Contexto de filtros estendido (period + unidade + canal) num único provider"

key-files:
  created: []
  modified:
    - src/lib/period.tsx
    - src/components/Header.tsx
    - src/sections/SalesSection.tsx
    - src/pages/Dashboard.tsx
    - src/components/DateRangePicker.tsx
    - src/components/AdsUploadCard.tsx

key-decisions:
  - "Filtros Unidade/Canal afetam só Vendas — dados das outras fontes incompletos"
  - "Renomeação: PeriodProvider/usePeriod → FilterProvider/useFilters"
  - "Breakdown do card escondido quando há canal específico ativo (UX)"

patterns-established:
  - "Filtros globais via Context único; setters preservam outros campos com setState((s) => ({ ...s, ... }))"

duration: ~25min
started: 2026-05-22T03:15:00Z
completed: 2026-05-22T03:40:00Z
---

# Phase 5 Plan 04: Filtros de Unidade e Canal de Venda — Summary

**Barra de filtros do topo ganhou dois selects novos — Unidade e Canal de Venda — que atuam só na seção Vendas (onde os dados estão completos). Meta Ads e Delivery seguiram intocados, alinhado com a realidade dos dados.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~25 min |
| Started | 2026-05-22T03:15:00Z |
| Completed | 2026-05-22T03:40:00Z |
| Tasks | 2 auto + 1 checkpoint |
| Files | 0 criados, 6 modificados |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Selects de Unidade e Canal no topo | Pass | Header tem 2 selects ao lado do seletor de período, com separadores |
| AC-2: Filtro de Unidade afeta Vendas | Pass | Vendas filtra rows por unit_id; Meta Ads e Delivery não mudam |
| AC-3: Filtro de Canal troca a coluna de valor | Pass | `total` substituído pelo valor da coluna do canal (pdv/ifood/anotaai) |
| AC-4: Filtros combinam | Pass | Unidade + Canal aplicam juntos; ex.: Jatiúca + iFood mostra R$ 0,00 (Jatiúca não opera iFood) |

## Verification Results

- `npm run build` — passou sem erro de TypeScript (973 módulos).
- Checkpoint human-verify — aprovado pelo Doug.

## Accomplishments

- Contexto global estendido pra carregar `{ start, end, presetKey, unitId, channel }` num único provider; setters via `setState((s) => ({ ...s, ... }))` preservam os outros campos.
- Renomeação `usePeriod`/`PeriodProvider` → `useFilters`/`FilterProvider`; 3 consumidores atualizados (DateRangePicker, SalesSection, AdsUploadCard) + Dashboard.
- Header com 2 selects (Unidade via `useUnits`, Canal hardcoded) usando classes `.fg` e `.filter-sep` já portadas.
- SalesSection aplica filtros: rows filtradas por unidade, transformação de `total` por canal, agregação/KPIs/cards/gráfico usam o resultado.
- Empty state diferenciado: "sem dados ainda" vs "sem dados pra essa combinação".

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/period.tsx` | Modificado | Contexto + Provider + hook renomeados, unidade/canal adicionados |
| `src/components/Header.tsx` | Modificado | 2 selects novos com `useFilters` + `useUnits` |
| `src/sections/SalesSection.tsx` | Modificado | Aplica Unidade + Canal; sufixo de filtros no KPI; empty state |
| `src/pages/Dashboard.tsx` | Modificado | `PeriodProvider` → `FilterProvider` |
| `src/components/DateRangePicker.tsx` | Modificado | `usePeriod` → `useFilters` |
| `src/components/AdsUploadCard.tsx` | Modificado | `usePeriod` → `useFilters` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Filtros só em Vendas | Meta Ads tem ~48% sem loja marcada, Anota AI 100% sem; filtrar lá esconderia dado válido | Plano honesto; futuras importações precisam marcar a loja pra estender filtro |
| Provider/hook renomeados | "usePeriod" não casava mais com unit/channel | 3 consumidores atualizados |
| Esconder breakdown do card quando canal != 'all' | Mostrar PDV/AnotaAi/iFood embaixo de um Total que é só de um canal era enganoso | UX mais clara (desvio do plano literal) |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 2 | Pequenos, ambos por melhor UX/realidade |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Plano executado conforme escrito, com 2 ajustes finos no caminho.

### Auto-fixed Issues

**1. [UX] Breakdown escondido quando canal específico está ativo**
- **Found during:** Task 2 (aplicar filtros em SalesSection)
- **Issue:** O plano dizia "manter PDV/AnotaAi/iFood individuais no breakdown". Na prática, mostrar todos os canais embaixo de um Total que é só de um canal escolhido confunde — a soma do breakdown não bate com o Total.
- **Fix:** Breakdown só renderiza quando `channel === 'all'`. Com canal específico, mostra apenas Total + dias com dados.
- **Files:** src/sections/SalesSection.tsx
- **Verification:** Checkpoint visual aprovado.

**2. [No-op] index.css não precisou de mudança**
- **Found during:** Task 1
- **Issue:** O plano não listou index.css, e de fato as classes `.fg`, `.fg-label`, `.filter-sep`, `.fg select` já estavam portadas.
- **Fix:** Nenhuma.
- **Files:** nenhum.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| HMR mostrou "useFilters precisa estar dentro de FilterProvider" durante as edições | Mid-edit state após renomear o contexto. Resolvido com F5 no browser. Build final passou limpo. |

## Domain Knowledge Captured

- **Jatiúca só opera PDV no momento** — informação que o Doug deu durante a verificação. Anotada na memória do projeto (`jatiuca-so-pdv.md`). Combinações Jatiúca × iFood/AnotaAi mostram R$ 0,00 — é a realidade, não bug.

## Next Phase Readiness

**Ready:**
- Barra de filtros do topo com Período + Unidade + Canal pronta. Falta só "Comparar com" e Análise mensal/semanal (plano 05-05).
- Padrão `useFilters` estabelecido — qualquer filtro futuro vai no mesmo contexto.

**Concerns:**
- Se um dia o filtro de Unidade precisar atuar em Meta Ads e Delivery, os uploads precisam marcar `unit_id` em cada linha. Hoje:
  - Meta Ads: 77 de 160 rows com `unit_id = null`
  - Anota AI: 70 de 70 rows com `unit_id = null`
- Bundle segue ~729 KB.

**Blockers:**
- None. Falta só 05-05 pra completar a Fase 5.

---
*Phase: 05-graficos-comparativos, Plan: 04*
*Completed: 2026-05-22*
