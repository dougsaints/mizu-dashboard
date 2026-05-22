# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 5: Gráficos e comparativos

## Current Position

Milestone: v0.1 MVP
Phase: 5 of 7 (Gráficos e comparativos) — Em progresso (1 de 2 plans)
Plan: 05-01 completo (loop fechado)
Status: Pronto pra planejar o plano 05-02
Last activity: 2026-05-22 — UNIFY do 05-01 (SUMMARY criado, gráfico de vendas validado)

Progress:
- Milestone: [██████░░░░] 61%
- Phase 5: [█████░░░░░] 50% (05-01 ✓, 05-02 pendente)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop fechado — plano 05-01 completo]
```

Próximo: abrir o loop do plano 05-02 com /paul:plan (gráficos Meta Ads e delivery).

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

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Autenticação de usuários | Init | M | Phase 7 |
| Hospedagem Vercel | Init | S | Phase 7 |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-22
Stopped at: Loop do plano 05-01 fechado — gráfico de linha de faturamento por unidade entregue e validado. SUMMARY criado.
Next action: /paul:plan para abrir o plano 05-02 (gráficos Meta Ads e delivery + seletor de período)
Resume file: .paul/phases/05-graficos-comparativos/05-01-SUMMARY.md

---
*STATE.md — Updated after every significant action*
