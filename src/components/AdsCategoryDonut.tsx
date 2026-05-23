// Donut: distribuição da verba Meta Ads por objetivo (Performance,
// Engajamento, Alcance/Branding). Lógica via classifyCampaign + ADS_GOAL_GROUPS.

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
import {
  classifyCampaign,
  goalGroupOf,
  ADS_GOAL_GROUPS,
  type AdsGoalKey,
} from '../lib/adsCategory'
import type { Database } from '../types/database'

ChartJS.register(ArcElement, Tooltip, Legend)

type AdsRow = Database['public']['Tables']['ads_daily']['Row']

type Props = { rows: AdsRow[] }

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function AdsCategoryDonut({ rows }: Props) {
  const { data, options, total, hasData } = useMemo(() => {
    const byGoal = new Map<AdsGoalKey, number>()
    for (const g of ADS_GOAL_GROUPS) byGoal.set(g.key, 0)

    for (const r of rows) {
      const cat = classifyCampaign(r.campaign_name)
      const goal = goalGroupOf(cat)
      byGoal.set(goal.key, (byGoal.get(goal.key) ?? 0) + Number(r.cost ?? 0))
    }

    const totalSum = [...byGoal.values()].reduce((s, v) => s + v, 0)

    const chartData: ChartData<'doughnut'> = {
      labels: ADS_GOAL_GROUPS.map((g) => g.label),
      datasets: [
        {
          data: ADS_GOAL_GROUPS.map((g) => byGoal.get(g.key) ?? 0),
          backgroundColor: ADS_GOAL_GROUPS.map((g) => g.color),
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
              return ` ${ctx.label}: ${brl(v)} (${pct.replace('.', ',')}%)`
            },
          },
        },
      },
    }

    return {
      data: chartData,
      options: chartOptions,
      total: totalSum,
      hasData: totalSum > 0,
    }
  }, [rows])

  if (!hasData) {
    return <div className="chart-empty-state">Sem investimento Meta Ads no período</div>
  }

  return (
    <div className="donut-wrap">
      <Doughnut data={data} options={options} />
      <div className="donut-center-total">
        <div className="donut-center-num">{brl(total)}</div>
        <div className="donut-center-label">investido</div>
      </div>
    </div>
  )
}
