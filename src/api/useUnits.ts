import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import type { Database } from '../types/database'

type Unit = Database['public']['Tables']['units']['Row']

export function useUnits() {
  return useQuery({
    queryKey: ['units', MIZU_TENANT_ID],
    queryFn: async (): Promise<Unit[]> => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}
