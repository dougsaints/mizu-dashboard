# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-24)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** Nenhum — milestone v0.2 fechada, aguardando definição de v0.3.

## Current Position

Milestone: Awaiting next milestone (v0.2 fechada em 2026-05-24)
Phase: None active
Plan: None
Status: Milestone v0.2 Polish, Densidade & Exportação complete — ready for next
Last activity: 2026-05-24 — /paul:complete-milestone v0.2 executado (MILESTONES.md atualizado, PROJECT.md evoluído, ROADMAP collapsed, archive em .paul/milestones/v0.2-ROADMAP.md, git tag v0.2.0)

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>

Progress:

- v0.1: [██████████] 100% ✓ (9 phases, 20 plans, 2026-05-23)
- v0.2: [██████████] 100% ✓ (4 phases, 17 plans, 2026-05-24)
- v0.3: aguardando `/paul:discuss-milestone`

## Loop Position

```text
PLAN ──▶ APPLY ──▶ UNIFY
  ○        ○        ○     [Milestone v0.2 complete — ready for next]
```

Próximo: Doug roda `/paul:discuss-milestone` (pra conversar sobre escopo) ou `/paul:milestone` (se já sabe direção).

## Accumulated Context

### Decisions vivas (carryover de v0.1 + v0.2)

| Decision | Origin | Impact |
|----------|--------|--------|
| PAUL é o sistema oficial de planejamento | v0.1 / Phase 4 | Toda feature passa pelo loop PAUL |
| FilterProvider único (Context) pra filtros globais | v0.1 / Phase 5 | Período + unidade + canal + cmpMode + analysisMode num só lugar |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | v0.1 / Phase 5 | Evita cascade ERR_INSUFFICIENT_RESOURCES |
| Hooks Realtime multi-consumer com opt-out | v0.1 / Phase 5 | Cache compartilhado por queryKey |
| Magic link + código OTP fallback | v0.1 / Phase 7-02b | Gmail queima link, código contorna |
| RLS cutover em 2 passos (aditivo + subtrativo) | v0.1 / Phase 9 | Padrão pra qualquer mudança de policy em prod |
| Identidade por fonte via kanji-pill (não cor de borda) | v0.2 / Phase 10 | Paleta Mizú engole cor pequena, área generosa registra |
| Cores por unidade determinísticas por nome | v0.2 / Phase 10 | Jatiúca sempre azul, Serraria sempre roxo, independente da ordem |
| Sparklines SVG puro (sem Chart.js extra) | v0.2 / Phase 11-04 | Render barato, zero dependência nova |
| Alertas Operacionais hardcoded (não config) | v0.2 / Phase 11-09 | Thresholds escolhidos com Doug, mudança = nova versão |
| html2canvas lazy + useCORS:true | v0.2 / Phase 13-01 | Lazy = bundle não infla; useCORS = fonts custom renderizam |
| Print PDF via window.print (não jspdf) | v0.2 / Phase 13-02 | Zero dependência nova; @media print branded suficiente |
| Auditoria automatizada quando Doug diz "tava melhor" | v0.2 / sprint remediação | Doug tem olho de design; sentimento = gap mensurável |

### Deferred Issues (carryover vivos pra v0.3)

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Alinhamento header vs subheader | v0.2 / UAT | XS | v0.3 polish precoce |
| Pílulas mensais saúde da planilha | v0.2 / audit | S | v0.3 |
| Lista campanhas Jatiúca individuais | v0.2 / audit | S | v0.3 |
| "% do alcance" em unit-cards Meta | v0.2 / audit | XS | v0.3 |
| Frases comparativas em todos KPIs | v0.2 / audit | M | v0.3 |
| Heatmap tooltip rico | v0.2 / audit | S | v0.3 |
| Sinergia diária pago+orgânico | v0.2 / audit | M | v0.3 |
| Tooltip Chart.js customizado branded | v0.2 / audit | S | v0.3 |
| Débito técnico (KPI_DEFS.map, unitSlug, @media print, regex unicode, useCORS fallback) | v0.2 / code-review | S total | v0.3 |
| Policies tenant-scoped via `is_member_of_tenant` | v0.1 / Phase 9 | M | v0.3+ (técnico) |
| Filtro global de período no topo do sistema | v0.1 / Phase 5 | M | v0.3 candidato |
| Estender toggle Mensal/Semanal pro gráfico de Vendas | v0.1 / Phase 5 | S | Revisitar se Doug sentir falta |
| HaveIBeenPwned password protection | v0.1 / Phase 9 | XS | Cosmético — adiar |
| Adicionar Mike + Gab como usuários | v0.1 / Phase 9 | XS | Tarefa manual Doug no Supabase |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-24
Stopped at: Milestone v0.2 fechada — MILESTONES.md, PROJECT.md, ROADMAP.md atualizados, archive criado, git tag v0.2.0 + push feitos
Next action: `/paul:discuss-milestone` ou `/paul:milestone` pra definir v0.3
Resume file: .paul/MILESTONES.md (resumo da v0.2) + .paul/ROADMAP.md (carryover pra v0.3)

---
*STATE.md — Updated after every significant action*
