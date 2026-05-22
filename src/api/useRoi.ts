import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'
import type { Database } from '../types/database'

type RoiConfigRow = Database['public']['Tables']['roi_config']['Row']
type RoiConfigInsert = Database['public']['Tables']['roi_config']['Insert']

export type RoiMode = 'mes' | 'sem'

// Default conforme briefing: R$ 11.000/mês (6k tráfego + 3k mão de obra + 2k geral).
const DEFAULT_CONFIG = {
  trafego: 6000,
  mao_de_obra: 3000,
  mkt_geral: 2000,
  mode: 'mes' as RoiMode,
}

export interface RoiData {
  config: {
    trafego: number
    mao_de_obra: number
    mkt_geral: number
    mode: RoiMode
  }
  // Faturamento já calculado pros 2 modos — alternar o toggle não refaz fetch.
  monthFat: number
  monthDays: number
  weekFat: number
  weekDays: number
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=dom, 1=seg…
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// Formata pela data LOCAL (Brasil é UTC-3). toISOString() usaria UTC e
// poderia pular um dia perto da meia-noite.
function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const QK = ['roi', MIZU_TENANT_ID] as const

export function useRoi() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK],
    queryFn: async (): Promise<RoiData> => {
      const today = new Date()
      const todayIso = toISO(today)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthStartIso = toISO(monthStart)
      const weekStartIso = toISO(startOfWeek(today))

      const [configRes, salesRes] = await Promise.all([
        supabase
          .from('roi_config')
          .select('*')
          .eq('tenant_id', MIZU_TENANT_ID)
          .maybeSingle(),
        supabase
          .from('sales_daily')
          .select('date, total')
          .eq('tenant_id', MIZU_TENANT_ID)
          .gte('date', monthStartIso)
          .lte('date', todayIso),
      ])

      if (configRes.error) throw configRes.error
      if (salesRes.error) throw salesRes.error

      const row = configRes.data as RoiConfigRow | null
      const config = row
        ? {
            trafego: Number(row.trafego ?? DEFAULT_CONFIG.trafego),
            mao_de_obra: Number(row.mao_de_obra ?? DEFAULT_CONFIG.mao_de_obra),
            mkt_geral: Number(row.mkt_geral ?? DEFAULT_CONFIG.mkt_geral),
            mode: (row.mode === 'sem' ? 'sem' : 'mes') as RoiMode,
          }
        : { ...DEFAULT_CONFIG }

      const sales = salesRes.data ?? []

      // Faturamento = soma de todas as unidades no período (igual painel antigo).
      let monthFat = 0
      let weekFat = 0
      const monthDates = new Set<string>()
      const weekDates = new Set<string>()
      for (const r of sales) {
        const val = Number(r.total ?? 0)
        monthFat += val
        monthDates.add(r.date)
        if (r.date >= weekStartIso) {
          weekFat += val
          weekDates.add(r.date)
        }
      }

      return {
        config,
        monthFat,
        monthDays: monthDates.size,
        weekFat,
        weekDays: weekDates.size,
      }
    },
    staleTime: 2 * 60 * 1000,
  })

  useEffect(() => {
    const channel = supabase
      .channel(`roi-${MIZU_TENANT_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'roi_config', filter: `tenant_id=eq.${MIZU_TENANT_ID}` }, () => qc.invalidateQueries({ queryKey: QK }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_daily', filter: `tenant_id=eq.${MIZU_TENANT_ID}` }, () => qc.invalidateQueries({ queryKey: QK }))
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [qc])

  return query
}

type RoiPatch = Partial<Omit<RoiConfigInsert, 'tenant_id' | 'updated_at'>>

export function useSaveRoiConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: RoiPatch) => {
      // Lê o estado atual pra não zerar os campos que não vieram no patch
      // (UPSERT — atualiza se já existe, cria se não).
      const current = qc.getQueryData<RoiData>([...QK])?.config ?? DEFAULT_CONFIG
      const row: RoiConfigInsert = {
        tenant_id: MIZU_TENANT_ID,
        trafego: current.trafego,
        mao_de_obra: current.mao_de_obra,
        mkt_geral: current.mkt_geral,
        mode: current.mode,
        ...patch,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from('roi_config')
        .upsert(row, { onConflict: 'tenant_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    // Atualização otimista: troca a tela na hora, salva em segundo plano.
    // Sem isso o toggle só mexia depois de 2 idas ao servidor (= "lag").
    onMutate: async (patch: RoiPatch) => {
      await qc.cancelQueries({ queryKey: QK })
      const prev = qc.getQueryData<RoiData>([...QK])
      if (prev) {
        qc.setQueryData<RoiData>([...QK], {
          ...prev,
          config: {
            ...prev.config,
            ...patch,
            mode: (patch.mode === 'sem' ? 'sem' : patch.mode === 'mes' ? 'mes' : prev.config.mode),
          },
        })
      }
      return { prev }
    },
    onError: (_err, _patch, ctx) => {
      // Deu erro ao salvar: desfaz a mudança otimista.
      if (ctx?.prev) qc.setQueryData([...QK], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
