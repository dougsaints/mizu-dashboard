// Pareto top-20 dos produtos: barras (unidades vendidas) + linha (%
// acumulado vs total GERAL — não só dos top 20). Snapshot mais recente
// do período.

import { useMemo } from 'react'
import { Chart } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { categoryColor } from '../lib/categoryColors'
import type { Database } from '../types/database'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

type ProductRow = Database['public']['Tables']['anotaai_products']['Row']

type Props = {
  products: ProductRow[]
}

function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function shortLabel(name: string): string {
  return name.length > 18 ? name.slice(0, 17) + '…' : name
}

type Item = { product_name: string; category: string | null; quantity: number }

export default function ParetoChart({ products }: Props) {
  const { data, options, hasData } = useMemo(() => {
    const map = new Map<string, Item>()
    for (const p of products) {
      const prev = map.get(p.product_name)
      const qty = Number(p.quantity ?? 0)
      if (prev) {
        prev.quantity += qty
      } else {
        map.set(p.product_name, {
          product_name: p.product_name,
          category: p.category,
          quantity: qty,
        })
      }
    }

    const sorted = [...map.values()].sort((a, b) => b.quantity - a.quantity)
    const totalGeral = sorted.reduce((s, i) => s + i.quantity, 0)
    const top = sorted.slice(0, 20)

    let acc = 0
    const cumPct = top.map((i) => {
      acc += i.quantity
      return totalGeral > 0 ? (acc / totalGeral) * 100 : 0
    })

    const labels = top.map((i) => shortLabel(i.product_name))
    const barColors = top.map((i) => categoryColor(i.category) + 'CC')

    const chartData: ChartData<'bar' | 'line'> = {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Unidades',
          data: top.map((i) => i.quantity),
          backgroundColor: barColors,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: '% Acumulado',
          data: cumPct,
          borderColor: '#2C3E50',
          backgroundColor: 'rgba(44,62,80,0.05)',
          tension: 0.25,
          pointRadius: 3,
          pointBackgroundColor: '#2C3E50',
          yAxisID: 'y1',
          borderWidth: 2,
        },
      ],
    }

    const chartOptions: ChartOptions<'bar' | 'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { font: { size: 11 }, boxWidth: 14, padding: 10 } },
        tooltip: {
          callbacks: {
            title: (ctxs) => top[ctxs[0]?.dataIndex ?? 0]?.product_name ?? '',
            label: (ctx: TooltipItem<'bar' | 'line'>) => {
              if (ctx.datasetIndex === 1) {
                const v = Number(ctx.parsed.y).toFixed(1).replace('.', ',')
                return ` Acumulado: ${v}%`
              }
              const it = top[ctx.dataIndex]
              const cat = it?.category || 'Sem categoria'
              return ` ${fmt(Number(ctx.parsed.y))} un · ${cat}`
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { font: { size: 10 }, maxRotation: 60, minRotation: 45 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          position: 'left',
          ticks: {
            font: { size: 11 },
            callback: (v) => `${fmt(Number(v))} un`,
          },
          grid: { color: '#F2F2F7' },
        },
        y1: {
          beginAtZero: true,
          max: 100,
          position: 'right',
          ticks: {
            font: { size: 11 },
            callback: (v) => `${v}%`,
          },
          grid: { display: false },
        },
      },
    }

    return { data: chartData, options: chartOptions, hasData: sorted.length >= 3 }
  }, [products])

  if (!hasData) {
    return <div className="chart-empty-state">Dados insuficientes pra Pareto (mínimo 3 produtos)</div>
  }

  return (
    <div className="pareto-wrap">
      <Chart type="bar" data={data as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
    </div>
  )
}
