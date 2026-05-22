// Hook React Query para organic_entries (métricas do Instagram).
// Inclui mutation de upload multi-arquivo + lista de imports (audit log).

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import { parseInstagramFiles, commitOrganicImport } from '../lib/instagramCsv'
import type { Database } from '../types/database'

type OrganicRow = Database['public']['Tables']['organic_entries']['Row']
type OrganicImport = Database['public']['Tables']['organic_imports']['Row']

const QK_ORGANIC = ['organic', MIZU_TENANT_ID] as const
const QK_IMPORTS = ['organic_imports', MIZU_TENANT_ID] as const

export function useOrganic(daysBack = 60) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK_ORGANIC, daysBack],
    queryFn: async (): Promise<OrganicRow[]> => {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)
      const sinceIso = since.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('organic_entries')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('date', sinceIso)
        .order('date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`organic-${MIZU_TENANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organic_entries',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_ORGANIC }),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

export function useOrganicImports(limit = 10) {
  return useQuery({
    queryKey: [...QK_IMPORTS, limit],
    queryFn: async (): Promise<OrganicImport[]> => {
      const { data, error } = await supabase
        .from('organic_imports')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('imported_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUploadInstagramCSV() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const parsed = await parseInstagramFiles(files)
      return commitOrganicImport(
        parsed,
        files.map((f) => f.name),
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_ORGANIC })
      qc.invalidateQueries({ queryKey: QK_IMPORTS })
    },
  })
}
