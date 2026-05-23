// Donut da participação de cada categoria no total de produtos vendidos
// no snapshot mais recente do período (Anota AI delivery).

import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import { categoryColor } from '../lib/categoryColors'
import type { Database } from '../types/database'

ChartJS.register(ArcElement, Tooltip, Legend)

type ProductRow = Database['public']['Tables']['anotaai_products']['Row']

type Props = {
  products: ProductRow[]
}

function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

export default function CategoryDonutChart({ products }: Props) {
  const { data, options, total, hasData } = useMemo(() => {
    const byCat = new Map<string, number>()
    for (const p of products) {
      const key = p.category?.trim() ? p.category : 'Sem categoria'
      byCat.set(key, (byCat.get(key) ?? 0) + Number(p.quantity ?? 0))
    }

    const entries = [...byCat.entries()].sort((a, b) => b[1] - a[1])
    const labels = entries.map(([k]) => k)
    const values = entries.map(([, v]) => v)
    const colors = labels.map((l) => categoryColor(l === 'Sem categoria' ? null : l))
    const totalSum = values.reduce((s, v) => s + v, 0)

    const chartData: ChartData<'doughnut'> = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    }

    const chartOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 11 }, boxWidth: 12, padding: 8 },
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'doughnut'>) => {
              const v = Number(ctx.parsed)
              const pct = totalSum > 0 ? ((v / totalSum) * 100).toFixed(1) : '0.0'
              return ` ${ctx.label}: ${fmt(v)} un (${pct.replace('.', ',')}%)`
            },
          },
        },
      },
    }

    return {
      data: chartData,
      options: chartOptions,
      total: totalSum,
      hasData: entries.length > 0,
    }
  }, [products])

  if (!hasData) {
    return <div className="chart-empty-state">Sem produtos no período</div>
  }

  return (
    <div className="donut-wrap">
      <Doughnut data={data} options={options} />
      <div className="donut-center-total">
        <div className="donut-center-num">{fmt(total)}</div>
        <div className="donut-center-label">unidades</div>
      </div>
    </div>
  )
}
