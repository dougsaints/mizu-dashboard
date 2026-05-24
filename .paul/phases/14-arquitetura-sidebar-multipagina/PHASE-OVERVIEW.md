# Phase 14 — Arquitetura: Sidebar + Multi-página

**Milestone:** v0.3 Arquitetura Multi-Página + Analytics Aprofundadas
**Status:** Not started
**Depends on:** Nada (primeira phase da v0.3)

## Goal

Reorganizar o app de scroll-único pra estrutura com sidebar lateral esquerda + páginas separadas (URL própria por página), seguindo padrão Stripe/Linear/Vercel. Resolver carryover de alinhamento header/subheader da v0.2.

## Scope

- **Shell `<Layout>`** envolvendo `<Outlet>` com sidebar fixa esquerda
- **Sidebar specs:** 240px expandida / 64px colapsada / mobile drawer 280px com overlay. Estado persistido em localStorage. NavLink com fundo gold/10% + border-left gold no ativo
- **7 rotas:** `/hoje`, `/recap-semanal`, `/vendas`, `/produtos`, `/marketing`, `/padroes`, `/diario`, `/dados` + redirect `/` → `/hoje`
- **Redistribuir 13 sections** em 7 páginas conforme arquitetura proposta
- **Mobile:** hambúrguer no Header abre drawer (não bottom-tab, são 7 itens)
- **Header refinado:** alinhamento header vs subheader (carryover v0.2 UAT)
- **Ícones SVG inline lucide-style** pra cada item da sidebar (zero dep nova)

## Plans estimados

4-5 plans (`14-01` shell + sidebar, `14-02` redistribuir sections em páginas, `14-03` mobile drawer + responsivo, `14-04` alinhamento header/subheader, opcional `14-05` polish + testes manuais)

## Anti-patterns a evitar

- Nesting > 2 níveis
- Ícone sem label no expandido
- Reset do estado collapsed no reload
- Sidebar profunda demais (manter flat com headers de grupo)
- Atalhos teclado (Doug não usa)

## Referências visuais

- [Linear](https://linear.app) — sidebar mais limpa do mercado
- [Vercel Dashboard](https://vercel.com/dashboard) — workspace switcher + persistência
- [Plausible Analytics](https://plausible.io/sites) — "Hoje primeiro" antes de drill-down
