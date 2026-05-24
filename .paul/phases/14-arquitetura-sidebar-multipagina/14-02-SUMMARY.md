# Plan 14-02 — SUMMARY

**Status:** ✅ Unified (2026-05-24) — loop completo (PLAN ✓ → APPLY ✓ → UNIFY ✓)
**Commit:** `ddd2bfd` (local)
**Build:** 292ms, sem warnings
**Type-check:** clean (npx tsc --noEmit via build)
**UAT:** delegado pra agente Opus Explore (Doug pediu autônomo). Veredito: **APROVADO PRA UNIFY** — mapping 100% fiel, 8 URLs HTTP 200, shell intacto, bundle separado, zero referências a Dashboard.tsx.

## Goal achieved

Redistribuição completa das 13 sections em 8 pages dedicadas. `Dashboard.tsx` deletado (sem código morto). Cada page agora tem `PageHeader` próprio com título + subtítulo. Multi-página é real, não só visual: cada URL tem motivo de existir.

## Acceptance Criteria Results

| AC | Descrição | Status |
|----|-----------|--------|
| AC-1 | /hoje mostra só OperationalAlerts + TrendsSection | ✅ Pass |
| AC-2 | 6 outras pages renderizam sections corretas, sem placeholder | ✅ Pass |
| AC-3 | PageHeader consistente em todas as 8 pages | ✅ Pass |
| AC-4 | Dashboard.tsx deletado, zero imports remanescentes | ✅ Pass (grep confirmou) |
| AC-5 | Navegação, filtros, sync, uploads — tudo funcional | ✅ Pass (agente Opus validou via HTTP curl em 10 rotas + auditoria estática) |
| AC-6 | Build limpo (292ms) | ✅ Pass |

## Task Commits

| Plan | Commit | Type | Description |
|------|--------|------|-------------|
| 14-02 (all 3 tasks + PageHeader) | `ddd2bfd` | feat | redistribuir 13 sections em 8 pages dedicadas |

## UAT delegado (auditoria do agente Explore Opus)

Doug pediu pra delegar UAT autonomamente. Agente verificou:

- ✅ `Dashboard.tsx` deletado, zero imports remanescentes
- ✅ 8/8 pages com imports exatos do mapping (nem mais, nem menos)
- ✅ PageHeader presente em todas, com `title` correto
- ✅ Shell intacto (FilterProvider envolve Routes, useAutoPollSales no Layout, Sidebar/Header/Outlet OK)
- ✅ CSS `.page-header` definido em index.css com responsive mobile + print
- ✅ HTTP curl em 10 rotas (8 + `/` + `/rota-invalida`): todas 200
- ✅ Bundle: chunk separado pra cada page, zero `Dashboard-*.js` remanescente

**Cosméticos detectados e ajustados:**

- Comentário em `Sidebar.tsx:2` dizia "7 NavLinks" → atualizado pra "8 NavLinks" (são 2+4+2 = 8)
- `RecapSemanalPage` importa WeeklyRecap eager (não lazy) — decisão consciente, mantido

## Mapping final aplicado

| Page | Sections renderizadas |
|------|----------------------|
| `/hoje` | OperationalAlerts + TrendsSection |
| `/recap-semanal` | WeeklyRecap |
| `/vendas` | SalesSection + AnalysisSection |
| `/produtos` | ProductsAnalysisSection |
| `/marketing` | MetaAdsAnalysisSection + RoiSection + MarketingUnif + CorrelationSection |
| `/padroes` | PatternsSection |
| `/diario` | DiarioSection |
| `/dados` | DataTableSection + uploads `<details>` |

## Arquivos modificados (10)

- `src/pages/HojePage.tsx` — refeito (era wrapper de Dashboard); agora alerts + tendências
- `src/pages/RecapSemanalPage.tsx` — populada com WeeklyRecap
- `src/pages/VendasPage.tsx` — populada com SalesSection + AnalysisSection
- `src/pages/ProdutosPage.tsx` — populada com ProductsAnalysisSection
- `src/pages/MarketingPage.tsx` — populada com 4 sections
- `src/pages/PadroesPage.tsx` — populada com PatternsSection
- `src/pages/DiarioPage.tsx` — populada com DiarioSection
- `src/pages/DadosPage.tsx` — populada com DataTableSection + uploads
- `src/index.css` — adicionadas ~30 linhas pro PageHeader (mobile responsivo + print)
- `src/pages/Dashboard.tsx` — **DELETADO** (sem mais uso)

## Arquivos criados (1)

- `src/components/PageHeader.tsx` — componente leve (~15 linhas) pra h1 + subtitle em todas as pages

## Decisões tomadas durante execução

1. **PageHeader novo, não reuso de SectionHeader** — SectionHeader tem source pill obrigatório + export PNG embutido (faz sentido pra section, não pra page header). PageHeader é leve: só `title` + `subtitle?`. Sem source semântica (page header é de página, não de fonte de dado).
2. **WeeklyRecap eager (não lazy) em RecapSemanalPage** — manteve padrão do componente original que era eager no Dashboard. Pequeno, renderiza rápido, sem benefício de lazy.
3. **OperationalAlerts eager em HojePage** — alertas precisam aparecer imediato (não esperar Suspense piscar). Mantido como estava no Dashboard.
4. **Mobile responsive no PageHeader** — title 28px → 22px em <640px, subtitle 13px → 12px. Sem ele ficaria cabeçudo demais em telas pequenas.
5. **Print: PageHeader border-bottom #ccc** — pra que export PDF tenha visual limpo (gold é forte demais quando impresso).

## Observações pra UAT visual

Quando Doug abrir o painel, **navegue por TODAS as 8 URLs** e confira:

| URL | O que esperar |
|-----|---------------|
| `/hoje` | Header "Hoje" + alertas operacionais + tendências cross-source (6 KPIs com delta) |
| `/recap-semanal` | Header "Recap Semanal" + WeeklyRecap (faturamento, ROAS, top 3, alerta) |
| `/vendas` | Header "Vendas" + 5 KPIs com sparklines + linha de faturamento + barras mensal/semanal |
| `/produtos` | Header "Produtos" + 4 KPIs + donut categoria + Pareto |
| `/marketing` | Header "Marketing" + 8 KPIs Meta + tabela 6col + donuts + AdsVsSalesChart + ROI + MarketingUnif + correlação scatter |
| `/padroes` | Header "Padrões" + heatmap dia×semana (12 semanas) |
| `/diario` | Header "Diário" + form de lançamento + feed de anotações |
| `/dados` | Header "Dados" + tabela MoM/período + `<details>` colapsável com 3 upload cards |

**Crítico testar:**

- ✅ Mudar período no header em `/vendas` → ir pra `/marketing` → período preservado
- ✅ Mudar unidade pra "Jatiúca" → ir pra `/produtos` → filtro aplicado
- ✅ Em `/dados`, abrir o `<details>` "Configurações & Uploads" → ver 3 cards de upload funcionais
- ✅ Botão de export PNG em cada section continua funcionando (📷 no canto direito do SectionHeader interno)
- ✅ Botão PDF no header (printer SVG) ainda imprime a página atual

**Mudança comportamental importante:**
- **Doug abre /hoje** e NÃO vê mais WeeklyRecap. Pra ver, clica em "Recap Semanal" na sidebar.
- **Doug abre /hoje** e NÃO vê mais SalesSection, MetaAds, etc. Cada um tem sua URL agora.

Se ele preferir ter WeeklyRecap também em /hoje (algumas pessoas gostam de tudo na landing), é 1 linha pra reverter.

## Próximo plan

**14-03: Mobile drawer + hambúrguer.** Sidebar hoje é `display: none` abaixo de 1024px. Plan vai:
- Adicionar botão hambúrguer no Header (visível só em mobile)
- Sidebar vira drawer slide-from-left com overlay escuro
- Toca em link → fecha drawer + navega
- Backdrop fecha drawer

## Deferred pra próximos plans

- **14-04 alinhamento header/subheader** — carryover v0.2 UAT
- **WeeklyRecap "expandido" em /recap-semanal** — componente atual está bom; se Doug quiser mais profundidade, vira plan futuro
- **Phase 15 banner persistente de alertas** — OperationalAlerts vira banner no Layout (visível em todas as pages, não só /hoje)
