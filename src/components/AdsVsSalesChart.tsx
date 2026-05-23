// Gráfico temporal Meta Ads × Vendas — Phase 11-11.
// Eixo Y duplo: Investimento Meta (azul) vs Faturamento (gold).
// Substitui o gap "Investimento × Impressões" do antigo por algo mais útil:
// vê se o gasto Meta está convertendo em receita real dia a dia.

import { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import type { Database } from '../types/database'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type AdsRow = Database['public']['Tables']['ads_daily']['Row']

type Props = {
  salesRows: SalesRow[]
  adsRows: AdsRow[]
}

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function AdsVsSalesChart({ salesRows, adsRows }: Props) {
  const { data, options, hasData } = useMemo(() => {
    const adsByDate = new Map<string, number>()
    for (const r of adsRows) {
      adsByDate.set(r.date, (adsByDate.get(r.date) ?? 0) + Number(r.cost ?? 0))
    }
    const salesByDate = new Map<string, number>()
    for (const r of salesRows) {
      salesByDate.set(r.date, (salesByDate.get(r.date) ?? 0) + Number(r.total ?? 0))
    }

    const dates = [...new Set([...adsByDate.keys(), ...salesByDate.keys()])].sort()
    if (dates.length === 0) {
      return {
        data: { labels: [], datasets: [] } as ChartData<'line'>,
        options: {} as ChartOptions<'line'>,
        hasData: false,
      }
    }

    const labels = dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`)
    const adsSeries = dates.map((d) => adsByDate.get(d) ?? 0)
    const salesSeries = dates.map((d) => salesByDate.get(d) ?? 0)

    const chartData: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'Investimento Meta Ads',
          data: adsSeries,
          borderColor: '#1877F2',
          backgroundColor: 'rgba(24,119,242,0.10)',
          yAxisID: 'yAds',
          tension: 0.3,
          pointRadius: 3,
          fill: true,
        },
        {
          label: 'Faturamento total',
          data: salesSeries,
          borderColor: '#C9A961',
          backgroundColor: 'rgba(201,169,97,0.12)',
          yAxisID: 'ySales',
          tension: 0.3,
          pointRadius: 3,
          fill: true,
        },
      ],
    }

    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'line'>) =>
              `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        yAds: {
          type: 'linear',
          position: 'left',
          ticks: { callback: (v) => brl(Number(v)) },
          title: { display: true, text: 'Meta Ads (R$)', color: '#1877F2' },
        },
        ySales: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => brl(Number(v)) },
          title: { display: true, text: 'Faturamento (R$)', color: '#8B6F3D' },
        },
      },
    }

    return { data: chartData, options: chartOptions, hasData: true }
  }, [salesRows, adsRows])

  if (!hasData) {
    return <div className="chart-empty-state">Sem dados de Meta Ads ou Vendas no período</div>
  }

  return (
    <div className="ads-vs-sales-chart">
      <Line data={data} options={options} />
    </div>
  )
}
