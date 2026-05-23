// Seção Correlações — cruza Meta Ads (investimento, cliques) com
// faturamento de vendas no período selecionado. Cada ponto = 1 dia.
// Coeficiente de Pearson + interpretação textual ao lado de cada gráfico.

import { useMemo } from 'react'
import { Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { useSales } from '../api/useSales'
import { useAds } from '../api/useAds'
import { useFilters, type Channel } from '../lib/period'
import { pearson, interpretCorrelation, formatR } from '../lib/statistics'
import type { Database } from '../types/database'
import SectionHeader from '../components/SectionHeader'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend)

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type AdsRow = Database['public']['Tables']['ads_daily']['Row']

type DailyPoint = {
  date: string
  salesTotal: number
  adCost: number
  adClicks: number
}

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

// Pega valor de vendas do canal selecionado (ou total se "all").
function salesAmount(row: SalesRow, channel: Channel): number {
  if (channel === 'all') return Number(row.total ?? 0)
  return Number(row[channel] ?? 0)
}

// Agrega rows por data, aplicando filtros de unit/channel só nas vendas
// (Meta Ads NÃO filtra por unidade — decisão da Phase 5: ~48% das linhas
// vêm sem unit_id, então filtrar lá esconderia dado válido).
function aggregateDaily(
  salesRows: SalesRow[],
  adsRows: AdsRow[],
  unitId: string | null,
  channel: Channel,
): DailyPoint[] {
  const byDate = new Map<string, DailyPoint>()

  const filteredSales = unitId
    ? salesRows.filter((r) => r.unit_id === unitId)
    : salesRows

  for (const r of filteredSales) {
    const point = byDate.get(r.date) ?? {
      date: r.date,
      salesTotal: 0,
      adCost: 0,
      adClicks: 0,
    }
    point.salesTotal += salesAmount(r, channel)
    byDate.set(r.date, point)
  }

  for (const a of adsRows) {
    const point = byDate.get(a.date) ?? {
      date: a.date,
      salesTotal: 0,
      adCost: 0,
      adClicks: 0,
    }
    point.adCost += Number(a.cost ?? 0)
    point.adClicks += Number(a.clicks ?? 0)
    byDate.set(a.date, point)
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

type ScatterCardProps = {
  title: string
  xLabel: string
  points: Array<{ x: number; y: number; date: string }>
  formatX: (n: number) => string
  pointColor: string
}

function ScatterCard({ title, xLabel, points, formatX, pointColor }: ScatterCardProps) {
  const r = useMemo(
    () => pearson(points.map((p) => p.x), points.map((p) => p.y)),
    [points],
  )
  const interp = useMemo(() => interpretCorrelation(r), [r])

  const data = useMemo<ChartData<'scatter'>>(
    () => ({
      datasets: [
        {
          label: title,
          data: points.map((p) => ({ x: p.x, y: p.y })),
          backgroundColor: pointColor,
          borderColor: pointColor,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    }),
    [points, pointColor, title],
  )

  const options = useMemo<ChartOptions<'scatter'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'scatter'>) => {
              const idx = ctx.dataIndex
              const p = points[idx]
              if (!p) return ''
              return [
                `Dia: ${formatDateBR(p.date)}`,
                `${xLabel}: ${formatX(p.x)}`,
                `Faturamento: ${brl(p.y)}`,
              ]
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: xLabel, color: 'var(--txt-2)' as unknown as string },
          ticks: {
            callback: (val) => formatX(Number(val)),
          },
        },
        y: {
          title: { display: true, text: 'Faturamento (R$)', color: 'var(--txt-2)' as unknown as string },
          ticks: {
            callback: (val) => brl(Number(val)),
          },
        },
      },
    }),
    [points, xLabel, formatX],
  )

  const hasEnough = points.length >= 3 && r !== null

  const directionTxt = interp.direction ? ` ${interp.direction}` : ''

  return (
    <div className="correlation-card">
      <div className="correlation-card-head">
        <div className="correlation-card-title">{title}</div>
        <div className="correlation-r" style={{ color: interp.color }}>
          <span className="correlation-r-num">r = {formatR(r)}</span>
          <span className="correlation-r-label">
            {interp.label}
            {directionTxt}
          </span>
        </div>
      </div>
      {hasEnough ? (
        <div className="correlation-chart">
          <Scatter data={data} options={options} />
        </div>
      ) : (
        <div className="correlation-empty">
          Dados insuficientes para correlação ({points.length} dia{points.length === 1 ? '' : 's'} com ambas as fontes — mínimo 3)
        </div>
      )}
    </div>
  )
}

export default function CorrelationSection() {
  const { start, end, unitId, channel } = useFilters()

  const sales = useSales(start, end, { subscribeRealtime: false })
  const ads = useAds(start, end, { subscribeRealtime: false })

  const daily = useMemo(
    () => aggregateDaily(sales.data ?? [], ads.data ?? [], unitId, channel),
    [sales.data, ads.data, unitId, channel],
  )

  // Pontos para correlação: só dias com pelo menos um valor real
  // (>0) tanto em ads quanto em vendas.
  const costPoints = useMemo(
    () =>
      daily
        .filter((d) => d.adCost > 0 && d.salesTotal > 0)
        .map((d) => ({ x: d.adCost, y: d.salesTotal, date: d.date })),
    [daily],
  )

  const clickPoints = useMemo(
    () =>
      daily
        .filter((d) => d.adClicks > 0 && d.salesTotal > 0)
        .map((d) => ({ x: d.adClicks, y: d.salesTotal, date: d.date })),
    [daily],
  )

  const isLoading = sales.isLoading || ads.isLoading
  const error = sales.error || ads.error

  return (
    <section className="mizu-section is-source-neutro">
      <SectionHeader
        source="neutro"
        kanji="関"
        title="Correlação Meta Ads × Vendas"
        subtitle="Cada ponto = 1 dia do período. Quanto mais próximo de +1 ou −1, mais relacionados. Próximo de 0, sem relação aparente."
        period={{ start, end }}
      />

      {isLoading && <div className="correlation-loading">Carregando dados…</div>}
      {error && (
        <div className="correlation-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && (
        <div className="correlation-grid">
          <ScatterCard
            title="Investimento Meta × Faturamento"
            xLabel="Investimento Meta (R$)"
            points={costPoints}
            formatX={brl}
            pointColor="#8E44AD"
          />
          <ScatterCard
            title="Cliques Meta × Faturamento"
            xLabel="Cliques Meta"
            points={clickPoints}
            formatX={(n) => n.toLocaleString('pt-BR')}
            pointColor="#2980B9"
          />
        </div>
      )}
    </section>
  )
}
