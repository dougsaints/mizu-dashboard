-- =====================================================================
-- Mizu Cloud — Schema inicial multi-tenant
-- Roda no SQL Editor do Supabase (Dashboard → SQL Editor → New query)
-- =====================================================================

-- ---------- TENANCY ----------
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  niche text not null default 'restaurant',
  brand jsonb not null default '{}'::jsonb,
  custom_domain text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_users (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  primary key (tenant_id, user_id)
);

-- ---------- UNIDADES ----------
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  slug text not null,
  display_name text not null,
  sort_order int not null default 0,
  unique (tenant_id, slug)
);

-- ---------- ENTRADAS DIÁRIAS (movimento/covers) ----------
create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  date date not null,
  covers int,
  lotacao text,
  obs text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (tenant_id, unit_id, date)
);
create index if not exists daily_entries_tenant_date_idx
  on public.daily_entries (tenant_id, date desc);

-- ---------- DIÁRIO DO TIME ----------
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ts timestamptz not null default now(),
  author_name text not null,
  author_user_id uuid references auth.users(id),
  tag text not null default 'ok',
  texto text not null
);
create index if not exists diary_entries_tenant_ts_idx
  on public.diary_entries (tenant_id, ts desc);

-- ---------- ROI CONFIG ----------
create table if not exists public.roi_config (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  trafego numeric not null default 6000,
  mao_de_obra numeric not null default 3000,
  mkt_geral numeric not null default 2000,
  mode text not null default 'mes',
  updated_at timestamptz not null default now()
);

-- ---------- META ADS IMPORTS ----------
create table if not exists public.ads_imports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  imported_at timestamptz not null default now(),
  filename text,
  rows jsonb not null,
  date_range_start date,
  date_range_end date
);
create index if not exists ads_imports_tenant_idx
  on public.ads_imports (tenant_id, imported_at desc);

-- ---------- ORGÂNICO ----------
create table if not exists public.organic_entries (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  date date not null,
  posts int not null default 0,
  stories int not null default 0,
  reels int not null default 0,
  alcance int not null default 0,
  engajamento int not null default 0,
  primary key (tenant_id, date)
);

-- ---------- DATA SOURCES (Google Sheets etc) ----------
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id),
  kind text not null,
  label text,
  url text,
  config jsonb not null default '{}'::jsonb
);

-- ---------- DASHBOARD WIDGETS (personalização por nicho — Fase 4) ----------
create table if not exists public.dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  widget_key text not null,
  enabled boolean not null default true,
  sort_order int not null default 0,
  config jsonb not null default '{}'::jsonb,
  unique (tenant_id, widget_key)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.tenants            enable row level security;
alter table public.tenant_users       enable row level security;
alter table public.units              enable row level security;
alter table public.daily_entries      enable row level security;
alter table public.diary_entries      enable row level security;
alter table public.roi_config         enable row level security;
alter table public.ads_imports        enable row level security;
alter table public.organic_entries    enable row level security;
alter table public.data_sources       enable row level security;
alter table public.dashboard_widgets  enable row level security;

-- ---------- POLICY HELPERS ----------
-- Função: usuário pertence ao tenant?
create or replace function public.is_member_of_tenant(t_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.tenant_users
    where tenant_id = t_id and user_id = auth.uid()
  );
$$;

-- ---------- TENANTS ----------
drop policy if exists "tenants_select_member" on public.tenants;
create policy "tenants_select_member"
  on public.tenants for select
  using (public.is_member_of_tenant(id));

-- ---------- TENANT_USERS ----------
drop policy if exists "tenant_users_select_self" on public.tenant_users;
create policy "tenant_users_select_self"
  on public.tenant_users for select
  using (user_id = auth.uid() or public.is_member_of_tenant(tenant_id));

-- ---------- UNITS / DAILY_ENTRIES / DIARY / ROI / ADS / ORGANIC / SOURCES / WIDGETS
-- Policy padrão: member do tenant pode SELECT/INSERT/UPDATE/DELETE
do $$
declare
  t text;
begin
  foreach t in array array[
    'units','daily_entries','diary_entries','roi_config',
    'ads_imports','organic_entries','data_sources','dashboard_widgets'
  ] loop
    execute format('drop policy if exists "%I_member_all" on public.%I;', t, t);
    execute format(
      'create policy "%I_member_all" on public.%I for all
         using (public.is_member_of_tenant(tenant_id))
         with check (public.is_member_of_tenant(tenant_id));',
      t, t
    );
  end loop;
end$$;

-- =====================================================================
-- REALTIME (Diário do Time precisa)
-- =====================================================================
alter publication supabase_realtime add table public.diary_entries;
alter publication supabase_realtime add table public.daily_entries;
alter publication supabase_realtime add table public.roi_config;
