# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (painel-diario.html) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP entrega leitura diária efetiva de vendas, tráfego pago e delivery. Fases posteriores adicionam análise comparativa, correlações e hospedagem em produção.

## Current Milestone

**v0.1 MVP** (v0.1.0)
Status: Em progresso
Phases: 3 of 6 complete

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 1 | Fundação e dados de vendas | 3 | ✅ Complete | 2026-05-16 |
| 2 | Meta Ads | 1 | ✅ Complete | 2026-05-16 |
| 3 | Anota AI / Delivery | 1 | 🚧 In progress | - |
| 4 | Gráficos e comparativos | 2 | 📋 Not started | - |
| 5 | Correlações e análise cruzada | 2 | 📋 Not started | - |
| 6 | Hospedagem, polish e autenticação | 2 | 📋 Not started | - |

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

### Phase 3: Anota AI / Delivery 🚧

**Goal:** Visualização de dados de delivery e produtos via upload de CSV Anota AI
**Depends on:** Phase 1
**Research:** Unlikely (padrão de upload já existe em Meta Ads)

**Scope:**
- Parsing de CSV Latin-1 do Anota AI
- Tabela `anotaai_products` no banco
- Componente de upload + visualização de produtos/delivery

**Plans:**
- [ ] 03-01: Upload Anota AI + tabela + exibição de métricas de delivery

---

### Phase 4: Gráficos e comparativos

**Goal:** Gráficos visuais por tipo de métrica e comparação entre períodos
**Depends on:** Phase 3 (todas as fontes de dados conectadas)
**Research:** Likely (escolha de biblioteca de gráficos)

**Scope:**
- Gráficos de linha/barra para vendas diárias e semanais
- Comparativo: ontem vs semana passada vs mês passado
- Gráficos para Meta Ads (impressões, cliques, custo)
- Gráficos para delivery/Anota AI

**Plans:**
- [ ] 04-01: Biblioteca de gráficos + gráficos de vendas
- [ ] 04-02: Gráficos Meta Ads e delivery + seletor de período

---

### Phase 5: Correlações e análise cruzada

**Goal:** Cruzamento de métricas entre fontes para identificar tendências e ações efetivas
**Depends on:** Phase 4 (gráficos base prontos)
**Research:** Likely (definir quais correlações fazem sentido pro negócio)

**Scope:**
- Painel de correlação: Meta Ads × Vendas
- Comparativo semanal consolidado (todas as fontes)
- Indicadores de tendência (subiu/caiu vs período anterior)

**Plans:**
- [ ] 05-01: Correlação Meta Ads × Vendas
- [ ] 05-02: Painel de tendências e indicadores consolidados

---

### Phase 6: Hospedagem, polish e autenticação

**Goal:** MVP em produção, visual limpo e acesso controlado
**Depends on:** Phase 5

**Scope:**
- Deploy no Vercel via GitHub
- Refinamento de UX (mobile-friendly, legibilidade)
- Autenticação básica (login simples, pós-MVP)

**Plans:**
- [ ] 06-01: Deploy Vercel + configuração de ambiente
- [ ] 06-02: Auth básico + polish final

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-18*
