---
phase: 06-correlacoes-analise-cruzada
plan: 03
status: complete
completed_at: 2026-05-23
---

# 06-03 SUMMARY — Tabela de dados consolidada

## O que foi entregue

Nova `DataTableSection` entre `CorrelationSection` e `RoiSection`. Duas tabelas + botão de export:

1. **Matriz Mês-a-Mês** (independente do filtro de período) — mês atual vs mês anterior, 1 linha por unidade, Δ% em badge para Total/PDV/iFood/AnotaAi. Canais inativos (Jatiúca: iFood, AnotaAi) aparecem como "—" automaticamente — detecção dinâmica via `unitHasChannel()`, sem hardcode de IDs.

2. **Tabela agregada do período** — usa filtros globais (start/end/unitId/channel). Coluna do canal selecionado fica destacada com background gold. Linha "TOTAL" agrega ambas as unidades se filtro permitir. Botão "⬇ Exportar CSV" baixa arquivo `mizu-vendas-{start}-a-{end}.csv` com BOM UTF-8 (Excel BR lê acentos certo) + separador `;`.

## Arquivos criados/modificados

**Criados:**
- `src/lib/aggregation.ts` — funções puras: `currentMonthRange`, `prevMonthRange`, `aggregateUnitMonth`, `computeDelta`, `unitHasChannel`
- `src/lib/csvExport.ts` — `buildCsv()`, `downloadCsv()`, `formatNumberBR()` — gerador genérico, sem deps externas
- `src/sections/DataTableSection.tsx` — seção principal + componentes internos `DeltaBadge`, `DeltaCell`

**Modificados:**
- `src/pages/Dashboard.tsx` — `lazy()` + `<Suspense>` pra DataTableSection (segue padrão 07-01b)
- `src/index.css` — bloco "Tabela de Dados (Phase 6-03)" no fim (~135 linhas)

## Decisões tomadas

1. **Detecção dinâmica de canal inativo** em vez de hardcode `{ serraria: [...], jatiuca: [...] }`. Função `unitHasChannel(rows, unitId, channel)` confere se há algum row > 0 nos dados dos 2 meses analisados. Mais robusto: funciona pra qualquer unidade nova adicionada no banco sem mudança de código.

2. **Sem coluna "Dinheiro"** — o HTML original tinha mas `sales_daily` não tem esse breakdown (só pdv/ifood/anotaai/total). Omitido conforme registrado nas SCOPE LIMITS do plan.

3. **CSV separator `;` + BOM UTF-8** — Excel BR padrão. Vírgula decimal nos números. Arquivo abre direto sem mexer em "Importar dados".

4. **Sem nova query / queryKey nova** — usa o mesmo `useSales` 3 vezes com ranges diferentes (currMonth, prevMonth, period). `subscribeRealtime: false` em todas (SalesSection já mantém o canal aberto pelo cache compartilhado).

5. **Matriz MoM ignora filtros globais propositalmente** — esse é o ponto da matriz: dar uma visão "fixa" mês a mês independente do que o usuário fez no header. Filtro global só afeta a tabela agregada de baixo.

6. **Botão export desabilitado quando não há dados** (`periodByUnit.length === 0`) — evita baixar CSV vazio.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa, novo chunk `DataTableSection-*.js` (9KB / 2.9KB gzip)
- [x] Sem warning de bundle (chunk principal continua em 68KB)
- [x] Lazy-loading individual com Suspense
- [ ] **Validação visual pendente:** Doug confere matriz MoM com dados reais, tenta exportar CSV no Excel BR

## Acceptance criteria

- [x] AC-1: Helpers de agregação mensal (currentMonthRange, prevMonthRange, aggregateUnitMonth, computeDelta)
- [x] AC-2: Matriz MoM com badges Δ%, "—" pra canal inativo, nota "Mês em curso"
- [x] AC-3: Tabela agregada respeita filtros globais, destaca coluna do canal selecionado, linha TOTAL
- [x] AC-4: Export CSV com BOM + separador `;` + vírgula decimal
- [x] AC-5: Visual integrado, padrão `.mizu-section`, lazy + Suspense

## Issues deferidas

- **Ordenação de colunas** — fora de escopo. Effort XS se Doug pedir.
- **Export PDF/Excel real (.xlsx)** — fora de escopo. CSV resolve a necessidade documentada.
- **Coluna "Dinheiro" como % do PDV** — não temos o dado em `sales_daily`. Precisaria mudança de schema + ingestão. Effort M se priorizar.

## Próximo passo

PLAN 06-04 — Análise de produtos: Donut por categoria + Pareto top-20 (linhas 2025-2050 do HTML).
