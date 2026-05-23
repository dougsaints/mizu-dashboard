---
phase: 11-portar-conteudo-html-antigo
plan: 01
status: completed
completed_at: 2026-05-24
---

## O que foi feito

Adicionado bloco de 8 KPIs Meta-only no topo do `MetaAdsAnalysisSection`: Investimento, Alcance, Impressões, Cliques, CTR, CPM, CPC, Frequência.

## Mudanças

**`src/sections/MetaAdsAnalysisSection.tsx`:**
- Adicionado `useMemo` calculando totals (cost, impressions, clicks, reach) + métricas derivadas (ctr, cpm, cpc, freq)
- Helpers `brl0`, `brl2`, `num`, `fmtOrDash` no escopo do módulo
- Bloco `<div className="meta-kpis-grid">` renderizado entre header e ads-analysis-grid quando há dados

**`src/index.css`:**
- `.meta-kpis-grid`: grid 4 colunas, responsive (2 cols < 900px, 1 col < 420px)
- `.meta-kpi`: card branco com border-top 3px azul Meta
- `.meta-kpi-lbl`: label uppercase 10px na cor `--source-meta`
- `.meta-kpi-val`: número 22px peso 800
- `.meta-kpi-sub`: subtexto 10px cinza

## Fórmulas usadas

- CTR = (cliques / impressões) × 100
- CPM = (custo / impressões) × 1000
- CPC = custo / cliques
- Frequência = impressões / alcance
- Divisão por zero → `—`

## Resultado

Build limpo 268ms. Visualmente: 8 cards azul-Meta no topo da seção, em grid 4×2 desktop.

## Próximo plan

**11-02: Tabela por categoria + cards de unidade lado a lado.** Complementa donuts existentes — tabela mostra valores absolutos + (eventualmente) delta vs período comparado por categoria; cards de unidade mostram absolute value por loja paralelo ao donut.
