import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import type { Database } from '../types/database'

type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']
type DiaryInsert = Database['public']['Tables']['diary_entries']['Insert']

const QK_DIARY = ['diary', MIZU_TENANT_ID] as const

export function useDiary() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: QK_DIARY,
    queryFn: async (): Promise<DiaryEntry[]> => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('ts', { ascending: false })
        .limit(200)
      if (error) throw error
      return data ?? []
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`diary-${MIZU_TENANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diary_entries',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_DIARY }),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

export function useAddDiaryEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<DiaryInsert, 'tenant_id'>) => {
      const row: DiaryInsert = { ...payload, tenant_id: MIZU_TENANT_ID }
      const { data, error } = await supabase
        .from('diary_entries')
        .insert(row)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_DIARY }),
  })
}
