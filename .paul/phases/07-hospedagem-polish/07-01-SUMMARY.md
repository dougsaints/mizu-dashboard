---
phase: 07-hospedagem-polish
plan: 01
status: complete (preparação) — deploy real aguarda Doug
completed_at: 2026-05-23
---

# 07-01 SUMMARY — Deploy Vercel prep

## O que foi entregue

Toda a preparação de repo pra que o deploy Vercel seja **clique-clique** quando Doug sentar pra fazer. O deploy real em si NÃO foi executado (precisa de Doug logado na Vercel + GitHub) — ficou documentado num passo-a-passo claro.

## Arquivos criados/modificados

- **`vercel.json`** — mínimo, só com `rewrites` SPA (`/((?!api/.*).*) → /index.html`) pra evitar 404 em refresh de rotas. Sem `buildCommand` / `framework` explícito — Vercel auto-detecta Vite. Sem ruído.
- **`DEPLOY.md`** — guia em PT-BR, 7 passos curtos, com troubleshooting comum:
  1. Criar conta Vercel (via GitHub)
  2. Import project mizu-dashboard
  3. Vercel auto-detecta Vite (não mexer)
  4. Colar 3 env vars (com tabela explicando onde achar cada uma)
  5. Clicar Deploy
  6. Testar URL gerada
  7. (Opcional) Custom domain
- **`.paul/phases/07-hospedagem-polish/07-01-PLAN.md`** — plano executável

## Decisões tomadas

1. **`vercel.json` ultra-mínimo.** Vercel detecta Vite sozinho — adicionar `framework`, `buildCommand`, `outputDirectory` explicitamente só polui. Só o `rewrites` é estritamente necessário (sem ele, F5 numa rota dá 404).

2. **Regex `/((?!api/.*).*)` em vez de `/(.*)`.** Hoje não temos `/api/*` (não tem Vercel Functions), mas o regex deixa preparado pra se um dia migrarmos lógica server-side. Custo: zero.

3. **DEPLOY.md em PT-BR, didático.** Doug é leigo (CLAUDE.md) — guia precisa explicar onde achar `VITE_SUPABASE_URL`, `VITE_MIZU_TENANT_ID`, etc. com print mental ("Supabase Dashboard → Settings → API"). Troubleshooting cobre os 3 erros mais comuns ("Failed to fetch", build TS error, 404 em refresh).

4. **Auto-deploy via GitHub mencionado mas não configurado pela minha mão.** Vercel ativa auto-deploy por padrão quando importa de GitHub — Doug só precisa saber que existe.

5. **Free tier documentado** — pra calmar ansiedade de "vai cobrar?". Nosso bundle 250KB gzip × ~100 visitas/dia = 7,5GB/mês << 100GB/mês do free tier.

## Verificação

- [x] `vercel.json` valida como JSON
- [x] `npm run build` continua passando (chunk principal 69KB / 23KB gzip, sem warning)
- [x] DEPLOY.md tem 7 passos + troubleshooting

## O que Doug precisa fazer manualmente (estimativa: 10 min)

1. Criar conta Vercel via GitHub
2. Import project `dougsaints/mizu-dashboard`
3. Colar 3 env vars (copiar do `.env.local` local + 1 query SQL)
4. Clicar Deploy
5. Testar URL `xxx.vercel.app`

Detalhes em `DEPLOY.md`.

## Pendência (Phase 7 não termina aqui)

**07-02 — Autenticação** aguarda decisão do Doug:

- **A) Senha compartilhada** — 1 senha pra todos. Simples mas inseguro.
- **B) Magic link via Supabase Auth** — clica link enviado por email. Sem senha.
- **C) Login + senha via Supabase Auth** — cada um com conta. Mais robusto.

Pra 3-4 usuários internos (Doug, Mike, Gab, assessoria), **B (magic link)** é o caminho mais comum: zero senha pra lembrar, controle via Supabase Dashboard de quem entra (lista de emails autorizados). Mas é decisão do Doug.

Quando ele escolher, eu crio PLAN 07-02 + implemento.

## Próximo passo

1. Doug abre `DEPLOY.md` e faz o deploy (5 min)
2. Doug valida que `xxx.vercel.app` carrega
3. Doug me avisa qual estratégia de auth quer
4. Eu implemento 07-02
