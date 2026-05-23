# Ativar autenticação (magic link) no Supabase

Guia em PT-BR pra você ativar o login do painel. **Custo: zero** (Supabase free tier inclui auth e email transacional).

---

## Status atual (atualizado 2026-05-23)

- **Email Provider habilitado** — ✅ feito pelo Doug
- **Usuário `genezilab@gmail.com` criado** — ✅ criado e confirmado (manual via Dashboard)
- **Usuário `douglasknk@hotmail.com` removido** — ✅ deletado via MCP em 23/05 (pedido pra ter SÓ 1 user autorizado)
- **Site URL + Redirect URLs** — ⏳ pendente (passo 2 abaixo)
- **Signup público desligado** — ⏳ pendente (passo 3 abaixo)
- **Teste end-to-end** (login → dashboard) — ⏳ pendente (testar após passo 3)

**Falta ~2 min de cliques no Dashboard.** Site URL e desligar signup são as 2 únicas pendências críticas.

---

## Contexto

O código React do login já está pronto (Phase 7-02). Falta configurar o Supabase pra **enviar os emails de magic link** e **autorizar quem entra**.

Tempo estimado: **5 minutos**, 5 cliques.

---

## Passo 1 — Habilitar Email Provider

1. Abre o **Supabase Dashboard** do projeto Mizú
2. Menu lateral: **Authentication** → **Sign In / Up** (ou **Providers** dependendo da versão)
3. Encontra o card **"Email"** e clica
4. Confere que **"Enable email provider"** está **ligado** ✅
5. **Não precisa procurar toggle "Magic Link" separado** — nas versões recentes do Supabase, magic link já vem incluído com o email provider (a função `signInWithOtp()` que o código usa funciona automaticamente).
6. Confere as configs de OTP (já vêm bons por default):
   - **Email OTP expiration:** 3600 segundos (1 hora) — tempo que o link/código fica válido
   - **Email OTP length:** 6-8 dígitos — o email vai conter tanto link clicável quanto código numérico
7. **Clica Save no canto inferior direito.**

---

## Passo 2 — Configurar Site URL

Isso é **crítico**: a Vercel vai ter uma URL tipo `mizu-dashboard.vercel.app`. O Supabase precisa saber pra onde redirecionar o usuário depois que ele clica no link mágico.

1. Authentication → **URL Configuration**
2. **Site URL:** cola a URL da Vercel (ex: `https://mizu-dashboard.vercel.app` ou `https://painel.sushi-mizu.com.br` se já configurou o domínio personalizado)
3. **Redirect URLs (allowlist):** adiciona TODAS as URLs onde o app vai rodar:
   ```
   https://mizu-dashboard.vercel.app
   https://painel.sushi-mizu.com.br
   http://localhost:5173
   ```
   (a última é pra dev local — sem ela, magic link não funciona quando você rodar `npm run dev`)
4. Salva

---

## Passo 3 — Desligar signup público (invite-only)

Sem isso, qualquer pessoa com a URL podia digitar um email e entrar. Vamos travar pra só quem você liberar:

1. Authentication → **Sign In / Up** (ou Settings, depende da versão)
2. Encontra **"Allow new users to sign up"** e **desliga**
3. Salva

Agora, se alguém tentar logar com email não autorizado, vai receber "signups not allowed" — o painel mostra mensagem em PT-BR amigável: *"Este email não está na lista de usuários autorizados…"*

---

## Passo 4 — Adicionar usuários autorizados

1. Authentication → **Users**
2. Clica **"Add user"** → **"Send invite"**
3. Para cada pessoa que vai usar o painel, repete:
   - Email: `mike@email.com`, `gab@email.com`, `seu-email@email.com`, etc.
   - Clica **Send invitation**

Cada pessoa vai receber um email do Supabase com link de confirmação. Depois disso, ela pode pedir magic link normalmente pelo painel.

**Alternativa (mais rápida):** "Create user" sem enviar invite — o usuário fica no banco e na primeira vez que tentar logar pelo painel, recebe o magic link e entra direto.

---

## Passo 5 — (Opcional) Customizar template do email

O email default do Supabase é em inglês e cinza. Pra deixar com cara de Mizú:

1. Authentication → **Email Templates** → **Magic Link**
2. Edita o assunto: `Seu link de acesso ao Painel Mizú`
3. Edita o corpo HTML — mantém `{{ .ConfirmationURL }}` pro link funcionar
4. Salva

Pode pular esse passo pra MVP. Template default funciona.

---

## Como o usuário entra (do lado dele)

1. Abre o painel (ex: `https://painel.sushi-mizu.com.br`)
2. Vê a tela de Login
3. Digita o email cadastrado
4. Clica **Enviar link mágico**
5. Vê **"Link enviado!"** na tela
6. Abre o inbox, encontra email do Supabase
7. Clica no link → volta no painel, já logado
8. Sessão fica salva no browser dele por **~7 dias** (renovação automática enquanto usar)

---

## Logout

Botão no canto direito do Header (mostra o email do usuário e um ícone ↩). Clica e volta pra tela de Login.

---

## Limitação atual (transparência)

**RLS do Supabase ainda permite acesso anônimo direto.** As tabelas do banco (`sales_daily`, `ads_daily`, etc.) ainda têm a policy `phase1_anon_access` ativa — qualquer pessoa com a URL do Supabase + anon key pode ler os dados via API REST direto, **mesmo sem login no painel**.

Pra MVP interno, isso é OK: a barreira do Login filtra 99% dos casos (quem acessa pela URL pública). Mas se você quiser **trancar de verdade**, precisa de um plan futuro:

- **Phase 7-03 (deferred):** RLS hardening — trocar `phase1_anon_access` por `authenticated only` em todas as tabelas. Effort M. Risco baixo se feito com migration nova + rollback testado.

Me avisa quando quiser fazer.

---

## Troubleshooting

### Email não chegou
- Confere a pasta de **spam/lixo**
- Confere que **Site URL** no passo 2 está correta (sem barra final, com `https://`)
- Confere que o email está na lista de **Users** autorizados
- Confere que **Email Provider** está enabled (passo 1)

### "Link mágico expirou"
- Magic link dura **1 hora** por padrão
- Pede um novo na tela de Login

### "Email rate limit exceeded"
- Supabase free tier limita **4 emails/hora** por endereço
- Aguarda 15-30 min e tenta de novo

### "Signups not allowed"
- O email não está cadastrado em **Authentication → Users**
- Adiciona o email no passo 4

### Magic link redireciona pra localhost (em produção)
- O **Site URL** no passo 2 não está apontando pra Vercel
- Conserta e pede novo magic link

### Botão "Enviar link" não habilita
- Email digitado não passa na validação simples (precisa formato `algo@algo.algo`)
- Confere se tem espaço sobrando, acento, etc.
