# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (`painel-diario.html`) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP (v0.1) entregou leitura diária efetiva de vendas, tráfego pago, delivery e marketing orgânico, com auth + RLS hardening. Próximas milestones definem direção pós-MVP.

## Current Milestone

**Awaiting next milestone**
Status: IDLE — v0.1 fechada em 2026-05-23

Próximos passos:

- Pausar pra usar o MVP por algumas semanas e identificar o que falta de verdade
- Rodar `/paul:discuss-milestone` quando tiver visão clara
- Rodar `/paul:milestone` se já souber escopo

## Next Milestone

Run `/paul:discuss-milestone` (explorar visão) ou `/paul:milestone` (criar direto) pra definir.

## Completed Milestones

<details>
<summary>v0.1 MVP — 2026-05-23 (9 phases, 20 plans, 8 dias)</summary>

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 1 | Fundação e dados de vendas | 3 | 2026-05-16 |
| 2 | Meta Ads | 1 | 2026-05-16 |
| 3 | Anota AI / Delivery | 1 | 2026-05-18 |
| 4 | Resumos: semana, ROI e marketing | 1 | 2026-05-22 |
| 5 | Gráficos e comparativos | 5 | 2026-05-22 |
| 6 | Correlações e análise cruzada | 5 | 2026-05-23 |
| 7 | Hospedagem, polish e autenticação | 4 | 2026-05-23 |
| 8 | Polish visual + Meta Ads expandido | 2 | 2026-05-23 |
| 9 | RLS hardening (authenticated-only) | 2 | 2026-05-23 |

Detalhes completos: [`.paul/milestones/v0.1-ROADMAP.md`](milestones/v0.1-ROADMAP.md)
Summary executivo: [`.paul/MILESTONES.md`](MILESTONES.md)

</details>

## Carryover (deferred issues vivos)

Itens que sobreviveram à milestone v0.1 e podem virar plans de futuras milestones:

- **Policies tenant-scoped via `is_member_of_tenant`** — resolve 13 WARNs `rls_policy_always_true` que restaram. Requer popular `tenant_users`. Effort M.
- **Filtro global de período no topo do sistema** — substituir/sincronizar os seletores 7/30/60 já existentes. Effort M. Origem: pedido Doug 22/05.
- **Estender toggle Mensal/Semanal pro gráfico de linha de Vendas** — Doug optou por manter isolado na AnalysisSection; revisitar se sentir falta usando. Effort S.
- **HaveIBeenPwned password protection** — cosmético (não usamos senha). Ligar no Supabase Dashboard se quiser fechar WARN. Effort XS.

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-23 (milestone v0.1 fechada via /paul:complete-milestone)*
