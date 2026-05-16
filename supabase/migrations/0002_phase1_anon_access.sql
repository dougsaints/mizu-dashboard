-- =====================================================================
-- Mizu Cloud — Fase 1: liberar acesso anônimo enquanto não há login
--
-- ⚠️  TRADE-OFF: qualquer um com a anon key tem read/write em todas as
-- tabelas tenant. Aceitável porque:
--   - URL do painel não é pública/listada
--   - Mizú é o único tenant na Fase 1
--   - Comportamento equivalente ao painel-diario.html original
--
-- A Fase 2 (Auth) reverte isto: drop dessas policies e ativa as policies
-- de membership criadas em 0001_initial.sql.
-- =====================================================================

-- ---------- Drop das policies estritas de 0001 ----------
drop policy if exists "tenants_select_member"   on public.tenants;
drop policy if exists "tenant_users_select_self" on public.tenant_users;
do $$
declare t text;
begin
  foreach t in array array[
    'units','daily_entries','diary_entries','roi_config',
    'ads_imports','organic_entries','data_sources','dashboard_widgets'
  ] loop
    execute format('drop policy if exists "%I_member_all" on public.%I;', t, t);
  end loop;
end$$;

-- ---------- Phase 1: anon access ----------
create policy "phase1_anon_select_tenants" on public.tenants
  for select using (true);

do $$
declare t text;
begin
  foreach t in array array[
    'units','daily_entries','diary_entries','roi_config',
    'ads_imports','organic_entries','data_sources','dashboard_widgets'
  ] loop
    execute format(
      'create policy "phase1_anon_all" on public.%I for all
         using (true) with check (true);',
      t
    );
  end loop;
end$$;

-- ---------- Confirmação ----------
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
  and policyname like 'phase1_%'
order by tablename;
