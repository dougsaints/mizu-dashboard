# Summary 09-02 — RLS cutover (destrutivo)

**Phase:** 9 — RLS hardening (authenticated-only)
**Plan:** 09-02 (cutover destrutivo)
**Completed:** 2026-05-23
**Loop:** PLAN → APPLY → UNIFY ✓

## O que foi feito

**Migration `0007_phase9_cutover_anon.sql`** criada e aplicada via MCP `apply_migration`:

- **Drop das 13 policies `phase1_anon_all`** (sales_daily, ads_daily, ads_imports, anotaai_imports, anotaai_products, daily_entries, dashboard_widgets, data_sources, diary_entries, organic_entries, organic_imports, roi_config, units)
- **Drop da policy `phase1_anon_select_tenants`** em tenants

Resultado: o banco SÓ responde a requests com JWT válido. Anon vê array vazio em SELECT, recebe permission denied em escrita.

## Pré-requisitos atendidos (confirmação)

| Pré-req | Como foi confirmado |
|---------|---------------------|
| 09-01 aplicada | Migration 0006 visível em `pg_policies` antes do cutover |
| Doug logou na Vercel | `auth.users` mostra `genezilab@gmail.com` com `last_sign_in_at = 2026-05-23 18:42:15 UTC` |
| Signup público desligado | Confirmado por Doug em chat (modo Auto) |
| User órfão `genezistudios` neutralizado | Sem `email_confirmed_at` + signup off → não consegue logar; deixado na tabela (Doug disse que email é dele) |

## Validações pós-cutover

| Validação | Esperado | Obtido |
|-----------|----------|--------|
| `pg_policies` só com `authenticated_*` | 14 policies (13 ALL + 1 SELECT em tenants) | ✅ Confirmado |
| Curl anon em `sales_daily` | `[]` | ✅ `[]` |
| Curl anon em `ads_daily` | `[]` | ✅ `[]` |
| Curl anon em `diary_entries` | `[]` | ✅ `[]` |
| Curl anon em `anotaai_products` | `[]` | ✅ `[]` |
| Curl anon em `tenants` | `[]` | ✅ `[]` |
| 13 WARNs `rls_policy_always_true` da anon | Sumir | ✅ Sumiram |

## Impacto pro usuário final

- **Quem está logado** (Doug com `genezilab@gmail.com`): painel funciona exatamente como antes
- **Quem abrir a URL direto sem login**: cai na tela de Login, não vê nenhum dado
- **Quem tentar bater na API REST com a anon key**: recebe `[]` em SELECT, erro em escrita

**Importante pro Doug:** outros usuários (Mike, Gab) precisam ser adicionados em Authentication → Users no Supabase Dashboard antes de conseguirem logar. Sem signup público, só usuários previamente cadastrados conseguem entrar.

## Advisors restantes (todos esperados, não-bloqueantes)

| WARN | Status | Decisão |
|------|--------|---------|
| `rls_policy_always_true` (13×, agora só authenticated) | Continua | Vai cair quando Phase 10 introduzir policies tenant-scoped via `is_member_of_tenant(tenant_id)`. Pré-requisito: popular `tenant_users`. |
| `authenticated_security_definer_function_executable` | Continua | Esperado — função existe pra ser usada por authenticated em policies futuras. |
| `auth_leaked_password_protection` | Continua | Config no Supabase Dashboard. Não usamos senha (magic link), então é cosmético. |
| `rls_enabled_no_policy` em `tenant_users` (INFO) | Continua | Tabela vazia ainda; ganha policy junto com Phase 10. |

## Plano de rollback (NÃO foi necessário)

Documentado em `09-02-PLAN.md`. Se algum dia for preciso reabrir anon (jamais deveria), basta recriar as policies dropadas — 5 segundos via SQL Editor.

## Files touched

- `supabase/migrations/0007_phase9_cutover_anon.sql` (novo)
- `.paul/phases/09-rls-hardening/09-02-SUMMARY.md` (este arquivo)
- `.paul/STATE.md` (Phase 9 ✅, MVP 100%)
- `.paul/ROADMAP.md` (Phase 9 marcada Complete + milestone atualizado)
- `.paul/paul.json` (loop IDLE, milestone v0.1 MVP completo)

## Aprendizado

**Estratégia 2 passos pra mudanças de RLS em produção:**
1. ADITIVO (criar policies novas em paralelo às velhas) — zero risco, app continua
2. SUBTRATIVO (dropar policies velhas) — destrutivo, só depois de validar end-to-end

Esse padrão eliminou totalmente o risco de "trancar a chave dentro do carro" típico de mudanças de RLS. Vale generalizar pra qualquer mudança crítica de permissão futura. Memorizado.
