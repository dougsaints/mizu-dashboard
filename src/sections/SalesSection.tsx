// Seção Vendas — KPIs de faturamento agregados por unidade.
// Período, Unidade e Canal de Venda vêm dos filtros globais no topo
// (useFilters). Os filtros afetam apenas esta seção — Meta Ads e
// Delivery seguem como estão.

import { useMemo } from 'react'
import { useSales, useSalesComparison } from '../api/useSales'
import { useUnits } from '../api/useUnits'
import { useFilters, type Channel } from '../lib/period'
import SalesLineChart from '../components/SalesLineChart'
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

function pct(curr: number, prev: number): { value: number; valid: boolean } {
  if (prev === 0) return { value: 0, valid: false }
  return { value: ((curr - prev) / prev) * 100, valid: true }
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

// Renderiza badge de variação % no KPI
type DeltaProps = {
  curr: number
  prev: number
  hasCmpData: boolean
}
function DeltaBadge({ curr, prev, hasCmpData }: DeltaProps) {
  if (!hasCmpData) {
    return <span className="kpi-delta kpi-delta--empty">— sem dados</span>
  }
  const { value, valid } = pct(curr, prev)
  if (!valid) {
    return <span className="kpi-delta kpi-delta--empty">— sem dados</span>
  }
  const abs = Math.abs(value)
  const isFlat = abs < 0.5
  const isUp = value >= 0.5
  const cls = isFlat ? 'kpi-delta--flat' : isUp ? 'kpi-delta--up' : 'kpi-delta--down'
  const arrow = isFlat ? '' : isUp ? '▲' : '▼'
  return (
    <span
      className={`kpi-delta ${cls}`}
      title={`vs ${brl(prev)} no período comparado`}
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
  const unitName = (id: string) => units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8)

  const comparing = cmpMode !== 'none'

  // Aplica filtros: primeiro Unidade (filtra linhas), depois Canal
  // (substitui `total` pelo valor da coluna do canal). Os campos
  // pdv/ifood/anotaai ficam intocados nas linhas — o breakdown só é
  // exibido quando o canal é "Todos" (com canal específico, ele
  // duplicaria a informação do total).
  const displayRows = useMemo<SalesRow[]>(() => {
    const filtered = unitId ? rows.filter((r) => r.unit_id === unitId) : rows
    if (channel === 'all') return filtered
    return filtered.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
  }, [rows, unitId, channel])

  // Mesmo filtro aplicado nas rows de comparação
  const cmpRows = useMemo<SalesRow[]>(() => {
    const filtered = unitId ? cmpRowsRaw.filter((r) => r.unit_id === unitId) : cmpRowsRaw
    if (channel === 'all') return filtered
    return filtered.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
  }, [cmpRowsRaw, unitId, channel])

  const hasCmpData = comparing && cmpRows.length > 0

  const aggregated = useMemo(() => aggregateByUnit(displayRows), [displayRows])
  const cmpAggregated = useMemo(() => aggregateByUnit(cmpRows), [cmpRows])

  const totalGeral = useMemo(
    () => Object.values(aggregated).reduce((s, u) => s + u.total, 0),
    [aggregated],
  )
  const cmpTotalGeral = useMemo(
    () => Object.values(cmpAggregated).reduce((s, u) => s + u.total, 0),
    [cmpAggregated],
  )
  const ticketMedio = useMemo(() => {
    const allDays = Object.values(aggregated).reduce((s, u) => s + u.days, 0)
    return allDays > 0 ? totalGeral / allDays : 0
  }, [aggregated, totalGeral])

  // Sufixo de filtros ativos pra label do KPI
  const filterChips = [
    unitId ? (units.find((u) => u.id === unitId)?.display_name ?? '') : '',
    channel === 'all' ? '' : `canal ${CHANNEL_LABEL[channel]}`,
  ].filter(Boolean)
  const filterSuffix = filterChips.length > 0 ? ` · ${filterChips.join(' · ')}` : ''

  const showEmpty = !isLoading && !error && displayRows.length === 0
  const hasData = !isLoading && !error && displayRows.length > 0

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
          {comparing && !hasCmpData && hasData && (
            <div className="sales-cmp-note">Sem dados no período de comparação</div>
          )}
        </div>
      </div>

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
          <div className="sales-kpis">
            <div className="kpi-card kpi-hero">
              <div className="kpi-label">Total geral · período selecionado{filterSuffix}</div>
              <div className="kpi-value">{brl(totalGeral)}</div>
              {comparing && (
                <DeltaBadge curr={totalGeral} prev={cmpTotalGeral} hasCmpData={hasCmpData} />
              )}
              <div className="kpi-sub">{displayRows.length} dia(s) com dados</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Ticket médio diário</div>
              <div className="kpi-value">{brl(ticketMedio)}</div>
              <div className="kpi-sub">Σ total ÷ dias com dados</div>
            </div>
          </div>

          <div className="sales-unit-grid">
            {Object.entries(aggregated).map(([id, agg]) => {
              const cmpAgg = cmpAggregated[id]
              return (
                <div key={id} className="unit-card">
                  <div className="unit-card-name">{unitName(id)}</div>
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
                          <DeltaBadge
                            curr={agg.pdv}
                            prev={cmpAgg?.pdv ?? 0}
                            hasCmpData={hasCmpData && !!cmpAgg}
                          />
                        )}
                      </span>
                      <span>
                        Anota AI: {brl(agg.anotaai)}
                        {comparing && (
                          <DeltaBadge
                            curr={agg.anotaai}
                            prev={cmpAgg?.anotaai ?? 0}
                            hasCmpData={hasCmpData && !!cmpAgg}
                          />
                        )}
                      </span>
                      <span>
                        iFood: {brl(agg.ifood)}
                        {comparing && (
                          <DeltaBadge
                            curr={agg.ifood}
                            prev={cmpAgg?.ifood ?? 0}
                            hasCmpData={hasCmpData && !!cmpAgg}
                          />
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
