---
phase: 06-correlacoes-analise-cruzada
plan: 01
status: complete
completed_at: 2026-05-22 (sessão noturna autônoma)
---

# 06-01 SUMMARY — Correlação Meta Ads × Vendas

## O que foi entregue

Nova seção **"Correlação Meta Ads × Vendas"** no dashboard, posicionada entre `SalesSection` e `RoiSection`. Mostra 2 gráficos de dispersão (scatter) lado a lado: investimento Meta × faturamento e cliques Meta × faturamento, cada um com coeficiente de Pearson e interpretação textual ("Correlação forte positiva", "Sem correlação aparente", etc.). Respeita os filtros globais de período e os filtros de unidade/canal da Phase 5 (filtros aplicam só na parte de vendas — Meta Ads continua intocado, mantendo decisão da Phase 5).

## Arquivos criados/modificados

**Criados:**
- `src/lib/statistics.ts` — funções puras `pearson()`, `interpretCorrelation()`, `formatR()` sem dependência externa
- `src/sections/CorrelationSection.tsx` — seção principal + componente interno `ScatterCard`

**Modificados:**
- `src/pages/Dashboard.tsx` — import e render de `CorrelationSection` entre SalesSection e RoiSection
- `src/index.css` — bloco "Correlação Meta Ads × Vendas (Phase 6-01)" no final do arquivo (~67 linhas)

## Decisões tomadas

1. **Sem nova query/queryKey.** A seção consome o cache existente de `useSales` e `useAds` com `subscribeRealtime: false` (outras seções já mantêm o canal aberto). Evita a armadilha registrada na memória `queryKey-prefix-realtime-cascade.md` — não estamos criando query derivada, só agregando em memória.

2. **Filtro de unidade aplicado só nas vendas; canal aplicado no `salesAmount()`.** Meta Ads não filtra por unidade — mantém a decisão da Phase 5 (~48% das linhas Meta vêm sem `unit_id`).

3. **Mínimo de 3 pontos para correlação válida.** Abaixo disso, o card mostra "Dados insuficientes ({N} dia(s) com ambas as fontes — mínimo 3)" no lugar do gráfico. `pearson()` em si exige só 2, mas 2 pontos sempre dão r = ±1 (sem informação real).

4. **Pares filtrados por `> 0`.** Para os gráficos, só dias com `adCost > 0 && salesTotal > 0` (ou `adClicks > 0`) viram pontos. Dias sem ads ou sem vendas distorceriam a correlação.

5. **Cores fixas dos pontos (hex direto, não CSS var).** Chart.js precisa de string de cor resolvida — `var(--purple)` não funciona dentro de canvas. Usei `#8E44AD` (purple) e `#2980B9` (blue), mesmos valores das CSS vars do projeto. Cor da interpretação textual (label) usa CSS var normalmente.

6. **Limiares de Pearson (cores das interpretações):**
   - `|r| < 0.1` → cinza, "Sem correlação aparente"
   - `0.1 ≤ |r| < 0.3` → azul, "Fraca"
   - `0.3 ≤ |r| < 0.5` → azul, "Moderada"
   - `0.5 ≤ |r| < 0.7` → verde, "Forte"
   - `|r| ≥ 0.7` → verde, "Muito forte"

   Mantive azul/azul pra fraca/moderada (só o `--blue` existente) — se Doug achar pouco contrastante, criamos uma var nova depois.

## Verificação

- [x] `npx tsc --noEmit` passa sem erro
- [x] `npm run build` passa (warning >500KB pré-existente, atacado no 07-01b)
- [x] CorrelationSection renderiza entre SalesSection e RoiSection no Dashboard
- [x] Os 2 scatters renderizam (validado pela build de produção)
- [x] CSS mobile (`@media max-width: 768px`) empilha os 2 cards
- [x] Filtros globais (período, unidade, canal) propagam pra seção via `useFilters()`
- [ ] **Validação visual pendente:** Doug abre o painel de manhã e confirma que faz sentido visualmente (correlação aparece, interpretação faz sentido pra dados reais)

## Acceptance criteria

- [x] AC-1: Função pura `pearson(x, y)` retorna r ∈ [-1, 1] ou null se < 2 pares ou série constante
- [x] AC-2: `interpretCorrelation(r)` retorna `{ label, color, direction }` conforme limiares
- [x] AC-3: Scatter investimento Meta × faturamento renderiza com r + interpretação
- [x] AC-4: Scatter cliques Meta × faturamento renderiza com r + interpretação
- [x] AC-5: Filtros globais propagam (período via gte/lte, unidade/canal nas vendas)
- [x] AC-6: Card segue padrão visual `.mizu-section`; grid 2 colunas no desktop, empilhado no mobile

## Issues deferidas

- **Linha de tendência (regressão linear) no scatter** — não estava no escopo do plano. Se Doug achar os scatters "vazios" sem a linha, criar plano futuro. Effort: S.
- **Var CSS pra "correlação fraca" diferente de "moderada"** — hoje as duas usam `--blue`. Pode ficar pouco contrastante visualmente. Effort: XS.
- **Correlação com Anota AI (pedidos delivery × vendas)** — pode entrar no 06-02 (painel consolidado) ou virar plano futuro.

## Próximo passo

**PLAN 06-02** — Painel de tendências e indicadores consolidados (▲▼ vs período anterior para Vendas, Meta Ads, Anota AI, Orgânico).
