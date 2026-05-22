# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 5: Gráficos e comparativos

## Current Position

Milestone: v0.1 MVP
Phase: 5 of 7 (Gráficos e comparativos) — Em progresso (2 de 3 plans)
Plan: 05-02 completo (loop fechado)
Status: Pronto pra planejar o plano 05-03 (filtro global de período)
Last activity: 2026-05-22 — UNIFY do 05-02 (SUMMARY criado, gráficos validados)

Progress:
- Milestone: [███████░░░] 68%
- Phase 5: [██████░░░░] 67% (05-01 ✓, 05-02 ✓, 05-03 pendente)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop fechado — plano 05-02 completo]
```

Próximo: abrir o loop do plano 05-03 com /paul:plan (filtro global de período).

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
Stopped at: Loop do plano 05-02 fechado — gráficos Meta Ads e delivery entregues e validados. SUMMARY criado. Phase 5 ganhou um 3º plano (05-03, filtro global) a pedido do Doug.
Next action: /paul:plan para abrir o plano 05-03 (filtro global de período no topo). Decisão-chave: substituir ou sincronizar os seletores 7/30/60 já existentes.
Resume file: .paul/phases/05-graficos-comparativos/05-02-SUMMARY.md

---
*STATE.md — Updated after every significant action*
