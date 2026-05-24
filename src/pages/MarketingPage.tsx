// MarketingPage — /marketing (Phase 14-02).
// Tudo de marketing num lugar: Meta Ads, ROI, orgânico, correlação Meta×Vendas.

import { lazy, Suspense } from 'react'
import PageHeader from '../components/PageHeader'

const MetaAdsAnalysisSection = lazy(() => import('../sections/MetaAdsAnalysisSection'))
const RoiSection = lazy(() => import('../sections/RoiSection'))
const MarketingUnif = lazy(() => import('../sections/MarketingUnif'))
const CorrelationSection = lazy(() => import('../sections/CorrelationSection'))

function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
  return <div className="lazy-fallback">{label}</div>
}

export default function MarketingPage() {
  return (
    <>
      <PageHeader
        title="Marketing"
        subtitle="Meta Ads, ROI, marketing orgânico e correlação com vendas"
      />
      <Suspense fallback={<LazyFallback label="Carregando análise Meta Ads…" />}>
        <MetaAdsAnalysisSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando ROI…" />}>
        <RoiSection />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando marketing…" />}>
        <MarketingUnif />
      </Suspense>
      <Suspense fallback={<LazyFallback label="Carregando correlação…" />}>
        <CorrelationSection />
      </Suspense>
    </>
  )
}
