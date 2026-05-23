# Roadmap: Sushi Mizú Dashboard

## Overview

Portar o painel HTML monolítico (`painel-diario.html`) para uma aplicação web moderna com banco de dados, atualização automática e análise cruzada de métricas. O MVP (v0.1) entregou leitura diária efetiva de vendas, tráfego pago, delivery e marketing orgânico, com auth + RLS hardening. A v0.2 foca em **polish visual, densidade, organização e exportação PNG/PDF** — alinhar o React ao padrão visual do HTML antigo de referência e ganhar fluxo de envio pro cliente.

## Current Milestone

**v0.2 Polish, Densidade & Exportação** (v0.2.0)
Status: 🚧 In Progress
Phases: 0 of 4 complete

**Foco:** Trazer o melhor visual do HTML antigo pro React, fechar gaps de conteúdo, reorganizar o Dashboard pra leitura limpa em desktop + mobile, e adicionar exportação PNG/PDF pro fluxo WhatsApp/email do cliente.

## Phases

| Phase | Name | Plans | Status | Completed |
|-------|------|-------|--------|-----------|
| 10 | Densidade visual + identidade por fonte | TBD | Not started | - |
| 11 | Portar conteúdo do HTML antigo | TBD | Not started | - |
| 12 | Organização do Dashboard + Mobile | TBD | Not started | - |
| 13 | Exportação PNG / PDF | TBD | Not started | - |

## Phase Details

### Phase 10: Densidade visual + identidade por fonte

**Goal:** Trazer o React ao padrão visual do HTML antigo de referência — cards mais densos, identidade clara por fonte de dados, storytelling em prosa nos heroes.
**Depends on:** Nada (primeira phase da v0.2)
**Plans:** TBD (definidos via `/paul:plan`)

**Scope:**

- Header de seção com ícone + cor temática por fonte: Meta Ads azul Facebook, Anota AI laranja, Instagram rosa/gradient, Vendas dourado, Diário verde
- Cards KPI compactos (altura proporcional ao conteúdo, fim do espaço vazio)
- Badges coloridos por categoria (Engajamento roxo, Vendas dourado, Alcance ocre)
- Cores por unidade consistentes em todo painel (Jatiúca azul, Serraria roxo)
- Storytelling em prosa nos heroes individuais (replicar pattern do `TrendsSection.buildSummary`)
- Cabeçalho contextual de seção com data/período do snapshot visível

---

### Phase 11: Portar conteúdo do HTML antigo

**Goal:** Fechar gaps de conteúdo identificados via comparação com o `painel-diario.html` de referência.
**Depends on:** Phase 10 (identidade visual já definida pra aplicar nos novos componentes)
**Plans:** TBD (definidos via `/paul:plan`)

**Scope:**

- 8 KPIs Meta-only no topo do `MetaAdsAnalysisSection` (Investimento, Alcance, Impressões, Cliques, CTR, CPM, CPC, Frequência) — hoje só Investimento e Cliques aparecem no `TrendsSection` cross-source
- Tabela "Por Categoria" complementando o donut existente (donut = proporção; tabela = valores absolutos + delta INVEST se houver comparação)
- Cards de unidade lado a lado complementando o donut por unidade (paralelo ao donut, valor absoluto por loja)
- Auditoria das outras seções (Vendas, Anota AI, Instagram orgânico) vs HTML antigo — listar e portar o que faltou

---

### Phase 12: Organização do Dashboard + Mobile

**Goal:** Separar área de leitura (números) de área de upload (configuração), reordenar seções por importância, ficar mobile-friendly de verdade.
**Depends on:** Phases 10 + 11 (componentes finais definidos antes de reorganizar)
**Plans:** TBD

**Scope:**

- Separar área de leitura vs área de upload/configuração: `AdsUploadCard`, `AnotaaiUploadCard`, `InstagramUploadCard` saem do scroll principal e vão pra rodapé / "Configurações" / final do scroll discreto
- Reordenar seções por importância natural de leitura: Tendências → Vendas → Meta Ads → Delivery (Anota AI) → Marketing orgânico → Padrões/Correlações → Diário → Configurações/Uploads
- Mobile responsivo de verdade — reflow de cards em 1 coluna, gráficos com tamanho adequado, touch targets >44px, header com filtros colapsável (não só "encolheu")
- Avaliar deferred do v0.1: filtro global de período no topo (carryover) — incluir aqui se fizer sentido junto da reorganização

---

### Phase 13: Exportação PNG / PDF

**Goal:** Resolver o fluxo de envio pro cliente: botão exportar PNG por seção (WhatsApp) + relatório PDF (diário ou semanal).
**Depends on:** Phases 10-12 (exportar tem que pegar o painel já polido, não a bagunça atual)
**Plans:** TBD

**Scope:**

- Botão "📷 Exportar PNG" por seção — gera PNG com proporção vertical pra WhatsApp (~1080×1920), padding adequado, marca d'água 水 dourado no canto, data + URL no rodapé. Usar `html2canvas` (já no `package.json`)
- Botão "📄 Exportar relatório PDF" — modo "diário" (dia anterior) e "semanal" (segunda-feira, geral da semana). Combina seções relevantes em PDF formatado com cabeçalho personalizado ("Sushi Mizú — Relatório do dia DD/MM" / "Relatório semanal DD/MM → DD/MM")
- Lib pra PDF: começar com `window.print()` + CSS print-friendly (zero dependência nova); cair pra `jspdf` se a qualidade não bater

---

## Completed Milestones

<details>
<summary>v0.1 MVP — 2026-05-23 (9 phases, 20 plans, 8 dias)</summary>

| Phase | Name | Plans | Completed |
|-------|------|-------|-----------|
| 1 | Fundação e dados de vendas | 3 | 2026-05-16 |
| 2 | Meta Ads | 1 | 2026-05-16 |
| 3 | Anota AI / Delivery | 1 | 2026-05-18 |
| 4 | Resumos: semana, ROI e marketing | 1 | 2026-05-22 |
| 5 | Gráficos e comparativos | 5 | 2026-05-22 |
| 6 | Correlações e análise cruzada | 5 | 2026-05-23 |
| 7 | Hospedagem, polish e autenticação | 4 | 2026-05-23 |
| 8 | Polish visual + Meta Ads expandido | 2 | 2026-05-23 |
| 9 | RLS hardening (authenticated-only) | 2 | 2026-05-23 |

Detalhes completos: [`.paul/milestones/v0.1-ROADMAP.md`](milestones/v0.1-ROADMAP.md)
Summary executivo: [`.paul/MILESTONES.md`](MILESTONES.md)

</details>

## Carryover (deferred issues vivos do v0.1)

Itens que sobreviveram à milestone v0.1 e que podem virar plans dentro da v0.2 ou de milestones futuras:

- **Policies tenant-scoped via `is_member_of_tenant`** — resolve 13 WARNs `rls_policy_always_true`. Requer popular `tenant_users`. Effort M. → adiado pra v0.3 (técnico, não bloqueia v0.2).
- **Filtro global de período no topo do sistema** — substituir/sincronizar os seletores 7/30/60. Effort M. → candidato pra Phase 12 (organização do Dashboard).
- **Estender toggle Mensal/Semanal pro gráfico de linha de Vendas** — Effort S. → revisitar se Doug sentir falta usando.
- **HaveIBeenPwned password protection** — cosmético. Effort XS. → adiar.
- **Adicionar Mike + Gab como usuários autorizados** — tarefa manual Doug no Supabase Dashboard. → quando ele quiser dar acesso.

---
*Roadmap created: 2026-05-18*
*Last updated: 2026-05-23 (milestone v0.2 aberta via /paul:milestone)*
