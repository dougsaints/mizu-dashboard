# Plano do Mizu Dashboard — estado atual

> **Para o Claude:** este é o "estado da arte" do projeto. Quando Doug
> disser "siga com o plano", leia esse arquivo, confirme em 2-3 linhas
> o que vai fazer, e comece. **Atualize esse arquivo no fim de toda
> sessão produtiva** marcando o que ficou pronto e ajustando o próximo
> passo.

**Última atualização:** 2026-05-16 (fim do dia — bug Serraria resolvido)

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
- `0003_sales_and_ads_normalized.sql` — cria `sales_daily` (faturamento
  normalizado) + `ads_daily` (Meta Ads normalizado) + colunas de
  estado em `data_sources`. **Já foi rodada por Doug no Supabase
  Dashboard em 2026-05-16.**

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

## 🚧 Próximo passo: AnotaaiUploadCard + WeeklyRecap

**Decisão tomada em 16/05:** vamos com opção A — criar primeiro o card
de upload do CSV do Anota AI, depois o WeeklyRecap com produtos
completos.

### Passo A1 — AnotaaiUploadCard (1 sessão)
Replicar padrão de `AdsUploadCard.tsx` + `useAds.ts` + `lib/metaAdsCsv.ts`.

1. Migration `0004_anotaai_products.sql` — tabela `anotaai_products`
   (produtos importados do CSV) + `anotaai_imports` (histórico).
   Encoding do CSV é **Latin-1** (não UTF-8), linha "Total,X" não é
   produto. Dedup natural: (date, product_name, unit_id).
2. Lib `src/lib/anotaaiCsv.ts` — parser. Decodificar Latin-1, ignorar
   linha "Total".
3. Hook `src/api/useAnotaai.ts` — query + Realtime + mutation upload.
4. Componente `src/components/AnotaaiUploadCard.tsx` — copiar visual do
   `AdsUploadCard`.
5. Wire-up no `Dashboard.tsx`.
6. CSS no `index.css`.

### Passo A2 — WeeklyRecap (1 sessão depois)

**Objetivo:** portar a caixa "Resumo da Semana" do painel antigo —
top 3 produtos vendidos na semana + ROAS (retorno sobre investimento
em anúncios).

**Roteiro:**
1. `src/api/useWeeklyRecap.ts` — query que agrega últimos 7 dias de
   `sales_daily` + `ads_daily` + `anotaai_products`, calcula ROAS,
   identifica top 3 produtos.
2. `src/sections/WeeklyRecap.tsx` — design do painel antigo. Achar
   lógica original com Grep "weeklyRecap" em `painel-diario.html`
   (não ler arquivo inteiro).
3. Wire-up em `Dashboard.tsx` antes da SalesSection.
4. CSS no `index.css`.

---

## 📋 Fila depois do WeeklyRecap

- **ROI / Investimento (RoiSection)** — investimento configurável
  vs retorno. Lê/grava `roi_config`. Tabela já existe.
- **Marketing Unificado (MarketingUnif)** — Orgânico vs Pago.
  Precisa upload de métricas orgânicas (Instagram/Facebook) — definir
  fonte com Doug.
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
