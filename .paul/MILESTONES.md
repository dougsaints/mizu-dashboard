# Milestones

Completed milestone log for this project.

| Milestone | Completed | Duration | Stats |
|-----------|-----------|----------|-------|
| v0.2 Polish, Densidade & Exportação | 2026-05-24 | ~36h | 4 phases, 17 plans, 27 files |
| v0.1 MVP | 2026-05-23 | 8 dias | 9 phases, 20 plans, 127 files |

---

## ✅ v0.2 Polish, Densidade & Exportação

**Completed:** 2026-05-24
**Duration:** ~36 horas (2026-05-23 → 2026-05-24)
**Version:** 0.2.0

### Stats

| Metric | Value |
|--------|-------|
| Phases | 4 (10, 11, 12, 13) |
| Plans (com SUMMARY no PAUL) | 17 (10 sprint original + 7 remediação) |
| Files (no commit do código) | 27 (6 novos, 20 modificados, 1 backup HTML) |
| Componentes novos | 4 (Sparkline, OperationalAlerts, AdsVsSalesChart, SectionHeader) |
| Libs novas | 2 (anomalyDetection, exportPng) |
| Linhas CSS adicionadas | ~1300 (tokens fonte/unidade, header 2 faixas, sparklines, alertas, mobile, print) |

### Key Accomplishments

- **Identidade visual por fonte de dados** — kanji-pill colorida + badge textual em todas as seções (Meta azul, Anota laranja, Instagram rosa, Vendas dourado, Diário verde). Paleta Mizú deixou de "engolir" cor pequena
- **Densidade ~2x do MVP** — KPI heroes compactos, sparklines SVG inline em Vendas (5 KPIs), 8 KPIs Meta-only no topo de Meta Ads, 4 KPIs em Produtos, tabela Por Categoria expandida a 6 colunas
- **Painel de Alertas Operacionais** preto/gold no topo — anomalia detectada automaticamente (queda <50%, WoW <-15%, ROAS<1x, pico >130%, dias úteis sem registro). Até 5 alertas priorizados
- **Gráfico ROI temporal** dentro de Meta Ads — Investimento × Faturamento diário (eixo Y duplo azul/dourado)
- **Dashboard reorganizado** — uploads colapsáveis em `<details>` no rodapé; seções por importância natural (Tendências → Vendas → Meta → Delivery → Marketing → Padrões → Diário → Config)
- **Mobile responsivo de verdade** — 13 grids viram 1 coluna em <640px, touch targets ≥44px, filter columns reflow em <768/<480px
- **Exportação PNG + PDF** — botão 📷 por seção (html2canvas lazy) + botão PDF global (window.print com @media print branded)
- **Header refinado** — emojis → bullet CSS + SVGs inline (refresh giratório, printer, log-out, calendar, chevron). Subheader com selects estilizados (appearance:none + caret SVG data-URL), altura uniforme 36px, alinhamento flex-end
- **Storytelling em prosa nos heroes** — replicando pattern do `TrendsSection.buildSummary` em WeeklyRecap, MarketingUnif, RoiSection
- **Cores por unidade consistentes** — Jatiúca azul (#1877F2), Serraria roxo (#7c3aed), via paleta determinística em SalesLineChart + unit-cards

### Key Decisions

| Decision | Phase/Sprint | Rationale |
|----------|--------------|-----------|
| Identidade por fonte via kanji-pill (não cor de borda) | Phase 10 | Área generosa registra; cor pequena some na paleta Mizú |
| Cores por unidade determinísticas por nome | Phase 10 | `unitName.toLowerCase().includes('jatiu')` — Jatiúca sempre azul mesmo se ordem mudar |
| Storytelling em prosa, não bullet list | Phase 10 | Replicar pattern do `TrendsSection.buildSummary` — fala humana cabe melhor |
| Auditoria automatizada vs HTML antigo após "tava melhor antes" | Sprint remediação | Doug é leigo em código mas tem olho de design; quando ele diz "estava melhor", o gap é real e mensurável |
| Sparklines SVG puro, não Chart.js | Phase 11-04 | 5 KPIs com mini-charts = render barato, zero dependência nova |
| Alertas Operacionais hardcoded (não config) | Phase 11-09 | Thresholds escolhidos com Doug, mudança = nova versão (não setting) |
| html2canvas lazy + useCORS:true | Phase 13-01 | Lazy = bundle não infla pra quem não exporta; useCORS = fonts custom do painel renderizam |
| Print PDF via window.print, não jspdf | Phase 13-02 | Zero dependência nova; @media print branded já é suficiente |
| Header em 2 faixas (marca + filtros) | Phase 11-05 | Faixa filtros sempre acessível no scroll; marca fixa pra brand recall |
| Emojis → SVG inline no header | Sprint refinamento | Doug detectou 🔄 "parecendo WhatsApp"; SVG lucide-style fica profissional |
| Plan 11-10 (Copiar WhatsApp) cancelado | Sprint remediação | Doug decidiu que prints + PNG export já bastam, copy-to-clipboard era complexidade extra |

### Phases Summary

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 10 | Densidade visual + identidade por fonte | 4 (10-01..10-04) | 2026-05-23 |
| 11 | Portar conteúdo do HTML antigo (+ remediação) | 9 (11-01, 11-02, 11-04..11-09, 11-11) | 2026-05-24 |
| 12 | Organização do Dashboard + Mobile | 2 (12-01, 12-02) | 2026-05-24 |
| 13 | Exportação PNG / PDF | 2 (13-01, 13-02) | 2026-05-24 |

### Carryover pra próxima milestone (v0.3)

**UAT pós-fechamento:**
- **Header e subheader desalinhados** — UAT v0.2 OK no refinamento do header, mas Doug notou que subheader alinha à esquerda e header tem padding diferente. Plan precoce de polish na v0.3.

**Do audit do agente** (`.paul/phases/11-portar-conteudo-html-antigo/11-03-AUDIT.md`, 32 itens triados):
- 🟡 médios não implementados: pílulas mensais ❌✅⚠️ de saúde da planilha, lista de campanhas Jatiúca individuais, "% do alcance" em cards de unidade Meta, frases comparativas "vs R$ X (data-data)" embaixo dos KPIs (fizemos no hero mas não em todos), heatmap tooltip rico, sinergia diária pago+orgânico, tooltip Chart.js customizado branded

**Débito técnico do code-reviewer** (do ultrareview pós-v0.2):
- Refactor: 8 KPIs Meta como `KPI_DEFS.map()` em vez de inline (em `MetaAdsAnalysisSection.tsx`)
- Helper `unitSlug(name)` em `lib/` — lógica `unitName.toLowerCase().includes('jatiu')` duplicada 3x
- 2 blocos `@media print` separados (linhas 1077 + ~3700 do index.css) precisam unificação
- `exportPng.ts`: regex unicode (NFD-strip) precisa refazer pra range explícito
- `useCORS: true` sem fallback no html2canvas

**Carryover técnico do v0.1 (ainda vivos):**
- Policies tenant-scoped via `is_member_of_tenant` (resolve 13 WARNs `rls_policy_always_true`) — adiar pra v0.3+
- HaveIBeenPwned password protection — cosmético, não usamos senha
- Mike + Gab como users (manual no Supabase Dashboard) — quando Doug quiser

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
