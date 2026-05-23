# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (`painel-diario.html`) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP (v0.1) entregou leitura diária efetiva de vendas, tráfego pago, delivery e marketing orgânico, com auth + RLS hardening. A v0.2 entregou **polish visual, densidade, organização e exportação PNG/PDF** — alinhamento do React ao padrão visual do HTML antigo de referência e fluxo de envio pro cliente via WhatsApp/email.

## Current Milestone

**Nenhuma milestone ativa.**
Status: ✅ v0.2 completa em 2026-05-24
Próximo passo: rode `/paul:discuss-milestone` pra conversar sobre escopo da v0.3, ou `/paul:milestone` se já tem direção definida.

## Next Milestone (a definir)

Candidatos prováveis baseados em carryover:

- **v0.3 Polish v2 + correções pequenas** — alinhamento header/subheader, pílulas mensais de saúde da planilha, helper `unitSlug`, débito técnico do code-reviewer
- **v0.3 Filtro global de período** — substituir/sincronizar seletores 7/30/60 (carryover v0.1)
- **v0.3 Endurecimento RLS tenant-scoped** — popular `tenant_users` + 13 WARNs `rls_policy_always_true`
- **v0.3 Novas integrações** — Instagram Insights API real, ou outra fonte de dados

## Completed Milestones

<details>
<summary><strong>v0.2 Polish, Densidade & Exportação</strong> — 2026-05-24 (4 phases, 17 plans, ~36h)</summary>

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 10 | Densidade visual + identidade por fonte | 4 (10-01..10-04) | 2026-05-23 |
| 11 | Portar conteúdo do HTML antigo (+ remediação) | 9 (11-01, 11-02, 11-04..11-09, 11-11) | 2026-05-24 |
| 12 | Organização do Dashboard + Mobile | 2 (12-01, 12-02) | 2026-05-24 |
| 13 | Exportação PNG / PDF | 2 (13-01, 13-02) | 2026-05-24 |

Detalhes completos: [`.paul/milestones/v0.2-ROADMAP.md`](milestones/v0.2-ROADMAP.md)
Summary executivo: [`.paul/MILESTONES.md`](MILESTONES.md)

</details>

<details>
<summary><strong>v0.1 MVP</strong> — 2026-05-23 (9 phases, 20 plans, 8 dias)</summary>

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

## Carryover (deferred vivos pra próximas milestones)

**Da v0.2:**

- Alinhamento header vs subheader (UAT v0.2 OK no header, mas subheader alinha à esquerda enquanto header tem padding diferente) — Effort XS. → v0.3 polish precoce
- Pílulas mensais de saúde da planilha + lista de campanhas Jatiúca + "% do alcance" em unit-cards Meta + frases comparativas em todos os KPIs + heatmap tooltip rico + sinergia diária pago+orgânico + tooltip Chart.js branded — Effort S-M cada
- Débito técnico (KPI_DEFS.map, unitSlug helper, unificar @media print, regex unicode em exportPng, fallback useCORS) — Effort S total

**Da v0.1:**

- Policies tenant-scoped via `is_member_of_tenant` (resolve 13 WARNs) — Effort M. Adiar pra v0.3+
- Filtro global de período no topo do sistema — Effort M
- Estender toggle Mensal/Semanal pro gráfico de linha de Vendas — Effort S
- HaveIBeenPwned password protection — Effort XS, cosmético
- Adicionar Mike + Gab como usuários (manual no Supabase Dashboard) — quando Doug quiser

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-24 (após /paul:complete-milestone v0.2)*
