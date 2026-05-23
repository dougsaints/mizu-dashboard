// Card de comparação justa por unidade (Phase 6-05).
// Mostra total, R$/dia, share, variação vs comparado, média histórica.

import { useMemo } from 'react'
import { computeDelta } from '../lib/aggregation'
import type { Database } from '../types/database'
import type { Channel } from '../lib/period'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type Unit = Database['public']['Tables']['units']['Row']

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function valueFor(row: SalesRow, channel: Channel): number {
  if (channel === 'all') return Number(row.total ?? 0)
  return Number(row[channel] ?? 0)
}

function unitSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

type Props = {
  unit: Unit
  rowsCurr: SalesRow[]
  rowsPrev: SalesRow[]
  channel: Channel
  comparing: boolean
  groupTotal: number
  histRate: number | null
}

export default function UnitCompareCard({
  unit,
  rowsCurr,
  rowsPrev,
  channel,
  comparing,
  groupTotal,
  histRate,
}: Props) {
  const stats = useMemo(() => {
    const curr = rowsCurr.filter((r) => r.unit_id === unit.id)
    const prev = rowsPrev.filter((r) => r.unit_id === unit.id)

    let total = 0
    const currDates = new Set<string>()
    for (const r of curr) {
      total += valueFor(r, channel)
      currDates.add(r.date)
    }
    const days = currDates.size
    const rate = days > 0 ? total / days : 0
    const share = groupTotal > 0 ? (total / groupTotal) * 100 : 0

    let prevTotal = 0
    for (const r of prev) prevTotal += valueFor(r, channel)

    return { total, days, rate, share, prevTotal }
  }, [rowsCurr, rowsPrev, unit.id, channel, groupTotal])

  const delta = useMemo(
    () => (comparing ? computeDelta(stats.total, stats.prevTotal) : null),
    [stats.total, stats.prevTotal, comparing],
  )

  const dayLabel = stats.days === 1 ? 'dia' : 'dias'
  const slug = unitSlug(unit.display_name)

  return (
    <div className={`unit-compare-card uc-${slug}`}>
      <div className="uc-head">
        <span className="uc-name">{unit.display_name}</span>
        <span className="uc-share">{stats.share.toFixed(1).replace('.', ',')}% do período</span>
      </div>
      <div className="uc-total">{brl(stats.total)}</div>
      <div className="uc-rate">
        {brl(stats.rate)} / dia • {stats.days} {dayLabel}
      </div>
      {delta && delta.pct !== null && (
        <div className="uc-meta">
          {delta.direction === 'flat' ? (
            <span className="uc-badge uc-badge--flat" title={`vs ${brl(stats.prevTotal)}`}>
              estável
            </span>
          ) : (
            <span
              className={`uc-badge ${delta.direction === 'up' ? 'uc-badge--up' : 'uc-badge--down'}`}
              title={`vs ${brl(stats.prevTotal)}`}
            >
              {delta.direction === 'up' ? '▲' : '▼'}{' '}
              {Math.abs(delta.pct).toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              %
            </span>
          )}
          <span className="uc-prev">vs {brl(stats.prevTotal)}</span>
        </div>
      )}
      {delta && delta.isNew && (
        <div className="uc-meta">
          <span className="uc-badge uc-badge--new">novo período</span>
        </div>
      )}
      {histRate !== null && histRate > 0 && (
        <div className="uc-ref">— média histórica: {brl(histRate)} / dia (≥8 semanas)</div>
      )}
    </div>
  )
}
