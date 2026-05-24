# Phase 15 — Aviso planilha desatualizada + Chart theme tokenizado

**Milestone:** v0.3 Arquitetura Multi-Página + Analytics Aprofundadas
**Status:** Not started
**Depends on:** Phase 14 (Layout shell pra plugar banner persistente)

## Goal

Fechar gap "planilha desatualizada pro dono" identificado na discussão da v0.3, e resolver débito técnico de chart (cores hardcoded + tooltip default Chart.js).

## Scope

### Aviso planilha pro dono (não pra Claude)

- Refazer `detectMissingDays` com mensagem direcionada: "⚠ Jatiúca: 3 dias sem registro (último: 21/05). Doug, atualize a planilha pra hoje."
- Distinguir 2 cenários: **sync OK mas dado vazio** (dono não preencheu) vs **sync falhou** (problema técnico). Hoje aparecem juntos
- Limiar configurável por unidade (Jatiúca pode ter padrão diferente de Serraria)
- **Banner persistente no `<Layout>`** (não só na home `/hoje`) — sempre visível enquanto o gap persistir
- Botão "Abrir planilha" linkando direto pro Sheets correto

### Chart theme tokenizado (débito técnico)

- Criar `src/lib/chartTheme.ts` centralizando paleta (Serraria roxo, Jatiúca azul, Meta, Gold, etc) e helpers `brl/brlShort/num`
- **Tooltip plugin branded único** — registrar 1× pra todos os charts (background `--ink-soft`, border `--mizu-gold`, font Inter, cornerRadius)
- Migrar 14 charts pra consumir tokens (hoje cada um redefine cor)
- Helper `unitSlug(name)` em `src/lib/` — eliminar duplicação `unitName.toLowerCase().includes('jatiu')` em 3 lugares
- `KPI_DEFS.map()` no MetaAdsAnalysisSection (refator dos 8 KPIs inline)
- Unificar 2 blocos `@media print` separados no `index.css`
- Refazer regex unicode em `exportPng.ts` pra range explícito
- Fallback se `useCORS:true` falhar no html2canvas

## Plans estimados

3-4 plans (`15-01` aviso planilha pro dono, `15-02` chart theme + tokens, `15-03` débito técnico restante, opcional `15-04` polish)

## Carryover absorvido

Da v0.2:
- Tooltip Chart.js customizado branded ✓
- Débito técnico (KPI_DEFS.map, unitSlug, @media print, regex unicode, useCORS fallback) ✓
