---
phase: 05-graficos-comparativos
plan: 01
subsystem: ui
tags: [chart.js, react-chartjs-2, react, vendas, graficos]

requires:
  - phase: 01-fundacao
    provides: tabela sales_daily, hook useSales, hook useUnits
provides:
  - Componente SalesLineChart (gráfico de linha reutilizável Chart.js)
  - Gráfico de faturamento diário por unidade na seção Vendas
affects: [05-graficos-comparativos plano 05-02, 06-correlacoes]

tech-stack:
  added: []
  patterns:
    - "Componente de gráfico Chart.js v4 com registro de módulos no escopo do módulo"

key-files:
  created: [src/components/SalesLineChart.tsx]
  modified: [src/sections/SalesSection.tsx, src/index.css]

key-decisions:
  - "Gráfico com uma linha por unidade (Serraria vs Jatiúca) — escolha do Doug"
  - "Chart.js já estava instalado — plano não adicionou dependências"

patterns-established:
  - "Gráficos: registrar módulos Chart.js no escopo do módulo, container com altura fixa por causa de maintainAspectRatio:false"

duration: ~20min
started: 2026-05-22T00:00:00Z
completed: 2026-05-22T00:20:00Z
---

# Phase 5 Plan 01: Gráfico de linha de vendas por unidade — Summary

**Seção Faturamento agora tem um gráfico de linha do faturamento diário com uma linha por loja (Serraria e Jatiúca), ligado ao seletor de período existente.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Started | 2026-05-22T00:00:00Z |
| Completed | 2026-05-22T00:20:00Z |
| Tasks | 3 completed (2 auto + 1 checkpoint) |
| Files modified | 3 (1 criado, 2 modificados) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Gráfico de linha por unidade | Pass | Linha colorida por unidade, legenda com display_name, eixo X em dd/mm |
| AC-2: Gráfico respeita o seletor de período | Pass | Reutiliza as `rows` de `useSales(range)`; redesenha junto com KPIs |
| AC-3: Tooltip e valores em formato BR | Pass | Tooltip "R$ 1.234,56"; eixo Y com `brlShort` (R$ sem centavos) |
| AC-4: Estados de carregando / vazio | Pass | `SalesLineChart` retorna `null` quando `rows` está vazio |

## Verification Results

- `npm run build` — `tsc -b && vite build` passou sem erro de TypeScript (968 módulos transformados).
- Checkpoint human-verify — Doug aprovou a verificação visual no browser ("approved").

## Accomplishments

- Novo componente `SalesLineChart` — gráfico de linha Chart.js reutilizável, recebe `rows` + `units` e monta um dataset por unidade.
- Gráfico encaixado na `SalesSection` abaixo dos cards das lojas, dentro do bloco que só renderiza com dados.
- Estilo do container adicionado ao `index.css` com altura fixa (necessária por causa de `maintainAspectRatio:false` do Chart.js).

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/components/SalesLineChart.tsx` | Criado | Gráfico de linha Chart.js — uma linha por unidade, formatação BR |
| `src/sections/SalesSection.tsx` | Modificado | Importa e renderiza o gráfico abaixo da grade de unidades |
| `src/index.css` | Modificado | `.sales-chart`, `.sales-chart-title`, `.sales-chart-canvas` (altura fixa) |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Gráfico com uma linha por unidade | Doug escolheu comparar Serraria vs Jatiúca lado a lado | Define o padrão visual; 05-02 pode seguir o mesmo |
| Não adicionar dependências | `chart.js` + `react-chartjs-2` já estavam no `package.json` | "Biblioteca de gráficos" do plano virou só configuração |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | — |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Plano executado exatamente como escrito.

### Deferred Items

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Padrão de gráfico Chart.js estabelecido — `SalesLineChart` serve de modelo para o plano 05-02 (gráficos de Meta Ads e delivery).
- `SalesSection` agora tem tanto KPIs quanto gráfico no mesmo seletor de período.

**Concerns:**
- Chart.js entrou no bundle pela primeira vez — o build final ficou ~708 KB (Vite avisa que passou de 500 KB). Não bloqueia o MVP; otimização (code-splitting) pode ser tratada na Fase 7 (polish).

**Blockers:**
- None.

---
*Phase: 05-graficos-comparativos, Plan: 01*
*Completed: 2026-05-22*
