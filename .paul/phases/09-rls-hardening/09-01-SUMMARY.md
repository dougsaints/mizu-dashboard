# Summary 09-01 — RLS hardening (passo aditivo)

**Phase:** 9 — RLS hardening (authenticated-only)
**Plan:** 09-01 (aditivo, não-destrutivo)
**Completed:** 2026-05-23
**Loop:** PLAN → APPLY → UNIFY ✓

## O que foi feito

1. **Migration `0006_phase9_rls_authenticated.sql`** criada em `supabase/migrations/` e aplicada via MCP `apply_migration`:
   - **13 tabelas** ganharam policy `authenticated_all` (`for all to authenticated using (true) with check (true)`) — espelha a `phase1_anon_all` existente mas restrita ao role `authenticated`
   - **`tenants`** ganhou `authenticated_select_tenants` (espelho da policy SELECT já existente)
   - **`is_member_of_tenant(uuid)`** endurecida:
     - `search_path` setado pra `public, pg_temp` (fix WARN `function_search_path_mutable`)
     - `EXECUTE` revogado de `anon` e `public` (fix WARN `anon_security_definer_function_executable`)
     - `EXECUTE` mantido pra `authenticated` (vai ser usado nas policies tenant-scoped no futuro)

2. **PAUL atualizado**: ROADMAP.md ganhou Phase 9 (2 plans: 09-01 + 09-02), paul.json migrou pra `phase: 9, loop: 09-01 APPLY`, plan 09-01 escrito.

## Validações realizadas

| Validação | Resultado |
|-----------|-----------|
| Policies coexistem em todas as 13 tabelas (anon + authenticated) | ✅ Confirmado via `pg_policies` |
| Anon ainda lê via REST (sales_daily, ads_daily, diary_entries, tenants) | ✅ HTTP 200 com payload em todas |
| WARN `function_search_path_mutable` | ✅ Sumiu |
| WARN `anon_security_definer_function_executable` | ✅ Sumiu |
| WARN `authenticated_security_definer_function_executable` | ⚠️ Continua (esperado — função existe pra ser usada por authenticated) |
| WARNs `rls_policy_always_true` | ⚠️ Continuam 26 (13 anon + 13 authenticated). Vão cair pra 13 no 09-02; pra 0 quando policies tenant-scoped forem introduzidas |

## Impacto pro app

**Zero.** O painel em produção continua funcionando exatamente como antes. Policies em RLS são OR — ter `authenticated_all` em cima de `phase1_anon_all` não tira acesso de ninguém.

## O que NÃO foi feito (intencionalmente)

- **Drop das policies `phase1_anon_all`** — fica pro 09-02, depois do Doug validar login na Vercel.
- **Tornar `is_member_of_tenant` SECURITY INVOKER** — quando 09-03 (futuro, fora desta phase) introduzir policies tenant-scoped, decidiremos se vale rebatizar a função ou converter pra invoker.
- **Ligar HaveIBeenPwned password protection** (WARN `auth_leaked_password_protection`) — config de Auth, fica como item pro Doug clicar no Dashboard junto com Site URL e signup off.

## Pré-requisito pra rodar o 09-02 (próximo plan)

Doug precisa, nesta ordem:

1. **Supabase Dashboard** (~2 min): Authentication → URL Configuration → setar Site URL + Redirect URLs; Sign In/Up → desligar "Allow new users to sign up". Detalhes em `AUTH_SETUP.md`.
2. **Vercel** (~1 min): aba anônima → painel → pede magic link → usa o **código de 8 dígitos** no campo OTP fallback (Gmail queima o link clicado).
3. **Me avisa** "login ok" — aí rodo o 09-02 que dropa as anon policies e o app passa a exigir login de verdade.

## Aprendizado registrado

- **Estratégia de cutover de RLS em 2 passos** (aditivo + subtrativo) — eliminou o risco de quebrar produção. Vale como padrão pra qualquer mudança de permissão futura.
- **Supabase JS troca role automaticamente** assim que há sessão — não foi preciso mudar nenhuma linha do front pra "preparar" pra auth.

## Files touched

- `supabase/migrations/0006_phase9_rls_authenticated.sql` (novo)
- `.paul/ROADMAP.md` (adicionou Phase 9 + atualizou contagem milestone)
- `.paul/paul.json` (phase 9, loop 09-01 APPLY)
- `.paul/phases/09-rls-hardening/09-01-PLAN.md` (novo)
- `.paul/phases/09-rls-hardening/09-01-SUMMARY.md` (este arquivo)
- `.paul/STATE.md` (atualizado na sequência)
