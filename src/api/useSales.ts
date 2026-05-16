// Hook React Query para sales_daily (faturamento normalizado).
// Inclui mutation de refresh manual e hook de polling automático.

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import { syncAllSheets } from '../lib/sheets'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type DataSource = Database['public']['Tables']['data_sources']['Row']

const QK_SALES = ['sales', MIZU_TENANT_ID] as const
const QK_SOURCES = ['data_sources', MIZU_TENANT_ID] as const

// ─── Query: leitura de sales_daily ───────────────────────────────

export function useSales(daysBack = 60) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK_SALES, daysBack],
    queryFn: async (): Promise<SalesRow[]> => {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)
      const sinceIso = since.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('sales_daily')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('date', sinceIso)
        .order('date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  // Realtime: qualquer mudança invalida a query
  useEffect(() => {
    const channel = supabase
      .channel(`sales-${MIZU_TENANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_daily',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_SALES }),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

// ─── Query: lista de data_sources (pra mostrar status no header) ─

export function useDataSources() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: QK_SOURCES,
    queryFn: async (): Promise<DataSource[]> => {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .order('label', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`sources-${MIZU_TENANT_ID}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_sources',
          filter: `tenant_id=eq.${MIZU_TENANT_ID}`,
        },
        () => qc.invalidateQueries({ queryKey: QK_SOURCES }),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])

  return query
}

// ─── Mutation: refresh manual de todas as planilhas ──────────────

export function useRefreshSales() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => syncAllSheets(),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK_SALES })
      qc.invalidateQueries({ queryKey: QK_SOURCES })
    },
  })
}

// ─── Polling automático em background ────────────────────────────
// Roda 1 vez ao montar + a cada `intervalSeconds` segundos.
// Pausa quando aba está oculta (Page Visibility API) pra não queimar
// fetches sem necessidade.

export function useAutoPollSales(intervalSeconds = 300) {
  const refresh = useRefreshSales()

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    const tick = () => {
      if (document.hidden) return
      if (refresh.isPending) return
      refresh.mutate()
    }

    // Primeiro disparo após pequeno delay (deixa a página assentar)
    const initial = setTimeout(tick, 1500)
    timer = setInterval(tick, intervalSeconds * 1000)

    // Quando aba volta a ficar visível, força refresh
    const onVisibility = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimeout(initial)
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalSeconds])
}
