---
phase: 05-graficos-comparativos
plan: 03
subsystem: ui
tags: [date-range-picker, filtro, periodo, react-context, calendario]

requires:
  - phase: 05-graficos-comparativos
    provides: seções Vendas e Meta Ads com gráficos (05-01, 05-02)
provides:
  - Contexto de período global (intervalo de datas)
  - DateRangePicker — seletor com 12 atalhos + calendário
  - Hooks useSales/useAds operando por intervalo de datas
affects: [05-04 filtros Unidade/Canal, 05-05 Comparar/Análise, 06-correlacoes]

tech-stack:
  added: []
  patterns:
    - "Estado global de UI via React Context (PeriodProvider/usePeriod)"
    - "Calendário portado à mão do painel original, sem biblioteca"

key-files:
  created:
    - src/lib/periodPresets.ts
    - src/components/DateRangePicker.tsx
  modified:
    - src/lib/period.tsx
    - src/pages/Dashboard.tsx
    - src/components/Header.tsx
    - src/api/useSales.ts
    - src/api/useAds.ts
    - src/sections/SalesSection.tsx
    - src/components/AdsUploadCard.tsx
    - src/sections/MarketingUnif.tsx

key-decisions:
  - "Período é um intervalo de datas (start/end ISO), não mais 'X dias'"
  - "Hooks useSales/useAds passaram a filtrar por .gte/.lte de data"
  - "CSS do seletor (.drp-*) já estava portado — reaproveitado, sem CSS novo"

patterns-established:
  - "Filtro global no topo via Context; seções consomem usePeriod()"

duration: ~90min
started: 2026-05-22T01:30:00Z
completed: 2026-05-22T03:00:00Z
---

# Phase 5 Plan 03: Seletor de período completo — Summary

**O filtro global virou um seletor de período de verdade: botão no topo que abre um painel com 12 atalhos (Hoje, Ontem, 7/14/28/30 dias, Esta/Semana passada, Este/Mês passado, Máximo, Personalizado) + calendário para intervalo custom. Contexto e hooks de dados passaram a operar por intervalo de datas.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~90 min (inclui re-planejamento e diagnóstico de ambiente) |
| Started | 2026-05-22T01:30:00Z |
| Completed | 2026-05-22T03:00:00Z |
| Tasks | 3 auto + 1 checkpoint |
| Files | 2 criados, 8 modificados |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Seletor com 12 atalhos | Pass | Painel abre com a lista completa de presets |
| AC-2: Atalho aplica o intervalo | Pass | Clique no preset aplica e recarrega Vendas/Meta Ads |
| AC-3: Intervalo personalizado pelo calendário | Pass | Seleção em 2 passos + "Aplicar"; preset vira "Personalizado" |
| AC-4: Filtro global e grudado | Pass | Header sticky; Vendas/Meta Ads sem seletor próprio |

## Verification Results

- `npm run build` — passou sem erro de TypeScript (973 módulos).
- Checkpoint human-verify — aprovado pelo Doug após resolver o problema de
  ambiente (ver Deviations).

## Accomplishments

- `periodPresets.ts` — os 12 atalhos do painel original e o cálculo de
  cada intervalo, em datas ISO locais (sem o pulo de fuso do toISOString).
- `period.tsx` — contexto reescrito: guarda `{ start, end, presetKey }`.
- `DateRangePicker.tsx` — seletor portado do painel original: trigger,
  painel com presets + calendário (navegação de mês, seleção em 2 passos,
  preview no hover), rodapé Cancelar/Aplicar.
- `useSales`/`useAds` migrados de `daysBack` para `(start, end)`.
- Consumidores adaptados: SalesSection, AdsUploadCard, MarketingUnif.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/periodPresets.ts` | Criado | 12 atalhos + cálculo de datas + rótulos |
| `src/components/DateRangePicker.tsx` | Criado | O seletor de período (trigger + painel) |
| `src/lib/period.tsx` | Modificado | Contexto passa a guardar intervalo de datas |
| `src/pages/Dashboard.tsx` | Modificado | Envolve o painel com PeriodProvider |
| `src/components/Header.tsx` | Modificado | Renderiza o DateRangePicker |
| `src/api/useSales.ts` | Modificado | Query por `.gte/.lte` de data |
| `src/api/useAds.ts` | Modificado | Query por `.gte/.lte` de data |
| `src/sections/SalesSection.tsx` | Modificado | Lê intervalo do contexto |
| `src/components/AdsUploadCard.tsx` | Modificado | Lê intervalo do contexto |
| `src/sections/MarketingUnif.tsx` | Modificado | Adaptado à nova assinatura de useAds (janela própria de 90 dias) |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Período = intervalo de datas (start/end) | Suporta calendário e atalhos como "Mês passado" | Hooks filtram por intervalo |
| Calendário portado à mão | Sem dependência nova; o painel original já tinha a lógica | Mais código, zero peso de lib |
| Reaproveitar CSS `.drp-*` | Já estava portado no index.css | Task 2 não precisou de CSS novo |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Sem impacto (CSS já existia) |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Plano executado conforme o escrito. Uma reprovação no
checkpoint, mas a causa era ambiente, não código.

### Auto-fixed Issues

**1. [No-op] index.css não precisou de mudança**
- **Found during:** Task 2
- **Issue:** O plano listava `index.css` em files_modified
- **Fix:** Nenhuma — todo o CSS `.drp-*` já estava portado no projeto
- **Files:** nenhum

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Checkpoint: "clicar num atalho não muda nada" | Diagnóstico: NÃO era bug de código. Havia 11 processos Node ativos (vários servidores Vite de sessões antigas); o browser estava ligado a um servidor velho. Resolvido matando todo o node e subindo 1 servidor limpo (porta 5173). Registrado na memória do projeto. |

## Next Phase Readiness

**Ready:**
- Filtro global de período pronto — base para 05-04 (Unidade/Canal) e
  05-05 (Comparar com / Análise), que estendem a barra de filtros.
- Padrão de Context global estabelecido para outros filtros.

**Concerns:**
- Bundle ~728 KB — code-splitting fica pra Fase 7.
- 05-03 foi replanejado uma vez (versão simples de 3 botões reprovada);
  a barra de filtros completa pedida pelo Doug segue em 05-04 e 05-05.

**Blockers:**
- None. Faltam 05-04 e 05-05 para fechar a Fase 5.

---
*Phase: 05-graficos-comparativos, Plan: 03*
*Completed: 2026-05-22*
