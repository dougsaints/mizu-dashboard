// Gráfico de barras horizontais — produtos mais vendidos no delivery.
// Usa só o snapshot mais recente (cada CSV do Anota AI é um relatório
// acumulado; somar várias fotos contaria item em dobro). Mesma lógica
// do useWeeklyRecap.

import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import type { Database } from '../types/database'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type ProductRow = Database['public']['Tables']['anotaai_products']['Row']

const TOP_N = 10

function num(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

type Props = {
  products: ProductRow[]
}

export default function TopProductsChart({ products }: Props) {
  const { data, options, hasData } = useMemo(() => {
    // O hook já ordena por snapshot_date DESC — products[0] é o mais novo.
    const latestSnapshot = products[0]?.snapshot_date ?? null

    const totals = new Map<string, number>()
    if (latestSnapshot) {
      for (const p of products) {
        if (p.snapshot_date !== latestSnapshot) continue
        const cur = totals.get(p.product_name) ?? 0
        totals.set(p.product_name, cur + Number(p.quantity ?? 0))
      }
    }

    const top = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)

    const chartData: ChartData<'bar'> = {
      labels: top.map(([name]) => name),
      datasets: [
        {
          label: 'Quantidade',
          data: top.map(([, qty]) => qty),
          backgroundColor: '#e8623d',
        },
      ],
    }

    const chartOptions: ChartOptions<'bar'> = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) =>
              `${num(Number(ctx.parsed.x ?? 0))} un.`,
          },
        },
      },
      scales: {
        x: { ticks: { callback: (value) => num(Number(value)) } },
      },
    }

    return { data: chartData, options: chartOptions, hasData: top.length > 0 }
  }, [products])

  // Sem produtos: não renderiza nada (o card já mostra a caixa de upload).
  if (!hasData) return null

  return (
    <div className="top-products-chart">
      <div className="top-products-title">Mais vendidos · delivery</div>
      <div className="top-products-canvas">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
