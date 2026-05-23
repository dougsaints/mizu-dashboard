---
phase: 06-correlacoes-analise-cruzada
plan: 04
status: complete
completed_at: 2026-05-23
---

# 06-04 SUMMARY — Análise de Produtos (Donut + Pareto)

## O que foi entregue

Nova `ProductsAnalysisSection` entre `DataTableSection` e `RoiSection`. Dois gráficos lado a lado (no desktop):

1. **Mix por Categoria** — donut com 1 fatia por categoria do snapshot mais recente do período, ordenado por unidades desc. Tooltip mostra `Categoria: X un (Y%)`. Texto central no donut com total geral de unidades.

2. **Concentração de Vendas (Pareto)** — gráfico misto Chart.js:
   - Barras: top 20 produtos por quantidade vendida, coloridas pela categoria
   - Linha: % acumulado vs **total geral** (não só dos 20 — fiel ao painel original)
   - Eixos: Y esquerdo "X un", Y direito "0-100%"
   - Tooltip por dataset (barra mostra qty + categoria; linha mostra "Acumulado: X,X%")

Ambos os charts respeitam `useFilters` (período + unidade). Channel não afeta — Anota AI é delivery, não tem canal.

## Arquivos criados/modificados

**Criados:**
- `src/lib/categoryColors.ts` — `categoryColor(cat)` heurística (sushi/hot-roll/combinado/bebida/sobremesa/entrada/yakisoba) + fallback determinístico (hash → paleta de 8 cores). Plus `withAlpha(hex, alpha)`.
- `src/components/CategoryDonutChart.tsx` — donut + total central
- `src/components/ParetoChart.tsx` — gráfico misto (bar + line) usando `<Chart type="bar" />` de react-chartjs-2
- `src/sections/ProductsAnalysisSection.tsx` — orquestrador que filtra snapshot mais recente do período

**Modificados:**
- `src/pages/Dashboard.tsx` — lazy + Suspense pra nova seção
- `src/index.css` — bloco "Análise de Produtos (Phase 6-04)" (~60 linhas)

## Decisões tomadas

1. **Snapshot mais recente DENTRO do range** — `inRange = products[snapshot_date in [start, end]]`, depois `max(snapshot_date)`. Não usa o snapshot global mais recente porque ele pode estar fora do filtro de período. Consistente com a forma como `TrendsSection` lida com Anota AI (snapshot semanal cumulativo).

2. **Total geral do Pareto inclui TODOS os produtos do snapshot, não só top 20** — fiel ao HTML original. A linha cumulativa converge pra <100% se o top 20 não cobre tudo (caso comum). É a métrica honesta: "top 20 = X% do total" mostra concentração real.

3. **Categorias heurísticas via regex** — mapeamento manual de palavras-chave comuns (`sushi|sashimi|nigiri|temaki`, etc.). Para categorias fora da lista, fallback determinístico via hash da string → paleta de 8 cores. Garante que "Yakisoba" sempre tenha a mesma cor, mesmo sem hardcode.

4. **`unitId` filtra Anota AI também** — diferente da decisão de Phase 5 que NÃO filtra Meta Ads por unit. Aqui, `anotaai_products.unit_id` é mais confiável (a maioria das rows tem unit_id preenchido). Filtra também rows com `unit_id === null` (não dá pra atribuir), pra não esconder o dado.

5. **Donut com legenda à direita + total no centro** — combinação compacta: cores via legenda, magnitude central. No mobile, o `donut-center-total` perde margin-left negativa pra centralizar (sem legenda à direita).

6. **`<Chart type="bar" />` com cast pra `ChartData<'bar'>`** — react-chartjs-2 não tem export `<Mixed>` ou similar. O `type="bar"` no componente é só pra registrar tipo base; cada dataset define seu próprio `type` interno. Cast é seguro porque o ChartJS aceita datasets heterogêneos no runtime.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa, novo chunk `ProductsAnalysisSection-*.js` (5.94KB / 2.52KB gzip)
- [x] Chunk principal 69KB (vs 68KB antes, +0.5KB — desprezível)
- [x] Lazy + Suspense individual
- [ ] **Validação visual pendente:** Doug confere com snapshot real do Anota AI

## Acceptance criteria

- [x] AC-1: `categoryColor()` retorna cor consistente; heurísticas + fallback determinístico
- [x] AC-2: Donut com fatias por categoria, tooltip "X un (Y%)", empty state
- [x] AC-3: Pareto top-20 com barras coloridas + linha cumulativa 0-100%, tooltip dual
- [x] AC-4: ProductsAnalysisSection filtra snapshot recente do período + unidade
- [x] AC-5: Visual integrado, grid 2 colunas → 1 no mobile, lazy + Suspense

## Issues deferidas

- **Linha 80% horizontal de referência no Pareto** — fácil de adicionar (annotation plugin), mas opcional. Effort XS.
- **Drill-down: clicar na fatia do donut filtra produtos por categoria** — não no escopo. Effort M.
- **KPIs de produtos (ticket médio delivery, mix de preços)** — precisaria de mais dados na tabela `anotaai_products` (preço unitário não está lá). Effort M se ampliar schema.
- **Mostrar comparativo entre snapshots (atual vs anterior)** — análise temporal de cardápio. Effort M, valor incerto.

## Próximo passo

PLAN 06-05 — Heatmap semanal de faturamento + Comparação justa por unidade (últimos 2 gaps amarelos).
