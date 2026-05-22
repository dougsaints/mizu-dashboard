# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 5: Gráficos e comparativos

## Current Position

Milestone: v0.1 MVP
Phase: 5 of 7 (Gráficos e comparativos) — Em progresso (4 de 5 plans)
Plan: 05-04 completo (loop fechado)
Status: Pronto pra planejar o plano 05-05 (Comparar com + Análise mensal/semanal)
Last activity: 2026-05-22 — UNIFY do 05-04 (SUMMARY criado, filtros Unidade/Canal validados)

Progress:
- Milestone: [█████████░] 82%
- Phase 5: [████████░░] 80% (05-01 ✓, 05-02 ✓, 05-03 ✓, 05-04 ✓, 05-05 pendente)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop fechado — plano 05-04 completo]
```

Próximo: abrir o loop do plano 05-05 com /paul:plan (último da Fase 5).

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

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Autenticação de usuários | Init | M | Phase 7 |
| Hospedagem Vercel | Init | S | Phase 7 |
| Filtro global de período no topo do sistema (pedido do Doug em 22/05 durante o 05-02) | Phase 5 | M | Plano 05-03 — decisão pendente: substituir ou sincronizar os seletores 7/30/60 já existentes |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-22
Stopped at: Loop do 05-04 fechado — filtros Unidade + Canal entregues e validados. SUMMARY criado. Anotada a info de domínio: Jatiúca só opera PDV (memória do projeto).
Next action: /paul:plan para abrir o plano 05-05 (Comparar com + Análise mensal/semanal). É o último plano da Fase 5.
Resume file: .paul/phases/05-graficos-comparativos/05-04-SUMMARY.md

---
*STATE.md — Updated after every significant action*
