# Plano do Mizu Dashboard — estado atual

> **Para o Claude:** este é o "estado da arte" do projeto. Quando Doug
> disser "siga com o plano", leia esse arquivo, confirme em 2-3 linhas
> o que vai fazer, e comece. **Atualize esse arquivo no fim de toda
> sessão produtiva** marcando o que ficou pronto e ajustando o próximo
> passo.

**Última atualização:** 2026-05-16

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

---

## 🟡 Pendências curtas (resolver na próxima sessão)

1. **Commit + push do trabalho de 16/05** — está local, falta subir pro
   GitHub. (Possivelmente já feito; verificar com `git log`.)
2. **Validação visual final** — Doug abriu localhost depois da migration?
   Os dados das planilhas aparecem na SalesSection? Confirmar com ele.

---

## 🚧 Próximo passo: WeeklyRecap

**Objetivo:** portar a caixa "Resumo da Semana" do painel antigo, que
mostra os 3 produtos mais vendidos da semana + ROAS (retorno sobre
investimento em anúncios).

**Por que essa é a próxima:** o usuário já tem dados de faturamento
(`sales_daily`) e de ads (`ads_daily`) no banco — WeeklyRecap só
**combina** os dois. Não precisa de fonte de dados nova, é só lógica
de agregação + UI.

**Roteiro sugerido (siga o padrão de SalesSection):**
1. Criar `src/api/useWeeklyRecap.ts` — query que agrega últimos 7 dias
   de sales + ads, calcula ROAS, identifica top 3 produtos
2. Criar `src/sections/WeeklyRecap.tsx` — usa o hook + design do
   painel antigo (consultar `painel-diario.html`, procurar `weeklyRecap`)
3. Wire-up em `Dashboard.tsx` antes da SalesSection
4. Appendar CSS no `index.css`

**Dependência de dado:** o painel antigo lê os "top 3 produtos" do CSV
do Anota AI (`Produtos-consulta-gerada-em-*.csv`). Hoje **não temos
upload desse CSV no app novo** — provavelmente precisa criar
`AnotaaiUploadCard.tsx` antes. Decidir com Doug: portar com upload
manual ou deixar produtos vazios temporariamente?

**Onde está a lógica no painel antigo:** usar Grep pra procurar
"weeklyRecap" em `painel-diario.html`. Não ler o arquivo inteiro.

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
