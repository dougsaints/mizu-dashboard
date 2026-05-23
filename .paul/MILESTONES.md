# Milestones

Completed milestone log for this project.

| Milestone | Completed | Duration | Stats |
|-----------|-----------|----------|-------|
| v0.1 MVP | 2026-05-23 | 8 dias | 9 phases, 20 plans, 127 files |

---

## ✅ v0.1 MVP

**Completed:** 2026-05-23
**Duration:** 8 dias (2026-05-16 → 2026-05-23)
**Version:** 0.1.0

### Stats

| Metric | Value |
|--------|-------|
| Phases | 9 |
| Plans (com SUMMARY no PAUL) | 20 |
| Files (no histórico do repo) | 127 |
| Tabelas no banco | 14 |
| Migrations aplicadas | 7 |
| Fontes de dados conectadas | 4 (Vendas, Meta Ads, Anota AI, Instagram orgânico) |

### Key Accomplishments

- **Painel funcional em produção** (https://mizu-dashboard-pi.vercel.app) com leitura diária de vendas, Meta Ads, delivery (Anota AI) e Instagram orgânico — 4 fontes conectadas
- **Banco normalizado no Supabase** com 14 tabelas, 1 tenant (Sushi Mizú), 2 unidades (Serraria + Jatiúca), Realtime ativo
- **Leitura automática de Google Sheets** (vendas Serraria + Jatiúca) via CSV publicado, polling 5min, dedup por chave natural
- **Upload manual de CSV** padronizado pra Meta Ads + Anota AI + Instagram (Meta não tem API gratuita, Anota usa Latin-1)
- **Gráficos comparativos** com Chart.js: linha de vendas por unidade, donuts de Meta Ads por objetivo/unidade, heatmaps, barras agrupadas mensal/semanal
- **Filtros globais** (período via calendário + 12 atalhos, unidade, canal, "comparar com") via FilterProvider único
- **Correlações cruzadas** entre fontes (Phase 6 inteira: Meta × Vendas, Pareto, padrões, ROI)
- **Autenticação magic link + OTP fallback** (Phase 7-02b inteira) — Gmail queima link, código de 8 dígitos contorna
- **Visual final**: KPI heroes pretos com gradient, watermark 水 dourado, hero Jatiúca azul, Meta Ads expandido (Phase 8)
- **RLS hardening em 2 passos** (Phase 9) — banco trancado: anon retorna `[]` em qualquer SELECT, só authenticated lê

### Key Decisions

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Sem auth no MVP inicial | Init | Reduz complexidade; URL privada por ora — virou auth em Phase 7-02 |
| Upload manual Meta Ads CSV | Phase 2 | Meta não tem API pública gratuita |
| ROI salvo no Supabase (não localStorage) | Phase 4 | Mike e Gab veem o mesmo número |
| MarketingUnif: total real + fatia paga | Phase 4 | Não estimar orgânico |
| PAUL é o sistema oficial de planejamento | Phase 4 | Reconciliação retroativa de fases 1-4 |
| FilterProvider único (Context) | Phase 5 | Período + unidade + canal + cmpMode + analysisMode num só lugar |
| Filtros Unidade/Canal só em Vendas | Phase 5 | Meta Ads ~48% sem loja, Anota 100% sem — filtrar lá esconderia dado |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | Phase 5 | Evita cascade ERR_INSUFFICIENT_RESOURCES |
| Hooks Realtime multi-consumer com opt-out | Phase 5 | Cache compartilhado por queryKey, sem WebSocket duplicada |
| Magic link + código OTP fallback | Phase 7-02b | Gmail scanner "queima" magic link; código numérico contorna |
| Vercel free tier | Phase 7-01 | Deploy automático via GitHub, SSL incluído, sem custo |
| RLS cutover em 2 passos (aditivo + subtrativo) | Phase 9 | Zero risco — adicionar policies novas em paralelo antes de dropar as antigas |

### Phases Summary

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

### Carryover pra próxima milestone

- 13 WARNs `rls_policy_always_true` (policies authenticated com `using (true)`) — resolver via policies tenant-scoped quando `tenant_users` for populado
- 1 WARN `authenticated_security_definer_function_executable` — função `is_member_of_tenant` aguarda uso real em Phase 10
- 1 WARN `auth_leaked_password_protection` — config no Supabase Dashboard, cosmético (não usamos senha)
- Adicionar Mike + Gab como usuários autorizados (manual via Dashboard)
- Deferred Issue: filtro global de período no topo do sistema (substituir/sincronizar seletores 7/30/60 já existentes)
- Deferred Issue: estender toggle Mensal/Semanal pro gráfico de linha de Vendas

---
