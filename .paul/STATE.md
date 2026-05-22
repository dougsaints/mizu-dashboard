# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 5: Gráficos e comparativos

## Current Position

Milestone: v0.1 MVP
Phase: 4 of 7 (Resumos: semana, ROI e marketing) — completa
Plan: 04-01 documentado retroativamente
Status: Fases 1-4 prontas. PAUL ressincronizado com a realidade em 22/05.
Last activity: 2026-05-22 — Commit b97421c (MarketingUnif validado no browser)

Progress:
- Milestone: [██████░░░░] 57%
- Phase 4: [██████████] 100%

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop fechado — Phase 4 completa]
```

Próximo: abrir o loop da Phase 5 com /paul:plan.

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

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Autenticação de usuários | Init | M | Phase 7 |
| Hospedagem Vercel | Init | S | Phase 7 |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-22
Stopped at: PAUL ressincronizado com a realidade (Opção A — criada a Fase 4 "Resumos", fases seguintes renumeradas). CLAUDE.md ajustado pra usar o PAUL como sistema oficial.
Next action: /paul:plan para abrir a Phase 5 (Gráficos e comparativos — começar pelos gráficos Chart.js de vendas)
Resume file: .paul/STATE.md

---
*STATE.md — Updated after every significant action*
