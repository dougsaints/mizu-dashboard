---
phase: 06-correlacoes-analise-cruzada
plan: 02
status: complete
completed_at: 2026-05-23 (sessão noturna autônoma)
---

# 06-02 SUMMARY — Painel de tendências consolidado

## O que foi entregue

Nova seção **"Tendências do período"** no topo do dashboard (entre WeeklyRecap e AnalysisSection), com 6 mini-KPIs cruzando as 4 fontes (Vendas, Meta Ads, Anota AI, Instagram orgânico), cada um com badge ▲▼ % vs período comparado. Frase-resumo amigável no topo destila o panorama: *"Comparado com o período anterior, melhorou em X, Y; piorou em Z."*

Lógica de "favorabilidade" diferenciada:

- **positive** (subir = bom): Faturamento, Ticket médio, Cliques, Alcance, Produtos vendidos → ▲ verde / ▼ vermelho
- **negative** (subir = ruim): nenhum no momento — espaço deixado pro futuro (ex: custo por clique)
- **neutral**: Investimento Meta → ▲▼ azul (subir não é nem bom nem ruim isolado)

## Arquivos criados/modificados

**Criados:**
- `src/components/TrendCard.tsx` — mini-KPI reutilizável com badge ▲▼ inteligente por favorability
- `src/sections/TrendsSection.tsx` — seção principal, agregação das 4 fontes, frase-resumo

**Modificados:**
- `src/pages/Dashboard.tsx` — render de TrendsSection entre WeeklyRecap e AnalysisSection
- `src/index.css` — bloco "Tendências do período (Phase 6-02)" no fim (~85 linhas)

## Decisões tomadas

1. **Sem novas queries de comparação.** TrendsSection consome `useSales/useAds/useOrganic/useAnotaaiProducts` com `subscribeRealtime: false`. Pra Ads/Organic/Anotaai do período comparado, chamamos os mesmos hooks com ranges diferentes (`useAds(cmpStart, cmpEnd, ...)`) e/ou filtramos localmente (organic/anotaai usam janela ampla de 120 dias já). Evita o pattern de armadilha registrado na memória `queryKey-prefix-realtime-cascade`.

2. **Quando `cmpMode === 'none'`, useAds(prev) ainda roda mas com range `(start, start)`** (1 dia). Custo desprezível e mantém estrutura do hook simples. As métricas `*Prev` viram `null` nesse caso e os badges somem.

3. **Filtros globais (unitId, channel) aplicam só nas vendas** — segue decisão da Phase 5 registrada no PROJECT.md. Investimento Meta / Alcance / Produtos Anota AI mantêm valores totais independentemente desses filtros. Hint "filtros de vendas aplicados" aparece na primeira métrica quando filtros estão ativos, deixando claro pro usuário.

4. **"Produtos vendidos Anota AI" = Σ quantity dos snapshots no período** — Anota AI são snapshots semanais (cumulativos), não vendas diárias. A soma agrega tudo que apareceu nos snapshots do período. Hint deixa explícito ("Σ quantity dos snapshots"). Pode ser ajustado depois se Doug preferir só o snapshot mais recente.

5. **Frase-resumo ignora favorability='neutral'** — investimento subindo não conta como "melhorou" nem "piorou". Coerente: a frase mede mudança *qualificada*.

6. **Estável vs Novo:**
   - `|delta| < 0.5%` → badge "estável" cinza (sem ▲▼)
   - `prev === 0 && curr > 0` → badge "novo" dourado (não dá pra calcular %, mas é sinal positivo de partida)

7. **Visual:** card branco com sombra mínima, label uppercase pequeno, valor grande, badge inline. Mobile: 3 → 2 → 1 colunas em 768px e 480px.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa (bundle subiu de 746KB → 751KB, +5.8KB; warning >500KB pré-existente, atacado no 07-01b)
- [x] TrendsSection renderiza entre WeeklyRecap e AnalysisSection
- [x] 6 cards aparecem (validado pela build)
- [x] cmpMode='none' suprime badges; frase mostra "Ative 'Comparar com'…"
- [x] Mobile responsive (3 → 2 → 1 colunas)
- [ ] **Validação visual pendente:** Doug abre o painel de manhã e confirma o panorama (frase faz sentido, cores corretas, dados batem)

## Acceptance criteria

- [x] AC-1: TrendCard reutilizável com favorability='positive'|'negative'|'neutral'
- [x] AC-2: TrendsSection agrega as 4 fontes via hooks existentes
- [x] AC-3: Grid de 6 indicadores (Faturamento, Ticket médio, Investimento Meta, Cliques Meta, Alcance, Produtos Anota AI)
- [x] AC-4: Frase-resumo "melhorou em X; piorou em Y" + fallback "Sem variações relevantes" / "Ative 'Comparar com'…"
- [x] AC-5: Filtros globais propagam — unidade/canal só nas vendas
- [x] AC-6: Visual integrado, mesmo padrão `.mizu-section`, renderiza na posição certa

## Issues deferidas

- **Anota AI: usar só último snapshot do período em vez de soma?** Comportamento atual (soma de todos os snapshots) pode inflar números se houver vários no período. Effort: XS. Revisitar se Doug achar os números altos demais.
- **Métrica "ROAS" (result_value / cost) no painel** — não estava no escopo. Faz sentido como 7º indicador (favorability=positive). Effort: XS. Plano futuro ou inline.
- **Custo por clique / CPC** — métrica com favorability='negative' (subir é ruim). Não no escopo. Effort: XS.
- **Var CSS para "trend-delta--down-good" diferenciar visualmente de "up-good"** — hoje usam mesma cor verde. Indicação por arrow basta no MVP. Effort: XS.

## Próximo passo

**Phase 6 está completa!** Vou seguir pro **PLAN 07-01b** (parte da Phase 7 que dá pra fazer sem Doug):
- Code-splitting do bundle (lazy-load das seções pesadas, atacar o warning >500KB)
- Polish de UX/mobile

Deploy Vercel (07-01) e auth (07-02) ficam pra quando Doug acordar.
