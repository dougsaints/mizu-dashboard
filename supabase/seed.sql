-- =====================================================================
-- Mizu Cloud — Seed do tenant Sushi Mizú
-- Roda DEPOIS de 0001_initial.sql
-- =====================================================================

-- ---------- 1) Tenant Mizú ----------
insert into public.tenants (slug, display_name, niche, brand)
values (
  'sushi-mizu',
  'Sushi Mizú',
  'restaurant',
  jsonb_build_object(
    'primaryColor', '#C9A961',
    'goldDeep',     '#8B6F3D',
    'ink',          '#16140F',
    'cream',        '#F7F4EC',
    'kanji',        '水',
    'logoUrl',      '/mizu-logo.png',
    'fontTitle',    'Inter',
    'fontBody',     'Inter',
    'fontKanji',    'Noto Serif JP'
  )
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  brand        = excluded.brand
returning id;

-- ---------- 2) Unidades ----------
with t as (select id from public.tenants where slug = 'sushi-mizu')
insert into public.units (tenant_id, slug, display_name, sort_order)
select t.id, v.slug, v.display_name, v.sort_order
from t, (values
  ('serraria', 'Serraria', 1),
  ('jatiuca',  'Jatiúca / Praia', 2)
) as v(slug, display_name, sort_order)
on conflict (tenant_id, slug) do nothing;

-- ---------- 3) Data sources (Google Sheets das vendas) ----------
-- URLs extraídas de painel-diario.html (linhas 2244-2257)
with t as (select id from public.tenants where slug = 'sushi-mizu')
insert into public.data_sources (tenant_id, kind, label, url)
select t.id, v.kind, v.label, v.url
from t, (values
  ('gsheet_csv', 'Vendas Serraria',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9DAPbqMaceio--placeholder/pub?gid=842215640&single=true&output=csv'),
  ('gsheet_csv', 'Vendas Jatiúca',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vQie1EI--placeholder/pub?gid=842215640&single=true&output=csv'),
  ('gsheet_csv', 'Itens Anota AI',
   'https://docs.google.com/spreadsheets/d/e/2PACX-1vSlJccWq--placeholder/pub?gid=2063859446&single=true&output=csv')
) as v(kind, label, url)
on conflict do nothing;

-- ⚠️ IMPORTANTE: substituir as URLs acima pelas URLs reais do painel-diario.html
--    (procure por `CSV_URLS` no arquivo, linhas 2244-2257)

-- ---------- 4) ROI config default ----------
with t as (select id from public.tenants where slug = 'sushi-mizu')
insert into public.roi_config (tenant_id, trafego, mao_de_obra, mkt_geral, mode)
select t.id, 6000, 3000, 2000, 'mes'
from t
on conflict (tenant_id) do nothing;

-- ---------- 5) Widgets ativos pra Mizú ----------
with t as (select id from public.tenants where slug = 'sushi-mizu')
insert into public.dashboard_widgets (tenant_id, widget_key, enabled, sort_order)
select t.id, v.widget_key, true, v.sort_order
from t, (values
  ('weekly_recap',   10),
  ('roi',            20),
  ('movimento',      30),
  ('diario',         40),
  ('marketing_unif', 50),
  ('sales_charts',   60)
) as v(widget_key, sort_order)
on conflict (tenant_id, widget_key) do nothing;

-- ---------- 6) Conferência ----------
select
  t.slug, t.display_name, t.niche,
  (select count(*) from public.units u where u.tenant_id = t.id) as units,
  (select count(*) from public.data_sources d where d.tenant_id = t.id) as sources,
  (select count(*) from public.dashboard_widgets w where w.tenant_id = t.id) as widgets
from public.tenants t
where t.slug = 'sushi-mizu';
