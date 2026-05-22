// Gráfico de linha de faturamento diário — uma linha por unidade.
// Reaproveita as rows de sales_daily já carregadas pela SalesSection.

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
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import type { Database } from '../types/database'

// Chart.js v4 é tree-shakable: registrar os módulos usados uma vez,
// no escopo do módulo (não a cada render).
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type Unit = Database['public']['Tables']['units']['Row']

// Cores fixas legíveis — uma quente, uma fria. Cai no array se surgir 3ª.
const PALETTE = ['#e8623d', '#3d8be8', '#3dba8b', '#b88a2e']

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

type Props = {
  rows: SalesRow[]
  units: Unit[]
}

export default function SalesLineChart({ rows, units }: Props) {
  const { data, options } = useMemo(() => {
    // Datas distintas em ordem ASCENDENTE (rows vêm DESC do hook).
    // ISO yyyy-mm-dd ordena corretamente como string.
    const dates = [...new Set(rows.map((r) => r.date))].sort()

    // Mapa unit_id → (data → total).
    const byUnit = new Map<string, Map<string, number>>()
    for (const r of rows) {
      if (!byUnit.has(r.unit_id)) byUnit.set(r.unit_id, new Map())
      byUnit.get(r.unit_id)!.set(r.date, Number(r.total ?? 0))
    }

    // Ordena pelas unidades conhecidas (sort_order); anexa unit_ids
    // que por acaso não estejam na lista de units.
    const unitIds = [
      ...units.filter((u) => byUnit.has(u.id)).map((u) => u.id),
      ...[...byUnit.keys()].filter((id) => !units.some((u) => u.id === id)),
    ]

    const labels = dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`)

    const chartData: ChartData<'line'> = {
      labels,
      datasets: unitIds.map((id, i) => {
        const perDay = byUnit.get(id)!
        const color = PALETTE[i % PALETTE.length]
        return {
          label: units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8),
          data: dates.map((d) => perDay.get(d) ?? null),
          borderColor: color,
          backgroundColor: color,
          tension: 0.3,
          spanGaps: true,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      }),
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
        y: {
          ticks: {
            callback: (value) => brlShort(Number(value)),
          },
        },
      },
    }

    return { data: chartData, options: chartOptions }
  }, [rows, units])

  // Sem dados: não renderiza nada (a SalesSection já mostra os avisos).
  if (rows.length === 0) return null

  return (
    <div className="sales-chart-canvas">
      <Line data={data} options={options} />
    </div>
  )
}
