# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-23)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.2 Polish, Densidade & Exportação — Phase 10: Densidade visual + identidade por fonte.

## Current Position

Milestone: v0.2 Polish, Densidade & Exportação (0 of 4 phases complete)
Phase: 10 of 13 — Densidade visual + identidade por fonte
Plan: None (Ready to plan)
Status: Milestone v0.2 criada via `/paul:milestone`. Aguarda primeiro `/paul:plan` da Phase 10.
Last activity: 2026-05-23T22:30:00Z — Milestone v0.2 scaffolded (4 phase dirs + ROADMAP + paul.json).

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>

Progress:

- v0.2: [░░░░░░░░░░] 0% (0/4 phases)
- Phase 10: ready to plan
- Phase 11 (depends on 10): pending
- Phase 12 (depends on 10+11): pending
- Phase 13 (depends on 10-12): pending

## Loop Position

```text
PLAN ──▶ APPLY ──▶ UNIFY
  ○        ○        ○     [Ready for first PLAN of Phase 10]
```

Próximo: Doug roda `/paul:plan` pra começar Phase 10 (Densidade visual + identidade por fonte).

## Accumulated Context

### Decisions vivas (carryover de v0.1, ainda aplicáveis)

| Decision | Phase | Impact |
|----------|-------|--------|
| PAUL é o sistema oficial de planejamento | Phase 4 | Toda feature passa pelo loop PAUL |
| FilterProvider único (Context) pra filtros globais | Phase 5 | Período + unidade + canal + cmpMode + analysisMode num só lugar |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | Phase 5 | Evita cascade ERR_INSUFFICIENT_RESOURCES |
| Hooks Realtime multi-consumer com opt-out | Phase 5 | Cache compartilhado por queryKey |
| Magic link + código OTP fallback | Phase 7-02b | Gmail queima link, código contorna |
| RLS cutover em 2 passos (aditivo + subtrativo) | Phase 9 | Padrão pra qualquer mudança de policy em prod |

### Deferred Issues (carryover vivos do v0.1)

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Policies tenant-scoped via `is_member_of_tenant` | Phase 9 | M | v0.3 (técnico, não bloqueia v0.2) |
| Filtro global de período no topo do sistema | Phase 5 | M | Phase 12 (organização do Dashboard) |
| Estender toggle Mensal/Semanal pro gráfico de Vendas | Phase 5 | S | Revisitar se Doug sentir falta |
| HaveIBeenPwned password protection | Phase 9 | XS | Cosmético — adiar |
| Adicionar Mike + Gab como usuários | Phase 9 | XS | Tarefa manual Doug no Supabase |

### Referência visual da v0.2

O screenshot do `painel-diario.html` (data 20/05/2026) compartilhado pelo Doug em 23/05 é a **referência visual canônica** desta milestone. Mostra o nível de densidade, identidade por fonte (ícone Meta azul, cores por categoria/unidade), storytelling em prosa nos heroes (ex: "Campanhas atribuídas à Jatiúca alcançaram 14.202 pessoas, 20% do alcance total..."), e cards lado a lado.

O arquivo `painel-diario.html` (5000+ linhas, raiz do projeto) está no repo pra consulta — usar Grep + Read com offset/limit pra trechos específicos durante implementação. Nunca ler inteiro.

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-23
Stopped at: Milestone v0.2 criada e scaffolded. 4 phase dirs em `.paul/phases/10..13`, ROADMAP atualizado com Current Milestone + tabela + Phase Details, paul.json em `phase: 10, status: not_started, loop: IDLE`. `MILESTONE-CONTEXT.md` consumido e deletado.

Próxima ação: Doug roda `/paul:plan` → Claude planeja o primeiro plan da Phase 10 (provavelmente `10-01: identidade visual por fonte de dados` ou similar, define no PLAN).

Resume file: .paul/ROADMAP.md (estrutura da milestone) + este STATE.md (estado atual)

---
*STATE.md — Updated after every significant action*
