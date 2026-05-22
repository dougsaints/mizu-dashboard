// Seção Vendas — KPIs de faturamento agregados por unidade,
// com seletor de período (7/30/60 dias).

import { useMemo, useState } from 'react'
import { useSales } from '../api/useSales'
import { useUnits } from '../api/useUnits'
import SalesLineChart from '../components/SalesLineChart'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']

const RANGES: Array<{ label: string; days: number }> = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '60 dias', days: 60 },
]

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function aggregateByUnit(rows: SalesRow[]): Record<string, { total: number; pdv: number; anotaai: number; ifood: number; days: number }> {
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

export default function SalesSection() {
  const [range, setRange] = useState(30)
  const { data: rows = [], isLoading, error } = useSales(range)
  const { data: units = [] } = useUnits()
  const unitName = (id: string) => units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8)

  const aggregated = useMemo(() => aggregateByUnit(rows), [rows])
  const totalGeral = useMemo(
    () => Object.values(aggregated).reduce((s, u) => s + u.total, 0),
    [aggregated],
  )
  const ticketMedio = useMemo(() => {
    const allDays = Object.values(aggregated).reduce((s, u) => s + u.days, 0)
    return allDays > 0 ? totalGeral / allDays : 0
  }, [aggregated, totalGeral])

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">売</span> Faturamento
          </div>
          <div className="mizu-section-sub">
            Sincronizado das planilhas a cada 5 min · clique no 🔄 do topo pra forçar
          </div>
        </div>
        <div className="range-picker">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              className={range === r.days ? 'on' : ''}
              onClick={() => setRange(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="sales-loading">Carregando faturamento…</div>}
      {error && (
        <div className="sales-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="sales-empty">
          Nenhum dado de faturamento ainda. As planilhas Google são sincronizadas
          automaticamente — em alguns segundos os números devem aparecer aqui.
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <>
          <div className="sales-kpis">
            <div className="kpi-card">
              <div className="kpi-label">Total geral · últimos {range} dias</div>
              <div className="kpi-value">{brl(totalGeral)}</div>
              <div className="kpi-sub">{rows.length} dia(s) com dados</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Ticket médio diário</div>
              <div className="kpi-value">{brl(ticketMedio)}</div>
              <div className="kpi-sub">Σ total ÷ dias com dados</div>
            </div>
          </div>

          <div className="sales-unit-grid">
            {Object.entries(aggregated).map(([unitId, agg]) => (
              <div key={unitId} className="unit-card">
                <div className="unit-card-name">{unitName(unitId)}</div>
                <div className="unit-card-total">{brl(agg.total)}</div>
                <div className="unit-card-breakdown">
                  <span>PDV: {brl(agg.pdv)}</span>
                  <span>Anota AI: {brl(agg.anotaai)}</span>
                  <span>iFood: {brl(agg.ifood)}</span>
                </div>
                <div className="unit-card-days">{agg.days} dia(s) com dados</div>
              </div>
            ))}
          </div>

          <div className="sales-chart">
            <div className="sales-chart-title">Faturamento dia a dia · por loja</div>
            <SalesLineChart rows={rows} units={units} />
          </div>
        </>
      )}
    </section>
  )
}
