import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltam variáveis de ambiente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local',
  )
}

// Nota: tipagem `Database` virá depois via `supabase gen types typescript`
// (CLI do Supabase) — gera tipos batendo com o schema real. Por enquanto,
// usamos tipos locais em src/types/database.ts para os hooks.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
