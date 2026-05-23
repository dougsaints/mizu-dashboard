-- Phase 9-01 — RLS hardening (passo aditivo)
--
-- Adiciona policies "authenticated_all" espelhando as "phase1_anon_all" já
-- existentes. NÃO REMOVE policies anon (vem no 09-02 com o cutover).
--
-- Resultado: anon continua lendo (compat) E authenticated também lê.
-- Quando Doug validar login end-to-end, 09-02 dropa as anon.
--
-- Idempotente: usa "drop policy if exists" + "create policy" — pode rodar 2x.

-- =========================================================================
-- Tabelas com policy ALL (leitura + escrita pra authenticated)
-- =========================================================================

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
    execute format('drop policy if exists authenticated_all on public.%I', tbl);
    execute format(
      'create policy authenticated_all on public.%I as permissive for all to authenticated using (true) with check (true)',
      tbl
    );
  end loop;
end $$;

-- =========================================================================
-- Tenants — só SELECT (espelha a policy anon equivalente)
-- =========================================================================

drop policy if exists authenticated_select_tenants on public.tenants;
create policy authenticated_select_tenants on public.tenants
  as permissive for select
  to authenticated
  using (true);

-- =========================================================================
-- Endurecer is_member_of_tenant
-- - Setar search_path (fix WARN function_search_path_mutable)
-- - Revogar EXECUTE pro anon (fix WARN anon_security_definer_function_executable)
-- - Manter EXECUTE pro authenticated (vai ser usado a partir do 09-02)
-- =========================================================================

alter function public.is_member_of_tenant(uuid) set search_path = public, pg_temp;

revoke execute on function public.is_member_of_tenant(uuid) from public;
revoke execute on function public.is_member_of_tenant(uuid) from anon;
grant  execute on function public.is_member_of_tenant(uuid) to authenticated;
