# Mizu Cloud — Painel SaaS Multi-Tenant

Painel online substituindo o `painel-diario.html` (single-file vanilla JS) por um SaaS hospedado: dados centralizados no Supabase, frontend React + Vite, deploy na Vercel.

**Stack:** Vite + React + TS · Supabase (Postgres + Auth + Realtime + Storage) · TanStack Query · Chart.js · Vercel

## Setup local

```bash
# 1. Instalar deps (já feito uma vez no scaffold)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MIZU_TENANT_ID

# 3. Rodar dev server
npm run dev          # http://localhost:5173

# 4. Build de produção
npm run build
npm run preview
```

## Setup do Supabase

1. Crie projeto em https://supabase.com (Free tier)
2. SQL Editor → New query → cole o conteúdo de [supabase/migrations/0001_initial.sql](supabase/migrations/0001_initial.sql) → Run
3. SQL Editor → New query → cole [supabase/seed.sql](supabase/seed.sql) → Run
4. Copie o `id` do tenant retornado pelo seed para `VITE_MIZU_TENANT_ID` em `.env.local`
5. Settings → API → copie `Project URL` e `anon public` para `.env.local`

## Estrutura

```
src/
├── index.css              # Design system portado 1:1 de painel-diario.html
├── main.tsx               # Entrypoint: QueryClient + Router
├── App.tsx                # Rotas
├── lib/
│   ├── supabase.ts        # Client Supabase tipado
│   └── tenant.ts          # Tenant atual (Fase 1: hardcoded Mizú)
├── api/                   # Hooks TanStack Query (1 por recurso)
│   └── useDiary.ts        # Diário do Time (+ Realtime subscribe)
├── types/database.ts      # Tipos das tabelas Supabase
├── components/Header.tsx  # Header com logo/branding do tenant
├── pages/Dashboard.tsx    # Página principal
└── sections/              # 1 componente por seção P0 (a portar)
```

## Roadmap

- **Fase 1** (em andamento): Mizú online, design 1:1, dados no Supabase. Sem auth.
- **Fase 2**: Auth (email/senha), `tenant_users`, RLS efetivo.
- **Fase 3**: Multi-tenant. Doug cria cliente novo no admin.
- **Fase 4**: Widgets configuráveis por nicho (`dashboard_widgets`).
- **Fase 5**: Custom domains por cliente.

Plano completo: [vou-dar-o-resumo-merry-newt.md](../.claude/plans/vou-dar-o-resumo-merry-newt.md) (no diretório `.claude/plans` global).
