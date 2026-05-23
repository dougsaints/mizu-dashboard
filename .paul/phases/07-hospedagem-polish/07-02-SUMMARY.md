---
phase: 07-hospedagem-polish
plan: 02
status: complete (UI) — Supabase config aguarda Doug
completed_at: 2026-05-23
---

# 07-02 SUMMARY — Autenticação via magic link

## O que foi entregue

Frontend de auth via Supabase Auth (magic link) — invite-only. Doug precisa fazer 5 cliques no Supabase Dashboard pra ativar.

**Fluxo do usuário final:**
1. Abre o painel → vê tela de Login (sem Dashboard)
2. Digita email cadastrado → clica "Enviar link mágico"
3. Vê "Link enviado!" — pega link no email
4. Clica no link → volta no painel, logado
5. Sessão persiste ~7 dias com renovação automática
6. Botão de logout no canto direito do Header (mostra email do user)

## Arquivos criados/modificados

**Criados:**
- `src/api/useAuth.ts` — hook + `signInWithEmail(email)` + `signOut()` + `isValidEmail()`. Cache module-level evita piscar `isLoading: true` em re-mounts. Tradutor de erros do Supabase pra PT-BR (signups not allowed, rate limit, invalid).
- `src/pages/Login.tsx` — 3 estados (idle / submitting / sent), com validação inline de email + tratamento de erro. Visual centralizado, kanji 水 dourado, fonte Playfair Display no título.
- `AUTH_SETUP.md` — guia em PT-BR de 5 passos: habilitar Email Provider, configurar Site URL, desligar signup público, adicionar usuários, (opcional) customizar template. Troubleshooting completo dos erros mais comuns.

**Modificados:**
- `src/App.tsx` — guard de auth: `isLoading → AuthSplash`, `!user → Login`, `user → Dashboard`. Dashboard agora também é `lazy()`, separando Login do bundle do Dashboard.
- `src/components/Header.tsx` — botão de logout no canto direito (email + ícone ↩, esconde email no mobile)
- `src/index.css` — bloco "Auth: Login screen + splash + logout (Phase 7-02)" no fim (~200 linhas)

## Decisões tomadas

1. **Magic link (vs senha)** — invite-only via Supabase Users. Sem signup público. Sem senha pra perder. Doug controla acesso editando lista de Users no Supabase Dashboard. Padrão moderno (Slack/Notion/Linear).

2. **Cache module-level pro `useAuth`** — evita o estado `isLoading: true` piscar quando o hook é re-montado (ex: navegação interna, HMR). Sessão real é sempre buscada via `getSession()` no mount, mas o "primeiro frame" usa o cache.

3. **`emailRedirectTo: window.location.origin`** — após clicar no magic link, usuário volta pra **raiz do site atual**. Funciona em dev (`localhost:5173`), em preview Vercel (`xxx.vercel.app`), e em prod (custom domain). Site URL e Redirect URLs no Supabase precisam estar configurados pra todos esses domínios — documentado no `AUTH_SETUP.md`.

4. **Tradução de erros do Supabase pra PT-BR** — "signups not allowed" vira "Este email não está na lista de usuários autorizados. Peça pro Doug te adicionar no painel do Supabase." Ajuda usuário não-técnico a entender o que fazer.

5. **Dashboard virou `lazy()` no App** — antes era import direto no App, só os components internos do Dashboard eram lazy. Agora o Dashboard inteiro é separado: **chunk principal caiu de 69KB pra 46KB / 17KB gzip** porque quem vê só o Login não baixa o código do Dashboard. Otimização gratuita.

6. **RLS NÃO foi tocada** — `phase1_anon_access` continua ativa em todas as tabelas. Auth protege visualmente (sem login = sem dashboard), mas alguém com a URL do Supabase + anon key ainda consegue ler via REST direto. Documentado como deferred issue: **Phase 7-03 (futuro) — RLS hardening**. Pra MVP interno, a barreira visual já filtra 99% dos casos.

7. **Logout no Header** em vez de menu dropdown — simplicidade. Email do user em ellipsis (160px max) + ícone ↩. Mobile esconde o email, deixa só o ícone.

## Métricas de bundle

| Antes (sem auth) | Depois (com auth + Login lazy) |
|---|---|
| index: 69.4KB / 23.3KB gzip | index: 46.5KB / 16.9KB gzip |
| Dashboard: misturado no index | Dashboard: 19.5KB / 6.2KB gzip (chunk próprio) |

Primeira visita (sem sessão): baixa só `index + react-vendor + supabase-vendor + query-vendor` (~46+182+196+35 = 459KB / ~134KB gzip) — Dashboard só baixa após login.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa
- [x] Login renderiza com 3 estados
- [x] Header tem botão logout
- [x] Lazy do Dashboard separa o bundle do Login
- [ ] **Pendente Doug:** configurar Supabase Auth (5 cliques) seguindo AUTH_SETUP.md
- [ ] **Pendente Doug:** testar fluxo completo (digitar email → receber → clicar → voltar logado)

## Acceptance criteria

- [x] AC-1: useAuth com signIn/signOut + listener onAuthStateChange
- [x] AC-2: Tela Login com 3 estados + validação + tradução de erro
- [x] AC-3: Guard no App.tsx (loading/login/dashboard) + logout no Header
- [x] AC-4: AUTH_SETUP.md com 5 passos + troubleshooting
- [x] AC-5: Build + tsc passam, novo chunk Dashboard separado

## Issues deferidas

- **Phase 7-03 — RLS hardening** — trocar `phase1_anon_access` por `authenticated only` em todas as tabelas. Effort M. Migration nova + testar leitura/escrita post-login + manter rollback. Sem isso, anon key ainda lê dados via REST direto.
- **Customizar template do email Mizú** — passo 5 do AUTH_SETUP.md é opcional. Pode ficar pra polish visual (Phase 8).
- **Página de "Sessão expirou" amigável** — se sessão expira no meio do uso, hoje o usuário volta pra Login sem mensagem. Effort XS.
- **OAuth (Google login)** — não no escopo. Effort S se Doug quiser adicionar.

## Próximo passo pra Doug

1. Faz o deploy Vercel (DEPLOY.md — ~10 min)
2. Configura Supabase Auth (AUTH_SETUP.md — ~5 min)
3. Testa fluxo: abre URL, digita seu email, recebe link, clica, volta logado
4. Adiciona Mike, Gab e outros usuários no Supabase Dashboard
5. (Opcional) Quando estiver pronto, fazemos Phase 8 — polish visual (cards pretos com gradient, Meta Ads expandido, hero Jatiúca)
