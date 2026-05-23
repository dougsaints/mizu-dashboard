// Heatmap CSS Grid 12 semanas × 7 dias (Phase 6-05).
// Cores via colorScale(val, min, max). Tooltip absoluto no hover.

import { Fragment, useMemo, useState } from 'react'
import { buildWeekBuckets, colorScale, type HeatmapDay } from '../lib/heatmap'
import type { Database } from '../types/database'
import type { Channel } from '../lib/period'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function brlK(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return `R$ ${n.toFixed(0)}`
}

function formatRowLabel(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${MONTHS_SHORT[d.getMonth()]}`
}

function formatTooltipDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function valueFor(row: SalesRow, channel: Channel): number {
  if (channel === 'all') return Number(row.total ?? 0)
  return Number(row[channel] ?? 0)
}

type Props = {
  rows: SalesRow[]
  channel: Channel
}

type TooltipState = { html: React.ReactNode; x: number; y: number } | null

export default function SalesHeatmap({ rows, channel }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const { buckets, min, max, maxDate, hasData } = useMemo(() => {
    if (rows.length === 0) {
      return { buckets: [], min: 0, max: 0, maxDate: new Date(), hasData: false }
    }

    // Soma por data (dias com multi-unit ou multi-row já vêm somados via JOIN
    // virtual, mas garantimos aqui pra evitar surpresas)
    const byDate = new Map<string, number>()
    let maxDateStr = rows[0].date
    for (const r of rows) {
      if (r.date > maxDateStr) maxDateStr = r.date
      byDate.set(r.date, (byDate.get(r.date) ?? 0) + valueFor(r, channel))
    }
    const daily = [...byDate.entries()].map(([ds, val]) => ({ ds, val }))

    const maxD = new Date(maxDateStr + 'T00:00:00')
    const bk = buildWeekBuckets(daily, maxD, 12)

    let mn = Infinity
    let mx = 0
    for (const b of bk) {
      for (const d of b.days) {
        if (d.val != null && d.val > 0) {
          if (d.val < mn) mn = d.val
          if (d.val > mx) mx = d.val
        }
      }
    }
    if (mn === Infinity) mn = 0
    return { buckets: bk, min: mn, max: mx, maxDate: maxD, hasData: mx > 0 }
  }, [rows, channel])

  const handleCellEnter = (e: React.MouseEvent, d: HeatmapDay) => {
    const isFuture = d.date.getTime() > maxDate.getTime()
    const hasVal = d.val != null && d.val > 0
    if (isFuture || !hasVal) {
      setTooltip({
        html: (
          <>
            <strong>{formatTooltipDate(d.date)}</strong>
            <br />
            <span style={{ color: '#B4B4B7' }}>{isFuture ? 'Data futura' : 'Sem dados'}</span>
          </>
        ),
        x: e.clientX,
        y: e.clientY,
      })
      return
    }
    setTooltip({
      html: (
        <>
          <strong>{formatTooltipDate(d.date)}</strong>
          <br />
          {brl(d.val as number)}
        </>
      ),
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleCellLeave = () => setTooltip(null)

  if (!hasData) {
    return <div className="heatmap-empty-state">Sem dados pra esses filtros</div>
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-legend">
        <span>{brlK(min)}</span>
        <span className="heatmap-legend-bar" />
        <span>{brlK(max)}</span>
      </div>
      <div className="heatmap">
        <div className="heatmap-corner" />
        {DOW_LABELS.map((l) => (
          <div className="heatmap-col-label" key={l}>
            {l}
          </div>
        ))}
        {buckets.map((b, bi) => (
          <Fragment key={bi}>
            <div className="heatmap-row-label">{formatRowLabel(b.weekStart)}</div>
            {b.days.map((d, di) => {
              const isFuture = d.date.getTime() > maxDate.getTime()
              const noData = d.val == null || d.val <= 0
              const empty = isFuture || noData
              const bg = empty ? undefined : colorScale(d.val, min, max)
              return (
                <div
                  key={di}
                  className={`heatmap-cell ${empty ? 'empty' : ''}`}
                  style={bg ? { background: bg } : undefined}
                  onMouseEnter={(e) => handleCellEnter(e, d)}
                  onMouseMove={(e) => handleCellEnter(e, d)}
                  onMouseLeave={handleCellLeave}
                />
              )
            })}
          </Fragment>
        ))}
      </div>

      {tooltip && (
        <div
          className="heatmap-tooltip visible"
          style={{
            left: Math.min(tooltip.x + 14, window.innerWidth - 200),
            top: Math.min(tooltip.y + 14, window.innerHeight - 80),
          }}
        >
          {tooltip.html}
        </div>
      )}
    </div>
  )
}
