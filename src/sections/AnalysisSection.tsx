// Seção "Análise por Período" — evolução mês a mês ou semana a semana.
// Lê vendas via useSales e custo Meta Ads via useAds.
// O toggle Mensal/Semanal vive no Header (analysisMode do FilterProvider).

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
import { useSales } from '../api/useSales'
import { useAds } from '../api/useAds'
import { useFilters } from '../lib/period'
import { useUnits } from '../api/useUnits'
import type { Database } from '../types/database'
import SectionHeader from '../components/SectionHeader'

// Registrar Chart.js no escopo do módulo (uma vez)
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type AdsRow = Database['public']['Tables']['ads_daily']['Row']

// Cores das unidades — padrão Phase 10-03 (Serraria roxo, Jatiúca azul)
const COLOR_SERRARIA = '#8E44AD'
const COLOR_JATIUCA = '#2980B9'
// Phase 11-07: trocou amarelo cocô (#b88a2e) por azul Meta (identidade da fonte)
const COLOR_ADS = '#1877F2'

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

// ─── Helper: extrai chave de agrupamento e label ──────────────────

function getGroupKey(date: string, mode: 'monthly' | 'weekly'): string {
  if (mode === 'monthly') {
    // "2025-05" → chave
    return date.slice(0, 7)
  }
  // ISO week: calcular semana do ano
  return getISOWeekKey(date)
}

function getGroupLabel(key: string, mode: 'monthly' | 'weekly'): string {
  if (mode === 'monthly') {
    // "2025-05" → "Mai/25"
    const [year, month] = key.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const mIdx = parseInt(month, 10) - 1
    return `${months[mIdx]}/${year.slice(2)}`
  }
  // "2025-W21" → "Sem 21"
  const parts = key.split('-W')
  return `Sem ${parts[1]}`
}

// Calcula a chave ISO week "YYYY-Www" pra uma data ISO string
function getISOWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  // Algoritmo ISO 8601: semana começa segunda
  const day = d.getDay() === 0 ? 7 : d.getDay() // dom=7
  const thu = new Date(d)
  thu.setDate(d.getDate() + (4 - day)) // quinta-feira da semana
  const year = thu.getFullYear()
  const firstThu = new Date(year, 0, 1)
  const firstDay = firstThu.getDay() === 0 ? 7 : firstThu.getDay()
  // Primeira quinta de jan
  firstThu.setDate(1 + (4 - firstDay + 7) % 7)
  const week = Math.round((thu.getTime() - firstThu.getTime()) / (7 * 24 * 3600 * 1000)) + 1
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ─── Agrupa sales por período ─────────────────────────────────────

type PeriodBucket = {
  key: string
  label: string
  serraria: number
  jatiuca: number
  other: number
}

function groupSales(
  rows: SalesRow[],
  mode: 'monthly' | 'weekly',
  unitMap: Map<string, string>, // unit_id → display_name
): PeriodBucket[] {
  const buckets = new Map<string, PeriodBucket>()

  for (const r of rows) {
    const key = getGroupKey(r.date, mode)
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: getGroupLabel(key, mode), serraria: 0, jatiuca: 0, other: 0 })
    }
    const b = buckets.get(key)!
    const name = (unitMap.get(r.unit_id) ?? '').toLowerCase()
    const val = Number(r.total ?? 0)
    if (name.includes('serraria')) b.serraria += val
    else if (name.includes('jatiuca') || name.includes('jatiúca')) b.jatiuca += val
    else b.other += val
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

// ─── Agrupa ads por período ───────────────────────────────────────

type AdsBucket = { key: string; label: string; cost: number }

function groupAds(rows: AdsRow[], mode: 'monthly' | 'weekly'): AdsBucket[] {
  const buckets = new Map<string, AdsBucket>()
  for (const r of rows) {
    const key = getGroupKey(r.date, mode)
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: getGroupLabel(key, mode), cost: 0 })
    }
    buckets.get(key)!.cost += Number(r.cost ?? 0)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
}

// ─── Detecta mês incompleto ───────────────────────────────────────

function isIncompleteMonth(start: string, end: string): boolean {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  // Considera incompleto se start e end estão no mesmo mês e o end
  // não é o último dia do mês
  if (s.getMonth() !== e.getMonth() || s.getFullYear() !== e.getFullYear()) return false
  const lastDay = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate()
  return e.getDate() < lastDay
}

// ─── Gráfico 1: Faturamento por período ──────────────────────────

type FaturamentoChartProps = {
  buckets: PeriodBucket[]
  incomplete: boolean
  endDate: string
}

function FaturamentoChart({ buckets, incomplete, endDate }: FaturamentoChartProps) {
  const { data, options } = useMemo(() => {
    const labels = buckets.map((b) => b.label)
    const opacity = incomplete && buckets.length === 1 ? 0.5 : 1

    const chartData: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Serraria',
          data: buckets.map((b) => b.serraria),
          backgroundColor: COLOR_SERRARIA + (opacity < 1 ? '80' : 'ff'),
          borderRadius: 4,
        },
        {
          label: 'Jatiúca',
          data: buckets.map((b) => b.jatiuca),
          backgroundColor: COLOR_JATIUCA + (opacity < 1 ? '80' : 'ff'),
          borderRadius: 4,
        },
      ],
    }

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) =>
              `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: (v) => brlShort(Number(v)) },
        },
      },
    }

    return { data: chartData, options: chartOptions }
  }, [buckets, incomplete])

  return (
    <div className="analysis-chart-block">
      <div className="analysis-chart-title">Faturamento por período</div>
      <div className="analysis-chart-canvas">
        <Bar data={data} options={options} />
      </div>
      {incomplete && buckets.length === 1 && (
        <div className="analysis-incomplete-note">
          Mês incompleto — dados até {endDate.slice(8, 10)}/{endDate.slice(5, 7)}
        </div>
      )}
    </div>
  )
}

// ─── Gráfico 2: Custo Meta Ads por período ───────────────────────

type AdsChartProps = {
  buckets: AdsBucket[]
  incomplete: boolean
  endDate: string
}

function AdsBarChart({ buckets, incomplete, endDate }: AdsChartProps) {
  const { data, options } = useMemo(() => {
    const labels = buckets.map((b) => b.label)
    const opacity = incomplete && buckets.length === 1 ? 0.5 : 1

    const chartData: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Custo Meta Ads',
          data: buckets.map((b) => b.cost),
          backgroundColor: COLOR_ADS + (opacity < 1 ? '80' : 'ff'),
          borderRadius: 4,
        },
      ],
    }

    const chartOptions: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) =>
              `${ctx.dataset.label}: ${brl(Number(ctx.parsed.y ?? 0))}`,
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: (v) => brlShort(Number(v)) },
        },
      },
    }

    return { data: chartData, options: chartOptions }
  }, [buckets, incomplete])

  return (
    <div className="analysis-chart-block">
      <div className="analysis-chart-title">Custo Meta Ads por período</div>
      <div className="analysis-chart-canvas">
        <Bar data={data} options={options} />
      </div>
      {incomplete && buckets.length === 1 && (
        <div className="analysis-incomplete-note">
          Mês incompleto — dados até {endDate.slice(8, 10)}/{endDate.slice(5, 7)}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────

export default function AnalysisSection() {
  const { start, end, unitId, channel, analysisMode } = useFilters()
  // Não subscreve Realtime — SalesSection (useSales) e AdsUploadCard
  // (useAds) já mantêm o canal aberto, e o cache do React Query é
  // compartilhado por queryKey. Evita abrir WebSocket extra que satura
  // o browser em StrictMode dev.
  const { data: salesRows = [] } = useSales(start, end, { subscribeRealtime: false })
  const { data: adsRows = [] } = useAds(start, end, { subscribeRealtime: false })
  const { data: units = [] } = useUnits()

  // Mapa unit_id → display_name pra classificar Serraria vs Jatiúca
  const unitMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const u of units) m.set(u.id, u.display_name)
    return m
  }, [units])

  // Filtra por unidade (se selecionada)
  const filteredSales = useMemo(() => {
    const byUnit = unitId ? salesRows.filter((r) => r.unit_id === unitId) : salesRows
    if (channel === 'all') return byUnit
    return byUnit.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
  }, [salesRows, unitId, channel])

  // Meta Ads não tem filtro de unidade/canal — segue o padrão do projeto
  // (leitura integral, sem reagrupar por canal)
  const filteredAds = useMemo(() => adsRows, [adsRows])

  const salesBuckets = useMemo(
    () => groupSales(filteredSales, analysisMode, unitMap),
    [filteredSales, analysisMode, unitMap],
  )

  const adsBuckets = useMemo(
    () => groupAds(filteredAds, analysisMode),
    [filteredAds, analysisMode],
  )

  const incomplete = analysisMode === 'monthly' && isIncompleteMonth(start, end)
  const subtitle = analysisMode === 'monthly' ? 'Evolução mês a mês' : 'Evolução semana a semana'

  const hasAnySales = filteredSales.length > 0
  const hasAnyAds = filteredAds.length > 0

  if (!hasAnySales && !hasAnyAds) {
    return (
      <section className="mizu-section analysis-section is-source-vendas">
        <SectionHeader
          source="vendas"
          kanji="析"
          title="Análise por Período"
          subtitle={subtitle}
          period={{ start, end }}
        />
        <div className="analysis-empty">Sem dados suficientes para análise.</div>
      </section>
    )
  }

  return (
    <section className="mizu-section analysis-section is-source-vendas">
      <SectionHeader
        source="vendas"
        kanji="析"
        title="Análise por Período"
        subtitle={subtitle}
        period={{ start, end }}
      />

      {(salesBuckets.length < 3 || adsBuckets.length < 3) && (
        <div className="analysis-sparse-note">
          📅 Período curto pra comparação: {salesBuckets.length} {analysisMode === 'monthly' ? 'mês(es)' : 'semana(s)'} de dado{salesBuckets.length === 1 ? '' : 's'}.
          Pra ver evolução, escolha um período maior no seletor do topo.
        </div>
      )}

      <div className={`analysis-charts ${salesBuckets.length < 3 ? 'analysis-charts--sparse' : ''}`}>
        {hasAnySales && (
          <FaturamentoChart
            buckets={salesBuckets}
            incomplete={incomplete}
            endDate={end}
          />
        )}
        {hasAnyAds && (
          <AdsBarChart
            buckets={adsBuckets}
            incomplete={incomplete}
            endDate={end}
          />
        )}
      </div>
    </section>
  )
}
