# Plano do Mizu Dashboard — estado atual

> **Para o Claude:** este é o "estado da arte" do projeto. Quando Doug
> disser "siga com o plano", leia esse arquivo, confirme em 2-3 linhas
> o que vai fazer, e comece. **Atualize esse arquivo no fim de toda
> sessão produtiva** marcando o que ficou pronto e ajustando o próximo
> passo.

**Última atualização:** 2026-05-22 (Passo A3 — RoiSection validado e commitado)

---

## Onde estamos

Migrando o painel HTML antigo (`painel-diario.html`) para um app Cloud
moderno (`mizu-dashboard/`). O motivo é tirar os dados do localStorage
de um celular só (onde Mike vê uma coisa e Gab vê outra) e centralizar
no Supabase, sincronizado em tempo real entre todos os dispositivos.

**Fase atual:** Fase 1 — portar seções do painel.

---

## ✅ O que já está pronto

### Infraestrutura
- App React + TypeScript + Vite criado em `mizu-dashboard/`
- Supabase configurado, 10 tabelas multi-tenant criadas
- Tenant Sushi Mizú + 2 unidades (Serraria, Jatiúca) populados
- 3 fontes de dados (Google Sheets) cadastradas
- Realtime ativo em diary, sales, ads, data_sources
- GitHub: `dougsaints/mizu-dashboard`

### Seções já portadas (Fase 1)
- **Diário do Time** — escrever notas que sincronizam entre dispositivos
- **Faturamento (SalesSection)** — KPIs por unidade, lê planilhas
  Google automaticamente a cada 5 min, breakdown PDV/Anota AI/iFood
- **Upload Meta Ads (AdsUploadCard)** — sobe CSV do Gerenciador de
  Anúncios, histórico acumulado, dedup automático
- **SyncStatusBadge** no header — mostra "🟢 atualizado há Xmin" com
  botão "🔄 atualizar agora"

### Última migration do banco
- `0004_anotaai_products.sql` — cria `anotaai_imports` (audit log de
  uploads) + `anotaai_products` (produtos do Anota AI normalizados com
  categoria). **Rodada via MCP em 2026-05-18. Tabelas vazias aguardando
  primeiro upload.**
- `0003_sales_and_ads_normalized.sql` — cria `sales_daily` +
  `ads_daily` + colunas de estado em `data_sources`. Rodada em 2026-05-16.

### Bug fix de 16/05 (fim do dia)
- **Sintoma:** badge "🔴 Falha em 1 fonte(s)" + Serraria não aparecia.
- **Causa:** planilha Serraria tem datas duplicadas (28/03/2026 e
  03/04/2026 aparecem 2x). Upsert em batch quebra com 500 ("ON CONFLICT
  cannot affect row a second time").
- **Conserto em [src/lib/sheets.ts](src/lib/sheets.ts):** dedup por
  data antes do upsert (última linha vence) + serialização de erro do
  Supabase decente (antes guardava "[object Object]" em `last_error`).
- **Validado:** Faturamento Serraria mostra R$ 319.771,29 em 30 dias,
  badge verde "3 fontes · agora". Pendências 1 e 2 resolvidas.

---

## 🚧 Próximo passo: ROI / Investimento (RoiSection)

**Decisão tomada em 16/05:** opção B — AnotaaiUploadCard antes do
WeeklyRecap, pra ter Top 3 produtos completo de uma vez.

### Passo A1 — AnotaaiUploadCard ✅ código pronto (16/05)

Implementado seguindo padrão de `AdsUploadCard` + `useAds` + `metaAdsCsv`.
Arquivos criados/atualizados:
- `supabase/migrations/0004_anotaai_products.sql` — 2 tabelas:
  `anotaai_imports` (audit log com payload jsonb) e `anotaai_products`
  (1 linha por produto com snapshot_date + categoria).
- `src/types/database.ts` — entradas pras 2 tabelas novas.
- `src/lib/anotaaiCsv.ts` — parser: tenta UTF-8 estrito, cai pra
  windows-1252 se falhar. Categoriza produto (port da função
  `categorizeItem` do painel antigo). Extrai data do nome do arquivo
  ("Produtos-consulta-gerada-em-DD-MM-AAAA.csv"). Ignora linha "Total".
- `src/api/useAnotaai.ts` — query + Realtime + mutation upload.
- `src/components/AnotaaiUploadCard.tsx` — UI com seletor de unidade
  ("Todas / Serraria / Jatiúca") + data do snapshot + arquivo +
  botão Importar. Mostra últimos 5 uploads.
- Wire-up no [Dashboard.tsx](src/pages/Dashboard.tsx).
- CSS appendado em [index.css](src/index.css).

**✅ Migration rodada via MCP em 2026-05-18.**
- `anotaai_imports`: criada, 0 linhas (aguardando primeiro upload)
- `anotaai_products`: criada, 0 linhas (aguardando primeiro upload)
- Realtime ativo, RLS + policy `phase1_anon_all` aplicadas

**✅ Upload testado e validado em 2026-05-18.**
Seção aparece corretamente no browser. Upload do CSV funcionou:
1 import registrado, 70 produtos importados no banco.

### Passo A2 — WeeklyRecap ✅ validado e commitado (22/05)

Implementado seguindo padrão do painel antigo (`renderWeeklyRecap()`):
- `src/api/useWeeklyRecap.ts` — query única que busca em paralelo
  `units` + `sales_daily` (14 dias) + `ads_daily` (semana atual) +
  `anotaai_products` (snapshot mais recente). Calcula ROAS, top 3
  produtos, alerta de queda > 15%. Realtime subscribe nas 3 tabelas.
- `src/sections/WeeklyRecap.tsx` — UI com 3 blocos em grid: faturamento
  por unidade + delta vs semana anterior, ROAS de marketing, top 3
  produtos do último snapshot Anota AI.
- Wire-up em `Dashboard.tsx` antes da SalesSection.
- CSS appendado em `index.css`.

**Validação 22/05 — 3 bugs encontrados e corrigidos em `useWeeklyRecap.ts`:**
1. Comparava semana parcial (4 dias) contra semana cheia (7 dias) —
   gerava queda falsa de ~80%. Agora compara janelas de mesmo tamanho.
2. `toISO()` usava horário UTC: data "23:59 local" virava o dia
   seguinte no banco (Brasil é UTC-3), inflando o "prev" em 1 dia.
   Agora `toISO()` formata pela data local.
3. Comparava "até hoje" mesmo com a planilha atrasada — como o Sheets
   tem lag de 1-2 dias, comparava 2 dias reais contra 4. Agora ancora
   no último dia COM dado e compara o mesmo nº de dias.
- **Validado no browser:** Serraria ▲1%, Jatiúca ▼12%, sem alerta falso.

---

### Passo A3 — RoiSection ✅ validado e commitado (22/05)

Implementado seguindo padrão do painel antigo (`recomputeRoi()`):
- Migration **não precisou** — `roi_config` já existe desde a 0001
  (Realtime + RLS + policy `phase1_anon_all` já aplicados na 0001/0002).
- CSS **não precisou** — classes `roi-grid/roi-input-card/roi-metric/`
  `roi-toggle` já estavam no `index.css`.
- `src/api/useRoi.ts` — query busca `roi_config` (com defaults se a
  linha não existir) + `sales_daily` do mês corrente. Calcula
  faturamento do mês E da semana de uma vez, pra o toggle Mensal/
  Semanal não refazer fetch. Mutation `useSaveRoiConfig` faz UPSERT.
  Realtime subscribe em `roi_config` + `sales_daily`.
- `src/sections/RoiSection.tsx` — 3 inputs (tráfego / mão de obra /
  mkt geral) salvos na nuvem ao sair do campo, toggle Mensal/Semanal,
  e 3 métricas: faturamento do período, margem (verde/vermelho),
  ROAS de marketing (faturamento ÷ investimento total).
- Wire-up em `Dashboard.tsx` logo abaixo do WeeklyRecap.

**Diferença vs painel antigo:** os valores agora salvam no Supabase
(antes era `localStorage` de um aparelho só) — Mike e Gab veem o
mesmo número, sincronizado em tempo real.

**Bug encontrado e corrigido na validação (22/05):** o toggle Mensal/
Semanal "travava" — só mexia depois de 2 idas ao servidor (salvar +
recarregar). Adicionada **atualização otimista** em `useSaveRoiConfig`:
a tela troca na hora e o salvamento roda em segundo plano (`onMutate`
patcheia o cache, `onError` desfaz se falhar).

**Validado no browser 22/05:** 3 blocos OK (faturamento R$ 360.572,
margem R$ 349.572, ROAS 32,78x), toggle fluido.

---

## 📋 Fila depois do RoiSection

- **Marketing Unificado (MarketingUnif)** — Total Instagram + fatia paga.
  **PRÓXIMO A FAZER.** Padrão a copiar: `AdsUploadCard` + `useAds` +
  `metaAdsCsv`.

  **⚠️ Enquadramento decidido (22/05):** os números do Business Suite
  são TOTAL (orgânico + pago juntos — Instagram não separa no export).
  Doug escolheu mostrar o **total real do Instagram** + ao lado **quanto
  e qual % veio dos anúncios** (Meta Ads / `ads_daily`). NÃO estimar
  "orgânico = total − pago" (estimativa imprecisa, descartada). A seção
  cruza: alcance total do Instagram × alcance pago dos anúncios → "X%
  do alcance foi impulsionado por anúncio".

  **Fonte (22/05):** upload de CSVs do Meta Business Suite — só
  Instagram (canal principal do Mizú). Exemplos em
  `../Instagram Metricas/` (6 arquivos de maio/2026).

  **Formato real do export (descoberto 22/05):**
  - **1 arquivo por métrica** — Doug exportou 6: Alcance, Visualizações,
    Interações, Visitas (ao perfil), Cliques no link, Seguidores.
  - Encoding **UTF-16 LE com BOM** (`FF FE`). Parser tem que detectar
    BOM e usar `TextDecoder('utf-16le')`, senão cai pra utf-8.
  - Estrutura: linha 1 `sep=,` (ignorar), linha 2 `"<Título da métrica>"`,
    linha 3 `"Data","Primary"`, linhas 4+ `"2026-05-01T00:00:00","valor"`.
  - Métrica identificada pela linha 2 (título). Mapear por palavra-chave:
    Alcance→alcance, Visualiz→visualizacoes, Intera→interacoes,
    Seguidor→seguidores_novos, Visita→visitas_perfil, Clique→cliques_link.
  - "Seguidores" = novos seguidores por dia (92, 65, 56…), NÃO total.
    Confirmado por Doug 22/05 (tooltip do Business Suite mostra valor/dia;
    o "1,7 mil" do topo é o total ganho no período).
  - Dados vão até 05-21 mesmo arquivo dizendo "até 22" — lag de 1 dia.

  **⚠️ Mudança de schema necessária:** `organic_entries` foi criada na
  0001 com colunas erradas (posts/stories/reels/alcance/engajamento) —
  não batem com o export real. Migration nova tem que reescrever pra:
  `tenant_id, date, alcance, visualizacoes, interacoes, seguidores_novos,
  visitas_perfil, cliques_link` (PK tenant_id+date).

  **Passos pra próxima sessão:**
  1. Migration `0005_*.sql` — recriar/alterar `organic_entries`.
  2. Tipos em `database.ts`.
  3. `src/lib/instagramCsv.ts` — parser UTF-16, multi-arquivo, merge por data.
  4. `src/api/useOrganic.ts` — query + Realtime + mutation upload.
  5. Componente upload (multi-file, aceita os 6 de uma vez).
  6. Seção `MarketingUnif` — total do Instagram (`organic_entries`) +
     fatia paga vinda de `ads_daily` (investimento, alcance/% do total).
- **Gráficos Chart.js de Vendas** — completar SalesSection com 5
  gráficos do painel antigo.
- **Fase 2 — Auth** (~1.5 dia). Login email/senha, ativar RLS estrita.
- **Fase 3 — Multi-tenant** (~2.5 dias). Outros clientes.
- **Fase 4 — Widgets por nicho** (~4 dias).
- **Fase 5 — Deploy + custom domain** (~0.5 dia/cliente).

---

## 🧭 Decisões importantes já tomadas (não re-perguntar)

- **Google Sheets:** polling automático a cada 5 min em background +
  botão manual. Pausa quando aba oculta.
- **Meta Ads CSV:** acumula histórico, dedup automático por
  (data, campanha, conjunto, unidade) — upload do mesmo arquivo 2x
  não dobra números.
- **MovimentoSection (covers no salão)** — não vai ser portada.
  Doug não vai usar.
- **Linguagem:** português, padrão BR (datas dd/mm/yyyy na UI,
  R$ 1.234,56 nos números).
