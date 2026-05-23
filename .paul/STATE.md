# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 5: Gráficos e comparativos

## Current Position

Milestone: v0.1 MVP
Phase: 5 of 7 (Gráficos e comparativos) — APPLY completo, aguardando UNIFY
Plan: 05-05 aplicado, checkpoint visual aprovado ("parece aprovado")
Status: Pronto pra UNIFY (fecha Fase 5 + MVP v0.1 em 100%)
Last activity: 2026-05-22 — APPLY do 05-05 + fix de cascade de invalidation (loop ERR_INSUFFICIENT_RESOURCES resolvido)

Progress:
- Milestone: [██████████] ~98% (falta só UNIFY do 05-05)
- Phase 5: [██████████] 100% (todos os 5 plans aplicados)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ○     [APPLY completo, aguardando UNIFY]
```

Próximo: Doug digita /paul:unify .paul/phases/05-graficos-comparativos/05-05-PLAN.md

## Accumulated Context

### Decisions

| Decision | Phase | Impact |
|----------|-------|--------|
| Vercel free tier para hospedagem | Init | Deploy via GitHub, sem custo |
| Sem auth no MVP | Init | Acesso por URL; phase1_anon_access policy no banco |
| Upload manual Meta Ads CSV | Phase 2 | Meta não tem API gratuita; padrão reutilizável para outras fontes |
| ROI salvo no Supabase | Phase 4 | Mike e Gab veem o mesmo número (antes era localStorage de 1 aparelho) |
| MarketingUnif: total real + fatia paga | Phase 4 | Não estima orgânico = total − pago (estimativa imprecisa, descartada) |
| PAUL é o sistema oficial de planejamento | Phase 4 | Toda feature passa pelo loop PAUL; registrado no CLAUDE.md |
| 2026-05-22: Gráfico de vendas com uma linha por unidade | Phase 5 | Compara Serraria vs Jatiúca; padrão de gráfico Chart.js para 05-02 |
| 2026-05-22: Meta Ads com 2 gráficos; delivery usa snapshot mais recente | Phase 5 | Custo e alcance separados (escalas diferentes); não soma snapshots do Anota AI |
| 2026-05-22: Hooks Realtime devem usar canal com nome único por instância | Phase 5 | Nome fixo colide com 2+ consumidores; corrigido no useAds, latente nos demais |
| 2026-05-22: Período é intervalo de datas (start/end), filtro global via Context | Phase 5 | useSales/useAds filtram por .gte/.lte; barra de filtros completa pedida pelo Doug, dividida em 05-03/04/05 |
| 2026-05-22: Filtros Unidade/Canal afetam só Vendas (dados das outras fontes incompletos) | Phase 5 | Meta Ads tem ~48% sem loja, Anota AI 100% sem loja; filtrar lá esconderia dado |
| 2026-05-22: Renomeado para FilterProvider/useFilters; setters preservam outros campos | Phase 5 | Contexto único para todos os filtros globais (período + unidade + canal); padrão pra 05-05 |
| 2026-05-22: Toggle "Análise por" Mensal/Semanal afeta SÓ a AnalysisSection (não vaza pro gráfico de linha de Vendas) | Phase 5 | Decisão (a) do plano 05-05; estender no futuro fica como Deferred Issue |
| 2026-05-22: queryKey de queries derivadas NÃO deve compartilhar prefix com a fonte invalidada por Realtime | Phase 5 | useSalesComparison começava com QK_SALES → cada Realtime event do range atual cascadeava refetch da comparison; causou loop com saturação ERR_INSUFFICIENT_RESOURCES. Fix: QK_SALES_CMP separada + staleTime 10min |
| 2026-05-22: Hooks consumidos por múltiplos componentes ganharam opt-out de Realtime (subscribeRealtime?: false) | Phase 5 | AnalysisSection passa false em useSales/useAds porque SalesSection/MarketingUnif/AdsUploadCard já mantêm o canal aberto; cache compartilhado por queryKey. Evita saturar limite de conexões do browser em StrictMode dev |

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Autenticação de usuários | Init | M | Phase 7 |
| Hospedagem Vercel | Init | S | Phase 7 |
| Filtro global de período no topo do sistema (pedido do Doug em 22/05 durante o 05-02) | Phase 5 | M | Plano 05-03 — decisão pendente: substituir ou sincronizar os seletores 7/30/60 já existentes |
| Estender toggle Mensal/Semanal pro gráfico de linha de Vendas (opção (c) do plano 05-05) | Phase 5 | S | Phase 6 ou pós-MVP — Doug optou por manter isolado na AnalysisSection; revisitar se sentir falta usando |
| Bundle JS em ~738KB (warning Vite >500KB) | Phase 5 | S | Phase 7 — usar dynamic import() / code-splitting antes do deploy Vercel |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-22
Stopped at: APPLY do 05-05 completo. react-engineer entregou T1-T3, eu qualifiquei e achei 1 GAP (badges não estavam no breakdown PDV/iFood/Anota AI), corrigido. Checkpoint visual revelou loop ERR_INSUFFICIENT_RESOURCES — diagnosticado como spec issue (queryKey da comparison compartilhava prefix com QK_SALES → cascata de invalidation por Realtime). Fix aplicado: QK_SALES_CMP separada + opt-out de Realtime em hooks multi-consumer. App estabilizou (88 erros baseline). Doug "parece aprovado".
Next action: Doug digita /paul:unify .paul/phases/05-graficos-comparativos/05-05-PLAN.md
Resume file: .paul/phases/05-graficos-comparativos/05-05-PLAN.md

---
*STATE.md — Updated after every significant action*
