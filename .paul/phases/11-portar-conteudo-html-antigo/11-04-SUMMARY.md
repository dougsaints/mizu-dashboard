---
phase: 11
plan: 04
status: completed
completed_at: 2026-05-24
---

# 11-04: Topo de Vendas refeito (5 KPIs + sparklines + Item Mais Vendido)

## O que foi feito

- **Novo componente** `src/components/Sparkline.tsx` — SVG inline puro, ~50 linhas, sem dependências. Path + opcional fill com gradiente translúcido.
- **`SalesSection.tsx` reescrito**: topo agora tem 5 cards (substitui os 2 KPIs antigos):
  1. **Vendas Totais** (hero preto/dourado com watermark 水, sparkline gold)
  2. **Item Mais Vendido** (do snapshot mais recente do Anota AI no período, top 1 por quantity)
  3. **PDV Loja Física** (sparkline azul Jatiúca-like)
  4. **iFood** (sparkline laranja AnotaAi-like)
  5. **Anota AI** (sparkline verde Diário-like)
- Cada card tem: ícone emoji + label uppercase + valor formatado + delta ▲/▼ vs período comparado + sub-info ("% do total" ou "vs R$ X (data – data)") + sparkline mini
- Reage dinamicamente a unidade/canal/período (via useFilters) — exatamente o que Doug pediu
- Mantém abaixo: ticket médio + unit cards detalhados + gráfico de linha completo

## Decisões de design

- **brlShort no hero** (R$ 469,7K em vez de R$ 469.722,34) — mais escaneável quando vê 5 cards lado a lado
- **% do total** no sub-texto (em vez de "X dias com dados") — Doug pediu "ver quanto cada canal rendeu"
- **Cores das sparklines** seguem a fonte de cada canal (PDV azul como Jatiúca, iFood laranja como AnotaAi-fonte, Anota AI verde) — código de cor consistente
- **Grid 1.4fr+1fr×4** desktop, reflow pra 3 cols < 1100px e 2 cols < 640px (hero ocupa span)

## Arquivos modificados

- `src/components/Sparkline.tsx` (novo)
- `src/sections/SalesSection.tsx` (refator completo do topo, ~330 linhas)
- `src/index.css` (+150 linhas: `.sales-top-grid`, `.sales-top-card`, `.sales-top-card--hero`, `.sales-top-icon`, `.sales-top-lbl/val/name/sub/spark`)

## Build

`tsc --noEmit` limpo.

## Próximo

11-05: Header em 2 níveis.
