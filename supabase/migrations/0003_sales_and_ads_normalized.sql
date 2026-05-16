-- =====================================================================
-- Mizu Cloud — Migration 0003
-- Normalização de Faturamento (sales_daily) e Tráfego Pago (ads_daily)
-- Estado de sincronização em data_sources
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Estender data_sources com estado de sync
-- ---------------------------------------------------------------------
alter table public.data_sources
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_error text,
  add column if not exists refresh_interval_seconds int not null default 300,
  add column if not exists enabled boolean not null default true;

-- ---------------------------------------------------------------------
-- 2) sales_daily — faturamento normalizado das planilhas
--    PK natural: (tenant_id, unit_id, date)
--    UPSERT por essa chave garante idempotência do polling
-- ---------------------------------------------------------------------
create table if not exists public.sales_daily (
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  unit_id    uuid not null references public.units(id)   on delete cascade,
  date       date not null,
  pdv        numeric not null default 0,
  anotaai    numeric not null default 0,
  ifood      numeric not null default 0,
  total      numeric generated always as (pdv + anotaai + ifood) stored,
  synced_at  timestamptz not null default now(),
  source_id  uuid references public.data_sources(id),
  primary key (tenant_id, unit_id, date)
);

create index if not exists sales_daily_tenant_date_idx
  on public.sales_daily (tenant_id, date desc);

-- ---------------------------------------------------------------------
-- 3) ads_daily — Meta Ads normalizado (1 linha por dia/campanha/adset/unit)
--    UNIQUE garante dedup automático em UPSERT
--    coalesce em unique permite tratar unit_id NULL como chave
-- ---------------------------------------------------------------------
create table if not exists public.ads_daily (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  unit_id       uuid references public.units(id),
  date          date not null,
  campaign_name text not null,
  ad_set_name   text not null default '',
  cost          numeric not null default 0,
  impressions   int     not null default 0,
  clicks        int     not null default 0,
  reach         int     not null default 0,
  results       int     not null default 0,
  result_value  numeric not null default 0,
  import_id     uuid references public.ads_imports(id) on delete set null,
  updated_at    timestamptz not null default now()
);

-- Índice único usando expressão (coalesce trata NULL como sentinela)
create unique index if not exists ads_daily_dedup_idx
  on public.ads_daily (
    tenant_id,
    date,
    campaign_name,
    ad_set_name,
    coalesce(unit_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists ads_daily_tenant_date_idx
  on public.ads_daily (tenant_id, date desc);

-- ---------------------------------------------------------------------
-- 4) Realtime
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.sales_daily;
alter publication supabase_realtime add table public.ads_daily;
alter publication supabase_realtime add table public.data_sources;

-- ---------------------------------------------------------------------
-- 5) RLS + Fase 1 anon access (consistente com 0002)
-- ---------------------------------------------------------------------
alter table public.sales_daily enable row level security;
alter table public.ads_daily   enable row level security;

create policy "phase1_anon_all" on public.sales_daily
  for all using (true) with check (true);

create policy "phase1_anon_all" on public.ads_daily
  for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 6) Confirmação
-- ---------------------------------------------------------------------
select 'sales_daily' as table_name, count(*) as row_count from public.sales_daily
union all
select 'ads_daily', count(*) from public.ads_daily;
