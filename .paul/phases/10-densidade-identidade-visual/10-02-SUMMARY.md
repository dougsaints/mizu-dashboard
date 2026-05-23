---
phase: 10-densidade-identidade-visual
plan: 02
status: completed
completed_at: 2026-05-23
---

## O que foi feito

Compactação dos KPI cards de 6 grupos diferentes — só CSS, zero TSX. Padding reduzido em ~4-6px, números aumentados em ~4px pra criar hierarquia mais forte.

## Mudanças aplicadas em `src/index.css`

| Bloco | Padding (antes → depois) | Número (antes → depois) | Outros |
|---|---|---|---|
| `.kpi-card` | 20px → 16px 18px | — | — |
| `.kpi-icon` | — | — | 36×36 → 30×30, margin-bottom 14 → 8 |
| `.kpi-label` | — | — | margin-bottom 6 → 4 |
| `.kpi-val` | — | 24 → 28 | margin-bottom 6 → 4 |
| `.trend-card` | 14×16 → 12×14 | — | min-height 96 removido, gap 4 → 2 |
| `.trend-card-value` | — | 22 → 26 | weight 700 → 800, letter-spacing -0.3 → -0.5 |
| `.mkt-tile` | 12×14 → 10×12 | 22 → 26 | mkt-tile-lbl margin-top 6 → 4 |
| `.wr-block` (2x) | 14×16 → 12×14 | — | — |
| `.wr-unit-val` (2x) | — | 22/20 → 26 | letter-spacing -0.4 → -0.5 |
| `.jat-kpi` | 12×14 → 10×12 | 22 → 26 | — |

## Resultado

- `npx tsc --noEmit` limpo
- `npm run build` em 259ms, sem warnings
- Cards mais compactos, números maiores — mais informação por scroll

## Próximo plan

**10-03: Badges por categoria + cores por unidade aplicadas.** Trazer a identidade cromática pro miolo dos cards (chips por categoria de gasto, badges por unidade nos KPIs de Vendas, cores consistentes nos gráficos).
