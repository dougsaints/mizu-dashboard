---
phase: 08-polish-visual-meta-ads
plan: 01
status: complete (build verde, validação visual pelo Doug pendente)
completed_at: 2026-05-23
---

# 08-01 SUMMARY — KPI heroes pretos com gradient

## O que foi entregue

Card "hero" (preto com gradient ink-2 → ink + watermark kanji 水 dourado + texto branco/dourado) aplicado nos KPIs estrela do painel:

1. **SalesSection** — card "Total geral · período selecionado" (era branco, agora preto com gradient)
2. **TrendsSection** — primeiro card "Faturamento" no grid de 6 KPIs (props `hero={true}` via TrendCard)

Demais KPIs (Ticket médio na SalesSection; outros 5 da TrendsSection) seguem o visual claro atual. Hero deve ser raro pra ter impacto — usar em 2 de ~10 KPIs no painel mantém a hierarquia visual.

## Arquivos modificados

- `src/index.css` — bloco "KPI hero (Phase 8-01)" no fim (~80 linhas):
  - `.kpi-card.kpi-hero` (gradient escuro + border gold-deep + box-shadow profunda + inset gold sutil)
  - `.kpi-card.kpi-hero::before` (kanji 水 grande no canto direito inferior, opacity 0.1)
  - Variantes de cor pros `.kpi-label`, `.kpi-value`, `.kpi-sub`, `.kpi-delta--*` no fundo escuro
  - `.trend-card--hero` versão adaptada pro tamanho do grid 3-col (kanji 96px vs 140px)
  - Media query mobile escala o watermark proporcionalmente
- `src/sections/SalesSection.tsx` — 1 linha: `kpi-card` → `kpi-card kpi-hero` no Total geral
- `src/components/TrendCard.tsx` — nova prop `hero?: boolean`; classList condicional
- `src/sections/TrendsSection.tsx` — passa `hero={m.key === 'faturamento'}` no mapeamento

## Decisões tomadas

1. **Apenas 2 heroes no painel inteiro** — escassez é o que dá peso visual. Se tudo é hero, nada é hero.

2. **Kanji 水 watermark via `::before` + `z-index`** — fiel ao HTML original. `opacity: 0.1` (subi de 0.08 do original) pra ficar um pouco mais legível na renderização moderna. Pointer-events none pra não interferir em interação.

3. **`.kpi-card > *` com `position: relative; z-index: 1`** — garante que o conteúdo fica ACIMA do watermark.

4. **Adaptações no badge `.kpi-delta`** — variantes `--up`, `--down`, `--flat`, `--empty` no fundo escuro usam tons claros (rgba branco) pra contraste correto. Mesmo padrão pro `.trend-delta--*`.

5. **`.trend-card--hero` separado de `.kpi-card.kpi-hero`** — diferentes tamanhos/paddings. Cards de Trend são mais compactos no grid 3-col; precisa ajustar dimensão do watermark.

6. **Mobile responsive** — watermark `100px` em vez de `140px` no kpi-hero, `70px` no trend-card hero — pra não estourar visualmente em telas pequenas.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa (sem mudança em tamanho de bundle — só CSS adicional)
- [ ] **Validação visual pelo Doug pendente:** abrir Vercel + logar via OTP + ver SalesSection (Total Geral preto) e TrendsSection (1º card preto)

## Acceptance criteria

- [x] AC-1: CSS `.kpi-card.kpi-hero` + watermark + variantes de cor
- [x] AC-2: Hero aplicado no Total Geral (SalesSection)
- [x] AC-3: Hero aplicado no Faturamento (TrendsSection) via prop nova

## Próximo passo

**PLAN 08-02 — Meta Ads expandido + Hero Jatiúca** (gráficos de distribuição da verba por categoria/unidade + bloco destacado pra Visibilidade Jatiúca).
