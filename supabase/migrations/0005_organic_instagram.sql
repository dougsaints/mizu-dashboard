-- =====================================================================
-- Mizu Cloud — Migration 0005
-- Marketing Orgânico (Instagram): métricas diárias do Meta Business Suite
--
-- A tabela `organic_entries` foi criada na 0001 com colunas erradas
-- (posts/stories/reels/alcance/engajamento) — nunca foi populada e não
-- bate com o export real do Business Suite. Aqui ela é RECRIADA com as
-- 6 métricas que o export traz, 1 linha por dia.
--
-- ⚠️ DROP: a tabela antiga é apagada. Como nunca teve dados, não há
--    perda. Se por algum motivo tiver linhas, elas se perdem.
--
-- Modelo:
--   organic_entries — 1 linha por (tenant, data) com as 6 métricas
--   organic_imports — 1 linha por upload (audit log, payload bruto)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) organic_entries — recriada com o schema correto
-- ---------------------------------------------------------------------
drop table if exists public.organic_entries cascade;

create table public.organic_entries (
  tenant_id          uuid not null references public.tenants(id) on delete cascade,
  date               date not null,
  alcance            int not null default 0,
  visualizacoes      int not null default 0,
  interacoes         int not null default 0,
  seguidores_novos   int not null default 0,
  visitas_perfil     int not null default 0,
  cliques_link       int not null default 0,
  updated_at         timestamptz not null default now(),
  primary key (tenant_id, date)
);

create index if not exists organic_entries_tenant_date_idx
  on public.organic_entries (tenant_id, date desc);

-- ---------------------------------------------------------------------
-- 2) organic_imports — audit log dos uploads
-- ---------------------------------------------------------------------
create table if not exists public.organic_imports (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  imported_at       timestamptz not null default now(),
  filenames         jsonb not null default '[]'::jsonb,
  date_range_start  date,
  date_range_end    date,
  rows              jsonb not null
);

create index if not exists organic_imports_tenant_when_idx
  on public.organic_imports (tenant_id, imported_at desc);

-- ---------------------------------------------------------------------
-- 3) Realtime
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.organic_entries;
alter publication supabase_realtime add table public.organic_imports;

-- ---------------------------------------------------------------------
-- 4) RLS + Fase 1 anon access
-- ---------------------------------------------------------------------
alter table public.organic_entries enable row level security;
alter table public.organic_imports enable row level security;

create policy "phase1_anon_all" on public.organic_entries
  for all using (true) with check (true);

create policy "phase1_anon_all" on public.organic_imports
  for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 5) Confirmação
-- ---------------------------------------------------------------------
select 'organic_entries' as table_name, count(*) as row_count from public.organic_entries
union all
select 'organic_imports', count(*) from public.organic_imports;
