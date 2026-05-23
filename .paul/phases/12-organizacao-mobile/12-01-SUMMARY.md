---
phase: 12-organizacao-mobile
plan: 01
status: completed
completed_at: 2026-05-24
---

## O que foi feito

Dashboard reorganizado pela ordem natural de leitura + 3 upload cards agrupados num bloco colapsável discreto no rodapé.

## Nova ordem das seções (Dashboard.tsx)

1. WeeklyRecap (resumo da semana)
2. TrendsSection
3. SalesSection (Vendas)
4. AnalysisSection (Vendas mensal/semanal)
5. MetaAdsAnalysisSection
6. RoiSection
7. ProductsAnalysisSection (Anota AI)
8. MarketingUnif (Instagram orgânico)
9. PatternsSection
10. CorrelationSection
11. DataTableSection
12. DiarioSection
13. **⚙ Configurações & Uploads** (`<details>` colapsável fechado por padrão) — Ads Upload, Anota AI Upload, Instagram Upload

## CSS

`.uploads-area` — bloco com border-top dashed, summary stilizado tipo "tab" creme com arrow rotacionado quando aberto. Pattern HTML nativo (`<details>`) — zero dependência, acessível.

## Resultado

Build limpo. O scroll principal agora termina no Diário, e os uploads ficam acessíveis mas fora do caminho.
