---
phase: 10-densidade-identidade-visual
plan: 01
status: completed
completed_at: 2026-05-23
---

## O que foi feito

Sistema de identidade visual por **fonte de dados** (Meta, AnotaAi, Instagram, Vendas, Diário) e por **unidade** (Jatiúca, Serraria) — tokens CSS + componente `SectionHeader` unificado + refactor das 12 seções.

### Arquivos tocados

- `src/index.css`:
  - Novo bloco de tokens no `:root` (linhas 62-83): 14 variáveis (`--source-*` + `--unit-*`)
  - Novo bloco `.section-header` (linhas 3152-3389): wrapper, kanji-pill 36×36 colorida, eyebrow-textual implícito via badge no canto direito, period-chip tintado, source-badge textual ("META ADS"/"VENDAS"/etc), modifiers por fonte
  - `.mizu-section { border-left-width: 8px }` — tira lateral grossa, perceptível no scroll
- `src/components/SectionHeader.tsx` (novo): API `source`, `title`, `subtitle?`, `kanji?`, `icon?`, `period?`, `actions?`, `sourceLabel?`, `showSourceBadge?`. Mapping interno `SOURCE_LABEL` pra renderizar badge textual automática
- `src/sections/*.tsx` (12 arquivos): substituído header inline `mizu-section-head` por `<SectionHeader ... />` com `source` correta e classe `is-source-X` no wrapper

### Mapeamento source-por-seção (referência pros próximos plans)

| Seção | source | Cor |
|---|---|---|
| WeeklyRecap, TrendsSection, AnalysisSection, SalesSection, PatternsSection | `vendas` | gold da marca |
| MetaAdsAnalysisSection, RoiSection | `meta` | azul Facebook |
| ProductsAnalysisSection | `anotaai` | laranja |
| MarketingUnif | `instagram` | rosa |
| DiarioSection | `diario` | verde |
| CorrelationSection, DataTableSection | `neutro` (gold) | gold |

## Decisões tomadas durante a execução

1. **v1 → v2 redesign no meio da execução.** Implementação inicial (kanji 22px colorido + border-left 4px + chip neutro) foi visualmente sub-ótima. Doug acusou no checkpoint: "vi mt diferença nao". Pivotou pra v2: kanji vira **pill 36×36 com fundo soft + borda + cor**, adicionou **badge textual "META ADS" no canto direito**, border-left engrossou pra 8px, chip de período ganhou cor da fonte. Decisão guiada pelo agente `ui-ux-designer` (que rodou 7min e crashou no socket antes de fechar, mas o CSS dele ficou e foi aproveitado/limpado).
2. **Eyebrow descartada em favor de badge no canto direito.** Inicialmente cogitei eyebrow acima do título ("META ADS" em caps). Trocou por badge no `section-header-actions` slot — fica menos competitivo com o título e libera espaço pra `actions` custom (ex: toggle Mensal/Semanal do ROI). Concatena: badge + actions no mesmo slot.
3. **MarketingUnif sem `period` prop.** Já mostra "DD/MM a DD/MM" no subtítulo (janela própria de 90 dias). Passar `period` duplicaria.

## Feedback do Doug (importante — anota)

Mesmo na v2, Doug avaliou: **"nao entendi muito bem o que mudou, nao fez muita diferença, eu aprovo mas anota isso ai"**. Aprovou pra desbloquear o sprint, mas o sinal é claro: **a identidade visual ainda não está chegando com o impacto esperado**.

**Hipóteses do porquê:**
- A paleta da marca (gold + creme + ink) é muito coesa — qualquer cor "extra" precisa de área maior pra registrar.
- A pill 36×36 com fundo `*-soft` (10% de opacidade) ainda é discreta demais. Pode precisar fundo mais saturado, ou pill maior, ou um banner horizontal no topo do header (em vez de pill + badge).
- O cliente final pode esperar **mais elementos coloridos no INTERIOR do card** (KPIs, números, badges em chart-cards) — não só no header.
- Próximos plans (10-02 KPI density, 10-03 badges, 10-04 storytelling) trazem cor pro miolo dos cards e devem cumulativamente entregar o impacto que faltou aqui.

**Decisão de manejo:** **não** revisitar 10-01 sozinho agora. Deixar acumular impacto com 10-02 → 10-04. Reavaliar quando Phase 10 inteira estiver completa. Se ainda falhar percepção, abrir 10-05 de polish remediativo.

## Próximo plan sugerido

**10-02: KPI compactos (densidade)** — atacar o "fim de espaço vazio" que o HTML antigo de referência tem. Cards de KPI com altura proporcional ao conteúdo, padding reduzido, números maiores, sub-labels menores. Aplicar em: WeeklyRecap blocks, SalesSection kpi-cards, TrendsSection grid, MetaAds donuts, etc.
