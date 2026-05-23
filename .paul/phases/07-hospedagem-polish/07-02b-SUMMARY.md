---
phase: 07-hospedagem-polish
plan: 02b
status: complete (deployado, aguarda teste end-to-end do Doug)
completed_at: 2026-05-23
---

# 07-02b SUMMARY — OTP fallback no Login

## Contexto (bug encontrado)

No primeiro teste do Doug com o auth deployado (Phase 7-02), o magic link clicado pelo Gmail Web retornou "One-time token not found" no `/verify` do Supabase. Logs confirmaram: token de uso único já consumido antes do clique.

**Causa:** Gmail Web pré-carrega URLs em emails (URL scanner / preview de segurança). Esse pré-carregamento consome o token. Quando usuário clica logo depois, 403.

**Evidência:** o mesmo usuário logou com sucesso uma vez (13:54:23 — primeiro magic link). No segundo magic link (após logout), o `/verify` recebeu o token mas não achou no DB. Indica pré-consumo, não bug de config.

## O que foi entregue

Campo de **código numérico OTP** como fallback do magic link. O mesmo email do Supabase contém 2 coisas: link clicável + código de 8 dígitos. Códigos não sofrem pré-consumo (Gmail não digita códigos sozinho).

UI: estado `sent` agora mostra:
1. Mensagem "Link enviado" (igual antes)
2. Bloco separado por linha tracejada: "Se o link não funcionar (acontece com Gmail), digite o **código de 8 dígitos** que está no mesmo email"
3. Input centralizado em monospace com letter-spacing (visual de código de verificação)
4. Botão "Entrar com código"
5. Botão "Tentar com outro email" no rodapé (mantido)

Após `verifyOtp` bem-sucedido, o `onAuthStateChange` do Supabase dispara, `useAuth` detecta sessão, `App.tsx` troca pra Dashboard automaticamente. Mesmo fluxo do magic link, só muda o canal.

## Arquivos modificados

- `src/api/useAuth.ts` — nova função `verifyEmailOtp(email, token)` com validação 6-8 dígitos + tradução PT-BR de erros (reusa `translateError` existente)
- `src/pages/Login.tsx` — novo estado `'verifying'`, novo handler `handleOtpSubmit`, novo bloco JSX `.login-otp-block`. Mantém fluxo do magic link 100% intacto.
- `src/index.css` — bloco "OTP fallback (Phase 7-02b)" com `.login-otp-block`, `.login-otp-label`, `.login-otp-input` (monospace + letter-spacing 6px, font-size maior).

## Decisões tomadas

1. **OTP como complemento, não substituição.** O fluxo principal continua sendo magic link (mais ergonômico). OTP é "rede de segurança" que aparece SÓ no estado `sent`, após o usuário já ter pedido o link.

2. **`autoComplete="one-time-code"` no input.** Permite que browsers móveis sugiram o código direto da notificação do SMS/inbox (iOS principalmente). Em desktop, sem efeito.

3. **Sanitização do input via `e.target.value.replace(/\D/g, '')`.** User só consegue digitar números — evita erros de digitar letras por engano.

4. **`type='email'` no `verifyOtp`.** Supabase usa o mesmo type pra magic link e código numérico do email (ambos são "OTP via email"). Funciona pros 2 caminhos.

5. **`signOut` não muda.** Existing flow.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa, novo `index-ZkhwBBd0.js` (47.85 KB / 17.25 KB gzip — +1KB vs antes do OTP, marginal)
- [x] `git push origin main` → Vercel auto-deploy
- [x] Curl no bundle Vercel: `verifyOtp` + `login-otp-input` + `Entrar com código` presentes
- [x] Screenshot do estado idle: visual sem regressão
- [ ] **Pendente:** Doug testa o fluxo completo (login com genezilab@gmail.com via OTP em vez do link)

## Próximo passo pro Doug (quando voltar)

1. Aba anônima → <https://mizu-dashboard-pi.vercel.app/>
2. Digita `genezilab@gmail.com` → clica "Enviar link mágico"
3. **Aguarda 1 min** se vier 429 rate limit (você fez vários testes hoje)
4. Abre o email do Supabase
5. **Em vez de clicar no botão "Confirm"**, procura o **código de 8 dígitos** (geralmente em destaque, abaixo ou acima do botão)
6. Volta no painel, cola o código no campo "Entrar com código"
7. Clica "Entrar com código"
8. Esperado: Dashboard aparece ✅

Se o painel travar em "Verificando…" ou mostrar erro, manda screenshot.

## Issues deferidas (não tocadas)

- **RLS hardening** (Phase 7-03 deferred) — RLS continua `phase1_anon_access`. Auth UI protege visualmente, mas API REST direta com anon key ainda lê dados.
- **Customizar template do email Mizú** — passo 5 do AUTH_SETUP, opcional.
- **Site URL + signup off no Supabase Dashboard** — configs manuais ainda pendentes (passos 2-3 do AUTH_SETUP).
