# Sushi Mizú Dashboard

## What This Is

Um painel web que centraliza dados de vendas, Meta Ads e delivery do Sushi Mizú, com atualização automática de alguns dados (Google Sheets) e upload manual de outros num momento inicial (Meta Ads CSV, Anota AI CSV). Projetado para leitura diária rápida e análise de tendências e correlações entre fontes.

## Core Value

Dono do restaurante, gestor e time de assessoria têm acesso rápido às principais métricas de faturamento, tráfego pago e marketing orgânico em um único lugar — sem abrir múltiplas plataformas.

## Current State

| Attribute | Value |
|-----------|-------|
| Type | Application |
| Version | 0.1.0 |
| Status | MVP em construção (Fase 5 de 7 completa) |
| Last Updated | 2026-05-22 (após Phase 5) |

## Requirements

### Core Features

- Visualização diária de vendas (ontem, semana, mês) com comparação de períodos
- Acompanhamento de métricas de tráfego pago (Meta Ads)
- Acompanhamento de marketing orgânico e delivery (Anota AI)
- Comparativos entre períodos (diário, semanal, mensal)
- Cruzamento de dados entre fontes para identificar tendências e correlações

### Validated (Shipped)

- [x] Scaffold base (React + TypeScript + Vite + Supabase) — v0.1
- [x] Leitura de planilhas Google Sheets (vendas Serraria + Jatiúca) — v0.1
- [x] Upload de CSV Meta Ads — v0.1
- [x] Seção de diário de operações — v0.1
- [x] Upload e visualização de dados Anota AI (produtos/delivery) — v0.1
- [x] WeeklyRecap — resumo semanal (faturamento, ROAS, top 3 produtos) — v0.1
- [x] RoiSection — ROI / investimento vs retorno (salvo na nuvem) — v0.1
- [x] MarketingUnif — marketing unificado Instagram (total + fatia paga) — v0.1
- [x] Gráfico de linha de faturamento diário por unidade (Chart.js) — Phase 5
- [x] Gráficos de Meta Ads e delivery — Phase 5
- [x] Seletor global de período (calendário + 12 atalhos) — Phase 5
- [x] Filtros globais Unidade + Canal de Venda — Phase 5
- [x] Comparativos entre períodos (anterior / mês passado) com delta ▲▼% nos KPIs e linha tracejada no gráfico — Phase 5
- [x] Análise mensal/semanal agregada (AnalysisSection com barras agrupadas) — Phase 5

### Active (In Progress)

- [ ] Nada em andamento — próximo: correlações e análise cruzada (Phase 6)

### Planned (Next)

- [ ] Correlação Meta Ads × Vendas (Phase 6)
- [ ] Painel de tendências e indicadores consolidados (Phase 6)
- [ ] Hospedagem no Vercel (Phase 7)
- [ ] Code-splitting do bundle (>500KB) (Phase 7)
- [ ] Autenticação básica (Phase 7, pós-MVP)

### Out of Scope

- MovimentoSection (covers no salão) — não vai ser portada
- API paga do Meta Ads — upload manual de CSV por enquanto
- Autenticação — pós-MVP (acesso por URL no momento)

## Constraints

### Technical Constraints

- Meta Ads: sem API pública gratuita — upload manual de CSV
- Anota AI: CSV encoding Latin-1, linha "Total,X" não é produto
- Google Sheets: lidas como CSV publicado (polling 5min)
- Auth: nenhuma no MVP (phase1_anon_access — qualquer um com URL lê/escreve)
- 1 tenant (Sushi Mizú) + 2 unidades (Serraria + Jatiúca)

### Business Constraints

- Hospedagem: gratuita ou muito barata (Vercel free tier definido)
- Sem prazo fixo, mas MVP funcional é prioridade
- Usuários leigos — interface deve ser simples e intuitiva

## Key Decisions

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Vercel para hospedagem | Free tier, deploy automático via GitHub, SSL incluído | 2026-05-18 | Active |
| Sem auth no MVP | Reduz complexidade; URL privada suficiente por ora | 2026-05-18 | Active |
| Upload manual Meta Ads | Meta não tem API pública gratuita | 2026-05-18 | Active |
| React Query + Supabase Realtime | Atualização automática sem polling manual | 2026-05-18 | Active |
| Filtros globais via FilterProvider (Context único) | Período + Unidade + Canal + cmpMode + analysisMode num só lugar; setters via spread preservam outros campos | 2026-05-22 | Active |
| Filtros Unidade/Canal aplicam só em Vendas | Meta Ads ~48% sem loja, Anota AI 100% sem; filtrar lá esconderia dado válido | 2026-05-22 | Active |
| queryKey de queries derivadas separada do prefix invalidado por Realtime | Evita cascade de invalidates → loop ERR_INSUFFICIENT_RESOURCES. Pattern: QK_X_CMP separada + staleTime alto | 2026-05-22 | Active |
| Hooks Realtime multi-consumer com opt-out (subscribeRealtime?: false) | Cache do React Query é compartilhado pela queryKey; 2º consumer não precisa abrir WebSocket próprio | 2026-05-22 | Active |

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Todas as fontes de dados conectadas | 4 fontes (Vendas, Meta, Delivery, Orgânico) | 4/4 | ✅ Completo |
| Comparativo de períodos funcionando | Diário + semanal + mensal | 3/3 | ✅ Completo (Phase 5) |
| Correlações entre métricas visíveis | Pelo menos 2 cruzamentos | - | Phase 6 (próxima) |
| Leitura diária efetiva | Time usa todo dia sem abrir outras plataformas | - | Pós-deploy (Phase 7) |

## Tech Stack / Tools

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + TypeScript + Vite | — |
| Banco de dados | Supabase (PostgreSQL) | Schema em supabase/migrations/ |
| Hospedagem | Vercel (free tier) | Deploy via GitHub |
| Auth | Nenhuma (MVP) | phase1_anon_access policy |
| Dados externos | Google Sheets (CSV publicado) | Polling 5min |
| Tráfego pago | Meta Ads CSV (upload manual) | — |
| Delivery/produtos | Anota AI CSV (upload manual) | Encoding Latin-1 |

## Links

| Resource | URL |
|----------|-----|
| Repository | https://github.com/dougsaints/mizu-dashboard |
| Painel original | painel-diario.html (referência, 5000+ linhas) |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-05-22 after Phase 5*
