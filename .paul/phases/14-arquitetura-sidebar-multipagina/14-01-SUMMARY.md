# Plan 14-01 — SUMMARY

**Status:** ✅ Applied (2026-05-24)
**Build:** 377ms, sem warnings
**Type-check:** clean (npx tsc --noEmit)
**Aguardando:** UAT visual do Doug

## Goal achieved

Shell de layout multi-página criado. Sidebar esquerda fixa com 7 NavLinks agrupados em 3 categorias + 8 rotas + `/hoje` preservando 100% do painel atual. Outras 7 rotas mostram placeholder pedagógico explicando que 14-02 vai popular.

## Arquivos criados (10)

- `src/components/Sidebar.tsx` (~135 linhas) — sidebar com NavLinks, toggle collapse, persistência localStorage, ícones SVG inline lucide-style, logout
- `src/components/Layout.tsx` (~20 linhas) — shell com Sidebar + Header + Outlet, `useAutoPollSales(300)` global
- `src/pages/HojePage.tsx` — wrapper que renderiza Dashboard atual (temporário até 14-02)
- `src/pages/RecapSemanalPage.tsx` — placeholder
- `src/pages/VendasPage.tsx` — placeholder
- `src/pages/ProdutosPage.tsx` — placeholder
- `src/pages/MarketingPage.tsx` — placeholder
- `src/pages/PadroesPage.tsx` — placeholder
- `src/pages/DiarioPage.tsx` — placeholder
- `src/pages/DadosPage.tsx` — placeholder

## Arquivos modificados (3)

- `src/App.tsx` — `FilterProvider` lifted pra acima de `<Routes>`, todas as 8 rotas dentro de `<Layout />` parent, redirect `/ → /hoje`, catch-all `* → /hoje`
- `src/pages/Dashboard.tsx` — removido `<Header />`, `<FilterProvider>`, `useAutoPollSales(300)` e o `<main>` wrapper (subiram pro Layout); agora é só um fragment com as 13 sections + uploads `<details>`
- `src/index.css` — adicionadas ~280 linhas no fim (app-shell, sidebar, page-placeholder, print overrides)

## Decisões tomadas durante execução

1. **`JSX.Element` → `ReactNode`** — React 19 não expõe `JSX` namespace por default; ajustado tipo do `NavItem.icon` pra `ReactNode` importado de `react`. Erro detectado pelo `tsc -b` (build), passou silenciosamente no IDE.
2. **Toggle só visível quando expandido + kanji só visível quando expandido** — primeiro tentei manter ambos no estado colapsado (cramped a 64px), depois mudei pra: colapsado mostra só toggle (chevron-right) centralizado; expandido mostra kanji + label + toggle (chevron-left). Mais limpo.
3. **CSS tokens reais usados** — o plano sugeriu `--ink-soft`, `--ink-border`, `--txt-1` (não existem). Usei os reais: `--card`, `--border`, `--txt`, `--mizu-gold-soft`, `--mizu-ink`. Fica consistente com o resto do app (light theme cream + gold).
4. **Sidebar background `var(--card)` + sutil box-shadow** — pra dar profundidade na fronteira com `--bg`. Border-right + sh-sm pra leitura natural sem peso.
5. **Hover state**: `--mizu-gold-soft` background + `--mizu-gold-deep` text. Active state: mesmo background + border-left 3px `--mizu-gold` + font-weight 600.
6. **`body:has(.sidebar-collapsed) .app-shell-main`** — selector com `:has()` pra ajustar margin do main sem precisar duplicar estado React no Layout. Funciona em todos os browsers modernos.
7. **Print overrides**: `@media print { .sidebar { display: none } .app-shell-main { margin-left: 0 } }` — pra que export PDF (Phase 13-02) continue funcionando sem sidebar atravessando.
8. **HojePage delibera renderizar Dashboard inteiro** — preserva zero regressão visual; 14-02 vai refatorar pra "Hoje focado" (só alertas + recap + tendências do dia, resto pras outras pages).
9. **`useAutoPollSales` movido pro Layout** — polling de planilha precisa rodar globalmente (não morrer quando navega entre páginas).

## Observações pra UAT visual

Quando Doug abrir http://localhost:5173/ (ou Ctrl+Shift+R pra forçar reload), deve ver:

- ✅ Redirect automático pra `/hoje`
- ✅ Sidebar à esquerda (240px, fundo branco + sutil sombra) com:
  - Topo: kanji 水 + "Sushi Mizú" + botão chevron-left pra colapsar
  - 3 grupos separados por linha sutil:
    - VISÃO GERAL: Hoje, Recap Semanal
    - ANÁLISES: Vendas, Produtos, Marketing, Padrões
    - OPERAÇÃO: Diário, Dados
  - Rodapé: avatar circular gold com iniciais + email truncado + botão logout (hover vermelho)
- ✅ Conteúdo da `/hoje` IDÊNTICO ao painel atual (todas as sections, filtros funcionam)
- ✅ Clicar em "Vendas" → URL muda pra `/vendas`, vê placeholder dourado dizendo o que virá
- ✅ Clicar no chevron-left → sidebar contrai pra 64px, só ícones aparecem (label vira tooltip nativo no hover)
- ✅ Reload (F5) → sidebar mantém estado colapsado/expandido
- ✅ Mudar período no header em `/hoje` → navegar pra `/vendas` → voltar pra `/hoje` → período preservado (FilterProvider acima de Routes)

**Mobile (<1024px):** sidebar OCULTA, conteúdo ocupa largura total. Drawer mobile entra em 14-03 — esperado nessa task.

## Próximo plan

**14-02: Redistribuir sections em pages.** Atualmente HojePage = Dashboard inteiro. 14-02 vai:
- Hoje = OperationalAlerts + WeeklyRecap + TrendsSection (recap do dia, foco)
- Vendas = SalesSection + AnalysisSection
- Produtos = ProductsAnalysisSection
- Marketing = MetaAdsAnalysisSection + RoiSection + MarketingUnif + CorrelationSection
- Padrões = PatternsSection (+ TrendsSection se duplicar)
- Diário = DiarioSection
- Dados = DataTableSection + uploads `<details>`
- Recap Semanal = WeeklyRecap expandido (TBD)

## Deferred pra próximos plans da Phase 14

- **14-03 mobile drawer:** sidebar entra como drawer com hambúrguer no Header (hoje só hidden em <1024px)
- **14-04 alinhamento header/subheader:** carryover v0.2 UAT — subheader alinha esquerda, header com padding diferente
- **14-05 (opcional):** polish + atalhos teclado? (Doug decide se precisa — provavelmente não)
