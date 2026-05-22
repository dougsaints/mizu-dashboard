import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { MIZU_TENANT_ID } from '../lib/tenant'

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=dom, 1=seg…
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export interface UnitWeek {
  id: string
  name: string
  cur: number
  prev: number
}

export interface WeeklyRecapData {
  periodLabel: string
  units: UnitWeek[]
  totalCur: number
  totalPrev: number
  adSpend: number
  roas: number | null
  top3: Array<{ name: string; qty: number }>
  alertDown: { unit: string; pct: number } | null
  noRevenue: boolean
}

const QK = ['weekly_recap', MIZU_TENANT_ID] as const

export function useWeeklyRecap() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: [...QK],
    queryFn: async (): Promise<WeeklyRecapData> => {
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      const weekStart = startOfWeek(today)
      const weekEndDate = new Date(weekStart)
      weekEndDate.setDate(weekEndDate.getDate() + 6)
      weekEndDate.setHours(23, 59, 59, 999)
      const capEnd = today < weekEndDate ? today : weekEndDate

      const prevWeekStart = new Date(weekStart)
      prevWeekStart.setDate(prevWeekStart.getDate() - 7)

      const since14 = toISO(prevWeekStart)
      const weekStartIso = toISO(weekStart)

      const [unitsRes, salesRes, adsRes, productsRes] = await Promise.all([
        supabase
          .from('units')
          .select('*')
          .eq('tenant_id', MIZU_TENANT_ID)
          .order('sort_order', { ascending: true }),
        supabase
          .from('sales_daily')
          .select('unit_id, date, total')
          .eq('tenant_id', MIZU_TENANT_ID)
          .gte('date', since14)
          .order('date', { ascending: false }),
        supabase
          .from('ads_daily')
          .select('cost, date')
          .eq('tenant_id', MIZU_TENANT_ID)
          .gte('date', weekStartIso)
          .lte('date', toISO(capEnd)),
        supabase
          .from('anotaai_products')
          .select('product_name, quantity, snapshot_date')
          .eq('tenant_id', MIZU_TENANT_ID)
          .order('snapshot_date', { ascending: false })
          .limit(500),
      ])

      if (unitsRes.error) throw unitsRes.error
      if (salesRes.error) throw salesRes.error
      if (adsRes.error) throw adsRes.error
      if (productsRes.error) throw productsRes.error

      const dbUnits = unitsRes.data ?? []
      const sales = salesRes.data ?? []
      const ads = adsRes.data ?? []
      const products = productsRes.data ?? []

      // Âncora: último dia COM dado de venda na semana atual. A planilha
      // atrasa 1-2 dias; comparar "até hoje" mostraria queda falsa. Comparamos
      // só os dias com dado contra o mesmo nº de dias da semana anterior.
      const capEndIso = toISO(capEnd)
      const curWeekDates = sales
        .map(r => r.date)
        .filter(d => d >= weekStartIso && d <= capEndIso)
      const lastDataIso = curWeekDates.length > 0
        ? curWeekDates.reduce((a, b) => (a > b ? a : b))
        : weekStartIso

      const [ly, lm, ld] = lastDataIso.split('-').map(Number)
      const effectiveEnd = new Date(ly, lm - 1, ld)
      const elapsedDays = Math.round((effectiveEnd.getTime() - weekStart.getTime()) / 86400000) + 1

      const prevWeekEnd = new Date(prevWeekStart)
      prevWeekEnd.setDate(prevWeekEnd.getDate() + elapsedDays - 1)
      const prevWeekEndIso = toISO(prevWeekEnd)
      const prevWeekStartIso = toISO(prevWeekStart)

      const periodLabel = `${fmtDate(weekStart)} → ${fmtDate(effectiveEnd)} · vs ${fmtDate(prevWeekStart)} → ${fmtDate(prevWeekEnd)}`

      // Faturamento por unit_id nos 2 períodos (janelas de mesmo tamanho)
      const sumSales = (unitId: string, iniIso: string, fimIso: string): number =>
        sales
          .filter(r => r.unit_id === unitId && r.date >= iniIso && r.date <= fimIso)
          .reduce((s, r) => s + Number(r.total ?? 0), 0)

      const units: UnitWeek[] = dbUnits.map(u => ({
        id: u.id,
        name: u.display_name,
        cur: sumSales(u.id, weekStartIso, lastDataIso),
        prev: sumSales(u.id, prevWeekStartIso, prevWeekEndIso),
      }))

      const totalCur = units.reduce((s, u) => s + u.cur, 0)
      const totalPrev = units.reduce((s, u) => s + u.prev, 0)

      // ROAS (retorno sobre investimento em anúncios) = faturamento ÷ gasto.
      // Gasto limitado à mesma janela do faturamento (até o último dia com dado).
      const adSpend = ads
        .filter(r => r.date <= lastDataIso)
        .reduce((s, r) => s + Number(r.cost ?? 0), 0)
      const roas = adSpend > 0 ? totalCur / adSpend : null

      // Top 3 produtos — snapshot mais recente disponível
      const latestSnapshot = products[0]?.snapshot_date ?? null
      const productMap = new Map<string, number>()
      if (latestSnapshot) {
        products
          .filter(p => p.snapshot_date === latestSnapshot)
          .forEach(p => {
            const cur = productMap.get(p.product_name) ?? 0
            productMap.set(p.product_name, cur + Number(p.quantity ?? 0))
          })
      }
      const top3 = [...productMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, qty]) => ({ name, qty }))

      // Alerta: queda > 15% em alguma unidade
      const drops = units
        .filter(u => u.prev > 0)
        .map(u => ({ unit: u.name, pct: ((u.cur - u.prev) / u.prev) * 100 }))
        .sort((a, b) => a.pct - b.pct)
      const alertDown = drops.length > 0 && drops[0].pct < -15 ? drops[0] : null

      return {
        periodLabel,
        units,
        totalCur,
        totalPrev,
        adSpend,
        roas,
        top3,
        alertDown,
        noRevenue: totalCur === 0,
      }
    },
    staleTime: 2 * 60 * 1000,
  })

  useEffect(() => {
    const channel = supabase
      .channel(`weekly-recap-${MIZU_TENANT_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_daily', filter: `tenant_id=eq.${MIZU_TENANT_ID}` }, () => qc.invalidateQueries({ queryKey: QK }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads_daily', filter: `tenant_id=eq.${MIZU_TENANT_ID}` }, () => qc.invalidateQueries({ queryKey: QK }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anotaai_products', filter: `tenant_id=eq.${MIZU_TENANT_ID}` }, () => qc.invalidateQueries({ queryKey: QK }))
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [qc])

  return query
}
