# Project State

## Project Reference

See: .paul/PROJECT.md (updated 2026-05-24)

**Core value:** Time e cliente têm acesso rápido a métricas de faturamento, tráfego e delivery — tudo num lugar, sem abrir múltiplas plataformas.
**Current focus:** v0.3 Arquitetura Multi-Página + Analytics Aprofundadas — Phase 14: Sidebar + Multi-página.

## Current Position

Milestone: v0.3 Arquitetura Multi-Página + Analytics Aprofundadas (em progresso)
Phase: 14 of 4 — Arquitetura: Sidebar + Multi-página — **In progress** (2/4-5 plans done)
Plan: **14-02 UNIFIED ✅** (commit `ddd2bfd`, loop fechado; UAT delegado a agente Opus)
Status: UNIFY complete, ready for next PLAN (14-03)
Last activity: 2026-05-24 — Unificado plan 14-02. Loop completo. UAT autônomo via agente Explore Opus aprovou: 8 URLs HTTP 200, mapping fiel, shell intacto, bundle separado, zero refs Dashboard.tsx remanescentes.

Vercel URL: <https://mizu-dashboard-pi.vercel.app/>
Local dev: <http://localhost:5173/>

Progress:

- v0.1: [██████████] 100% ✓ (9 phases, 20 plans, 2026-05-23)
- v0.2: [██████████] 100% ✓ (4 phases, 17 plans, 2026-05-24)
- v0.3: [███░░░░░░░] ~11% (Phase 14: 2/4-5 plans done, milestone total ~2/18-22)

## Loop Position

```text
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop 14-02 fechado, ready for next PLAN 14-03]
```

Próximo: Doug roda `/paul:plan` → Claude planeja 14-03 (mobile drawer: hambúrguer no Header, sidebar slide-from-left com overlay, fecha ao tocar link ou backdrop).

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

### Decisions arquiteturais novas (v0.3)

| Decision | Origin | Impact |
|----------|--------|--------|
| Sidebar esquerda 240px / 64px colapsada / drawer mobile | v0.3 / discussão | Padrão Stripe/Linear/Vercel; 7 itens nível 1 sem nesting |
| Landing `/hoje` (não `/dashboard` ou `/`) | v0.3 / discussão | Doug abre 0-cliques na pergunta diária ("vendi quanto?") |
| Agrupamento sidebar: Visão Geral / Análises / Operação | v0.3 / discussão | Separa olhar (passivo) de fazer (ativo) — reduz carga cognitiva pra leigo |
| Sem atalhos teclado (Cmd+K / J-K) | v0.3 / discussão | Doug não usa; descoberta via olho/mouse/touch |
| Mobile = drawer com hambúrguer (não bottom-tab) | v0.3 / discussão | 7 itens > limite de 5 do bottom-tab |
| Análises com effort L adiadas pra v0.4 (RFM, BCG, Forecast, Geo, GenAI) | v0.3 / discussão | Precisam mudança de schema ou LLM pago; v0.3 só dados/UI existentes |
| Meta Ads API adiada pra v0.5/v0.6 | v0.3 / discussão | CSV funciona; quando virar fricção, integrar com System User + Edge Function |

### Plano da v0.3 (resumo)

- **Phase 14** (4-5 plans): Shell `<Layout>` + sidebar esquerda + redistribuir 13 sections em 7 páginas + alinhamento header/subheader
- **Phase 15** (3-4 plans): Aviso "planilha desatualizada pro dono" persistente + `lib/chartTheme.ts` tokenizado + tooltip Chart.js branded + débito técnico (KPI_DEFS.map, unitSlug, @media print, regex unicode, useCORS fallback)
- **Phase 16** (5-6 plans): Quick wins F&B — YoY/WoW lado-a-lado, sazonalidade decomposta, waterfall variação, frequency Meta, distribuição ticket boxplot, cancellation rate
- **Phase 17** (5-6 plans): Refatorar análises fracas — gauge ROAS na RoiSection, CorrelationSection v2 (lag+p-value), heatmap hora×dia, treemap produtos, MA+banda na AnalysisSection, z-score em alertas

### Deferred Issues (carryover vivos pra v0.4+)

| Issue | Origin | Effort | Revisit |
|-------|--------|--------|---------|
| RFM + cohort clientes delivery | v0.3 pesquisa | L | v0.4 (precisa customer_id no iFood/AnotaAi) |
| LTV / CAC por canal | v0.3 pesquisa | L | v0.4 (depende RFM) |
| Menu engineering matrix (BCG) | v0.3 pesquisa | M | v0.4 (precisa COGS por produto) |
| Geo-heatmap bairros entrega | v0.3 pesquisa | M | v0.4 (precisa parsear CEP) |
| Forecast 7-30d com confidence interval | v0.3 pesquisa | M | v0.4 (Holt-Winters / SMA ponderada) |
| Anomaly detection com root-cause GenAI | v0.3 pesquisa | L | v0.5+ (LLM pago, Doug avisa antes) |
| Integração Meta Ads API (System User + Edge Function) | v0.3 discussão | M-L | v0.5/v0.6 quando CSV virar fricção |
| Policies tenant-scoped via `is_member_of_tenant` | v0.1 / Phase 9 | M | v0.4+ (técnico) |
| HaveIBeenPwned password protection | v0.1 / Phase 9 | XS | Cosmético — adiar |
| Adicionar Mike + Gab como usuários | v0.1 / Phase 9 | XS | Tarefa manual Doug no Supabase |
| Pílulas mensais ❌✅⚠️ saúde da planilha | v0.2 audit | S | Avaliar se entra em alguma phase |
| Lista campanhas Jatiúca individuais | v0.2 audit | S | Avaliar se entra em alguma phase |
| "% do alcance" em unit-cards Meta | v0.2 audit | XS | Avaliar se entra em alguma phase |
| Frases comparativas em todos KPIs | v0.2 audit | M | Avaliar se entra em alguma phase |

### Blockers/Concerns

Nenhum.

## Session Continuity

Last session: 2026-05-24
Stopped at: Milestone v0.3 scaffolded — 4 phase dirs com PHASE-OVERVIEW.md, ROADMAP atualizado, paul.json em `phase: 14, status: not_started`, MILESTONE-CONTEXT.md consumido
Next action: Doug roda `/paul:plan` → Claude planeja primeiro plan da Phase 14 (provavelmente `14-01: shell <Layout> + sidebar esquerda + React Router redirects`)
Resume file: .paul/ROADMAP.md (estrutura da milestone) + este STATE.md (estado atual) + `.paul/phases/14-arquitetura-sidebar-multipagina/PHASE-OVERVIEW.md` (scope detalhado da Phase 14)

---
*STATE.md — Updated after every significant action*
