// Hook React Query para ads_daily (Meta Ads normalizado).
// Inclui mutation de upload de CSV + lista de imports (audit log).

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import { parseMetaAdsCSV, commitAdsImport, readFileAsText } from '../lib/metaAdsCsv'
import { useUnits } from './useUnits'
import type { Database } from '../types/database'

type AdsRow = Database['public']['Tables']['ads_daily']['Row']
type AdsImport = Database['public']['Tables']['ads_imports']['Row']

const QK_ADS = ['ads', MIZU_TENANT_ID] as const
const QK_IMPORTS = ['ads_imports', MIZU_TENANT_ID] as const

export function useAds(daysBack = 60) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK_ADS, daysBack],
    queryFn: async (): Promise<AdsRow[]> => {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)
      const sinceIso = since.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('ads_daily')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('date', sinceIso)
        .order('date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  // Nome de canal único por instância do hook — vários componentes
  // podem usar useAds ao mesmo tempo sem colidir no mesmo canal Realtime.
  useEffect(() => {
    const channel = supabase
      .channel(`ads-${MIZU_TENANT_ID}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads_daily',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_ADS }),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

export function useAdsImports(limit = 10) {
  return useQuery({
    queryKey: [...QK_IMPORTS, limit],
    queryFn: async (): Promise<AdsImport[]> => {
      const { data, error } = await supabase
        .from('ads_imports')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('imported_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUploadAdsCSV() {
  const qc = useQueryClient()
  const unitsQ = useUnits()

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const units = unitsQ.data ?? []
      if (units.length === 0) {
        throw new Error('Lista de unidades não carregada ainda. Tente de novo em 1s.')
      }
      const text = await readFileAsText(file)
      const parsed = parseMetaAdsCSV(text)
      const result = await commitAdsImport(parsed, file.name, units)
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ADS })
      qc.invalidateQueries({ queryKey: QK_IMPORTS })
    },
  })

  return mutation
}
