# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 9: RLS hardening (passo aditivo entregue; cutover bloqueado em Doug validar login)

## Current Position

Milestone: v0.1 MVP
Phase: 6 ✅ + 7 ✅ + 8 ✅ + 9 (em curso — 09-01 ✅, 09-02 bloqueado em Doug).
Plan: 06-01 a 06-05 + 07-01b + 07-01 + 07-02 + 07-02b + 08-01 + 08-02 + 09-01 — 12 plans completos.
Status: Phase 9-01 (aditiva) entregue autonomamente. Migration 0006 aplicada via MCP: 13 tabelas ganharam policy `authenticated_all` espelhando a anon (zero impacto no app), função `is_member_of_tenant` endurecida (search_path + revoke anon execute). Anon ainda lê — validado por curl em 4 tabelas. 2 WARNs do advisor caíram.
Last activity: 2026-05-23 — UNIFY 09-01 (RLS aditivo).

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>.

Progress:
- Milestone: [██████████] ~99% (falta 2 configs no Supabase Dashboard + 1 teste end-to-end Doug + 09-02 cutover)
- Phase 7: [██████████] 95%
- Phase 9: [█████░░░░░] 50% (09-01 ✅ aditivo; 09-02 ⏳ cutover bloqueado em Doug validar login)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [12 loops fechados]
                          09-02 aguarda Doug (BLOCKED_ON_USER)
```

Próximo: Doug clica 2 vezes no Supabase Dashboard (Site URL + Redirect URLs; desligar signup público) + testa login com genezilab@gmail.com. Quando confirmar "login ok", rodo o 09-02 (drop das policies anon — app passa a exigir login).

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
| Bundle JS em ~738KB (warning Vite >500KB) | Phase 5 | S | Phase 7 — usar dynamic import() / code-splitting antes do deploy Vercel |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-23
Stopped at: 12 loops PAUL fechados. Último: Phase 9-01 (RLS hardening aditivo) — migration 0006 aplicada via MCP, 13 tabelas com `authenticated_all` em paralelo às `phase1_anon_all`, função `is_member_of_tenant` endurecida (search_path + revoke anon execute). Anon ainda lê (sanity check curl em 4 tabelas: HTTP 200). Painel em produção segue normal — zero impacto. Próximo passo bloqueado em Doug validar login.

Próximos passos (em ordem):

1. **Doug fora do remoto**: 2 cliques no Supabase Dashboard (Authentication → URL Configuration: Site URL + Redirect URLs; Sign In/Up: desligar "Allow new users to sign up"). Detalhes em AUTH_SETUP.md.
2. **Doug testa login**: aba anônima, abre Vercel, pede magic link, usa o CÓDIGO de 8 dígitos (não o link — Gmail consome) no campo OTP fallback.
3. **Doug valida visual** das 11 entregas anteriores. Especial atenção:
   - SalesSection Total Geral (card preto com 水 dourado)
   - TrendsSection 1º card (Faturamento, preto)
   - MetaAdsAnalysisSection (NOVA, donut por objetivo + donut por unidade + hero Jatiúca azul claro)
4. **Quando Doug confirmar "login ok"**: Claude roda plan 09-02 (drop das 14 policies `phase1_anon_all`, app passa a exigir login de verdade). Migration já planejada, ~30 segundos pra aplicar.

Next action: Doug abre nova sessão → digita "/paul:resume" ou simplesmente "continua daí" → Claude lê STATE.md.
Resume file: .paul/STATE.md (este arquivo)

Bundle Vercel atual: index-DVqeydRB.js / CSS index-Cagec8OR.css (validado em 23/05 às 12:49 BRT).

---
*STATE.md — Updated after every significant action*
