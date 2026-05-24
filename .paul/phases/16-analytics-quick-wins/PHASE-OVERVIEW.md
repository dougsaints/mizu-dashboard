# Phase 16 — Analytics quick wins (high impact / low effort)

**Milestone:** v0.3 Arquitetura Multi-Página + Analytics Aprofundadas
**Status:** Not started
**Depends on:** Phase 15 (chart theme tokenizado pra novas visualizações já nascerem com paleta única)

## Goal

Adicionar análises estado-da-arte F&B identificadas na pesquisa Toast/Delaget/Square/iFood (2025/2026), priorizadas por **alto impacto e baixo effort** — todas funcionam com dados que já temos.

## Scope

| # | Análise | Onde | Por quê |
|---|---------|------|---------|
| 1 | **Comparativo YoY / WoW lado-a-lado** | Vendas + Marketing | Tendência crítica que hoje só aparece como delta % isolado |
| 2 | **Sazonalidade decomposta** (trend + seasonal + residual visual) | Padrões | Toast/Square mostram intra-semana + mensal + eventos separados |
| 3 | **Waterfall de variação** ("vendas caíram -20%: -10% Meta, -5% iFood, -5% restante") | Hoje (landing) | Explica "por que mudou" — padrão Toast Signals AI |
| 4 | **Saturação de audiência Meta** (frequency >3 = saturando) | Marketing | Meta expõe esse dado, hoje não usamos |
| 5 | **Distribuição de ticket** (boxplot, não só média) | Vendas | Média esconde cauda — padrão F&B 2026 |
| 6 | **Cancellation / refund rate delivery** | Padrões / Operação | iFood/AnotaAi exposem |

## Plans estimados

5-6 plans (1 por análise, ou agrupar 2 mais leves)

## Fontes

- [Toast — Data Science for Restaurants](https://pos.toasttab.com/blog/on-the-line/data-science-for-restaurants)
- [Toast Signals AI](https://restauranttechnologynews.com/2025/12/toast-signals-next-phase-of-restaurant-technology-competition-with-expanded-focus-on-ai-driven-operations/)
- [iFood Parceiros — Métricas](https://blog-parceiros.ifood.com.br/metricas-ifood/)

## Adiado pra v0.4+

Análises de alto impacto mas effort L (requerem mudança de schema):
- RFM + cohort de clientes delivery (precisa `customer_id` no iFood/AnotaAi)
- LTV / CAC por canal (depende do anterior)
- Menu engineering matrix (BCG) — precisa cadastrar custo unitário por produto
- Geo-heatmap bairros entrega — precisa parsear CEP do CSV
- Forecast 7-30d com confidence interval (Holt-Winters) — viável mas escopo grande
- Anomaly detection com root-cause GenAI — requer LLM call paga
