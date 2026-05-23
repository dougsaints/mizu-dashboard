# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP ✅ COMPLETO (2026-05-23) — 9 phases, 13 plans, todas entregues.

## Current Position

Milestone: v0.1 MVP ✅ Complete (2026-05-23)
Phase: 6 ✅ + 7 ✅ + 8 ✅ + 9 ✅
Plan: 06-01 a 06-05 + 07-01b + 07-01 + 07-02 + 07-02b + 08-01 + 08-02 + 09-01 + 09-02 — 13 plans completos.
Status: Phase 9 FECHADA. Cutover RLS aplicado via migration 0007: dropadas as 14 policies `phase1_anon_*`. Banco agora SÓ responde a request com JWT. Anon curl retorna `[]` em todas as tabelas testadas. Doug logado com `genezilab@gmail.com` confirma painel funcional. Signup público OFF.
Last activity: 2026-05-23 — UNIFY 09-02 (RLS cutover). MVP entregue.

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>.

Progress:
- Milestone v0.1 MVP: [██████████] 100% ✅
- Phase 9: [██████████] 100% (09-01 ✅ aditivo + 09-02 ✅ cutover)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [13 loops fechados — MVP completo]
                          IDLE — aguarda próxima milestone definida pelo Doug
```

Próximo: Doug decide o que vem depois do MVP. Sugestões (deferred issues remanescentes ou novas direções):

- Adicionar Mike/Gab como usuários autorizados (Supabase Dashboard → Authentication → Users → "Add user")
- Phase 10 (opcional): policies tenant-scoped via `is_member_of_tenant` — derruba as 13 WARNs `rls_policy_always_true` que sobraram. Requer popular `tenant_users`.
- v0.2 milestone novo (ex: mais fontes de dados, dashboard analítico próprio, mobile, etc.)

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
| 2026-05-22: Toggle "Análise por" Mensal/Semanal afeta SÓ a AnalysisSection (não vaza pro gráfico de linha de Vendas) | Phase 5 | Decisão (a) do plano 05-05; estender no futuro fica como Deferred Issue |
| 2026-05-22: queryKey de queries derivadas NÃO deve compartilhar prefix com a fonte invalidada por Realtime | Phase 5 | useSalesComparison começava com QK_SALES → cada Realtime event do range atual cascadeava refetch da comparison; causou loop com saturação ERR_INSUFFICIENT_RESOURCES. Fix: QK_SALES_CMP separada + staleTime 10min |
| 2026-05-22: Hooks consumidos por múltiplos componentes ganharam opt-out de Realtime (subscribeRealtime?: false) | Phase 5 | AnalysisSection passa false em useSales/useAds porque SalesSection/MarketingUnif/AdsUploadCard já mantêm o canal aberto; cache compartilhado por queryKey. Evita saturar limite de conexões do browser em StrictMode dev |

### Deferred Issues

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| Autenticação de usuários | Init | M | Phase 7 |
| Hospedagem Vercel | Init | S | Phase 7 |
| Filtro global de período no topo do sistema (pedido do Doug em 22/05 durante o 05-02) | Phase 5 | M | Plano 05-03 — decisão pendente: substituir ou sincronizar os seletores 7/30/60 já existentes |
| Estender toggle Mensal/Semanal pro gráfico de linha de Vendas (opção (c) do plano 05-05) | Phase 5 | S | Phase 6 ou pós-MVP — Doug optou por manter isolado na AnalysisSection; revisitar se sentir falta usando |
| ~~Bundle JS em ~738KB (warning Vite >500KB)~~ ✅ RESOLVIDO em alguma das fases 6/7/8 | Phase 5 | — | Auditado em 23/05 na Phase 9 ociosa: code-splitting + manualChunks já presentes. Maior chunk: supabase-vendor 196KB (50KB gzip). Sections individuais <10KB. Entry inicial 47KB (17KB gzip). Saudável. |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-23
Stopped at: **MVP v0.1 entregue.** 13 loops PAUL fechados. Sessão final: Phase 9 completa (RLS hardening em 2 passos — aditivo + cutover). Migrations 0006 e 0007 aplicadas via MCP. Banco trancado: anon curl retorna `[]` em todas as tabelas; só authenticated lê/escreve. Doug logou com `genezilab@gmail.com` antes do cutover. Signup público OFF.

Próximos passos (em ordem):

1. **Doug pusha os commits locais** (4 commits aguardando push manual, regra de proteção da main impede Claude pushar direto):
   - `1d3c326` Phase 9-01 RLS aditivo
   - `9391bbb` Plan 09-02 antecipado + bundle auditado
   - `[novo]` Phase 9-02 cutover (gerado neste turno)
   - Roda: `git push origin main`
2. **Doug adiciona Mike/Gab como usuários** (Supabase Dashboard → Authentication → Users → "Add user") quando quiser dar acesso pra eles.
3. **Próxima milestone**: Doug decide. Possíveis direções abertas:
   - Phase 10 opcional: policies tenant-scoped (deferred issue restante)
   - v0.2: nova feature ou nova fonte de dados
   - Pausa pra usar o MVP por algumas semanas antes de decidir próximo passo

Next action: Doug abre nova sessão → digita "/paul:resume" ou simplesmente "continua daí" → Claude lê STATE.md.
Resume file: .paul/STATE.md (este arquivo)

Bundle Vercel atual: index-DVqeydRB.js / CSS index-Cagec8OR.css (validado em 23/05 às 12:49 BRT).

---
*STATE.md — Updated after every significant action*
