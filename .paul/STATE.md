# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-23)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** Awaiting next milestone. v0.1 MVP fechada em 2026-05-23.

## Current Position

Milestone: Awaiting next milestone
Phase: None active
Plan: None
Status: Milestone v0.1 MVP complete — pronto pra próxima.
Last activity: 2026-05-23T22:00:00Z — `/paul:complete-milestone` rodada; MILESTONES.md + archive + tag v0.1.0 criados.

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>

Progress:

- v0.1 MVP: [██████████] 100% ✅ (2026-05-23)
- v0.2: [░░░░░░░░░░] aguarda definição

## Loop Position

```text
PLAN ──▶ APPLY ──▶ UNIFY
  ○        ○        ○     [Milestone complete — ready for next]
```

Próximo: Doug roda `/paul:discuss-milestone` (explorar visão da v0.2 conversando) ou `/paul:milestone` (criar direto se já souber escopo).

## Accumulated Context

> Histórico completo da v0.1 MVP migrado pra `.paul/MILESTONES.md`
> (entry permanente) e `.paul/milestones/v0.1-ROADMAP.md` (snapshot
> do ROADMAP no momento do fechamento). As Decisions abaixo são as
> que continuam relevantes pra próximas milestones.

### Decisions vivas (carryover da v0.1)

| Decision | Phase | Impact |
|----------|-------|--------|
| PAUL é o sistema oficial de planejamento | Phase 4 | Toda feature passa pelo loop PAUL |
| FilterProvider único (Context) pra filtros globais | Phase 5 | Período + unidade + canal + cmpMode + analysisMode num só lugar |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | Phase 5 | Evita cascade ERR_INSUFFICIENT_RESOURCES |
| Hooks Realtime multi-consumer com opt-out | Phase 5 | Cache compartilhado por queryKey, sem WebSocket duplicada |
| Magic link + código OTP fallback | Phase 7-02b | Gmail queima link, código contorna |
| RLS cutover em 2 passos (aditivo + subtrativo) | Phase 9 | Padrão pra qualquer mudança de policy em prod |

### Deferred Issues (carryover vivos)

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Policies tenant-scoped via `is_member_of_tenant` (resolve 13 WARNs `rls_policy_always_true`) | Phase 9 | M | Próxima milestone — requer popular `tenant_users` primeiro |
| Filtro global de período no topo do sistema | Phase 5 | M | Próxima milestone — decisão pendente: substituir ou sincronizar 7/30/60 |
| Estender toggle Mensal/Semanal pro gráfico de linha de Vendas | Phase 5 | S | Revisitar se Doug sentir falta usando |
| HaveIBeenPwned password protection | Phase 9 | XS | Cosmético — não usamos senha |
| Adicionar Mike + Gab como usuários autorizados | Phase 9 | XS | Quando Doug quiser dar acesso |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-23
Stopped at: **Milestone v0.1 MVP fechada via `/paul:complete-milestone`.** 9 phases, 20 plans, 8 dias, 127 files no histórico. MILESTONES.md criado, ROADMAP arquivado em `.paul/milestones/v0.1-ROADMAP.md`, PROJECT.md evoluído (15 requirements validados), versão alinhada em 0.1.0 across PROJECT/ROADMAP/STATE/paul.json/package.json, tag git `v0.1.0` criada.

Next action: Doug abre nova sessão → digita `/paul:discuss-milestone` (conversar) ou `/paul:milestone` (criar direto) → define v0.2.
Resume file: .paul/MILESTONES.md (histórico) + este STATE.md (estado atual)

---
*STATE.md — Updated after every significant action*
