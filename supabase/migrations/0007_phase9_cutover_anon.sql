-- Phase 9-02 — RLS cutover (destrutivo, irreversível sem rollback manual)
--
-- DROPA as policies phase1_anon_* criadas em 0002_phase1_anon_access.sql.
-- A partir daqui, o banco SÓ responde a requests com JWT de authenticated.
-- Anon recebe array vazio em SELECT, erro 401/permissão em INSERT/UPDATE/DELETE.
--
-- PRÉ-REQUISITO: 0006_phase9_rls_authenticated.sql aplicada + Doug logou
-- com sucesso na Vercel pelo menos 1x (genezilab@gmail.com, last_sign_in
-- em 2026-05-23 18:42 UTC) + signup público desligado no Supabase Dashboard.

do $$
declare
  tbl text;
  tables text[] := array[
    'sales_daily',
    'ads_daily',
    'ads_imports',
    'anotaai_imports',
    'anotaai_products',
    'daily_entries',
    'dashboard_widgets',
    'data_sources',
    'diary_entries',
    'organic_entries',
    'organic_imports',
    'roi_config',
    'units'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop policy if exists phase1_anon_all on public.%I', tbl);
  end loop;
end $$;

drop policy if exists phase1_anon_select_tenants on public.tenants;
