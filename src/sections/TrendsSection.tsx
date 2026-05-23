// Painel de tendências consolidado — Phase 6-02.
// Agrega 6 indicadores das 4 fontes (Vendas, Meta Ads, Anota AI,
// Instagram orgânico) e mostra ▲▼% vs período comparado (cmpMode global).
// Frase-resumo amigável no topo destila o panorama em 1 linha.

import { useMemo } from 'react'
import { useSales, useSalesComparison, getComparisonRange } from '../api/useSales'
import { useAds } from '../api/useAds'
import { useOrganic } from '../api/useOrganic'
import { useAnotaaiProducts } from '../api/useAnotaai'
import { useFilters, type Channel } from '../lib/period'
import TrendCard, { type Favorability } from '../components/TrendCard'
import SectionHeader from '../components/SectionHeader'
import type { Database } from '../types/database'

type SalesRow = Database['public']['Tables']['sales_daily']['Row']
type AdsRow = Database['public']['Tables']['ads_daily']['Row']
type OrganicRow = Database['public']['Tables']['organic_entries']['Row']
type AnotaaiRow = Database['public']['Tables']['anotaai_products']['Row']

function brl(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function num(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function salesAmount(row: SalesRow, channel: Channel): number {
  if (channel === 'all') return Number(row.total ?? 0)
  return Number(row[channel] ?? 0)
}

function filterSales(rows: SalesRow[], unitId: string | null, channel: Channel): SalesRow[] {
  const filtered = unitId ? rows.filter((r) => r.unit_id === unitId) : rows
  if (channel === 'all') return filtered
  return filtered.map((r) => ({ ...r, total: Number(r[channel] ?? 0) }))
}

function sumSales(rows: SalesRow[], channel: Channel): number {
  let total = 0
  for (const r of rows) total += salesAmount(r, channel)
  return total
}

function uniqueDaysWithSales(rows: SalesRow[], channel: Channel): number {
  const dates = new Set<string>()
  for (const r of rows) {
    if (salesAmount(r, channel) > 0) dates.add(r.date)
  }
  return dates.size
}

function sumAdsCost(rows: AdsRow[]): number {
  let total = 0
  for (const r of rows) total += Number(r.cost ?? 0)
  return total
}

function sumAdsClicks(rows: AdsRow[]): number {
  let total = 0
  for (const r of rows) total += Number(r.clicks ?? 0)
  return total
}

function filterByDate<T extends { date: string }>(rows: T[], start: string, end: string): T[] {
  return rows.filter((r) => r.date >= start && r.date <= end)
}

function filterAnotaaiByDate(rows: AnotaaiRow[], start: string, end: string): AnotaaiRow[] {
  return rows.filter((r) => r.snapshot_date >= start && r.snapshot_date <= end)
}

function sumOrganicAlcance(rows: OrganicRow[]): number {
  let total = 0
  for (const r of rows) total += Number(r.alcance ?? 0)
  return total
}

function sumAnotaaiQty(rows: AnotaaiRow[]): number {
  let total = 0
  for (const r of rows) total += Number(r.quantity ?? 0)
  return total
}

type Metric = {
  key: string
  label: string
  curr: number
  prev: number | null
  formatted: string
  formattedPrev: string
  favorability: Favorability
  hint?: string
}

function buildSummary(metrics: Metric[], cmpModeLabel: string): string | null {
  const improved: string[] = []
  const worsened: string[] = []

  for (const m of metrics) {
    if (m.prev === null || m.prev === 0) continue
    const delta = ((m.curr - m.prev) / m.prev) * 100
    if (Math.abs(delta) < 0.5) continue

    const isUp = delta > 0
    let isFavorable: boolean
    if (m.favorability === 'neutral') continue
    if (m.favorability === 'negative') {
      isFavorable = !isUp
    } else {
      isFavorable = isUp
    }
    if (isFavorable) improved.push(m.label)
    else worsened.push(m.label)
  }

  if (improved.length === 0 && worsened.length === 0) return null

  const parts: string[] = []
  if (improved.length > 0) parts.push(`melhorou em ${improved.join(', ')}`)
  if (worsened.length > 0) parts.push(`piorou em ${worsened.join(', ')}`)
  return `Comparado com ${cmpModeLabel}, ${parts.join('; ')}.`
}

export default function TrendsSection() {
  const { start, end, unitId, channel, cmpMode } = useFilters()
  const cmpRange = getComparisonRange(start, end, cmpMode)
  const comparing = cmpMode !== 'none'

  // Sales: current + comparison (já existem queries dedicadas)
  const salesCurr = useSales(start, end, { subscribeRealtime: false })
  const salesPrev = useSalesComparison(start, end, cmpMode)

  // Ads: 2 ranges, ambos sem Realtime (cache mantido por AdsUploadCard)
  const adsCurr = useAds(start, end, { subscribeRealtime: false })
  const adsPrev = useAds(
    cmpRange?.cmpStart ?? start,
    cmpRange?.cmpEnd ?? start,
    { subscribeRealtime: false },
  )

  // Janelas amplas — filtramos localmente por start/end.
  // subscribeRealtime: false porque MarketingUnif/AnotaaiUploadCard
  // já mantêm o canal aberto; cache compartilhado por queryKey.
  const organic = useOrganic(120, { subscribeRealtime: false })
  const anotaai = useAnotaaiProducts(120, { subscribeRealtime: false })

  const isLoading =
    salesCurr.isLoading ||
    adsCurr.isLoading ||
    organic.isLoading ||
    anotaai.isLoading

  // ─── Vendas (current + prev) ─────────────────────────────────
  const salesCurrFiltered = useMemo(
    () => filterSales(salesCurr.data ?? [], unitId, channel),
    [salesCurr.data, unitId, channel],
  )
  const salesPrevFiltered = useMemo(
    () => filterSales(salesPrev.data ?? [], unitId, channel),
    [salesPrev.data, unitId, channel],
  )

  const faturamentoCurr = useMemo(
    () => sumSales(salesCurrFiltered, channel),
    [salesCurrFiltered, channel],
  )
  const faturamentoPrev = useMemo(
    () => (comparing ? sumSales(salesPrevFiltered, channel) : null),
    [salesPrevFiltered, channel, comparing],
  )

  const ticketCurr = useMemo(() => {
    const days = uniqueDaysWithSales(salesCurrFiltered, channel)
    return days > 0 ? faturamentoCurr / days : 0
  }, [salesCurrFiltered, channel, faturamentoCurr])

  const ticketPrev = useMemo(() => {
    if (!comparing) return null
    const days = uniqueDaysWithSales(salesPrevFiltered, channel)
    if (days === 0) return null
    return (faturamentoPrev ?? 0) / days
  }, [salesPrevFiltered, channel, faturamentoPrev, comparing])

  // ─── Meta Ads (current + prev) ───────────────────────────────
  const adsCurrRows = adsCurr.data ?? []
  const adsPrevRows = comparing && cmpRange ? adsPrev.data ?? [] : []

  const investCurr = useMemo(() => sumAdsCost(adsCurrRows), [adsCurrRows])
  const investPrev = useMemo(
    () => (comparing && cmpRange ? sumAdsCost(adsPrevRows) : null),
    [adsPrevRows, comparing, cmpRange],
  )
  const clicksCurr = useMemo(() => sumAdsClicks(adsCurrRows), [adsCurrRows])
  const clicksPrev = useMemo(
    () => (comparing && cmpRange ? sumAdsClicks(adsPrevRows) : null),
    [adsPrevRows, comparing, cmpRange],
  )

  // ─── Instagram orgânico (filtra localmente) ──────────────────
  const organicRows = organic.data ?? []
  const alcanceCurr = useMemo(
    () => sumOrganicAlcance(filterByDate(organicRows, start, end)),
    [organicRows, start, end],
  )
  const alcancePrev = useMemo(() => {
    if (!comparing || !cmpRange) return null
    return sumOrganicAlcance(filterByDate(organicRows, cmpRange.cmpStart, cmpRange.cmpEnd))
  }, [organicRows, comparing, cmpRange])

  // ─── Anota AI produtos (filtra localmente por snapshot_date) ─
  const anotaaiRows = anotaai.data ?? []
  const qtyCurr = useMemo(
    () => sumAnotaaiQty(filterAnotaaiByDate(anotaaiRows, start, end)),
    [anotaaiRows, start, end],
  )
  const qtyPrev = useMemo(() => {
    if (!comparing || !cmpRange) return null
    return sumAnotaaiQty(filterAnotaaiByDate(anotaaiRows, cmpRange.cmpStart, cmpRange.cmpEnd))
  }, [anotaaiRows, comparing, cmpRange])

  const metrics: Metric[] = useMemo(
    () => [
      {
        key: 'faturamento',
        label: 'Faturamento',
        curr: faturamentoCurr,
        prev: faturamentoPrev,
        formatted: brl(faturamentoCurr),
        formattedPrev: brl(faturamentoPrev ?? 0),
        favorability: 'positive',
        hint: unitId || channel !== 'all' ? 'filtros de vendas aplicados' : undefined,
      },
      {
        key: 'ticket',
        label: 'Ticket médio diário',
        curr: ticketCurr,
        prev: ticketPrev,
        formatted: brl(ticketCurr),
        formattedPrev: brl(ticketPrev ?? 0),
        favorability: 'positive',
        hint: 'faturamento ÷ dias com vendas',
      },
      {
        key: 'invest',
        label: 'Investimento Meta',
        curr: investCurr,
        prev: investPrev,
        formatted: brl(investCurr),
        formattedPrev: brl(investPrev ?? 0),
        favorability: 'neutral',
        hint: investCurr === 0 ? 'sem dados' : undefined,
      },
      {
        key: 'clicks',
        label: 'Cliques Meta',
        curr: clicksCurr,
        prev: clicksPrev,
        formatted: num(clicksCurr),
        formattedPrev: num(clicksPrev ?? 0),
        favorability: 'positive',
        hint: clicksCurr === 0 ? 'sem dados' : undefined,
      },
      {
        key: 'alcance',
        label: 'Alcance Instagram',
        curr: alcanceCurr,
        prev: alcancePrev,
        formatted: num(alcanceCurr),
        formattedPrev: num(alcancePrev ?? 0),
        favorability: 'positive',
        hint: alcanceCurr === 0 ? 'sem dados' : undefined,
      },
      {
        key: 'produtos',
        label: 'Produtos vendidos (Anota AI)',
        curr: qtyCurr,
        prev: qtyPrev,
        formatted: num(qtyCurr),
        formattedPrev: num(qtyPrev ?? 0),
        favorability: 'positive',
        hint: qtyCurr === 0 ? 'sem snapshot no período' : 'Σ quantity dos snapshots',
      },
    ],
    [
      faturamentoCurr,
      faturamentoPrev,
      ticketCurr,
      ticketPrev,
      investCurr,
      investPrev,
      clicksCurr,
      clicksPrev,
      alcanceCurr,
      alcancePrev,
      qtyCurr,
      qtyPrev,
      unitId,
      channel,
    ],
  )

  const cmpModeLabel = cmpMode === 'prev' ? 'o período anterior' : cmpMode === 'prevMonth' ? 'o mês passado' : ''

  const summary = useMemo(() => {
    if (!comparing) return null
    return buildSummary(metrics, cmpModeLabel)
  }, [metrics, comparing, cmpModeLabel])

  return (
    <section className="mizu-section is-source-vendas">
      <SectionHeader
        source="vendas"
        kanji="流"
        title="Tendências do período"
        subtitle={
          !comparing
            ? 'Ative "Comparar com" no topo pra ver tendências entre períodos.'
            : summary
              ? summary
              : 'Sem variações relevantes pra comparar (todas estáveis ou sem dados).'
        }
        period={{ start, end }}
      />

      {isLoading && <div className="trends-loading">Carregando indicadores…</div>}

      {!isLoading && (
        <div className="trends-grid">
          {metrics.map((m) => (
            <TrendCard
              key={m.key}
              label={m.label}
              formatted={m.curr === 0 && (m.hint === 'sem dados' || m.hint === 'sem snapshot no período') ? '—' : m.formatted}
              curr={m.curr}
              prev={m.prev}
              formattedPrev={m.formattedPrev}
              favorability={m.favorability}
              hint={m.hint}
              hero={m.key === 'faturamento'}
            />
          ))}
        </div>
      )}
    </section>
  )
}
