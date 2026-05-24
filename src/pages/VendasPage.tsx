// VendasPage — /vendas (Phase 14-02).
// Faturamento detalhado por unidade/canal + análise mensal/semanal agregada.

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const SalesSection = lazy(() => import('../sections/SalesSection'))
const AnalysisSection = lazy(() => import('../sections/AnalysisSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function VendasPage() {
  return (
    <>
      <PageHeader
        title="Vendas"
        subtitle="Faturamento detalhado por unidade, canal e período"
      />
      <Suspense fallback={<LazyFallback label="Carregando vendas…" />}>
        <SalesSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando análise…" />}>
        <AnalysisSection />
      </Suspense>
    </>
  )
}
