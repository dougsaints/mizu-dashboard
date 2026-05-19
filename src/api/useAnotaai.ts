// Hook React Query para anotaai_products (produtos do Anota AI).
// Inclui mutation de upload de CSV + lista de imports (audit log).

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import {
  parseAnotaaiCSV,
  commitAnotaaiImport,
  readAnotaaiText,
  snapshotDateFromFilename,
} from '../lib/anotaaiCsv'
import type { Database } from '../types/database'

type ProductRow = Database['public']['Tables']['anotaai_products']['Row']
type ImportRow = Database['public']['Tables']['anotaai_imports']['Row']

const QK_PRODUCTS = ['anotaai_products', MIZU_TENANT_ID] as const
const QK_IMPORTS = ['anotaai_imports', MIZU_TENANT_ID] as const

export function useAnotaaiProducts(daysBack = 90) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK_PRODUCTS, daysBack],
    queryFn: async (): Promise<ProductRow[]> => {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)
      const sinceIso = since.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('anotaai_products')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('snapshot_date', sinceIso)
        .order('snapshot_date', { ascending: false })
        .order('quantity', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`anotaai-${MIZU_TENANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anotaai_products',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_PRODUCTS }),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

export function useAnotaaiImports(limit = 10) {
  return useQuery({
    queryKey: [...QK_IMPORTS, limit],
    queryFn: async (): Promise<ImportRow[]> => {
      const { data, error } = await supabase
        .from('anotaai_imports')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('imported_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
  })
}

export interface UploadAnotaaiArgs {
  file: File
  unitId: string | null
  snapshotDate: string // ISO yyyy-mm-dd
}

export function useUploadAnotaaiCSV() {
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ file, unitId, snapshotDate }: UploadAnotaaiArgs) => {
      const text = await readAnotaaiText(file)
      const parsed = parseAnotaaiCSV(text)
      const result = await commitAnotaaiImport({
        parsed,
        filename: file.name,
        unitId,
        snapshotDate,
      })
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_PRODUCTS })
      qc.invalidateQueries({ queryKey: QK_IMPORTS })
    },
  })

  return mutation
}

export { snapshotDateFromFilename }
