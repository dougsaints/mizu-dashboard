// Seção "Análise de Produtos" — Phase 6-04.
// Donut por categoria + Pareto top-20 do snapshot mais recente do
// período (Anota AI delivery).

import { useMemo } from 'react'
import { useAnotaaiProducts } from '../api/useAnotaai'
import { useFilters } from '../lib/period'
import CategoryDonutChart from '../components/CategoryDonutChart'
import ParetoChart from '../components/ParetoChart'
import type { Database } from '../types/database'

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

  return (
    <section className="mizu-section">
      <div className="mizu-section-head">
        <div>
          <div className="mizu-section-title">
            <span className="kanji-deco">品</span> Análise de Produtos
          </div>
          <div className="mizu-section-sub">
            Mix de categorias e concentração de vendas no delivery (Anota AI) ·{' '}
            {latestSnapshotDate
              ? `snapshot de ${formatDateBR(latestSnapshotDate)}`
              : 'sem snapshot no período'}
          </div>
        </div>
      </div>

      {isLoading && <div className="data-table-loading">Carregando análise de produtos…</div>}
      {error && (
        <div className="data-table-loading" style={{ color: 'var(--alert-red)' }}>
          Erro ao carregar: {(error as Error).message}
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
