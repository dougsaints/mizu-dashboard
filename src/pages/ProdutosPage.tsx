// ProdutosPage — /produtos (Phase 14-02).
// Mix do cardápio, ranking, concentração e tendências de produtos.

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const ProductsAnalysisSection = lazy(() => import('../sections/ProductsAnalysisSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function ProdutosPage() {
  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle="Mix do cardápio, ranking, concentração e tendências por categoria"
      />
      <Suspense fallback={<LazyFallback label="Carregando análise de produtos…" />}>
        <ProductsAnalysisSection />
      </Suspense>
    </>
  )
}
