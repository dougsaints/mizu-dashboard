---
phase: 10-densidade-identidade-visual
plan: 03
status: completed
completed_at: 2026-05-23
---

## O que foi feito

Cores por unidade padronizadas (Jatiúca azul `#2980B9`, Serraria roxo `#8E44AD`) em todo o painel + badge colorida da unidade dentro do `.unit-card` da SalesSection.

## Mudanças

**`src/components/SalesLineChart.tsx`:**
- `PALETTE` antiga `['#e8623d', '#3d8be8', ...]` (laranja+azul) → nova `['#8E44AD', '#2980B9', ...]` (roxo+azul)
- Reflete em: linhas do gráfico de faturamento dia-a-dia por loja

**`src/sections/AnalysisSection.tsx`:**
- `COLOR_SERRARIA` `#e8623d` → `#8E44AD`
- `COLOR_JATIUCA` `#3d8be8` → `#2980B9`
- Reflete em: bars charts "Faturamento por período" e "Custo Meta Ads por período"

**`src/sections/SalesSection.tsx`:**
- `.unit-card-name` substituído por `<div className="unit-card-badge unit-card-badge--{jatiuca|serraria|other}">{NOME EM CAPS}</div>`
- `.unit-card` ganhou classe modifier `.jatiuca` ou `.serraria` baseada no nome

**`src/index.css`:**
- Novo bloco no final: `.unit-card { border-left-width: 6px !important }` + `.unit-card.jatiuca/.serraria { border-left-color: var(--unit-X) !important }` + `.unit-card-badge--jatiuca/--serraria` (chip em soft-color, caixa-alta, peso 800)

## Resultado esperado no browser

- Charts de Vendas (linha) e Análise (barras) agora mostram Serraria em roxo + Jatiúca em azul, consistente com .unit-card e .ads-unit-card já existentes
- Cada unit-card abre com uma **badge azul "JATIÚCA"** ou **roxa "SERRARIA"** em caixa-alta + border-left 6px da cor

## Decisão tomada

**Trocar laranja por roxo na Serraria pode confundir memória muscular do cliente** — mas o ROADMAP da v0.2 foi explícito em pedir "cores por unidade consistentes (Jatiúca azul, Serraria roxo)". Honrei o roadmap. Se Doug quiser reverter, é mudança trivial (3 hex codes).

## Próximo plan

**10-04: Storytelling em prosa nos heroes** — replicar pattern do TrendsSection.buildSummary em outros lugares: WeeklyRecap (frase contextual da semana), MarketingUnif (frase sobre alcance pago vs total), eventualmente RoiSection (frase sobre ROAS atingido).
