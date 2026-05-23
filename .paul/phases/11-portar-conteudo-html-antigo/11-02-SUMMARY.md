---
phase: 11-portar-conteudo-html-antigo
plan: 02
status: completed
completed_at: 2026-05-24
---

## O que foi feito

Complementado os 2 donuts do `MetaAdsAnalysisSection` com:
- **Tabela "Por Categoria"** sob o donut de Objetivo (3 linhas: Performance/Engajamento/Alcance, com Valor + % do total)
- **3 cards de unidade lado a lado** sob o donut de Unidade (Jatiúca azul / Serraria roxo / Geral neutro, com Valor + %)

## Mudanças

**`MetaAdsAnalysisSection.tsx`:**
- Imports: `classifyCampaign`, `goalGroupOf`, `unitOfCampaign`, `ADS_GOAL_GROUPS`, `AdsGoalKey`, `AdsUnit` de `../lib/adsCategory`
- 2 useMemo novos: `byGoal` (cost por goal group) e `byUnit` (cost por unidade)
- Tabela e cards inline nos chart-cards existentes (sem componente novo)

**`index.css`:**
- `.cat-breakdown-table` — tabela 12px com header uppercase, células 8px, dot colorido por categoria
- `.unit-breakdown-cards` — grid 3 colunas; `.unit-breakdown-card--{jatiuca|serraria|geral}` com border-left colorido via tokens unit-X

## Decisão tomada

Inline (sem extrair componentes) — economia de boilerplate, e o conteúdo é específico do MetaAdsAnalysisSection. Se outras seções quiserem o mesmo pattern depois, refatora pra `<BreakdownTable>` + `<BreakdownCards>`.

## Próximo plan

Phase 11 tem mais 1 item pendente no ROADMAP: "Auditoria das outras seções (Vendas, Anota AI, Instagram orgânico) vs HTML antigo — listar e portar o que faltou". Mas isso é trabalho de discovery (precisa Grep + Read no painel antigo) e tem retorno marginal comparado ao impacto de Phases 12 (organização/mobile) e 13 (exportação). Adiar pra carryover, seguir pra Phase 12.
