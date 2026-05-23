# Gap Audit: HTML antigo vs React (Phase 11 discovery)

> Auditoria sistemática do `painel-diario_BKP_2026-05-16_v7-atual.html` (5832 linhas) contra as 12 sections + 18 components do React. Triagem por probabilidade de uso diário pelo Doug. Itens marcados "não existe" são gaps reais — não estão em outra section com nome diferente.

---

## 🔴 Alta probabilidade de uso diário (priorizar)

1. **Painel de Alertas Operacionais (anomaly detection)** — bloco escuro com até 5 alertas automáticos: dia <50% da média 14d (crítico), pico >130% (positivo), queda WoW >15% por canal, dias úteis sem registro nos últimos 14d, novo recorde semanal/mensal. HTML: `painel-diario.html:4793-4970` (`detectAnomalies` + `renderAlerts`). React: **não existe** (TrendsSection mostra ▲▼% por métrica, mas não detecta anomalia). Doug provavelmente abre o painel pra "ver se tem algo errado" — esse é o componente que responde isso sem precisar interpretar números.

2. **Sparklines nos KPIs** — todo KPI hero do antigo (Vendas Totais, PDV, iFood, AnotaAi, Investimento, Alcance, Impressões, Cliques, CTR, CPM, CPC, Frequência) tem mini-gráfico de linha embaixo mostrando a tendência diária do período. HTML: `renderSparkline` em `painel-diario.html:3399`, usado em `renderKPIs:3661-3664` e `renderAdsKpis:3979-3998`. React: **não existe** em nenhum KPI. Pequeno mas é o que faz o número virar "história".

3. **5 KPIs de Vendas em vez de 2** — antigo tinha hero "Vendas Totais" + cards separados de "PDV", "iFood", "AnotaAi" e "Item Mais Vendido" todos visíveis no topo. HTML: `painel-diario.html:3611-3658`. React `SalesSection.tsx:167-181` mostra **só 2 KPIs** (Total geral + Ticket médio); o breakdown PDV/iFood/AnotaAi aparece dentro de cada unit-card como sub-linha (menos visível). Doug pediu visão imediata de quanto cada canal rendeu.

4. **Gráfico de linha temporal Meta Ads (Investimento + Impressões)** — eixo Y duplo, série diária, no período filtrado. HTML: `renderAdsTimeChart` em `painel-diario.html:4001-4060`. React: **não existe** — `MetaAdsAnalysisSection` tem só donuts por categoria/unidade e os KPIs; `AdsCharts.tsx` está no projeto mas não é usado por nenhuma section. Sem ele, não dá pra ver "o investimento de ontem se traduziu em impressão hoje".

5. **Hero "Item Mais Vendido"** — KPI dedicado mostrando o produto líder no topo do dashboard. HTML: `painel-diario.html:3622-3627`. React: **não existe como KPI** — só dentro de `WeeklyRecap` (top 3 da semana, longe do topo) e `TopProductsChart` (lista). Doug usaria pra responder "o que tá saindo mais hoje?" sem precisar rolar.

6. **Pílulas de cobertura de meses (missing data)** — barra `❌ ✅ ⚠️` mostrando por mês se a planilha está completa (`✅`), incompleta (`⚠️ Xd`) ou sem dados (`❌`). HTML: `checkMissing` em `painel-diario.html:5024-5052`. React: **não existe**. Pra um painel que depende de planilhas externas, isso é o "indicador de saúde do dado" que evita o Doug olhar número errado.

7. **Filtros globais Unidade + Canal + Comparação visíveis no topo** — antigo tinha select `fUnidade`, `fCanal`, `fCmpMode` ao lado do date picker. HTML: `painel-diario.html:1659-1685`. React tem o FilterProvider e o seletor de período, mas Unidade/Canal/Comparação **estão dispersos ou implícitos** — verificar se o Header expõe os 3 com mesma proeminência (Phase 11-02 deve ter feito parte; conferir UI real).

8. **Resumo Semanal pronto pra copiar (WhatsApp)** — `copyWeeklyRecap` exporta o bloco formatado com `*negrito*` markdown pra colar no WhatsApp + função `downloadWeeklyRecap`. HTML: `painel-diario.html:5746-5790`. React `WeeklyRecap.tsx`: **mostra os dados, mas sem botão de copiar/exportar**. Esse era o caso de uso central: "segunda de manhã copio o resumo da semana e mando no grupo". Falta o botão.

9. **CTR por Objetivo de Campanha (3 cards: Performance / Engajamento / Alcance)** — separa CTR útil das campanhas de venda do "ruído" de campanhas de branding. HTML: `renderAdsCtrByGoal` em `painel-diario.html:3858-3891`. React: **não existe**. Doug provavelmente não interpreta CTR cru — esses 3 cards traduzem "vendas tão dando clique?" vs "branding tá só impressão" sem precisar pensar.

10. **Tabela "Por Categoria" Meta Ads com 6 colunas + delta inline** — Categoria | Investimento | Impressões | Alcance | CTR | Δ Invest. Cada célula tem o ▲▼% inline embaixo do número. HTML: `renderAdsByCategory` em `painel-diario.html:4062-4120`. React tem só o donut + tabela de % (`MetaAdsAnalysisSection.tsx:110-125`), **sem deltas, sem impressões/alcance/CTR por categoria**.

11. **Lista de campanhas individuais Jatiúca (com nome, % atribuído quando split)** — mostra cada campanha que rodou pra Jatiúca, ordenada por impressões, com tag "(50% atribuído)" pra splits. HTML: `painel-diario.html:4178-4205`. React `JatiucaVisibilityCard.tsx`: **mostra só os agregados** (Investimento/Alcance/Impressões/Cliques). Doug provavelmente quer saber QUAIS campanhas, não só o total.

12. **Frases-resumo em prosa nos KPIs** — antigo tinha texto tipo "vs. R$ 12.300 (01/05 – 07/05)" embaixo do KPI quando comparação ativa. React `SalesSection.tsx:75` tem só o tooltip `title="vs R$ X"` — texto escondido até dar hover. Doug não vai dar hover, vai querer ler.

---

## 🟡 Uso possível, mas não vital

13. **Gráfico "Faturamento por Canal" (barras PDV/iFood/AnotaAi)** — barras simples lado a lado mostrando contribuição de cada canal no período. HTML: `renderCanal` em `painel-diario.html:3738-3759`. React: **não existe como gráfico** (existe nas unit-cards como números). Útil pra comparação visual rápida; média prioridade porque o número já tá nos cards.

14. **Linha tracejada de comparação no gráfico de vendas diárias** — quando `cmpMode` ativo, o antigo desenhava série do período anterior em tracejado por cima. HTML: comportamento de `renderLine` em `painel-diario.html:3677` (precisa confirmar). React `SalesLineChart.tsx`: **aceita `cmpRows` prop** mas não está claro se renderiza como tracejado distinto.

15. **Média histórica R$/dia nas unit cards (≥8 semanas)** — referência "— média histórica: R$ 950/dia" só aparece se a unidade tem ≥8 semanas de dados. HTML: `buildUnitCard:3809-3811` + `histRatePerDay:3816-3827`. React `PatternsSection.tsx:25-49` tem `computeHistRate` mas usa só nos cards de Padrões — não aparece nas unit cards de Vendas (SalesSection).

16. **Toggle Mensal/Semanal pro gráfico de linha de vendas** — antigo tinha `setLineView` que mudava agrupamento da série. HTML: `painel-diario.html:5086`. React: já documentado no PROJECT.md como "Carryover do v0.1" — Doug optou por isolar, revisitar se sentir falta.

17. **Sumário de "% do invest." e "% do alcance" em cada unit card Meta Ads** — antigo: `<span class="share">${shareSpend.toFixed(0)}% do invest. · ${shareReach.toFixed(0)}% do alcance</span>`. HTML: `painel-diario.html:4150`. React `MetaAdsAnalysisSection`: tem só % do invest no breakdown table; **não tem % do alcance por unidade**.

18. **Nota de "(X linhas de campanhas Jatiúca-tagged no período)"** — feedback explícito de quantas campanhas o detector achou. HTML: `painel-diario.html:4171`. React: subtítulo do card é genérico ("Quanto a unidade está sendo mostrada"); **não diz quantas campanhas detectou** — Doug não tem como saber se a regex pegou tudo.

19. **Diferenciação visual cards "perf/eng/alc" (cores distintas por objetivo)** — antigo: `ads-goal-card.perf` (azul vendas), `.eng` (amarelo), `.alc` (cinza). HTML: `painel-diario.html:3846-3856`. React tem `ADS_GOAL_GROUPS` definido em `lib/adsCategory.ts` mas o donut **mistura tudo no mesmo gradient** — não dá pra olhar de relance e saber "qual fatia é vendas".

20. **Diário de Operações (DiarioSection) — feed visível no topo** — antigo `painel-diario.html:2195-2230` posicionava o Diário próximo do topo na ordem natural. React `DiarioSection.tsx`: existe, mas posição depende do `Dashboard.tsx` (conferir). Se está no fim, o uso cai. (média porque depende da ordem real).

21. **Botão "Limpar cache de Meta Ads"** — `clearAdsCache` em `painel-diario.html:2667`. React: faz upload novo, mas não tem botão explícito de limpar. Útil quando Doug subiu CSV errado.

22. **Exportação semanal como PNG/download** — `downloadWeeklyRecap` em `painel-diario.html:5775` gera imagem da semana. React: **não existe**. Phase 13 trata exportação PNG/PDF — pode aguardar.

23. **"Dias com dados" vs "dias úteis no período"** — antigo mostrava "X dias de operação" nas unit cards. React mostra "X dia(s) com dados" mas **não distingue** dias sem operação real (domingo) de dias faltantes na planilha.

24. **Tooltip rico no heatmap** — antigo: tooltip mostrava data, valor, dia da semana e % vs média do dia. HTML: `getHeatmapTooltip:4511`, `showHeatmapTooltip:4519` + cálculo `pct = ((d.val - avg) / avg) * 100` em `painel-diario.html:4626`. React `SalesHeatmap.tsx`: conferir se mostra esse delta vs média; provavelmente tooltip mais simples.

25. **Renderização condicional "ainda sem dados Meta Ads" com instrução de upload** — texto explicativo + atalho `📣 Meta Ads` no canto direito. HTML: `painel-diario.html:3937-3945`. React: tem estado vazio mas mensagem pode estar menos pedagógica.

---

## ⚪ Provavelmente nostalgia/irrelevante

26. **MovimentoSection (covers no salão)** — já documentado em PROJECT.md como **Out of Scope**, não portar.

27. **`drpRenderPresets` com 12 atalhos exatos do antigo** — React `DateRangePicker.tsx` já tem presets; nomes/quantidade exatos não são "uso diário".

28. **Sparkline com gradiente em curva spline** — detalhe cosmético, não funcional.

29. **Tooltip externo customizado (`externalTooltipHandler`)** — antigo tinha tooltip Chart.js customizado renderizado em DOM. React usa tooltip default Chart.js — funciona, só não tem o estilo "branded" do antigo.

30. **Função `wireUpload`/`wireAdsUpload`** — wiring vanilla JS, substituído por componentes upload no React. Não é gap, é arquitetura.

31. **`copyToClipboard` genérico** — utility do antigo; React pode usar `navigator.clipboard.writeText` direto onde precisar. Útil quando portar o "copiar resumo da semana" (#8).

32. **JSONP fallback (`fetchViaJSONP`)** — workaround antigo pra CORS de Google Sheets. React usa Supabase como middleware, irrelevante.

---

## 📐 Diferenças de UX/densidade

- **Antigo: ~10 KPIs visíveis sem scroll no topo (5 Vendas + 8 Meta Ads = 13 cards estavam acima da dobra)**. React: ~6 visíveis (2 Vendas + 4 nos heroes). O Doug sente menos "informação por olhada".
- **Antigo: tabelas com bordas finas dividindo dados (`mom-table`, `ads-cat-table`, `data-table`)**. React: mantém isso bem em `DataTableSection`, mas `MetaAdsAnalysisSection` substituiu tabela rica de categoria por donut + tabela de só 3 colunas.
- **Antigo: deltas inline (`▲ 12.3%`) embaixo de cada número dentro das tabelas Meta Ads**. React: deltas só aparecem nos KPI heroes principais; tabelas de Meta Ads perderam isso.
- **Antigo: cores por objetivo de campanha (azul performance, amarelo engajamento, cinza alcance) consistentes entre donut, tabela e cards**. React: paletas dispersas, sem código de cor sistemático por objetivo.
- **Antigo: agrupamento visual por "fonte" (Vendas / Meta Ads / Anota AI / Marketing) com fundos sutilmente distintos**. React: tem o `is-source-*` no className das sections — conferir se a diferença visual está forte o suficiente pra Doug "navegar por seção".
- **Antigo: mensagem de "freshness" — quanto tempo desde a última atualização** (`updateFreshness:2821`). React: `SyncStatusBadge.tsx` faz isso, mas pode estar menos visível que o antigo.
- **Antigo: badge "(50% atribuído)" cinza claro ao lado do nome da campanha split**. React: lógica de split existe (`splitOf`) mas não é mostrada na UI.
- **Antigo: nas unit cards de vendas, share % no canto superior direito ("32.5% do período")**. React: tem unit-card-badge mas conferir se mostra share %.
- **Antigo: hero card em gradient verde (`kpi-hero`) destacando "Vendas Totais"**. React: hero preto/dourado (mudança intencional Phase 8 — não é gap, é decisão).

---

## 🧮 Cálculos/agregações ausentes

- **Detecção de anomalia: dia atual / média móvel 14 dias** — `movingAverage:4780` + `detectAnomalies:4793`. React não calcula MA nem ratio vs média.
- **Comparação WoW (week-over-week) por canal** — antigo descarta semana parcial e compara última fechada vs anterior, com threshold -15%. React não tem essa lógica isolada.
- **Detecção de dias úteis sem registro (Seg-Sáb) nos últimos 14 dias** — antigo agrega num único alerta por unidade. React: PatternsSection mostra heatmap mas não detecta lacuna.
- **Recorde semanal/mensal** — antigo compara última semana/mês contra histórico todo (`Math.max(...weeks.slice(0, -1).map(w => w.total))`). React: não tem.
- **% vs média do dia da semana no heatmap** — antigo calcula `pct = ((d.val - avg) / avg) * 100` por dia da semana e mostra no tooltip. Conferir no React.
- **CTR ponderado por objetivo de campanha** — agregação de cliques/impressões filtrando por `ADS_GOAL_GROUPS`. React tem a função `goalGroupOf` mas não calcula CTR por grupo.
- **Frequência diária Meta Ads (impressions/reach por dia)** — antigo calcula no sparkline em `painel-diario.html:3994`. React tem o KPI agregado, não a série diária.
- **Sinergia "dias com pago + orgânico no mesmo dia"** — `painel-diario.html:5650-5658` conta interseção. React `MarketingUnif.tsx`: mostra % paid reach mas **não** mostra sinergia diária (quantos dias com ambos).
- **CPC, CPM, Frequência por categoria de campanha** — antigo calcula em `aggregateAds(rows, filter)`; React calcula só pro total geral.

---

## Resumo executivo

**Os 5 gaps que provavelmente mais machucam o uso diário do Doug:**

1. Painel de Alertas (anomalias automáticas) — o componente "me avisa se tem algo errado"
2. Sparklines em todos os KPIs — transforma número solto em tendência
3. KPIs PDV/iFood/AnotaAi separados no topo de Vendas — visão imediata por canal
4. Gráfico de linha temporal Meta Ads (gasto × impressões diário) — falta total no React
5. Botão de copiar Resumo da Semana pro WhatsApp — caso de uso central perdido

**Diferença de densidade**: o painel antigo entregava ~2× mais "sinais por scroll" que o React. A migração ganhou em código limpo e Realtime, mas perdeu na sensação de "abro e já sei tudo" que o monolítico HTML dava.

**Próximo passo sugerido (Doug)**: priorizar os 5 itens acima como Phase 11-04 (ou nova milestone v0.3), validar visualmente cada um abrindo o painel antigo lado a lado com o React.

---

*AUDIT.md — gerado em 2026-05-23 como discovery puro de Phase 11. Sem plan PAUL associado.*
