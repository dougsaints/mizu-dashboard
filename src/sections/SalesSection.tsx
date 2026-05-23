// Seção Vendas — Phase 11-04 (refactor sprint v0.2 remediation).
// Topo: 5 KPIs com sparklines (Vendas Totais hero + Item Mais Vendido + PDV + iFood + AnotaAi).
// Reage dinamicamente a unidade/canal/período via useFilters.

import { useMemo } from 'react'
import { useSales, useSalesComparison } from '../api/useSales'
import { useAnotaaiProducts } from '../api/useAnotaai'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel } from '../lib/period'
import SalesLineChart from '../components/SalesLineChart'
import SectionHeader from '../components/SectionHeader'
import Sparkline from '../components/Sparkline'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']

const CHANNEL_LABEL: Record<Channel, string> = {
  all: '',
  pdv: 'PDV',
  ifood: 'iFood',
  anotaai: 'AnotaAi',
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function brlShort(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function pct(curr: number, prev: number): { value: number; valid: boolean } {
  if (prev === 0) return { value: 0, valid: false }
  return { value: ((curr - prev) / prev) * 100, valid: true }
}

function formatDateBR(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function aggregateByUnit(
  rows: SalesRow[],
): Record<string, { total: number; pdv: number; anotaai: number; ifood: number; days: number }> {
  const out: Record<string, { total: number; pdv: number; anotaai: number; ifood: number; days: number }> = {}
  for (const r of rows) {
    const k = r.unit_id
    if (!out[k]) out[k] = { total: 0, pdv: 0, anotaai: 0, ifood: 0, days: 0 }
    out[k].total += Number(r.total ?? 0)
    out[k].pdv += Number(r.pdv ?? 0)
    out[k].anotaai += Number(r.anotaai ?? 0)
    out[k].ifood += Number(r.ifood ?? 0)
    out[k].days += 1
  }
  return out
}

function buildDailySeries(rows: SalesRow[]) {
  const byDate = new Map<string, { total: number; pdv: number; ifood: number; anotaai: number }>()
  for (const r of rows) {
    const d = r.date
    if (!byDate.has(d)) byDate.set(d, { total: 0, pdv: 0, ifood: 0, anotaai: 0 })
    const e = byDate.get(d)!
    e.total += Number(r.total ?? 0)
    e.pdv += Number(r.pdv ?? 0)
    e.ifood += Number(r.ifood ?? 0)
    e.anotaai += Number(r.anotaai ?? 0)
  }
  const sorted = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b))
  return {
    dates: sorted.map(([d]) => d),
    total: sorted.map(([, v]) => v.total),
    pdv: sorted.map(([, v]) => v.pdv),
    ifood: sorted.map(([, v]) => v.ifood),
    anotaai: sorted.map(([, v]) => v.anotaai),
  }
}

type DeltaProps = {
  curr: number
  prev: number
  hasCmpData: boolean
  cmpLabel?: string
}
function DeltaBadge({ curr, prev, hasCmpData, cmpLabel }: DeltaProps) {
  if (!hasCmpData) return <span className="kpi-delta kpi-delta--empty">— sem dados</span>
  const { value, valid } = pct(curr, prev)
  if (!valid) return <span className="kpi-delta kpi-delta--empty">— sem dados</span>
  const abs = Math.abs(value)
  const isFlat = abs < 0.5
  const isUp = value >= 0.5
  const cls = isFlat ? 'kpi-delta--flat' : isUp ? 'kpi-delta--up' : 'kpi-delta--down'
  const arrow = isFlat ? '' : isUp ? '▲' : '▼'
  return (
    <span
      className={`kpi-delta ${cls}`}
      title={cmpLabel ?? `vs ${brl(prev)} no período comparado`}
    >
      {arrow} {abs.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
    </span>
  )
}

export default function SalesSection() {
  const { start, end, unitId, channel, cmpMode } = useFilters()
  const { data: rows = [], isLoading, error } = useSales(start, end)
  const { data: cmpRowsRaw = [] } = useSalesComparison(start, end, cmpMode)
  const { data: units = [] } = useUnits()
  const { data: anotaaiProducts = [] } = useAnotaaiProducts(120, { subscribeRealtime: false })
  const unitName = (id: string) => units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8)

  const comparing = cmpMode !== 'none'

  const displayRows = useMemo<SalesRow[]>(() => {
    const filtered = unitId ? rows.filter((r) => r.unit_id === unitId) : rows
    if (channel === 'all') return filtered
    return filtered.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
  }, [rows, unitId, channel])

  const cmpRows = useMemo<SalesRow[]>(() => {
    const filtered = unitId ? cmpRowsRaw.filter((r) => r.unit_id === unitId) : cmpRowsRaw
    if (channel === 'all') return filtered
    return filtered.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
  }, [cmpRowsRaw, unitId, channel])

  const hasCmpData = comparing && cmpRows.length > 0

  const aggregated = useMemo(() => aggregateByUnit(displayRows), [displayRows])
  const cmpAggregated = useMemo(() => aggregateByUnit(cmpRows), [cmpRows])

  const totals = useMemo(() => {
    return Object.values(aggregated).reduce(
      (acc, u) => ({
        total: acc.total + u.total,
        pdv: acc.pdv + u.pdv,
        ifood: acc.ifood + u.ifood,
        anotaai: acc.anotaai + u.anotaai,
      }),
      { total: 0, pdv: 0, ifood: 0, anotaai: 0 },
    )
  }, [aggregated])

  const cmpTotals = useMemo(() => {
    return Object.values(cmpAggregated).reduce(
      (acc, u) => ({
        total: acc.total + u.total,
        pdv: acc.pdv + u.pdv,
        ifood: acc.ifood + u.ifood,
        anotaai: acc.anotaai + u.anotaai,
      }),
      { total: 0, pdv: 0, ifood: 0, anotaai: 0 },
    )
  }, [cmpAggregated])

  const dailySeries = useMemo(() => buildDailySeries(displayRows), [displayRows])

  const ticketMedio = useMemo(() => {
    const allDays = Object.values(aggregated).reduce((s, u) => s + u.days, 0)
    return allDays > 0 ? totals.total / allDays : 0
  }, [aggregated, totals.total])

  // Item Mais Vendido — snapshot mais recente do período, top 1 por quantity
  const itemMaisVendido = useMemo(() => {
    const inRange = anotaaiProducts.filter(
      (p) => p.snapshot_date >= start && p.snapshot_date <= end,
    )
    if (inRange.length === 0) return null
    let latestDate = inRange[0].snapshot_date
    for (const p of inRange) {
      if (p.snapshot_date > latestDate) latestDate = p.snapshot_date
    }
    let latest = inRange.filter((p) => p.snapshot_date === latestDate)
    if (unitId) {
      latest = latest.filter((p) => p.unit_id === unitId || p.unit_id === null)
    }
    if (latest.length === 0) return null
    let best = latest[0]
    for (const p of latest) {
      if (Number(p.quantity ?? 0) > Number(best.quantity ?? 0)) best = p
    }
    return { name: best.product_name, qty: Number(best.quantity ?? 0) }
  }, [anotaaiProducts, start, end, unitId])

  const cmpRangeLabel = useMemo(() => {
    if (!hasCmpData) return ''
    const dates = [...new Set(cmpRows.map((r) => r.date))].sort()
    if (dates.length === 0) return ''
    return ` (${formatDateBR(dates[0])} – ${formatDateBR(dates[dates.length - 1])})`
  }, [cmpRows, hasCmpData])

  const filterChips = [
    unitId ? (units.find((u) => u.id === unitId)?.display_name ?? '') : '',
    channel === 'all' ? '' : `canal ${CHANNEL_LABEL[channel]}`,
  ].filter(Boolean)
  const filterSuffix = filterChips.length > 0 ? ` · ${filterChips.join(' · ')}` : ''

  const showEmpty = !isLoading && !error && displayRows.length === 0
  const hasData = !isLoading && !error && displayRows.length > 0
  const totalDays = Object.values(aggregated).reduce((s, u) => s + u.days, 0)

  return (
    <section className="mizu-section is-source-vendas">
      <SectionHeader
        source="vendas"
        kanji="売"
        title="Faturamento"
        subtitle={`Sincronizado das planilhas a cada 5 min${filterSuffix}`}
        period={{ start, end }}
      />
      {comparing && !hasCmpData && hasData && (
        <div className="sales-cmp-note">Sem dados no período de comparação</div>
      )}

      {isLoading && <div className="sales-loading">Carregando faturamento…</div>}
      {error && (
        <div className="sales-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {showEmpty && (
        <div className="sales-empty">
          {rows.length === 0
            ? 'Nenhum dado de faturamento ainda. As planilhas Google são sincronizadas automaticamente — em alguns segundos os números devem aparecer aqui.'
            : 'Nenhum dado pra essa combinação de filtros. Tente trocar a unidade, o canal ou o período.'}
        </div>
      )}

      {hasData && (
        <>
          <div className="sales-top-grid">
            {/* HERO: Vendas Totais */}
            <div className="sales-top-card sales-top-card--hero">
              <div className="sales-top-icon" aria-hidden>💰</div>
              <div className="sales-top-lbl">Vendas Totais</div>
              <div className="sales-top-val">{brlShort(totals.total)}</div>
              {comparing && (
                <DeltaBadge
                  curr={totals.total}
                  prev={cmpTotals.total}
                  hasCmpData={hasCmpData}
                  cmpLabel={`vs ${brl(cmpTotals.total)}${cmpRangeLabel}`}
                />
              )}
              <div className="sales-top-sub">
                {totalDays} dias de operação
                {comparing && hasCmpData && (
                  <><br /><span className="sales-top-cmp">vs. {brlShort(cmpTotals.total)}{cmpRangeLabel}</span></>
                )}
              </div>
              <div className="sales-top-spark sales-top-spark--hero">
                <Sparkline values={dailySeries.total} color="#C9A961" fill="#C9A961" width={150} height={38} />
              </div>
            </div>

            {/* Item Mais Vendido */}
            <div className="sales-top-card">
              <div className="sales-top-icon" aria-hidden>🏆</div>
              <div className="sales-top-lbl">Item Mais Vendido</div>
              {itemMaisVendido ? (
                <>
                  <div className="sales-top-name">{itemMaisVendido.name}</div>
                  <div className="sales-top-sub">{itemMaisVendido.qty} unidades</div>
                </>
              ) : (
                <>
                  <div className="sales-top-val sales-top-val--muted">—</div>
                  <div className="sales-top-sub">Sem snapshot Anota AI no período</div>
                </>
              )}
            </div>

            {/* PDV */}
            <div className="sales-top-card">
              <div className="sales-top-icon" aria-hidden>🏪</div>
              <div className="sales-top-lbl">PDV Loja Física</div>
              <div className="sales-top-val">{brlShort(totals.pdv)}</div>
              {comparing && (
                <DeltaBadge
                  curr={totals.pdv}
                  prev={cmpTotals.pdv}
                  hasCmpData={hasCmpData}
                  cmpLabel={`vs ${brl(cmpTotals.pdv)}${cmpRangeLabel}`}
                />
              )}
              <div className="sales-top-sub">
                {totals.total > 0 ? `${((totals.pdv / totals.total) * 100).toFixed(1).replace('.', ',')}% do total` : '—'}
                {comparing && hasCmpData && (
                  <><br /><span className="sales-top-cmp">vs. {brlShort(cmpTotals.pdv)}{cmpRangeLabel}</span></>
                )}
              </div>
              <div className="sales-top-spark">
                <Sparkline values={dailySeries.pdv} color="#2980B9" fill="#2980B9" />
              </div>
            </div>

            {/* iFood */}
            <div className="sales-top-card">
              <div className="sales-top-icon" aria-hidden>🛵</div>
              <div className="sales-top-lbl">iFood</div>
              <div className="sales-top-val">{brlShort(totals.ifood)}</div>
              {comparing && (
                <DeltaBadge
                  curr={totals.ifood}
                  prev={cmpTotals.ifood}
                  hasCmpData={hasCmpData}
                  cmpLabel={`vs ${brl(cmpTotals.ifood)}${cmpRangeLabel}`}
                />
              )}
              <div className="sales-top-sub">
                {totals.total > 0 ? `${((totals.ifood / totals.total) * 100).toFixed(1).replace('.', ',')}% do total` : '—'}
                {comparing && hasCmpData && (
                  <><br /><span className="sales-top-cmp">vs. {brlShort(cmpTotals.ifood)}{cmpRangeLabel}</span></>
                )}
              </div>
              <div className="sales-top-spark">
                <Sparkline values={dailySeries.ifood} color="#FF6B35" fill="#FF6B35" />
              </div>
            </div>

            {/* AnotaAi */}
            <div className="sales-top-card">
              <div className="sales-top-icon" aria-hidden>📱</div>
              <div className="sales-top-lbl">Anota AI</div>
              <div className="sales-top-val">{brlShort(totals.anotaai)}</div>
              {comparing && (
                <DeltaBadge
                  curr={totals.anotaai}
                  prev={cmpTotals.anotaai}
                  hasCmpData={hasCmpData}
                  cmpLabel={`vs ${brl(cmpTotals.anotaai)}${cmpRangeLabel}`}
                />
              )}
              <div className="sales-top-sub">
                {totals.total > 0 ? `${((totals.anotaai / totals.total) * 100).toFixed(1).replace('.', ',')}% do total` : '—'}
                {comparing && hasCmpData && (
                  <><br /><span className="sales-top-cmp">vs. {brlShort(cmpTotals.anotaai)}{cmpRangeLabel}</span></>
                )}
              </div>
              <div className="sales-top-spark">
                <Sparkline values={dailySeries.anotaai} color="#27AE60" fill="#27AE60" />
              </div>
            </div>
          </div>

          {/* Ticket médio + unit cards continuam abaixo (mantém o detalhamento) */}
          <div className="sales-kpis">
            <div className="kpi-card">
              <div className="kpi-label">Ticket médio diário</div>
              <div className="kpi-value">{brl(ticketMedio)}</div>
              <div className="kpi-sub">Σ total ÷ dias com dados</div>
            </div>
          </div>

          <div className="sales-unit-grid">
            {Object.entries(aggregated).map(([id, agg]) => {
              const cmpAgg = cmpAggregated[id]
              const slug = unitName(id).toLowerCase().includes('jatiu')
                ? 'jatiuca'
                : unitName(id).toLowerCase().includes('serraria')
                  ? 'serraria'
                  : 'other'
              return (
                <div key={id} className={`unit-card ${slug !== 'other' ? slug : ''}`}>
                  <div className={`unit-card-badge unit-card-badge--${slug}`}>
                    {unitName(id).toUpperCase()}
                  </div>
                  <div className="unit-card-total">{brl(agg.total)}</div>
                  {comparing && (
                    <DeltaBadge
                      curr={agg.total}
                      prev={cmpAgg?.total ?? 0}
                      hasCmpData={hasCmpData && !!cmpAgg}
                    />
                  )}
                  {channel === 'all' && (
                    <div className="unit-card-breakdown">
                      <span>
                        PDV: {brl(agg.pdv)}
                        {comparing && (
                          <DeltaBadge curr={agg.pdv} prev={cmpAgg?.pdv ?? 0} hasCmpData={hasCmpData && !!cmpAgg} />
                        )}
                      </span>
                      <span>
                        Anota AI: {brl(agg.anotaai)}
                        {comparing && (
                          <DeltaBadge curr={agg.anotaai} prev={cmpAgg?.anotaai ?? 0} hasCmpData={hasCmpData && !!cmpAgg} />
                        )}
                      </span>
                      <span>
                        iFood: {brl(agg.ifood)}
                        {comparing && (
                          <DeltaBadge curr={agg.ifood} prev={cmpAgg?.ifood ?? 0} hasCmpData={hasCmpData && !!cmpAgg} />
                        )}
                      </span>
                    </div>
                  )}
                  <div className="unit-card-days">{agg.days} dia(s) com dados</div>
                </div>
              )
            })}
          </div>

          <div className="sales-chart">
            <div className="sales-chart-title">Faturamento dia a dia · por loja</div>
            <SalesLineChart
              rows={displayRows}
              units={units}
              cmpRows={hasCmpData ? cmpRows : []}
            />
          </div>
        </>
      )}
    </section>
  )
}
