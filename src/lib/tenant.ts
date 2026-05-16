// Fase 1: tenant Mizú hardcoded. Na Fase 2/3, isso vira contexto + lookup
// na tabela `tenant_users` após login do Supabase Auth.

export const MIZU_TENANT_ID = import.meta.env.VITE_MIZU_TENANT_ID as string

export const MIZU_UNIT_SERRARIA_SLUG = 'serraria'
export const MIZU_UNIT_PRAIA_SLUG = 'jatiuca'

export function useCurrentTenant() {
  return {
    id: MIZU_TENANT_ID,
    slug: 'sushi-mizu',
    displayName: 'Sushi Mizú',
    niche: 'restaurant',
    brand: {
      primaryColor: '#C9A961',
      kanji: '水',
      logoUrl: '/mizu-logo.png',
    },
  }
}
