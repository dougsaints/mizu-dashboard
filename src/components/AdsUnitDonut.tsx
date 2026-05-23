// Donut: distribuição da verba Meta Ads por unidade. Detecção via
// unitOfCampaign(campaign_name) — Jatiúca/Serraria/Geral.

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
import { unitOfCampaign, type AdsUnit } from '../lib/adsCategory'
import type { Database } from '../types/database'

ChartJS.register(ArcElement, Tooltip, Legend)

type AdsRow = Database['public']['Tables']['ads_daily']['Row']

const UNIT_META: Array<{ key: AdsUnit; label: string; color: string }> = [
  { key: 'jatiuca',  label: 'Jatiúca',  color: '#2980B9' },
  { key: 'serraria', label: 'Serraria', color: '#8E44AD' },
  { key: 'geral',    label: 'Geral',    color: '#95A5A6' },
]

type Props = { rows: AdsRow[] }

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function AdsUnitDonut({ rows }: Props) {
  const { data, options, total, hasData } = useMemo(() => {
    const byUnit = new Map<AdsUnit, number>()
    for (const m of UNIT_META) byUnit.set(m.key, 0)

    for (const r of rows) {
      const u = unitOfCampaign(r.campaign_name)
      byUnit.set(u, (byUnit.get(u) ?? 0) + Number(r.cost ?? 0))
    }

    const totalSum = [...byUnit.values()].reduce((s, v) => s + v, 0)

    const chartData: ChartData<'doughnut'> = {
      labels: UNIT_META.map((m) => m.label),
      datasets: [
        {
          data: UNIT_META.map((m) => byUnit.get(m.key) ?? 0),
          backgroundColor: UNIT_META.map((m) => m.color),
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
        <div className="donut-center-label">verba do período</div>
      </div>
    </div>
  )
}
