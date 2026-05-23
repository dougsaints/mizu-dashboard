// Seção "Análise de Produtos" — Phase 6-04.
// Donut por categoria + Pareto top-20 do snapshot mais recente do
// período (Anota AI delivery).

import { useMemo } from 'react'
import { useAnotaaiProducts } from '../api/useAnotaai'
import { useFilters } from '../lib/period'
import CategoryDonutChart from '../components/CategoryDonutChart'
import ParetoChart from '../components/ParetoChart'
import type { Database } from '../types/database'
import SectionHeader from '../components/SectionHeader'

type ProductRow = Database['public']['Tables']['anotaai_products']['Row']

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function ProductsAnalysisSection() {
  const { start, end, unitId } = useFilters()
  // subscribeRealtime: false porque AnotaaiUploadCard já mantém canal aberto
  const { data: allProducts = [], isLoading, error } = useAnotaaiProducts(120, {
    subscribeRealtime: false,
  })

  const latestRows = useMemo<ProductRow[]>(() => {
    // 1. Filtra snapshots dentro do período
    const inRange = allProducts.filter(
      (p) => p.snapshot_date >= start && p.snapshot_date <= end,
    )
    if (inRange.length === 0) return []

    // 2. Acha snapshot mais recente DENTRO desse range
    let latestDate = inRange[0].snapshot_date
    for (const p of inRange) {
      if (p.snapshot_date > latestDate) latestDate = p.snapshot_date
    }

    // 3. Filtra rows desse snapshot
    let rows = inRange.filter((p) => p.snapshot_date === latestDate)

    // 4. Filtra por unidade (se aplicável)
    if (unitId) {
      rows = rows.filter((p) => p.unit_id === unitId || p.unit_id === null)
    }
    return rows
  }, [allProducts, start, end, unitId])

  const latestSnapshotDate = latestRows[0]?.snapshot_date ?? null

  // 4 KPIs de produtos (Phase 11-06)
  const productsKpis = useMemo(() => {
    if (latestRows.length === 0) return null
    const totalUnits = latestRows.reduce((s, p) => s + Number(p.quantity ?? 0), 0)
    const skus = new Set(latestRows.map(p => p.product_name).filter(Boolean)).size
    const skusUnicos = latestRows.filter(p => Number(p.quantity ?? 0) === 1).length

    // Concentração top 10 (% do total que vem dos 10 mais vendidos)
    const sorted = [...latestRows].sort((a, b) => Number(b.quantity ?? 0) - Number(a.quantity ?? 0))
    const top10Sum = sorted.slice(0, 10).reduce((s, p) => s + Number(p.quantity ?? 0), 0)
    const concentrationPct = totalUnits > 0 ? (top10Sum / totalUnits) * 100 : 0
    const top10Units = top10Sum

    // Maior categoria
    const byCat = new Map<string, number>()
    for (const p of latestRows) {
      const k = p.category?.trim() || 'Sem categoria'
      byCat.set(k, (byCat.get(k) ?? 0) + Number(p.quantity ?? 0))
    }
    const sortedCats = [...byCat.entries()].sort((a, b) => b[1] - a[1])
    const topCat = sortedCats[0]
    const topCatName = topCat ? topCat[0] : '—'
    const topCatPct = topCat && totalUnits > 0 ? (topCat[1] / totalUnits) * 100 : 0

    return { totalUnits, skus, skusUnicos, concentrationPct, top10Units, topCatName, topCatPct }
  }, [latestRows])

  return (
    <section className="mizu-section is-source-anotaai">
      <SectionHeader
        source="anotaai"
        kanji="品"
        title="Análise de Produtos"
        subtitle={`Mix de categorias e concentração de vendas no delivery (Anota AI) · ${
          latestSnapshotDate
            ? `snapshot de ${formatDateBR(latestSnapshotDate)}`
            : 'sem snapshot no período'
        }`}
        period={{ start, end }}
      />

      {isLoading && <div className="data-table-loading">Carregando análise de produtos…</div>}
      {error && (
        <div className="data-table-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && productsKpis && (
        <div className="products-kpis-grid">
          <div className="products-kpi">
            <div className="products-kpi-lbl">Unidades Vendidas</div>
            <div className="products-kpi-val">{productsKpis.totalUnits.toLocaleString('pt-BR')}</div>
            <div className="products-kpi-sub">somando todos os SKUs</div>
          </div>
          <div className="products-kpi">
            <div className="products-kpi-lbl">SKUs Distintos</div>
            <div className="products-kpi-val">{productsKpis.skus}</div>
            <div className="products-kpi-sub">{productsKpis.skusUnicos} vendidos 1× (cauda longa)</div>
          </div>
          <div className="products-kpi">
            <div className="products-kpi-lbl">Concentração Top 10</div>
            <div className="products-kpi-val">{productsKpis.concentrationPct.toFixed(1).replace('.', ',')}%</div>
            <div className="products-kpi-sub">{productsKpis.top10Units.toLocaleString('pt-BR')} un dos top 10</div>
          </div>
          <div className="products-kpi">
            <div className="products-kpi-lbl">Maior Categoria</div>
            <div className="products-kpi-val products-kpi-val--text">{productsKpis.topCatName}</div>
            <div className="products-kpi-sub">{productsKpis.topCatPct.toFixed(1).replace('.', ',')}% das unidades</div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="products-analysis-grid">
          <div className="chart-card">
            <div className="chart-card-title">Mix por Categoria</div>
            <div className="chart-card-sub">Participação de cada grupo no total de unidades</div>
            <CategoryDonutChart products={latestRows} />
          </div>
          <div className="chart-card">
            <div className="chart-card-title">Concentração de Vendas (Pareto)</div>
            <div className="chart-card-sub">Top 20 · barras = unidades · linha = % acumulado</div>
            <ParetoChart products={latestRows} />
          </div>
        </div>
      )}
    </section>
  )
}
