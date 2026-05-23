# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-22)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.1 MVP — Phase 6: Correlações e análise cruzada

## Current Position

Milestone: v0.1 MVP
Phase: 6 ✅ Complete. Phase 7: 07-01b ✅ + 07-01 ✅ (prep). Deploy real aguarda Doug. 07-02 (auth) aguarda decisão de estratégia.
Plan: 06-01 a 06-05 + 07-01b + 07-01 — 7 plans completos.
Status: Repo pronto pra deploy. `vercel.json` + `DEPLOY.md` criados. Aguarda Doug clicar 5 botões na Vercel + escolher estratégia de auth.
Last activity: 2026-05-23 — UNIFY 07-01 (deploy prep)

Progress:
- Milestone: [█████████▌] ~95% (falta deploy real + auth)
- Phase 6: [██████████] 100%
- Phase 7: [████████░░] 75% (07-01b + 07-01 prep ✅; deploy clique + 07-02 auth pendentes)

## Loop Position

```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [7 loops fechados]
```

Próximo: Doug abre `DEPLOY.md`, executa os 5 passos (~10min). Depois escolhe estratégia de auth (A senha compartilhada / B magic link / C login+senha — recomendo B). Eu crio 07-02 PLAN + implemento.

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

Last session: 2026-05-22
Stopped at: Phase 5 completa e fechada (5/5 plans). UNIFY do 05-05 criou SUMMARY oficial. Transition executado: PROJECT.md, ROADMAP.md, paul.json sincronizados. Commit do phase pendente (será criado pela transition). Próximo: Phase 6 — Correlações e análise cruzada (2 plans: 06-01 Correlação Meta Ads × Vendas, 06-02 Painel de tendências consolidado).
Next action: /paul:plan para abrir Phase 6
Resume file: .paul/ROADMAP.md

---
*STATE.md — Updated after every significant action*
