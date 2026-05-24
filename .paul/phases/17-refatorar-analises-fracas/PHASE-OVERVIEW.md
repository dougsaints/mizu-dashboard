# Phase 17 — Refatorar análises fracas + aprofundar razoáveis

**Milestone:** v0.3 Arquitetura Multi-Página + Analytics Aprofundadas
**Status:** Not started
**Depends on:** Phases 14-16 (estrutura final + theme + quick wins definidos)

## Goal

Atacar as sections classificadas como **Fracas** ou **Razoáveis** na auditoria de charts (v0.2 close). Cada uma vira viz/análise robusta seguindo padrão chart-theme da Phase 15.

## Scope

### Sections Fracas (refazer)

| Section | Problema | Solução proposta |
|---------|----------|------------------|
| **RoiSection** | 100% texto + inputs, zero viz | **Gauge de ROAS** com meta visível + bullet chart de margem |
| **CorrelationSection** | Só Pearson estático 2D | **Lag analysis** (D, D+1, D+2) + p-value + linha de regressão + segmentação por unidade/canal |
| **MarketingUnif** | paidPct por divisão, sem gráfico | Viz de fatia paga vs orgânica ao longo do tempo (stacked area) |

### Sections Razoáveis (aprofundar)

| Section | Aprofundamento |
|---------|---------------|
| **PatternsSection** | Adicionar **heatmap hora×dia** (restaurante vive de horário de pico — hoje só tem dia×semana fixo 12 sem) |
| **AnalysisSection** | Bars mensais com **MA sobreposta** + banda min/max + destaque mês corrente como projeção (não fato consumado) |
| **ProductsAnalysisSection** | **Treemap** hierárquico categoria→produto complementando Pareto linear |
| **OperationalAlerts** | Migrar thresholds fixos pra **z-score** (mais robusto a outlier) |

## Plans estimados

5-6 plans

## Carryover absorvido

Da v0.2 (audit do agente 11-03-AUDIT.md):
- Heatmap tooltip rico ✓ (já existe `.heatmap-tooltip` branded)
- Sinergia diária pago + orgânico ✓ (parte do MarketingUnif refeito + waterfall em Hoje da Phase 16)

Da v0.1:
- Estender toggle Mensal/Semanal pro gráfico de Vendas → cabe no AnalysisSection aprofundado
