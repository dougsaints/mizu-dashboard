// Seção "Tabela de Dados" — Phase 6-03.
// Duas tabelas: (1) Matriz MoM (mês atual vs anterior, fixa — ignora
// filtro global de período); (2) Tabela agregada do período selecionado
// + botão de export CSV.

import { useMemo } from 'react'
import { useSales } from '../api/useSales'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel } from '../lib/period'
import {
  currentMonthRange,
  prevMonthRange,
  aggregateUnitMonth,
  computeDelta,
  unitHasChannel,
  type DeltaResult,
} from '../lib/aggregation'
import { buildCsv, downloadCsv, formatNumberBR } from '../lib/csvExport'
import type { Database } from '../types/database'
import SectionHeader from '../components/SectionHeader'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type Unit = Database['public']['Tables']['units']['Row']

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function monthLabel(iso: string): string {
  const [y, m] = iso.split('-')
  return `${MONTHS[Number(m) - 1]}/${y.slice(2)}`
}

function filterByUnit(rows: SalesRow[], unitId: string): SalesRow[] {
  return rows.filter((r) => r.unit_id === unitId)
}

type DeltaBadgeProps = { delta: DeltaResult; prevValue: number }

function DeltaBadge({ delta, prevValue }: DeltaBadgeProps) {
  if (delta.isNew) {
    return <span className="mom-badge mom-badge--new" title={`vs ${brl(prevValue)}`}>novo</span>
  }
  if (delta.pct === null) {
    return <span className="mom-na">—</span>
  }
  if (delta.direction === 'flat') {
    return (
      <span className="mom-badge mom-badge--flat" title={`vs ${brl(prevValue)}`}>
        estável
      </span>
    )
  }
  const arrow = delta.direction === 'up' ? '▲' : '▼'
  const cls = delta.direction === 'up' ? 'mom-badge--up' : 'mom-badge--down'
  const abs = Math.abs(delta.pct).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <span className={`mom-badge ${cls}`} title={`vs ${brl(prevValue)}`}>
      {arrow} {abs}%
    </span>
  )
}

type DeltaCellProps = {
  curr: number
  prev: number
  inactive: boolean
}

function DeltaCell({ curr, prev, inactive }: DeltaCellProps) {
  if (inactive) {
    return (
      <td className="r mom-cell-delta">
        <span className="mom-na">—</span>
      </td>
    )
  }
  if (curr === 0 && prev === 0) {
    return (
      <td className="r mom-cell-delta">
        <span className="mom-na">—</span>
      </td>
    )
  }
  const delta = computeDelta(curr, prev)
  return (
    <td className="r mom-cell-delta">
      <DeltaBadge delta={delta} prevValue={prev} />
    </td>
  )
}

export default function DataTableSection() {
  const { start, end, unitId, channel } = useFilters()
  const { data: units = [] } = useUnits()

  // ─── Matriz MoM: ranges fixos (independente de filtros) ─────
  const today = useMemo(() => new Date(), [])
  const currRange = useMemo(() => currentMonthRange(today), [today])
  const prevRange = useMemo(() => prevMonthRange(today), [today])

  const currMonth = useSales(currRange.start, currRange.end, { subscribeRealtime: false })
  const prevMonth = useSales(prevRange.start, prevRange.end, { subscribeRealtime: false })

  // ─── Tabela agregada: usa filtros globais ───────────────────
  const period = useSales(start, end, { subscribeRealtime: false })

  // Aplica filtro de unidade (canal já é aplicado nas células condicionais)
  const periodRowsFiltered = useMemo<SalesRow[]>(() => {
    const rows = period.data ?? []
    return unitId ? rows.filter((r) => r.unit_id === unitId) : rows
  }, [period.data, unitId])

  // Lista de unidades a exibir
  const activeUnits = useMemo<Unit[]>(() => {
    if (unitId) return units.filter((u) => u.id === unitId)
    return units
  }, [units, unitId])

  // Agregação por unidade no período
  type PeriodAgg = {
    unit: Unit
    pdv: number
    ifood: number
    anotaai: number
    total: number
    days: number
  }
  const periodByUnit = useMemo<PeriodAgg[]>(() => {
    return activeUnits.map((u) => {
      const rows = filterByUnit(periodRowsFiltered, u.id)
      const dates = new Set<string>()
      let pdv = 0, ifood = 0, anotaai = 0, total = 0
      for (const r of rows) {
        pdv += Number(r.pdv ?? 0)
        ifood += Number(r.ifood ?? 0)
        anotaai += Number(r.anotaai ?? 0)
        total += Number(r.total ?? 0)
        dates.add(r.date)
      }
      return { unit: u, pdv, ifood, anotaai, total, days: dates.size }
    })
  }, [periodRowsFiltered, activeUnits])

  const periodTotals = useMemo(() => {
    const sum = { pdv: 0, ifood: 0, anotaai: 0, total: 0, days: 0 }
    const dates = new Set<string>()
    for (const r of periodRowsFiltered) {
      sum.pdv += Number(r.pdv ?? 0)
      sum.ifood += Number(r.ifood ?? 0)
      sum.anotaai += Number(r.anotaai ?? 0)
      sum.total += Number(r.total ?? 0)
      dates.add(r.date)
    }
    sum.days = dates.size
    return sum
  }, [periodRowsFiltered])

  // Nota sobre "mês em curso"
  const lastDayOfCurrMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const isMonthInProgress = today.getDate() < lastDayOfCurrMonth

  // ─── Export CSV ──────────────────────────────────────────────
  const handleExport = () => {
    const header = ['Período', 'Unidade', 'PDV', 'iFood', 'AnotaAi', 'Total', 'Dias']
    const periodLabel = `${formatDateBR(start)} - ${formatDateBR(end)}`
    const rows = periodByUnit.map((p) => [
      periodLabel,
      p.unit.display_name,
      formatNumberBR(p.pdv),
      formatNumberBR(p.ifood),
      formatNumberBR(p.anotaai),
      formatNumberBR(p.total),
      p.days,
    ])
    if (periodByUnit.length > 1) {
      rows.push([
        periodLabel,
        'TOTAL',
        formatNumberBR(periodTotals.pdv),
        formatNumberBR(periodTotals.ifood),
        formatNumberBR(periodTotals.anotaai),
        formatNumberBR(periodTotals.total),
        periodTotals.days,
      ])
    }
    const csv = buildCsv(header, rows)
    downloadCsv(csv, `mizu-vendas-${start}-a-${end}.csv`)
  }

  const isLoading = currMonth.isLoading || prevMonth.isLoading || period.isLoading
  const channelHighlight = (col: Channel) => (channel === col ? 'data-table-channel-highlight' : '')

  return (
    <section className="mizu-section data-table-section is-source-neutro">
      <SectionHeader
        source="neutro"
        kanji="表"
        title="Tabela de Dados"
        subtitle="Visão mês a mês fixa + tabela do período selecionado (export CSV)"
        period={{ start, end }}
      />

      {isLoading && <div className="data-table-loading">Carregando dados…</div>}

      {!isLoading && (
        <>
          {/* ─── Matriz Mês a Mês ──────────────────────── */}
          <div className="mom-block">
            <div className="mom-matrix-head">
              <div className="mom-matrix-title">Mês a Mês — Visão por Unidade</div>
              <div className="mom-matrix-sub">
                {monthLabel(currRange.start)} vs {monthLabel(prevRange.start)} · independente do filtro de período
              </div>
            </div>
            <div className="mom-table-wrap">
              <table className="mom-table">
                <thead>
                  <tr>
                    <th>Unidade</th>
                    <th className="r">{monthLabel(currRange.start)}</th>
                    <th className="r">{monthLabel(prevRange.start)}</th>
                    <th className="r">Δ Total</th>
                    <th className="r">Δ PDV</th>
                    <th className="r">Δ iFood</th>
                    <th className="r">Δ AnotaAi</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => {
                    const c = aggregateUnitMonth(filterByUnit(currMonth.data ?? [], u.id), currRange)
                    const p = aggregateUnitMonth(filterByUnit(prevMonth.data ?? [], u.id), prevRange)
                    // canal inativo = sem nenhum dado > 0 nesse canal em NENHUM dos 2 meses
                    const inactiveCh = (ch: 'pdv' | 'ifood' | 'anotaai'): boolean => {
                      return (
                        !unitHasChannel(currMonth.data ?? [], u.id, ch) &&
                        !unitHasChannel(prevMonth.data ?? [], u.id, ch)
                      )
                    }
                    return (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.display_name}</strong>
                        </td>
                        <td className="r">{brl(c.total)}</td>
                        <td className="r">{brl(p.total)}</td>
                        <DeltaCell curr={c.total} prev={p.total} inactive={false} />
                        <DeltaCell curr={c.pdv} prev={p.pdv} inactive={inactiveCh('pdv')} />
                        <DeltaCell curr={c.ifood} prev={p.ifood} inactive={inactiveCh('ifood')} />
                        <DeltaCell curr={c.anotaai} prev={p.anotaai} inactive={inactiveCh('anotaai')} />
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="mom-foot-note">
              {isMonthInProgress
                ? `Mês atual em curso (${today.getDate()} de ${lastDayOfCurrMonth} dias). Comparação contra o mês anterior completo — % esperada negativa enquanto o mês não fecha.`
                : 'Mês completo. Comparação direta contra o mês anterior.'}
            </div>
          </div>

          {/* ─── Tabela Agregada do Período ────────────── */}
          <div className="data-block">
            <div className="data-table-head">
              <div>
                <div className="data-table-title">Resumo Agregado</div>
                <div className="data-table-sub">
                  Período selecionado: {formatDateBR(start)} – {formatDateBR(end)}
                </div>
              </div>
              <button
                type="button"
                className="data-table-export-btn"
                onClick={handleExport}
                disabled={periodByUnit.length === 0}
              >
                ⬇ Exportar CSV
              </button>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Unidade</th>
                    <th className={`r ${channelHighlight('pdv')}`}>PDV</th>
                    <th className={`r ${channelHighlight('ifood')}`}>iFood</th>
                    <th className={`r ${channelHighlight('anotaai')}`}>AnotaAi</th>
                    <th className="r">Total</th>
                    <th className="r">Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {periodByUnit.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="data-table-empty">
                        Sem dados pra esse filtro
                      </td>
                    </tr>
                  ) : (
                    <>
                      {periodByUnit.map((p) => (
                        <tr key={p.unit.id}>
                          <td>
                            {formatDateBR(start)} – {formatDateBR(end)}
                          </td>
                          <td>
                            <strong>{p.unit.display_name}</strong>
                          </td>
                          <td className={`r ${channelHighlight('pdv')}`}>{brl(p.pdv)}</td>
                          <td className={`r ${channelHighlight('ifood')}`}>{brl(p.ifood)}</td>
                          <td className={`r ${channelHighlight('anotaai')}`}>{brl(p.anotaai)}</td>
                          <td className="r">{brl(p.total)}</td>
                          <td className="r">{p.days}</td>
                        </tr>
                      ))}
                      {periodByUnit.length > 1 && (
                        <tr className="data-table-total-row">
                          <td>
                            {formatDateBR(start)} – {formatDateBR(end)}
                          </td>
                          <td>
                            <strong>TOTAL</strong>
                          </td>
                          <td className={`r ${channelHighlight('pdv')}`}>{brl(periodTotals.pdv)}</td>
                          <td className={`r ${channelHighlight('ifood')}`}>{brl(periodTotals.ifood)}</td>
                          <td className={`r ${channelHighlight('anotaai')}`}>{brl(periodTotals.anotaai)}</td>
                          <td className="r">
                            <strong>{brl(periodTotals.total)}</strong>
                          </td>
                          <td className="r">{periodTotals.days}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
