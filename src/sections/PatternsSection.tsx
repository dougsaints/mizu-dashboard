// Seção "Padrões e Performance" — Phase 6-05.
// Heatmap semanal (12 semanas, layout fixo) + cards de comparação justa
// entre unidades (respeita filtros do header).

import { useMemo } from 'react'
import { useSales, useSalesComparison } from '../api/useSales'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel } from '../lib/period'
import { startOfWeekSun, toIso } from '../lib/heatmap'
import SalesHeatmap from '../components/SalesHeatmap'
import UnitCompareCard from '../components/UnitCompareCard'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type Unit = Database['public']['Tables']['units']['Row']

function valueFor(row: SalesRow, channel: Channel): number {
  if (channel === 'all') return Number(row.total ?? 0)
  return Number(row[channel] ?? 0)
}

// Calcula média histórica de R$/dia de uma unidade nas rows fornecidas.
// Requer ≥8 semanas (56 dias) — se range tem menos, retorna null.
function computeHistRate(
  rows: SalesRow[],
  unitId: string,
  channel: Channel,
  rangeStart: string,
  rangeEnd: string,
): number | null {
  // Datas em ms pra medir cobertura
  const start = new Date(rangeStart + 'T00:00:00').getTime()
  const end = new Date(rangeEnd + 'T00:00:00').getTime()
  const days = Math.round((end - start) / 86400000) + 1
  if (days < 56) return null

  const unitRows = rows.filter((r) => r.unit_id === unitId)
  if (unitRows.length === 0) return null

  let total = 0
  const dates = new Set<string>()
  for (const r of unitRows) {
    total += valueFor(r, channel)
    dates.add(r.date)
  }
  if (dates.size === 0) return null
  return total / dates.size
}

export default function PatternsSection() {
  const { start, end, unitId, channel, cmpMode } = useFilters()
  const { data: units = [] } = useUnits()

  // Range fixo das 12 semanas terminando hoje
  const { heatmapStart, heatmapEnd } = useMemo(() => {
    const today = new Date()
    const lastSun = startOfWeekSun(today)
    const firstSun = new Date(lastSun)
    firstSun.setDate(firstSun.getDate() - 11 * 7)
    const lastSat = new Date(lastSun)
    lastSat.setDate(lastSat.getDate() + 6)
    return { heatmapStart: toIso(firstSun), heatmapEnd: toIso(lastSat) }
  }, [])

  // 3 queries — todas com subscribeRealtime: false (SalesSection já mantém canal aberto)
  const rowsAtual = useSales(start, end, { subscribeRealtime: false })
  const rowsCmp = useSalesComparison(start, end, cmpMode)
  const rowsHeatmap = useSales(heatmapStart, heatmapEnd, { subscribeRealtime: false })

  const comparing = cmpMode !== 'none'

  // Filtra heatmap por unidade (channel é aplicado dentro do SalesHeatmap)
  const heatmapRows = useMemo<SalesRow[]>(() => {
    const all = rowsHeatmap.data ?? []
    return unitId ? all.filter((r) => r.unit_id === unitId) : all
  }, [rowsHeatmap.data, unitId])

  // Unidades a mostrar nos cards
  const activeUnits = useMemo<Unit[]>(() => {
    if (unitId) return units.filter((u) => u.id === unitId)
    return units
  }, [units, unitId])

  // Group total = soma das rows do período (todas as unidades antes do filtro de share)
  const groupTotal = useMemo(() => {
    const rows = rowsAtual.data ?? []
    let sum = 0
    for (const r of rows) sum += valueFor(r, channel)
    return sum
  }, [rowsAtual.data, channel])

  // Pra cada unidade, hist rate baseado nos 12 semanas do heatmap
  const histRateByUnit = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const u of activeUnits) {
      map.set(
        u.id,
        computeHistRate(rowsHeatmap.data ?? [], u.id, channel, heatmapStart, heatmapEnd),
      )
    }
    return map
  }, [rowsHeatmap.data, activeUnits, channel, heatmapStart, heatmapEnd])

  const isLoading = rowsAtual.isLoading || rowsHeatmap.isLoading

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">律</span> Padrões e Performance
          </div>
          <div className="mizu-section-sub">
            Padrão semanal de faturamento (últimas 12 semanas) e comparação normalizada entre unidades
          </div>
        </div>
      </div>

      {isLoading && <div className="data-table-loading">Carregando padrões…</div>}

      {!isLoading && (
        <div className="patterns-grid">
          <div className="chart-card patterns-heatmap-card">
            <div className="chart-card-title">Padrão Semanal de Faturamento</div>
            <div className="chart-card-sub">
              12 semanas · cor mais escura = dia mais forte · respeita unidade e canal · ignora período
            </div>
            <SalesHeatmap rows={heatmapRows} channel={channel} />
          </div>
          <div className="patterns-units">
            {activeUnits.map((u) => (
              <UnitCompareCard
                key={u.id}
                unit={u}
                rowsCurr={rowsAtual.data ?? []}
                rowsPrev={rowsCmp.data ?? []}
                channel={channel}
                comparing={comparing}
                groupTotal={groupTotal}
                histRate={histRateByUnit.get(u.id) ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
