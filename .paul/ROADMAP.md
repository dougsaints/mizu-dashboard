# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (painel-diario.html) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP entrega leitura diária efetiva de vendas, tráfego pago e delivery. Fases posteriores adicionam análise comparativa, correlações e hospedagem em produção.

## Current Milestone

**v0.1 MVP** (v0.1.0)
Status: Em progresso
Phases: 4 of 7 complete

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Fundação e dados de vendas | 3 | ✅ Complete | 2026-05-16 |
| 2 | Meta Ads | 1 | ✅ Complete | 2026-05-16 |
| 3 | Anota AI / Delivery | 1 | ✅ Complete | 2026-05-18 |
| 4 | Resumos: semana, ROI e marketing | 1 | ✅ Complete | 2026-05-22 |
| 5 | Gráficos e comparativos | 5 | 🔨 Em progresso | - |
| 6 | Correlações e análise cruzada | 2 | 📋 Not started | - |
| 7 | Hospedagem, polish e autenticação | 2 | 📋 Not started | - |

## Phase Details

### Phase 1: Fundação e dados de vendas ✅

**Goal:** Scaffold base funcional com banco de dados e leitura de planilhas de vendas
**Depends on:** Nada (primeira fase)

**Scope:**
- Scaffold React + TypeScript + Vite + Supabase
- Tabelas de vendas no banco
- Leitura de Google Sheets (Serraria + Jatiúca) via CSV publicado
- Seção de diário de operações
- Upload de Meta Ads CSV

**Plans:**
- [x] 01-01: Scaffold e configuração base
- [x] 01-02: Integração Google Sheets + tabela de vendas
- [x] 01-03: Upload Meta Ads CSV + seção de diário

---

### Phase 2: Meta Ads ✅

**Goal:** Visualização de métricas de tráfego pago via upload de CSV
**Depends on:** Phase 1

**Plans:**
- [x] 02-01: Componente de upload + tabela + exibição de métricas Meta Ads

---

### Phase 3: Anota AI / Delivery ✅

**Goal:** Visualização de dados de delivery e produtos via upload de CSV Anota AI
**Depends on:** Phase 1

**Scope:**
- Parsing de CSV Latin-1 do Anota AI
- Tabela `anotaai_products` no banco
- Componente de upload + visualização de produtos/delivery

**Plans:**
- [x] 03-01: Upload Anota AI + tabela + exibição de métricas de delivery

---

### Phase 4: Resumos: semana, ROI e marketing ✅

**Goal:** Painéis de resumo que cruzam as fontes de dados num panorama executivo rápido
**Depends on:** Phase 3 (todas as fontes principais conectadas)

> ⚠️ Esta fase foi construída fora do loop do PAUL (sessões de 20-22/05,
> registradas no `PLAN.md`) e documentada retroativamente em 22/05, quando
> o PAUL foi reconciliado com a realidade.

**Scope:**
- WeeklyRecap — resumo semanal (faturamento vs semana anterior, ROAS, top 3 produtos)
- RoiSection — ROI / investimento vs retorno, configuração salva no Supabase
- MarketingUnif — marketing unificado Instagram (total real + fatia paga)
- Migration 0005 — recriação de `organic_entries` + `organic_imports`

**Plans:**
- [x] 04-01: WeeklyRecap + RoiSection + MarketingUnif (documentado retroativamente)

---

### Phase 5: Gráficos e comparativos

**Goal:** Gráficos visuais por tipo de métrica e comparação entre períodos
**Depends on:** Phase 4
**Research:** Likely (escolha de biblioteca de gráficos)

**Scope:**
- Gráficos de linha/barra para vendas diárias e semanais
- Comparativo: ontem vs semana passada vs mês passado
- Gráficos para Meta Ads (impressões, cliques, custo)
- Gráficos para delivery/Anota AI

**Plans:**
- [x] 05-01: Gráfico de linha de vendas por unidade (completo 22/05)
- [x] 05-02: Gráficos Meta Ads e delivery + seletor de período (completo 22/05)
- [x] 05-03: Seletor de período completo (calendário + 12 atalhos) (completo 22/05)
- [ ] 05-04: Filtros de Unidade e Canal de Venda
- [ ] 05-05: "Comparar com" + Análise mensal/semanal

> Notas:
> - Chart.js + react-chartjs-2 já estavam instalados — a parte
>   "biblioteca de gráficos" do 05-01 virou só configuração.
> - Os planos 05-03/04/05 nasceram do pedido do Doug (22/05) de portar a
>   barra de filtros completa do painel original. Quebrada em 3 planos:
>   Período (03), Unidade/Canal (04), Comparar/Análise (05).
> - A 1ª versão do 05-03 (3 botões 7/30/60) foi revisada — simples demais
>   perto da referência.

---

### Phase 6: Correlações e análise cruzada

**Goal:** Cruzamento de métricas entre fontes para identificar tendências e ações efetivas
**Depends on:** Phase 5 (gráficos base prontos)
**Research:** Likely (definir quais correlações fazem sentido pro negócio)

**Scope:**
- Painel de correlação: Meta Ads × Vendas
- Comparativo semanal consolidado (todas as fontes)
- Indicadores de tendência (subiu/caiu vs período anterior)

**Plans:**
- [ ] 06-01: Correlação Meta Ads × Vendas
- [ ] 06-02: Painel de tendências e indicadores consolidados

---

### Phase 7: Hospedagem, polish e autenticação

**Goal:** MVP em produção, visual limpo e acesso controlado
**Depends on:** Phase 6

**Scope:**
- Deploy no Vercel via GitHub
- Refinamento de UX (mobile-friendly, legibilidade)
- Autenticação básica (login simples, pós-MVP)

**Plans:**
- [ ] 07-01: Deploy Vercel + configuração de ambiente
- [ ] 07-02: Auth básico + polish final

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-22 (reconciliação — Fase 4 nova, renumeração das seguintes)*
