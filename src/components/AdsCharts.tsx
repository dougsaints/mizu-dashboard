// Gráficos do Meta Ads — gasto por dia (barras) e impressões/alcance
// (linha). Recebe as rows de ads_daily já carregadas pelo AdsUploadCard.

import { useMemo } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import type { Database } from '../types/database'

// Chart.js v4 é tree-shakable: registrar os módulos usados uma vez.
// BarElement entra aqui por causa do gráfico de barras.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
)

type AdsRow = Database['public']['Tables']['ads_daily']['Row']

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

function num(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

type Props = {
  rows: AdsRow[]
}

export default function AdsCharts({ rows }: Props) {
  const { costData, costOptions, reachData, reachOptions } = useMemo(() => {
    // ads_daily tem várias linhas por data (uma por campanha) — agregar.
    const byDate = new Map<string, { cost: number; impressions: number; reach: number }>()
    for (const r of rows) {
      const cur = byDate.get(r.date) ?? { cost: 0, impressions: 0, reach: 0 }
      cur.cost += Number(r.cost ?? 0)
      cur.impressions += Number(r.impressions ?? 0)
      cur.reach += Number(r.reach ?? 0)
      byDate.set(r.date, cur)
    }

    // Datas em ordem ASCENDENTE (rows vêm DESC do hook).
    const dates = [...byDate.keys()].sort()
    const labels = dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`)

    const cd: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Gasto',
          data: dates.map((d) => byDate.get(d)!.cost),
          backgroundColor: '#e8623d',
        },
      ],
    }

    const co: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => `Gasto: ${brl(Number(ctx.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        y: { ticks: { callback: (value) => brlShort(Number(value)) } },
      },
    }

    const rd: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'Impressões',
          data: dates.map((d) => byDate.get(d)!.impressions),
          borderColor: '#3d8be8',
          backgroundColor: '#3d8be8',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Alcance',
          data: dates.map((d) => byDate.get(d)!.reach),
          borderColor: '#3dba8b',
          backgroundColor: '#3dba8b',
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    }

    const ro: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'line'>) =>
              `${ctx.dataset.label}: ${num(Number(ctx.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        y: { ticks: { callback: (value) => num(Number(value)) } },
      },
    }

    return { costData: cd, costOptions: co, reachData: rd, reachOptions: ro }
  }, [rows])

  // Sem dados: não renderiza nada (o card já mostra a caixa de upload).
  if (rows.length === 0) return null

  return (
    <div className="ads-charts">
      <div className="ads-chart-block">
        <div className="ads-chart-title">Gasto em anúncios · por dia</div>
        <div className="ads-chart-canvas">
          <Bar data={costData} options={costOptions} />
        </div>
      </div>
      <div className="ads-chart-block">
        <div className="ads-chart-title">Impressões e alcance · por dia</div>
        <div className="ads-chart-canvas">
          <Line data={reachData} options={reachOptions} />
        </div>
      </div>
    </div>
  )
}
