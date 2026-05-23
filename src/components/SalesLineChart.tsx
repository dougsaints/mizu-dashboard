// Gráfico de linha de faturamento diário — uma linha por unidade.
// Reaproveita as rows de sales_daily já carregadas pela SalesSection.
// Aceita cmpRows opcional para desenhar 2ª série tracejada (comparação).

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

// Cores por NOME da unidade (Phase 10-03 + revisão sprint v0.2).
// Map evita regressão silenciosa se sort_order mudar no banco.
const COLOR_SERRARIA = '#8E44AD' // roxo
const COLOR_JATIUCA = '#2980B9'  // azul
const FALLBACK_PALETTE = ['#3dba8b', '#b88a2e', '#16a085', '#d35400']

function colorForUnitName(name: string, fallbackIdx: number): string {
  const n = name.toLowerCase()
  if (n.includes('serraria')) return COLOR_SERRARIA
  if (n.includes('jatiu')) return COLOR_JATIUCA
  return FALLBACK_PALETTE[fallbackIdx % FALLBACK_PALETTE.length]
}
// Cor da série comparada: cinza claro com transparência
const CMP_COLOR = 'rgba(107, 98, 83, 0.45)'

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
  cmpRows?: SalesRow[]  // série de comparação (opcional); vazio = não exibe
}

export default function SalesLineChart({ rows, units, cmpRows = [] }: Props) {
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

    // Mapa da série comparada: unit_id → valores por índice de dia
    // (alinhamos por posição, não por data exata — dia 1 atual vs dia 1 comparado)
    const cmpByUnit = new Map<string, number[]>()
    if (cmpRows.length > 0) {
      const cmpDates = [...new Set(cmpRows.map((r) => r.date))].sort()
      for (const r of cmpRows) {
        if (!cmpByUnit.has(r.unit_id)) cmpByUnit.set(r.unit_id, [])
      }
      // Preenche array de valores por índice de data comparada
      for (const [uid, arr] of cmpByUnit.entries()) {
        const unitMap = new Map<string, number>()
        for (const r of cmpRows) {
          if (r.unit_id === uid) unitMap.set(r.date, Number(r.total ?? 0))
        }
        cmpDates.forEach((d) => arr.push(unitMap.get(d) ?? 0))
      }
    }

    // Ordena pelas unidades conhecidas (sort_order); anexa unit_ids
    // que por acaso não estejam na lista de units.
    const unitIds = [
      ...units.filter((u) => byUnit.has(u.id)).map((u) => u.id),
      ...[...byUnit.keys()].filter((id) => !units.some((u) => u.id === id)),
    ]

    const labels = dates.map((d) => `${d.slice(8, 10)}/${d.slice(5, 7)}`)

    const hasCmp = cmpRows.length > 0

    // Série principal: 1 linha colorida por unidade com label "Atual · NomeUnidade"
    const mainDatasets = unitIds.map((id, i) => {
      const perDay = byUnit.get(id)!
      const unitLabel = units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8)
      const color = colorForUnitName(unitLabel, i)
      return {
        label: hasCmp ? `Atual · ${unitLabel}` : unitLabel,
        data: dates.map((d) => perDay.get(d) ?? null),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderDash: [] as number[],
      }
    })

    // Série comparada: 1 linha tracejada cinza por unidade com label "Comparado · NomeUnidade"
    const cmpDatasets = hasCmp
      ? unitIds
          .filter((id) => cmpByUnit.has(id))
          .map((id) => {
            const unitLabel = units.find((u) => u.id === id)?.display_name ?? id.slice(0, 8)
            const values = cmpByUnit.get(id)!
            // Alinha por índice: preenche com null se comparado tem menos dias
            const aligned = dates.map((_, i) => values[i] ?? null)
            return {
              label: `Comparado · ${unitLabel}`,
              data: aligned,
              borderColor: CMP_COLOR,
              backgroundColor: CMP_COLOR,
              tension: 0.3,
              spanGaps: true,
              pointRadius: 2,
              pointHoverRadius: 4,
              borderDash: [4, 4],
            }
          })
      : []

    const chartData: ChartData<'line'> = {
      labels,
      datasets: [...mainDatasets, ...cmpDatasets],
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
  }, [rows, units, cmpRows])

  // Sem dados: não renderiza nada (a SalesSection já mostra os avisos).
  if (rows.length === 0) return null

  return (
    <div className="sales-chart-canvas">
      <Line data={data} options={options} />
    </div>
  )
}
