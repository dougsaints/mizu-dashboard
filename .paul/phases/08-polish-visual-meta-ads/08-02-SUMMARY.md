---
phase: 08-polish-visual-meta-ads
plan: 02
status: complete (build verde, validação visual pelo Doug pendente)
completed_at: 2026-05-23
---

# 08-02 SUMMARY — Meta Ads expandido + Hero Jatiúca

## O que foi entregue

Nova `MetaAdsAnalysisSection` no Dashboard (entre `ProductsAnalysisSection` e `PatternsSection`) com 3 visualizações que portam os gaps de Meta Ads que faltavam do painel HTML:

1. **Distribuição por Objetivo** (donut) — Verba agrupada em 3 intenções:
   - 🟢 **Performance** (categorias `ven` + `rmk` — Vendas + Remarketing)
   - 🔵 **Engajamento** (`eng`)
   - 🟡 **Alcance / Branding** (`alc` + `out`)
   - Classificação automática via `classifyCampaign(name)` — regex no nome da campanha (`[VEN]`, `[RMK]`, `DELIVERY`, `[ENG]`, `[ALC]`, `BRANDING`).

2. **Distribuição por Unidade** (donut) — Quanto da verba foi pra:
   - 🔵 **Jatiúca** (campanhas com "JATIUCA" no nome)
   - 🟣 **Serraria** (com "SERRARIA")
   - ⚪ **Geral** (sem nome de unidade — institucional/multi)

3. **Hero card "Visibilidade Jatiúca (Praia)"** — bloco com gradient azul claro (paleta praia/Jatiúca), border-left azul forte, 4 KPIs grandes:
   - Investimento Jatiúca (R$ + % do total)
   - Alcance Jatiúca (número + % do total)
   - Impressões Jatiúca (+ %)
   - Cliques Jatiúca (+ %)
   - Empty state amigável se 0 campanhas direcionadas: "Sem campanhas direcionadas pra Jatiúca no período · Nomes de campanha precisam conter 'Jatiúca' pra serem detectados."

## Arquivos criados/modificados

**Criados:**
- `src/lib/adsCategory.ts` — portado do painel HTML (linhas 2466-2489):
  - `classifyCampaign(name)` → 'rmk'|'ven'|'eng'|'alc'|'out'
  - `unitOfCampaign(name)` → 'jatiuca'|'serraria'|'geral'
  - `ADS_GOAL_GROUPS` — array com 3 grupos agrupando categorias relacionadas
  - `goalGroupOf(cat)` — helper de mapeamento reverso
- `src/components/AdsCategoryDonut.tsx` — Doughnut Chart.js + total R$ no centro
- `src/components/AdsUnitDonut.tsx` — análogo por unidade
- `src/components/JatiucaVisibilityCard.tsx` — card hero com 4 KPIs grandes + empty state
- `src/sections/MetaAdsAnalysisSection.tsx` — orquestra os 3 componentes (grid 2 cols + hero abaixo)

**Modificados:**
- `src/pages/Dashboard.tsx` — lazy() + Suspense pra MetaAdsAnalysisSection entre ProductsAnalysis e Patterns
- `src/index.css` — bloco "Análise Meta Ads + Hero Jatiúca (Phase 8-02)" no fim (~80 linhas):
  - `.ads-analysis-grid` (2 cols → 1 mobile)
  - `.jat-hero` (gradient `#E8F2FA → #fff` + border-left azul + sombra suave)
  - `.jat-hero-title`, `.jat-hero-sub`, `.jat-hero-empty`
  - `.jat-kpis` grid 4 → 2 → 1 colunas conforme breakpoint
  - `.jat-kpi`, `.jat-kpi-label`, `.jat-kpi-value` (19px destacado), `.jat-kpi-sub` em azul

## Decisões tomadas

1. **Portado FIEL às regras do painel HTML original** — `classifyCampaign` usa as mesmas regex (`[RMK]`, `DELIVERY`, `[VEN]`, etc.). Isso garante consistência se Doug usa o mesmo padrão de nomenclatura no Gerenciador Meta Ads. Se um dia ele mudar padrão, ajusta o helper sem mexer no UI.

2. **Sem filtros aplicados** — segue decisão Phase 5: Meta Ads não filtra por unitId/channel global (filtro vendido como "filtros aplicam só em vendas"). Investimento agregado sempre mostra todas as campanhas do período.

3. **`subscribeRealtime: false`** — AdsUploadCard mantém o canal aberto, MetaAdsAnalysisSection só lê do cache compartilhado por queryKey.

4. **Total no centro do donut** — padrão estabelecido nos donuts da Phase 6-04 (CategoryDonutChart). Continuidade visual.

5. **Hero Jatiúca em azul claro** vs hero KPI preto da Phase 8-01 — proposital. Azul = Jatiúca = praia. Preto/gold = institucional. Heroes diferentes por contexto.

6. **Empty state honesto** no hero — explica POR QUE pode estar vazio ("nomes precisam conter Jatiúca"). Ajuda Doug a entender se é falta de campanha ou problema de nomenclatura.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa, novo chunk `MetaAdsAnalysisSection-De6L-rJR.js`
- [x] Chunks separados (lazy + Suspense)
- [ ] **Validação visual pelo Doug pendente** após login

## Acceptance criteria

- [x] AC-1: classifyCampaign + unitOfCampaign + ADS_GOAL_GROUPS portados
- [x] AC-2: AdsCategoryDonut com 3 fatias coloridas + tooltip + total no centro
- [x] AC-3: AdsUnitDonut com 3 fatias (Jatiúca azul, Serraria roxo, Geral cinza)
- [x] AC-4: JatiucaVisibilityCard com 4 KPIs + empty state + visual azul claro
- [x] AC-5: MetaAdsAnalysisSection orquestra os 3, posição correta no Dashboard, lazy

## Issues deferidas

- **CTR por Objetivo** (gráfico extra) — não implementado nesse plan. Seria útil pra ver se Performance tem CTR mais alto que Engajamento. Effort S. Pode entrar como 08-02b se Doug pedir.
- **Editar regras de classificação via UI** — hoje as regex são hardcoded em `adsCategory.ts`. Se Doug muda convenção de nomenclatura, precisa editar código. Effort M.
- **Overrides de unidade** (linhas 2491-2533 do HTML) — painel original tem regras manuais pra dividir campanhas multi-unidade proporcionalmente. Não portado. Effort M. Se algumas campanhas misturam Jatiúca+Serraria, pode dar contagem errada.

## Próximo passo

Doug logar no painel deployado (Vercel + login OTP do 07-02b), navegar até a nova MetaAdsAnalysisSection (após Análise de Produtos), validar visualmente:
- Os 2 donuts somam pra valores que fazem sentido com a verba real do mês
- A categorização do Meta acertou (Performance vs Engajamento vs Alcance)
- O hero Jatiúca mostra dados (se houver campanhas direcionadas)
