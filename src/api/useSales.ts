// Hook React Query para sales_daily (faturamento normalizado).
// Inclui mutation de refresh manual e hook de polling automático.

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import { syncAllSheets } from '../lib/sheets'
import type { CmpMode } from '../lib/period'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type DataSource = Database['public']['Tables']['data_sources']['Row']

const QK_SALES = ['sales', MIZU_TENANT_ID] as const
const QK_SALES_CMP = ['sales_cmp', MIZU_TENANT_ID] as const
const QK_SOURCES = ['data_sources', MIZU_TENANT_ID] as const

// ─── Função pura: calcula o intervalo de comparação ─────────────
// Retorna { cmpStart, cmpEnd } ou null se cmpMode === 'none'.

export function getComparisonRange(
  start: string,
  end: string,
  cmpMode: CmpMode,
): { cmpStart: string; cmpEnd: string } | null {
  if (cmpMode === 'none') return null

  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')

  if (cmpMode === 'prev') {
    // Mesmo número de dias, imediatamente antes do start.
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    const cmpEnd = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
    const cmpStart = new Date(cmpEnd.getTime() - diffDays * 24 * 60 * 60 * 1000)
    return {
      cmpStart: cmpStart.toISOString().slice(0, 10),
      cmpEnd: cmpEnd.toISOString().slice(0, 10),
    }
  }

  if (cmpMode === 'prevMonth') {
    // Subtrai 1 mês do start e do end.
    const s = new Date(startDate)
    const e = new Date(endDate)
    s.setMonth(s.getMonth() - 1)
    e.setMonth(e.getMonth() - 1)
    return {
      cmpStart: s.toISOString().slice(0, 10),
      cmpEnd: e.toISOString().slice(0, 10),
    }
  }

  return null
}

// ─── Query: leitura de sales_daily ───────────────────────────────

// Opt-in/out de Realtime. Default true (compat). Componentes que só
// leem o cache (ex.: AnalysisSection) passam { subscribeRealtime: false }
// para evitar abrir um 2º WebSocket — economiza conexão do browser.
type UseSalesOptions = { subscribeRealtime?: boolean }

export function useSales(start: string, end: string, options: UseSalesOptions = {}) {
  const { subscribeRealtime = true } = options
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK_SALES, start, end],
    queryFn: async (): Promise<SalesRow[]> => {
      const { data, error } = await supabase
        .from('sales_daily')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })

  // Realtime: canal com nome único por instância — evita warning
  // "channel already subscribed" quando múltiplos hooks usam useSales
  // ao mesmo tempo (ex.: período atual + período comparado).
  useEffect(() => {
    if (!subscribeRealtime) return
    const channelName = `sales-${MIZU_TENANT_ID}-${crypto.randomUUID()}`
    const channel = supabase
      .channel(channelName)
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
  }, [qc, subscribeRealtime])

  return query
}

// ─── Query: leitura do período comparado ─────────────────────────
// Só dispara quando cmpMode !== 'none'. **queryKey separada de QK_SALES**
// pra evitar que invalidações por Realtime do range atual disparem
// refetch em cascata da comparação (que é histórico, raramente muda).
// staleTime alto: dados comparativos do passado são estáveis.

export function useSalesComparison(start: string, end: string, cmpMode: CmpMode) {
  const range = getComparisonRange(start, end, cmpMode)

  return useQuery({
    queryKey: [...QK_SALES_CMP, range?.cmpStart ?? '', range?.cmpEnd ?? ''],
    enabled: range !== null,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<SalesRow[]> => {
      if (!range) return []
      const { data, error } = await supabase
        .from('sales_daily')
        .select('*')
        .eq('tenant_id', MIZU_TENANT_ID)
        .gte('date', range.cmpStart)
        .lte('date', range.cmpEnd)
        .order('date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })
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
