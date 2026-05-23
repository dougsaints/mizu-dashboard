# Deploy do Mizú Dashboard na Vercel

Guia passo-a-passo pra subir o painel no ar. **Custo: zero** (Vercel Free Tier cobre nosso uso com folga).

---

## Antes de começar

Você vai precisar de:

- ✅ Acesso à conta GitHub `dougsaints` (que tem o repo `mizu-dashboard`)
- ✅ Um email pra criar conta Vercel (recomendo o mesmo do GitHub — facilita o login)
- ✅ Acesso ao Supabase Dashboard (pra copiar 3 valores)

Tempo estimado: **10 minutos** no primeiro deploy.

---

## Passos

### 1. Criar conta Vercel

- Vai em **<https://vercel.com/signup>**
- Clica em "Continue with GitHub" — usa a mesma conta `dougsaints`
- Pula o "Add domain" / "Invite team" — pode fazer depois

### 2. Importar o repo

- Na dashboard da Vercel, clica em **"Add New..."** → **"Project"**
- Procura `mizu-dashboard` na lista (se não aparecer, clica em "Adjust GitHub App Permissions" e dá acesso ao repo)
- Clica em **"Import"** ao lado do repo

### 3. Configurar projeto (quase tudo automático)

A Vercel detecta sozinha que é Vite e preenche:

- **Framework Preset:** Vite ✅ (já preenchido)
- **Root Directory:** `./` ✅ (já preenchido)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `dist` ✅

**Não mude nada disso.** Só precisa preencher as 3 variáveis de ambiente abaixo.

### 4. Colar as 3 variáveis de ambiente

Ainda na tela de configuração, expande a seção **"Environment Variables"**:

| Nome | Valor | Onde achar |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → "Project URL" |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (string longa) | Supabase Dashboard → Settings → API → "anon public" key |
| `VITE_MIZU_TENANT_ID` | UUID tipo `d94eac50-7f56-...` | SQL Editor no Supabase, roda: `select id from tenants where slug='sushi-mizu';` |

**Dica:** os 2 primeiros valores você já tem no seu arquivo `.env.local` da máquina — pode copiar de lá direto.

### 5. Clicar Deploy

- Clica **"Deploy"**
- A Vercel vai fazer build (~2 minutos)
- Quando aparecer o "🎉" e os fogos, deploy tá pronto
- Sua URL fica algo tipo `mizu-dashboard-dougsaints.vercel.app`

### 6. Testar

- Abre a URL fornecida
- Confere se o painel carrega normal
- Tenta atualizar a página (F5) numa rota qualquer — não pode dar 404 (graças ao `vercel.json` que já tá no repo)

---

## Depois do deploy

- **Auto-deploy ativado por padrão**: todo `git push` na branch `main` faz a Vercel re-deployar sozinha em ~2 minutos
- **Preview deploys**: PRs do GitHub ganham uma URL de preview separada (útil pra testar mudanças antes do merge)
- **Domínio próprio (opcional)**: Settings → Domains → "Add" → segue as instruções de DNS

---

## Troubleshooting

### "Failed to fetch" / painel não carrega dados
- As variáveis de ambiente não foram coladas direito. Vai em **Settings → Environment Variables** e confere as 3.
- Após corrigir, precisa redepoyar: aba **Deployments** → último deploy → **⋯ → Redeploy**.

### Build falha com erro de TypeScript
- Roda `npm run build` na sua máquina pra ver o erro real
- Se passa local mas falha na Vercel, geralmente é diferença de versão de Node
- Adiciona no `package.json`:
  ```json
  "engines": { "node": ">=20" }
  ```
  e commita.

### 404 em refresh de rota
- O `vercel.json` na raiz do repo resolve isso. Confere que ele tá commitado:
  ```
  git status vercel.json
  ```

### Variável de ambiente nova depois do deploy
- Toda vez que adicionar ou mudar uma env var, precisa **redepoyar** (botão Redeploy na aba Deployments). Vercel não pega env nova automaticamente.

---

## Limites do Free Tier (não preocupar por enquanto)

A Vercel Free Tier cobre:

- 100GB de bandwidth/mês (nosso painel é leve — < 250KB gzip — não passamos disso nem com 100 usuários ativos)
- Builds ilimitados em projetos pessoais
- SSL automático e CDN global

Se um dia bater no limite, a gente avisa e migra pra plano pago (US$ 20/mês). Mas pra MVP interno com 3-4 usuários, é praticamente impossível.

---

## Pendência: autenticação

Hoje qualquer pessoa com a URL pode ver os dados (policy `phase1_anon_access` no Supabase). Depois do deploy funcionando, próximo passo é **Phase 7-02 — auth**.

Você precisa decidir qual estratégia:

- **A) Senha compartilhada** — 1 senha pra todos. Mais simples, menos seguro.
- **B) Magic link** — clica num link enviado pro email. Sem senha pra lembrar.
- **C) Login + senha** — cada pessoa com sua conta. Mais robusto, mais setup.

Quando voltar pra rodar o auth, me avisa qual escolheu.
