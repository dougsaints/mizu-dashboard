-- =====================================================================
-- Mizu Cloud — Migration 0004
-- Anota AI: importação de produtos vendidos (delivery)
--
-- O CSV "Produtos-consulta-gerada-em-*.csv" do Anota AI é uma FOTO
-- (snapshot) agregada — soma de produtos vendidos em um período que o
-- usuário selecionou na ferramenta do Anota AI antes de exportar. Não
-- tem coluna de data por linha.
--
-- Modelo:
--   anotaai_imports  — 1 linha por upload (audit log, payload bruto)
--   anotaai_products — 1 linha por (import, produto). Cada snapshot é
--                      atomicamente substituído quando há novo upload
--                      pra mesma (snapshot_date, unit_id).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) anotaai_imports — audit log
-- ---------------------------------------------------------------------
create table if not exists public.anotaai_imports (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  unit_id         uuid references public.units(id),
  imported_at     timestamptz not null default now(),
  filename        text,
  snapshot_date   date,
  period_start    date,
  period_end      date,
  rows            jsonb not null
);

create index if not exists anotaai_imports_tenant_when_idx
  on public.anotaai_imports (tenant_id, imported_at desc);

-- ---------------------------------------------------------------------
-- 2) anotaai_products — produtos normalizados
--    snapshot_date denormalizado pra acelerar queries do WeeklyRecap
-- ---------------------------------------------------------------------
create table if not exists public.anotaai_products (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  unit_id        uuid references public.units(id),
  import_id      uuid not null references public.anotaai_imports(id) on delete cascade,
  snapshot_date  date not null,
  product_name   text not null,
  category       text,
  quantity       numeric not null default 0
);

create index if not exists anotaai_products_tenant_date_idx
  on public.anotaai_products (tenant_id, snapshot_date desc);
create index if not exists anotaai_products_import_idx
  on public.anotaai_products (import_id);

-- ---------------------------------------------------------------------
-- 3) Realtime
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.anotaai_imports;
alter publication supabase_realtime add table public.anotaai_products;

-- ---------------------------------------------------------------------
-- 4) RLS + Fase 1 anon access
-- ---------------------------------------------------------------------
alter table public.anotaai_imports  enable row level security;
alter table public.anotaai_products enable row level security;

create policy "phase1_anon_all" on public.anotaai_imports
  for all using (true) with check (true);

create policy "phase1_anon_all" on public.anotaai_products
  for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 5) Confirmação
-- ---------------------------------------------------------------------
select 'anotaai_imports'  as table_name, count(*) as row_count from public.anotaai_imports
union all
select 'anotaai_products', count(*) from public.anotaai_products;
